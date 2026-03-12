"""Recurring billing: generate invoices, charge saved cards, send reminders."""

import logging
from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.billing._provider import get_payment_provider
from app.modules.billing.enums import InvoiceStatus, SubscriptionStatus
from app.modules.billing.models import Invoice
from app.modules.billing.overdue import reactivate_subscription_after_payment
from app.providers.payments.mercadopago import MercadoPagoProvider
from app.repositories.billing_repository import BillingRepository
from app.repositories.customer_repository import CustomerRepository

if TYPE_CHECKING:
    from fastapi import BackgroundTasks

logger = logging.getLogger(__name__)


async def generate_recurring_invoices(
    db: AsyncSession,
    *,
    org_id: str = "innexar",
    now: datetime | None = None,
    days_before_due: int = 0,
) -> int:
    """For active subscriptions with next_due_date <= (now + days_before_due), create the next invoice and advance next_due_date by 30 days. Returns count of invoices created."""
    billing_repo = BillingRepository(db)
    if now is None:
        now = datetime.now(UTC)
    cutoff = now + timedelta(days=days_before_due) if days_before_due else now
    rows = await billing_repo.list_subscriptions_due_with_plan_product(cutoff)
    count = 0
    for sub, price_plan, _product in rows:
        due = sub.next_due_date
        if not due:
            continue
        inv = Invoice(
            customer_id=sub.customer_id,
            subscription_id=sub.id,
            status=InvoiceStatus.PENDING.value,
            due_date=due,
            total=float(price_plan.amount),
            currency=price_plan.currency or "BRL",
            line_items=[
                {
                    "description": f"{_product.name} - {price_plan.name} (recorrente)",
                    "amount": float(price_plan.amount),
                }
            ],
        )
        billing_repo.add_invoice(inv)
        await billing_repo.flush()
        sub.next_due_date = due + timedelta(days=30)
        count += 1
    await billing_repo.flush()
    return count


async def charge_recurring_invoices(
    db: AsyncSession,
    *,
    org_id: str = "innexar",
) -> tuple[int, int]:
    """Attempt to charge pending invoices using saved MP cards. Returns (charged, failed)."""
    billing_repo = BillingRepository(db)
    rows = await billing_repo.list_pending_invoices_with_subscription_customer()
    charged = 0
    failed = 0
    for inv, sub, customer in rows:
        if not customer.mp_customer_id:
            continue
        try:
            provider = await get_payment_provider(
                db, customer.id, org_id, inv.currency or "BRL"
            )
            if not isinstance(provider, MercadoPagoProvider):
                continue
            import httpx

            with httpx.Client(timeout=10.0) as client:
                cards_resp = client.get(
                    f"https://api.mercadopago.com/v1/customers/{customer.mp_customer_id}/cards",
                    headers={
                        "Authorization": f"Bearer {provider._access_token}"
                    },
                )
            if cards_resp.status_code != 200 or not cards_resp.json():
                continue
            cards = cards_resp.json()
            card_id = str(cards[0].get("id", ""))
            if not card_id:
                continue
            description_parts = []
            if inv.line_items and isinstance(inv.line_items, list):
                first = inv.line_items[0]
                if isinstance(first, dict):
                    description_parts.append(
                        str(first.get("description", ""))
                    )
            description = (
                description_parts[0]
                if description_parts
                else f"Invoice #{inv.id}"
            )

            payment = provider.charge_saved_card(
                customer_id=customer.mp_customer_id,
                card_id=card_id,
                amount=float(inv.total),
                description=description,
                external_reference=str(inv.id),
            )
            pay_status = (payment.get("status") or "").lower()
            if pay_status == "approved":
                inv.status = InvoiceStatus.PAID.value
                inv.paid_at = datetime.now(UTC)
                inv.external_id = str(payment.get("id", ""))
                await reactivate_subscription_after_payment(
                    db, sub.id, org_id=org_id
                )
                charged += 1
            else:
                failed += 1
        except Exception:
            logger.warning(
                "Failed to charge recurring invoice %s for customer %s",
                inv.id,
                customer.id,
                exc_info=True,
            )
            failed += 1
    await billing_repo.flush()
    return charged, failed


async def send_invoice_reminders(
    db: AsyncSession,
    background_tasks: "BackgroundTasks",
    *,
    org_id: str = "innexar",
    days_ahead: int = 2,
    now: datetime | None = None,
) -> int:
    """Find PENDING invoices with due_date within the next days_ahead days and reminder_sent_at null; create in-app notification + send email for each customer user and set reminder_sent_at. Returns count of invoices reminded."""
    from app.modules.notifications.service import (
        create_notification_and_maybe_send_email,
    )

    billing_repo = BillingRepository(db)
    customer_repo = CustomerRepository(db)
    if now is None:
        now = datetime.now(UTC)
    end = now + timedelta(days=days_ahead)
    invoices = await billing_repo.list_pending_invoices_for_reminders(now, end)
    reminded = 0
    for inv in invoices:
        customer = await customer_repo.get_by_id_with_users(inv.customer_id)
        if not customer or not customer.users:
            inv.reminder_sent_at = now
            reminded += 1
            continue
        due_str = inv.due_date.strftime("%d/%m/%Y") if inv.due_date else ""
        total_str = (
            f"R$ {inv.total:.2f}"
            if (inv.currency or "").upper() == "BRL"
            else f"{inv.total:.2f} {inv.currency or ''}"
        )
        title = "Lembrete: fatura em breve"
        body = f"Sua fatura #{inv.id} vence em {due_str}. Valor: {total_str}. Acesse o portal para pagar."
        for cu in customer.users:
            await create_notification_and_maybe_send_email(
                db,
                background_tasks,
                customer_user_id=cu.id,
                channel="in_app,email",
                title=title,
                body=body,
                recipient_email=cu.email,
                org_id=org_id,
            )
        inv.reminder_sent_at = now
        reminded += 1
    await billing_repo.flush()
    return reminded
