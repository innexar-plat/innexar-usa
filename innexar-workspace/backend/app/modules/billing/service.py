"""Billing service: re-exports from domain modules for backward compatibility."""

from app.modules.billing._provider import get_payment_provider as _get_payment_provider
from app.modules.billing.invoice_ops import (
    create_manual_invoice,
    create_payment_attempt,
    create_subscription_checkout,
    mark_invoice_paid,
)
from app.modules.billing.recurring_ops import (
    charge_recurring_invoices,
    generate_recurring_invoices,
    send_invoice_reminders,
)
from app.modules.billing.webhook_ops import process_webhook

__all__ = [
    "_get_payment_provider",
    "create_manual_invoice",
    "create_payment_attempt",
    "create_subscription_checkout",
    "mark_invoice_paid",
    "process_webhook",
    "generate_recurring_invoices",
    "charge_recurring_invoices",
    "send_invoice_reminders",
]
