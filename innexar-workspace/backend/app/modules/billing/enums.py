"""Billing enums for Invoice and Subscription state machines."""

import enum


class InvoiceStatus(enum.StrEnum):
    DRAFT = "draft"
    ISSUED = "issued"
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    CANCELED = "canceled"
    EXPIRED = "expired"


class SubscriptionStatus(enum.StrEnum):
    INACTIVE = "inactive"
    ACTIVE = "active"
    OVERDUE = "overdue"
    SUSPENDED = "suspended"
    CANCELED = "canceled"


class PaymentProvider(enum.StrEnum):
    STRIPE = "stripe"
    MERCADOPAGO = "mercadopago"
