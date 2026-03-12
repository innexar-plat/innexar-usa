"""Webhook processing for Stripe and Mercado Pago."""

import hashlib
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit import log_audit
from app.modules.billing._subscription_helpers import (
    set_subscription_next_due_if_recurring,
)
from app.modules.billing.enums import InvoiceStatus, SubscriptionStatus
from app.modules.billing.models import WebhookEvent
from app.modules.billing.overdue import reactivate_subscription_after_payment
from app.providers.payments.mercadopago import MercadoPagoProvider
from app.providers.payments.stripe import StripeProvider
from app.repositories.billing_repository import BillingRepository


async def process_webhook(
    db: AsyncSession,
    provider: str,
    body: bytes,
    headers: dict[str, str],
) -> tuple[bool, str, int | None]:
    """Process webhook; idempotent via WebhookEvent. Returns (ok, message, paid_invoice_id or None)."""
    billing_repo = BillingRepository(db)
    event_id = ""
    if provider == "stripe":
        p = StripeProvider()
        result = p.handle_webhook(body, headers)
        if not result.processed:
            return False, result.message, None
        event_id = result.message
        if await billing_repo.get_webhook_event_by_provider_and_event_id(
            "stripe", event_id
        ):
            return True, "already_processed", None
        payload_hash = hashlib.sha256(body).hexdigest()
        ev = WebhookEvent(
            provider="stripe", event_id=event_id, payload_hash=payload_hash
        )
        billing_repo.add_webhook_event(ev)
        paid_invoice_id: int | None = None
        if result.invoice_id:
            inv = await billing_repo.get_invoice_by_id(result.invoice_id)
            if inv:
                inv.status = InvoiceStatus.PAID.value
                inv.paid_at = datetime.now(UTC)
                paid_invoice_id = inv.id
                if inv.subscription_id:
                    sub = await billing_repo.get_subscription_by_id(
                        inv.subscription_id
                    )
                    if sub:
                        sub.status = SubscriptionStatus.ACTIVE.value
                        sub.start_date = datetime.now(UTC)
                        await set_subscription_next_due_if_recurring(db, sub)
                        await reactivate_subscription_after_payment(
                            db, sub.id, org_id="innexar"
                        )
                await log_audit(
                    db,
                    entity="invoice",
                    entity_id=str(inv.id),
                    action="paid",
                    actor_type="webhook",
                    actor_id=event_id,
                    payload={"provider": "stripe"},
                )
        await billing_repo.flush()
        return True, "ok", paid_invoice_id

    if provider == "mercadopago":
        p = MercadoPagoProvider()
        result = p.handle_webhook(body, headers)
        if not result.processed:
            return False, result.message, None
        event_id = result.message
        if await billing_repo.get_webhook_event_by_provider_and_event_id(
            "mercadopago", event_id
        ):
            return True, "already_processed", None
        payload_hash = hashlib.sha256(body).hexdigest()
        ev = WebhookEvent(
            provider="mercadopago",
            event_id=event_id,
            payload_hash=payload_hash,
        )
        billing_repo.add_webhook_event(ev)
        paid_invoice_id = None
        if result.mp_plan_id and result.mp_preapproval_id:
            link = await billing_repo.get_mp_subscription_checkout_by_plan_id(
                result.mp_plan_id
            )
            if link:
                inv = await billing_repo.get_invoice_by_id(link.invoice_id)
                if inv and inv.status != InvoiceStatus.PAID.value:
                    inv.status = InvoiceStatus.PAID.value
                    inv.paid_at = datetime.now(UTC)
                    paid_invoice_id = inv.id
                    if inv.subscription_id:
                        sub = await billing_repo.get_subscription_by_id(
                            inv.subscription_id
                        )
                        if sub:
                            sub.status = SubscriptionStatus.ACTIVE.value
                            sub.external_id = result.mp_preapproval_id
                            sub.start_date = sub.start_date or datetime.now(UTC)
                            await set_subscription_next_due_if_recurring(
                                db, sub
                            )
                            await reactivate_subscription_after_payment(
                                db, sub.id, org_id="innexar"
                            )
                    await log_audit(
                        db,
                        entity="invoice",
                        entity_id=str(inv.id),
                        action="paid",
                        actor_type="webhook",
                        actor_id=event_id,
                        payload={
                            "provider": "mercadopago",
                            "subscription": True,
                        },
                    )
        elif result.invoice_id:
            inv = await billing_repo.get_invoice_by_id(result.invoice_id)
            if inv:
                inv.status = InvoiceStatus.PAID.value
                inv.paid_at = datetime.now(UTC)
                paid_invoice_id = inv.id
                if inv.subscription_id:
                    sub = await billing_repo.get_subscription_by_id(
                        inv.subscription_id
                    )
                    if sub:
                        sub.status = SubscriptionStatus.ACTIVE.value
                        sub.start_date = datetime.now(UTC)
                        await set_subscription_next_due_if_recurring(db, sub)
                        await reactivate_subscription_after_payment(
                            db, sub.id, org_id="innexar"
                        )
                await log_audit(
                    db,
                    entity="invoice",
                    entity_id=str(inv.id),
                    action="paid",
                    actor_type="webhook",
                    actor_id=event_id,
                    payload={"provider": "mercadopago"},
                )
        await billing_repo.flush()
        return True, "ok", paid_invoice_id

    return False, "unknown provider", None
