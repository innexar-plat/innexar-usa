"""Invoice and payment-link operations: create invoice, payment attempt, subscription checkout, mark paid."""

from datetime import UTC, datetime
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit import log_audit
from app.modules.billing._provider import get_payment_provider
from app.modules.billing._subscription_helpers import (
    set_subscription_next_due_if_recurring,
)
from app.modules.billing.enums import InvoiceStatus, SubscriptionStatus
from app.modules.billing.models import (
    Invoice,
    MPSubscriptionCheckout,
    PaymentAttempt,
)
from app.modules.billing.overdue import reactivate_subscription_after_payment
from app.providers.payments.base import PaymentLinkResult
from app.providers.payments.mercadopago import MercadoPagoProvider
from app.providers.payments.stripe import StripeProvider
from app.repositories.billing_repository import BillingRepository
from app.repositories.customer_repository import CustomerRepository


async def create_manual_invoice(
    db: AsyncSession,
    customer_id: int,
    due_date: datetime,
    total: float,
    currency: str = "BRL",
    line_items: list[dict[str, Any]] | dict[str, Any] | None = None,
) -> Invoice:
    """Create a one-off invoice (no subscription)."""
    billing_repo = BillingRepository(db)
    inv = Invoice(
        customer_id=customer_id,
        subscription_id=None,
        status=InvoiceStatus.DRAFT.value,
        due_date=due_date,
        total=total,
        currency=currency,
        line_items=line_items if isinstance(line_items, (dict, list)) else None,
    )
    billing_repo.add_invoice(inv)
    await billing_repo.flush()
    return inv


def _is_recurring_interval(interval: str | None) -> bool:
    """True if plan is recurring (month/monthly/year/yearly), not one-time."""
    if not interval:
        return False
    low = (interval or "").strip().lower()
    return low not in ("one_time", "one-time")


# WaaS USA: product name -> plan_slug for Stripe subscription description
_WAAS_NAME_TO_SLUG: dict[str, str] = {
    "Starter Website": "starter",
    "Business Website": "business",
    "Pro Website": "pro",
}


async def create_payment_attempt(
    db: AsyncSession,
    invoice_id: int,
    success_url: str,
    cancel_url: str,
    customer_email: str | None = None,
    customer_name: str | None = None,
    customer_phone: str | None = None,
    coupon_code: str | None = None,
) -> PaymentLinkResult:
    """Create payment attempt and return payment_url. For Stripe + USD + recurring subscription, creates subscription checkout."""
    billing_repo = BillingRepository(db)
    customer_repo = CustomerRepository(db)
    inv = await billing_repo.get_invoice_by_id(invoice_id)
    if not inv:
        raise ValueError("Invoice not found")
    if inv.status == InvoiceStatus.PAID.value:
        raise ValueError("Invoice already paid")
    currency = (inv.currency or "BRL").upper()
    customer = await customer_repo.get_by_id_with_users(inv.customer_id)
    org_id = customer.org_id if customer else "innexar"
    provider = await get_payment_provider(db, inv.customer_id, org_id, currency)
    description = (
        f"Fatura #{inv.id}"
        if (inv.currency or "BRL").upper() == "BRL"
        else f"Invoice #{inv.id}"
    )

    use_subscription = (
        isinstance(provider, StripeProvider)
        and currency == "USD"
        and inv.subscription_id is not None
    )
    if use_subscription:
        row = await billing_repo.get_subscription_with_plan_product(inv.subscription_id)
        if row and _is_recurring_interval(row[1].interval):
            sub, price_plan, product = row
            if inv.line_items and isinstance(inv.line_items, list) and inv.line_items:
                first = inv.line_items[0]
                if isinstance(first, dict) and first.get("description"):
                    description = str(first["description"])[:255]
            plan_slug = _WAAS_NAME_TO_SLUG.get(product.name or "", "") or (
                (product.name or "").lower().replace(" ", "_")[:32]
            )
            res = provider.create_subscription_link(
                invoice_id=inv.id,
                amount=float(inv.total),
                currency=inv.currency or "USD",
                success_url=success_url,
                cancel_url=cancel_url,
                plan_slug=plan_slug,
                customer_email=customer_email,
                customer_name=customer_name,
                customer_phone=customer_phone,
                description=description,
                contract_months=12,
                coupon_code=coupon_code,
            )
        else:
            use_subscription = False

    if not use_subscription:
        res = provider.create_payment_link(
            invoice_id=inv.id,
            amount=float(inv.total),
            currency=inv.currency or "BRL",
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=customer_email,
            customer_name=customer_name,
            customer_phone=customer_phone,
            description=description,
            coupon_code=coupon_code,
        )
    attempt = PaymentAttempt(
        invoice_id=invoice_id,
        provider="stripe" if isinstance(provider, StripeProvider) else "mercadopago",
        external_id=res.external_id,
        payment_url=res.payment_url,
        status="pending",
    )
    billing_repo.add_payment_attempt(attempt)
    inv.status = InvoiceStatus.PENDING.value
    inv.external_id = res.external_id
    await billing_repo.flush()
    return res


async def create_subscription_checkout(
    db: AsyncSession,
    invoice_id: int,
    back_url: str,
) -> PaymentLinkResult:
    """Create MP preapproval_plan for Assinaturas, link invoice to plan, return init_point."""
    billing_repo = BillingRepository(db)
    customer_repo = CustomerRepository(db)
    inv = await billing_repo.get_invoice_by_id(invoice_id)
    if not inv:
        raise ValueError("Invoice not found")
    if inv.status == InvoiceStatus.PAID.value:
        raise ValueError("Invoice already paid")
    if not inv.subscription_id:
        raise ValueError("Invoice has no subscription")
    currency = (inv.currency or "BRL").upper()
    customer = await customer_repo.get_by_id_with_users(inv.customer_id)
    org_id = customer.org_id if customer else "innexar"
    provider = await get_payment_provider(db, inv.customer_id, org_id, currency)
    if not isinstance(provider, MercadoPagoProvider):
        raise ValueError("Subscription checkout requires Mercado Pago")
    row = await billing_repo.get_subscription_with_plan_product(inv.subscription_id)
    if not row:
        raise ValueError("Subscription or plan not found")
    sub, price_plan, product = row
    reason = product.name or f"Invoice #{invoice_id}"
    if inv.line_items and isinstance(inv.line_items, list) and inv.line_items:
        first = inv.line_items[0]
        if isinstance(first, dict) and first.get("description"):
            reason = str(first["description"])[:255]
    interval = (price_plan.interval or "monthly").lower()
    frequency, frequency_type = (
        (12, "months") if interval == "yearly" else (1, "months")
    )
    plan_result = provider.create_subscription_plan(
        reason=reason,
        amount=float(inv.total),
        currency=currency,
        back_url=back_url,
        frequency=frequency,
        frequency_type=frequency_type,
    )
    link = MPSubscriptionCheckout(invoice_id=invoice_id, mp_plan_id=plan_result.plan_id)
    billing_repo.add_mp_subscription_checkout(link)
    inv.status = InvoiceStatus.PENDING.value
    await billing_repo.flush()
    return PaymentLinkResult(
        payment_url=plan_result.init_point, external_id=plan_result.plan_id
    )


async def mark_invoice_paid(
    db: AsyncSession,
    invoice_id: int,
    *,
    actor_type: str = "staff",
    actor_id: str = "",
    org_id: str = "innexar",
) -> int | None:
    """Mark invoice as paid (manual override). Activates subscription and triggers reactivation. Returns invoice_id if paid."""
    billing_repo = BillingRepository(db)
    inv = await billing_repo.get_invoice_by_id(invoice_id)
    if not inv:
        return None
    if inv.status == InvoiceStatus.PAID.value:
        return None
    inv.status = InvoiceStatus.PAID.value
    inv.paid_at = datetime.now(UTC)
    if inv.subscription_id:
        sub = await billing_repo.get_subscription_by_id(inv.subscription_id)
        if sub:
            sub.status = SubscriptionStatus.ACTIVE.value
            if not sub.start_date:
                sub.start_date = datetime.now(UTC)
            await set_subscription_next_due_if_recurring(db, sub)
            await reactivate_subscription_after_payment(db, sub.id, org_id=org_id)
    await log_audit(
        db,
        entity="invoice",
        entity_id=str(inv.id),
        action="manual_payment_confirmed",
        actor_type=actor_type,
        actor_id=actor_id,
        payload={"org_id": org_id},
    )
    await billing_repo.flush()
    return inv.id
