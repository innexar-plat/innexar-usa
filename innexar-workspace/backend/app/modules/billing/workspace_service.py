"""Billing workspace service: CRUD and link-hestia via repository. No payment logic here."""

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit import log_audit
from app.modules.billing.models import (
    PricePlan,
    Product,
    ProvisioningRecord,
    Subscription,
)
from app.modules.billing.overdue import sync_subscription_status_to_hestia
from app.modules.billing.schemas import (
    InvoiceCreate,
    LinkHestiaBody,
    PricePlanCreate,
    PricePlanUpdate,
    ProductCreate,
    ProductUpdate,
    SubscriptionCreate,
    SubscriptionUpdate,
)
from app.modules.billing.service import create_manual_invoice
from app.repositories.billing_repository import BillingRepository


class BillingWorkspaceService:
    """Workspace billing CRUD. Uses BillingRepository; no direct DB in routers."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._repo = BillingRepository(db)

    # ----- Products -----
    async def list_products(
        self, with_plans: bool = False
    ) -> list[Product] | list[dict]:
        products = await self._repo.list_products()
        if not with_plans:
            return products
        all_plans = await self._repo.list_price_plans(order_by_id=True)
        by_product: dict[int, list[PricePlan]] = {}
        for pp in all_plans:
            by_product.setdefault(pp.product_id, []).append(pp)
        return [{"product": p, "plans": by_product.get(p.id, [])} for p in products]

    async def get_product(self, product_id: int) -> Product | None:
        return await self._repo.get_product_by_id(product_id)

    async def create_product(self, body: ProductCreate) -> Product:
        p = Product(
            name=body.name,
            description=body.description,
            is_active=body.is_active,
            provisioning_type=body.provisioning_type,
            hestia_package=body.hestia_package,
        )
        self._repo.add_product(p)
        await self._db.flush()
        await self._repo.update_product(p)
        return p

    async def update_product(
        self, product_id: int, body: ProductUpdate
    ) -> Product | None:
        p = await self._repo.get_product_by_id(product_id)
        if not p:
            return None
        if body.name is not None:
            p.name = body.name
        if body.description is not None:
            p.description = body.description
        if body.is_active is not None:
            p.is_active = body.is_active
        if body.provisioning_type is not None:
            p.provisioning_type = body.provisioning_type
        if body.hestia_package is not None:
            p.hestia_package = body.hestia_package
        await self._repo.update_product(p)
        return p

    # ----- Price plans -----
    async def list_price_plans(self, product_id: int | None = None) -> list[PricePlan]:
        return await self._repo.list_price_plans(product_id=product_id)

    async def get_price_plan(self, plan_id: int) -> PricePlan | None:
        return await self._repo.get_price_plan_by_id(plan_id)

    async def create_price_plan(self, body: PricePlanCreate) -> PricePlan:
        pp = PricePlan(
            product_id=body.product_id,
            name=body.name,
            interval=body.interval,
            amount=body.amount,
            currency=body.currency,
        )
        self._repo.add_price_plan(pp)
        await self._db.flush()
        await self._repo.update_price_plan(pp)
        return pp

    async def update_price_plan(
        self, plan_id: int, body: PricePlanUpdate
    ) -> PricePlan | None:
        pp = await self._repo.get_price_plan_by_id(plan_id)
        if not pp:
            return None
        if body.name is not None:
            pp.name = body.name
        if body.interval is not None:
            pp.interval = body.interval
        if body.amount is not None:
            pp.amount = body.amount
        if body.currency is not None:
            pp.currency = body.currency
        await self._repo.update_price_plan(pp)
        return pp

    # ----- Subscriptions -----
    async def list_subscriptions(
        self, customer_id: int | None = None
    ) -> list[Subscription]:
        return await self._repo.list_subscriptions(customer_id=customer_id)

    async def get_subscription(self, subscription_id: int) -> Subscription | None:
        return await self._repo.get_subscription_by_id(subscription_id)

    async def create_subscription(
        self, body: SubscriptionCreate, actor_id: str, org_id: str
    ) -> Subscription:
        sub = Subscription(
            customer_id=body.customer_id,
            product_id=body.product_id,
            price_plan_id=body.price_plan_id,
            status=body.status,
            start_date=body.start_date,
            next_due_date=body.next_due_date,
        )
        self._repo.add_subscription(sub)
        await self._db.flush()
        await log_audit(
            self._db,
            entity="subscription",
            entity_id=str(sub.id),
            action="create",
            actor_type="staff",
            actor_id=actor_id,
            org_id=org_id,
        )
        await self._repo.update_subscription(sub)
        return sub

    async def update_subscription(
        self,
        subscription_id: int,
        body: SubscriptionUpdate,
        org_id: str,
    ) -> Subscription | None:
        sub = await self._repo.get_subscription_by_id(subscription_id)
        if not sub:
            return None
        if body.status is not None:
            sub.status = body.status
            await sync_subscription_status_to_hestia(
                self._db, subscription_id, body.status, org_id
            )
        if body.start_date is not None:
            sub.start_date = body.start_date
        if body.end_date is not None:
            sub.end_date = body.end_date
        if body.next_due_date is not None:
            sub.next_due_date = body.next_due_date
        await self._repo.update_subscription(sub)
        return sub

    async def link_hestia_user(
        self, subscription_id: int, body: LinkHestiaBody
    ) -> ProvisioningRecord | None:
        """Link Hestia user to subscription. Returns None if subscription not found; raises ValueError if invoice_id invalid."""
        sub = await self._repo.get_subscription_by_id(subscription_id)
        if not sub:
            return None
        if body.invoice_id is not None:
            inv = await self._repo.get_invoice_for_subscription(
                body.invoice_id, subscription_id
            )
            if inv is None:
                raise ValueError(
                    "invoice_id must belong to this subscription or be omitted"
                )
        rec = ProvisioningRecord(
            subscription_id=subscription_id,
            invoice_id=body.invoice_id,
            provider="hestia",
            external_user=body.hestia_username.strip(),
            domain=body.domain.strip(),
            site_url=f"https://{body.domain.strip()}",
            panel_login=body.hestia_username.strip(),
            panel_url=None,
            panel_password_encrypted=None,
            status="provisioned",
            provisioned_at=datetime.now(timezone.utc),  # noqa: UP017
        )
        self._repo.add_provisioning_record(rec)
        await self._repo.refresh_provisioning_record(rec)
        return rec

    # ----- Invoices (list/get from repo; create via existing service) -----
    async def list_invoices(
        self,
        customer_id: int | None = None,
        status: str | None = None,
    ):
        return await self._repo.list_invoices(customer_id=customer_id, status=status)

    async def get_invoice(self, invoice_id: int):
        return await self._repo.get_invoice_by_id(invoice_id)

    async def create_invoice(self, body: InvoiceCreate):
        """Create invoice via create_manual_invoice then set subscription_id."""
        inv = await create_manual_invoice(
            self._db,
            customer_id=body.customer_id,
            due_date=body.due_date,
            total=body.total,
            currency=body.currency,
            line_items=body.line_items,
        )
        inv.subscription_id = body.subscription_id
        await self._db.flush()
        await self._db.refresh(inv)
        return inv
