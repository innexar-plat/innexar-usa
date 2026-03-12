"""Public checkout: resolve product/plan, find or create customer, create subscription+invoice, pay."""

import logging
import secrets
from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING

from app.core.security import create_token_customer, hash_password
from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from app.modules.billing.enums import InvoiceStatus, SubscriptionStatus
from app.modules.billing.models import Invoice, PricePlan, Product, Subscription
from app.modules.billing.service import create_payment_attempt
from app.modules.checkout.schemas import CheckoutStartRequest, CheckoutStartResponse
from app.repositories.billing_repository import BillingRepository
from app.repositories.customer_repository import CustomerRepository
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

if TYPE_CHECKING:
    from fastapi import BackgroundTasks

logger = logging.getLogger(__name__)
ORG_ID = "innexar"

WAAS_SLUG_TO_NAME: dict[str, str] = {
    "starter": "Starter Website",
    "business": "Business Website",
    "pro": "Pro Website",
}


class CheckoutService:
    """Start checkout: resolve product/plan, find or create customer, create sub+invoice, pay (Bricks or Checkout Pro)."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._billing = BillingRepository(db)
        self._customer = CustomerRepository(db)

    async def start_checkout(
        self,
        body: CheckoutStartRequest,
        background_tasks: "BackgroundTasks",
    ) -> CheckoutStartResponse:
        """Full checkout flow: resolve product/plan, find or create customer, create sub+invoice, process payment."""
        email = body.customer_email.lower().strip()
        product_id, price_plan_id, product, pp = await self._resolve_product_plan(body)
        provisioning_type = (product.provisioning_type or "").lower()
        if provisioning_type == "hestia_hosting" and not (body.domain or "").strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Domain is required for hosting products",
            )

        customer_id, customer_user_id, cust, existing_customer = (
            await self._find_or_create_customer(body, email)
        )
        checkout_token = create_token_customer(
            subject=customer_user_id,
            expires_delta=timedelta(hours=1),
            extra_claims={"scope": "checkout_auto_login"},
        )

        sub = Subscription(
            customer_id=customer_id,
            product_id=product_id,
            price_plan_id=price_plan_id,
            status=SubscriptionStatus.INACTIVE.value,
        )
        self._billing.add_subscription(sub)
        await self._db.flush()

        due = datetime.now(UTC) + timedelta(days=7)
        preferred_locale = (body.locale or "en").strip().lower() or "en"
        if preferred_locale not in ("en", "pt", "es"):
            preferred_locale = "en"
        line_items: list[dict] = [
            {
                "description": f"{product.name} - {pp.name}",
                "amount": float(pp.amount),
                "preferred_locale": preferred_locale,
            }
        ]
        if body.domain and provisioning_type == "hestia_hosting":
            line_items[0]["domain"] = body.domain.strip()
        if body.fidelity_12_months_accepted is True:
            line_items[0]["fidelity_12_months_accepted"] = True
            line_items[0]["fidelity_accepted_at"] = datetime.now(UTC).isoformat()

        inv = Invoice(
            customer_id=customer_id,
            subscription_id=sub.id,
            status=InvoiceStatus.DRAFT.value,
            due_date=due,
            total=float(pp.amount),
            currency=pp.currency or "BRL",
            line_items=line_items,
        )
        self._billing.add_invoice(inv)
        await self._db.flush()

        if body.payment_method_id:
            from app.modules.checkout.checkout_bricks import process_bricks_payment

            return await process_bricks_payment(
                self._db,
                background_tasks,
                body,
                inv,
                sub,
                pp,
                cust,
                email,
                existing_customer,
                checkout_token,
            )

        success_url = body.success_url
        if success_url and checkout_token:
            separator = "&" if "?" in success_url else "?"
            success_url = f"{success_url}{separator}token={checkout_token}"
        try:
            res = await create_payment_attempt(
                self._db,
                invoice_id=inv.id,
                success_url=success_url,
                cancel_url=body.cancel_url,
                customer_email=email,
                customer_name=body.customer_name,
                customer_phone=body.customer_phone,
                coupon_code=body.coupon_code and body.coupon_code.strip() or None,
            )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
            ) from e
        return CheckoutStartResponse(
            payment_url=res.payment_url,
            existing_customer=existing_customer,
            checkout_token=checkout_token,
        )

    async def _resolve_product_plan(
        self, body: CheckoutStartRequest
    ) -> tuple[int, int, Product, PricePlan]:
        """Resolve product_id, price_plan_id and load Product, PricePlan. Raises 404 if not found."""
        if body.plan_slug:
            slug = (body.plan_slug or "").strip().lower()
            product_name = WAAS_SLUG_TO_NAME.get(slug)
            if not product_name:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Unknown plan_slug: {body.plan_slug}. Use starter, business, or pro.",
                )
            rows = await self._billing.list_products_and_plans_by_filter(
                org_id=ORG_ID,
                product_names=(product_name,),
                plan_interval="month",
                plan_currency="USD",
            )
            if not rows:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"WaaS product '{product_name}' not found. Run seed_products_usa_waas.py.",
                )
            product, pp = rows[0]
            return (product.id, pp.id, product, pp)
        product_id = body.product_id  # type: ignore[assignment]
        price_plan_id = body.price_plan_id  # type: ignore[assignment]
        pp = await self._billing.get_price_plan_by_id(price_plan_id)
        if not pp or pp.product_id != product_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product or price plan not found",
            )
        product = await self._billing.get_product_by_id(product_id)
        if not product or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found or inactive",
            )
        return (product_id, price_plan_id, product, pp)

    async def _find_or_create_customer(
        self, body: CheckoutStartRequest, email: str
    ) -> tuple[int, int, Customer | None, bool]:
        """Find or create Customer and CustomerUser. Returns (customer_id, customer_user_id, cust, existing_customer)."""
        cu = await self._customer.get_customer_user_by_email(email)
        if cu:
            cust = await self._customer.get_by_id_with_users(cu.customer_id)
            return (cu.customer_id, cu.id, cust, True)

        cust = await self._customer.get_by_email(email)
        if cust:
            cu_new = CustomerUser(
                customer_id=cust.id,
                email=email,
                password_hash=hash_password(secrets.token_urlsafe(16)),
                requires_password_change=True,
                email_verified=False,
            )
            self._customer.add_customer_user(cu_new)
            await self._db.flush()
            return (cust.id, cu_new.id, cust, False)

        cust = Customer(
            org_id=ORG_ID,
            name=body.customer_name or email,
            email=email,
            phone=body.customer_phone,
        )
        self._customer.add(cust)
        await self._db.flush()
        cu_new = CustomerUser(
            customer_id=cust.id,
            email=email,
            password_hash=hash_password(secrets.token_urlsafe(16)),
            requires_password_change=True,
            email_verified=False,
        )
        self._customer.add_customer_user(cu_new)
        await self._db.flush()
        return (cust.id, cu_new.id, cust, False)
