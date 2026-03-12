"""Checkout Bricks flow: process payment with MP token (card/Pix). Used by CheckoutService."""

import logging
from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING

from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from app.modules.billing.enums import InvoiceStatus, SubscriptionStatus
from app.modules.billing.models import Invoice, PricePlan, Subscription
from app.modules.billing.overdue import reactivate_subscription_after_payment
from app.modules.billing.service import _get_payment_provider
from app.providers.payments.mercadopago import MercadoPagoProvider
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

if TYPE_CHECKING:
    from app.modules.checkout.schemas import CheckoutStartRequest, CheckoutStartResponse
    from fastapi import BackgroundTasks

logger = logging.getLogger(__name__)
ORG_ID = "innexar"


def _is_recurring_interval(interval: str | None) -> bool:
    """True if plan generates recurring invoices (month/monthly/year/yearly)."""
    if not interval:
        return True
    return (interval or "").lower() not in ("one_time",)


async def process_bricks_payment(
    db: AsyncSession,
    background_tasks: "BackgroundTasks",
    body: "CheckoutStartRequest",
    inv: Invoice,
    sub: Subscription,
    price_plan: PricePlan,
    cust: Customer | None,
    email: str,
    existing_customer: bool,
    checkout_token: str | None,
) -> "CheckoutStartResponse":
    """Process payment using Brick token; update invoice/subscription; return response."""
    from app.core.database import AsyncSessionLocal
    from app.modules.billing.post_payment import create_project_and_notify_after_payment
    from app.modules.checkout.schemas import CheckoutStartResponse
    from app.modules.customers.service import send_portal_credentials_after_payment
    from app.modules.notifications.service import (
        create_notification_and_maybe_send_email,
    )

    currency = (inv.currency or "BRL").upper()
    provider = await _get_payment_provider(db, inv.customer_id, ORG_ID, currency)
    if not isinstance(provider, MercadoPagoProvider):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bricks payment is only available for Mercado Pago (BRL)",
        )

    payer_email = (body.payer_email or email).lower().strip()
    mp_customer_id = ""
    try:
        mp_customer = provider.create_or_get_customer(
            email=payer_email, name=body.customer_name
        )
        mp_customer_id = str(mp_customer.get("id", ""))
        if mp_customer_id and cust and not cust.mp_customer_id:
            cust.mp_customer_id = mp_customer_id
            await db.flush()
    except ValueError:
        logger.warning(
            "Failed to create/get MP customer for %s; proceeding with payment", email
        )

    desc = f"Invoice #{inv.id} - {(inv.line_items or [{}])[0].get('description', '')}"
    try:
        payment = provider.create_payment(
            token=body.token,
            amount=float(inv.total),
            installments=body.installments,
            payment_method_id=body.payment_method_id,
            issuer_id=body.issuer_id,
            payer_email=payer_email,
            description=desc,
            external_reference=str(inv.id),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        ) from e

    if mp_customer_id and body.token:
        try:
            card = provider.save_card(customer_id=mp_customer_id, card_token=body.token)
            if card.get("id"):
                logger.info(
                    "Saved card %s for MP customer %s", card.get("id"), mp_customer_id
                )
        except Exception:
            logger.warning(
                "Failed to save card for MP customer %s", mp_customer_id, exc_info=True
            )

    payment_status = (payment.get("status") or "").lower()
    payment_id = str(payment.get("id", ""))
    inv.external_id = payment_id
    if payment_status == "approved":
        inv.status = InvoiceStatus.PAID.value
        inv.paid_at = datetime.now(UTC)
        sub.status = SubscriptionStatus.ACTIVE.value
        sub.start_date = datetime.now(UTC)
        if _is_recurring_interval(price_plan.interval):
            sub.next_due_date = sub.start_date + timedelta(days=30)
        await reactivate_subscription_after_payment(db, sub.id, org_id=ORG_ID)
        await db.flush()

        cu_r = await db.execute(
            select(CustomerUser)
            .where(CustomerUser.customer_id == inv.customer_id)
            .limit(1)
        )
        cu = cu_r.scalar_one_or_none()
        if cu:
            await create_notification_and_maybe_send_email(
                db,
                background_tasks,
                customer_user_id=cu.id,
                channel="in_app,email",
                title="Pagamento confirmado",
                body=f"A fatura #{inv.id} foi paga.",
                recipient_email=cu.email,
                org_id=ORG_ID,
            )
        background_tasks.add_task(
            send_portal_credentials_after_payment, inv.customer_id, ORG_ID, inv.id
        )

        async def _run_create_project(invoice_id: int) -> None:
            async with AsyncSessionLocal() as session:
                try:
                    await create_project_and_notify_after_payment(session, invoice_id)
                    await session.commit()
                except Exception:
                    await session.rollback()
                    raise

        background_tasks.add_task(_run_create_project, inv.id)
    elif payment_status in ("pending", "in_process"):
        inv.status = InvoiceStatus.PENDING.value
    else:
        inv.status = InvoiceStatus.PENDING.value
    await db.flush()

    error_message = None
    if payment_status == "rejected":
        status_detail = payment.get("status_detail", "")
        error_messages = {
            "cc_rejected_bad_filled_card_number": "Número do cartão incorreto.",
            "cc_rejected_bad_filled_date": "Data de validade incorreta.",
            "cc_rejected_bad_filled_security_code": "Código de segurança incorreto.",
            "cc_rejected_bad_filled_other": "Dados do cartão incorretos.",
            "cc_rejected_call_for_authorize": "Ligue para a operadora do cartão para autorizar.",
            "cc_rejected_card_disabled": "Cartão desabilitado. Ligue para a operadora.",
            "cc_rejected_duplicated_payment": "Pagamento duplicado detectado.",
            "cc_rejected_high_risk": "Pagamento recusado por segurança.",
            "cc_rejected_insufficient_amount": "Saldo insuficiente.",
            "cc_rejected_max_attempts": "Limite de tentativas atingido. Tente outro cartão.",
            "cc_rejected_other_reason": "Pagamento recusado. Tente outro cartão.",
        }
        error_message = error_messages.get(
            status_detail, "Pagamento recusado. Verifique os dados e tente novamente."
        )

    poi = payment.get("point_of_interaction", {}) or {}
    tx_data = poi.get("transaction_data", {}) or {}
    return CheckoutStartResponse(
        payment_status=payment_status,
        payment_id=payment_id,
        existing_customer=existing_customer,
        error_message=error_message,
        qr_code_base64=tx_data.get("qr_code_base64"),
        qr_code=tx_data.get("qr_code"),
        ticket_url=tx_data.get("ticket_url"),
        checkout_token=checkout_token,
    )
