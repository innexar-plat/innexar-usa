"""Checkout public API schemas."""

from pydantic import BaseModel, EmailStr, model_validator


class CheckoutStartRequest(BaseModel):
    """Start checkout: product/plan + customer email + URLs.
    Either (product_id + price_plan_id) OR plan_slug must be provided.
    For WaaS USA use plan_slug (starter, business, pro); backend resolves IDs."""

    product_id: int | None = None
    price_plan_id: int | None = None
    plan_slug: str | None = None  # WaaS: starter | business | pro
    customer_email: EmailStr
    customer_name: str | None = None
    customer_phone: str | None = None
    success_url: str
    cancel_url: str
    coupon_code: str | None = None  # Stripe: promotion code or coupon id (co_xxx)
    locale: str | None = (
        None  # Preferred locale for portal/email (en, pt, es); default en
    )
    domain: str | None = (
        None  # Required when product.provisioning_type == hestia_hosting
    )

    # Bricks Payment Brick fields (token is optional for Pix)
    token: str | None = None
    payment_method_id: str | None = None
    issuer_id: str | None = None
    installments: int = 1
    payer_email: str | None = None  # fallback to customer_email if not set

    # Contrato de fidelidade 12 meses (assinatura site)
    fidelity_12_months_accepted: bool | None = None

    @model_validator(mode="after")
    def require_product_or_slug(self) -> "CheckoutStartRequest":
        if self.plan_slug:
            if self.product_id is not None or self.price_plan_id is not None:
                raise ValueError(
                    "Use either plan_slug or (product_id, price_plan_id), not both"
                )
            return self
        if self.product_id is None or self.price_plan_id is None:
            raise ValueError(
                "Either plan_slug or both product_id and price_plan_id are required"
            )
        return self


class CheckoutStartResponse(BaseModel):
    """Checkout start result."""

    payment_url: str | None = None  # For Checkout Pro redirect (legacy)
    payment_status: str | None = None  # For Bricks: approved, rejected, pending, etc.
    payment_id: str | None = None  # MP payment id
    existing_customer: bool = False
    error_message: str | None = None  # User-friendly error if payment rejected

    # Pix / Ticket response fields
    qr_code_base64: str | None = None
    qr_code: str | None = None
    ticket_url: str | None = None

    # One-time auto-login token for checkout success redirect
    checkout_token: str | None = None
