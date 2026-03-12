"""Stripe payment provider."""

import logging
import os
from typing import Any

from app.providers.payments.base import PaymentLinkResult, WebhookResult

try:
    import stripe
except ImportError:
    stripe = None  # type: ignore[assignment]

logger = logging.getLogger(__name__)


def _get_api_key() -> str | None:
    return os.environ.get("STRIPE_SECRET_KEY") or os.environ.get("STRIPE_API_KEY")


def _get_webhook_secret() -> str | None:
    return os.environ.get("STRIPE_WEBHOOK_SECRET")


def _resolve_stripe_discount(coupon_code: str | None) -> list[dict[str, str]] | None:
    """Resolve coupon_code to Stripe discounts. Supports promotion code (e.g. DESCONTO10) or coupon id (co_xxx)."""
    if not coupon_code or not (coupon_code := coupon_code.strip()):
        return None
    if stripe is None:
        return None
    try:
        if coupon_code.startswith("co_"):
            stripe.Coupon.retrieve(coupon_code)
            logger.info("Stripe discount applied: coupon id %s", coupon_code[:20])
            return [{"coupon": coupon_code}]
        # Try exact, then lowercase, then uppercase (Stripe list can be case-sensitive)
        for code_variant in (coupon_code, coupon_code.lower(), coupon_code.upper()):
            promos = stripe.PromotionCode.list(code=code_variant, active=True, limit=1)
            if promos.data:
                promo_id = promos.data[0].id
                logger.info(
                    "Stripe discount applied: promotion_code %s for code %r",
                    promo_id,
                    code_variant,
                )
                return [{"promotion_code": promo_id}]
        logger.warning("Stripe discount not found for code %r", coupon_code[:30])
        return None
    except Exception as e:  # noqa: BLE001
        logger.warning("Stripe discount resolve failed for %r: %s", coupon_code[:20], e)
        return None


class StripeProvider:
    """Stripe implementation of PaymentProviderProtocol."""

    def __init__(self, api_key: str | None = None) -> None:
        self._api_key = api_key or _get_api_key()
        if self._api_key and stripe is not None:
            stripe.api_key = self._api_key

    def create_payment_link(
        self,
        invoice_id: int,
        amount: float,
        currency: str,
        success_url: str,
        cancel_url: str,
        customer_email: str | None = None,
        customer_name: str | None = None,
        customer_phone: str | None = None,
        description: str | None = None,
        coupon_code: str | None = None,
    ) -> PaymentLinkResult:
        if stripe is None:
            raise RuntimeError("stripe package not installed")
        key = self._api_key or _get_api_key()
        if not key:
            raise ValueError("STRIPE_SECRET_KEY not configured")
        stripe.api_key = key
        amount_cents = int(round(amount * 100))
        params: dict[str, Any] = {
            "payment_method_types": ["card"],
            "line_items": [
                {
                    "price_data": {
                        "currency": (currency or "brl").lower()[:3],
                        "product_data": {
                            "name": description or f"Invoice #{invoice_id}",
                        },
                        "unit_amount": amount_cents,
                    },
                    "quantity": 1,
                }
            ],
            "mode": "payment",
            "success_url": success_url,
            "cancel_url": cancel_url,
            "customer_email": customer_email or None,
            "metadata": {"invoice_id": str(invoice_id)},
        }
        discounts = _resolve_stripe_discount(coupon_code)
        if discounts:
            params["discounts"] = discounts
        else:
            params["allow_promotion_codes"] = True
        session: Any = stripe.checkout.Session.create(**params)
        url = session.get("url") or ""
        return PaymentLinkResult(payment_url=url, external_id=session.get("id"))

    def create_subscription_link(
        self,
        invoice_id: int,
        amount: float,
        currency: str,
        success_url: str,
        cancel_url: str,
        plan_slug: str = "",
        customer_email: str | None = None,
        customer_name: str | None = None,
        customer_phone: str | None = None,
        description: str | None = None,
        contract_months: int = 12,
        coupon_code: str | None = None,
    ) -> PaymentLinkResult:
        """Create a Stripe Checkout Session for a recurring subscription."""
        if stripe is None:
            raise RuntimeError("stripe package not installed")
        key = self._api_key or _get_api_key()
        if not key:
            raise ValueError("STRIPE_SECRET_KEY not configured")
        stripe.api_key = key
        amount_cents = int(round(amount * 100))
        params: dict[str, Any] = {
            "payment_method_types": ["card"],
            "line_items": [
                {
                    "price_data": {
                        "currency": (currency or "usd").lower()[:3],
                        "product_data": {
                            "name": description
                            or f"Website Subscription — {plan_slug.title()}",
                        },
                        "unit_amount": amount_cents,
                        "recurring": {"interval": "month"},
                    },
                    "quantity": 1,
                }
            ],
            "mode": "subscription",
            "success_url": success_url,
            "cancel_url": cancel_url,
            "customer_email": customer_email or None,
            "subscription_data": {
                "metadata": {
                    "invoice_id": str(invoice_id),
                    "plan_slug": plan_slug,
                    "contract_months": str(contract_months),
                },
            },
            "metadata": {
                "invoice_id": str(invoice_id),
                "plan_slug": plan_slug,
            },
        }
        discounts = _resolve_stripe_discount(coupon_code)
        if discounts:
            params["discounts"] = discounts
        else:
            params["allow_promotion_codes"] = True
        session: Any = stripe.checkout.Session.create(**params)
        url = session.get("url") or ""
        return PaymentLinkResult(payment_url=url, external_id=session.get("id"))

    def handle_webhook(self, body: bytes, headers: dict[str, str]) -> WebhookResult:
        if stripe is None:
            raise RuntimeError("stripe package not installed")
        secret = _get_webhook_secret()
        if not secret:
            return WebhookResult(
                processed=False, message="webhook secret not configured"
            )
        sig = headers.get("stripe-signature", "")
        try:
            event = stripe.Webhook.construct_event(body, sig, secret)
        except (
            ValueError,
            getattr(stripe, "SignatureVerificationError", ValueError),
        ) as e:
            return WebhookResult(processed=False, message=str(e))
        event_id = event.get("id", "")
        event_type = event.get("type", "")

        # One-time payment completed
        if event_type == "checkout.session.completed":
            session = event.get("data", {}).get("object", {})
            metadata = session.get("metadata", {}) or {}
            invoice_id_str = metadata.get("invoice_id")
            invoice_id = int(invoice_id_str) if invoice_id_str else None
            return WebhookResult(
                processed=True, invoice_id=invoice_id, message=event_id
            )

        # Subscription created
        if event_type == "customer.subscription.created":
            subscription = event.get("data", {}).get("object", {})
            metadata = subscription.get("metadata", {}) or {}
            invoice_id_str = metadata.get("invoice_id")
            invoice_id = int(invoice_id_str) if invoice_id_str else None
            return WebhookResult(
                processed=True, invoice_id=invoice_id, message=event_id
            )

        # Recurring invoice paid (includes first payment)
        if event_type == "invoice.paid":
            invoice_obj = event.get("data", {}).get("object", {})
            subscription_id = invoice_obj.get("subscription")
            metadata = (
                invoice_obj.get("subscription_details", {}).get("metadata", {}) or {}
            )
            invoice_id_str = metadata.get("invoice_id")
            invoice_id = int(invoice_id_str) if invoice_id_str else None
            return WebhookResult(
                processed=True,
                invoice_id=invoice_id,
                message=f"{event_id}|sub:{subscription_id or ''}",
            )

        # Subscription cancelled
        if event_type == "customer.subscription.deleted":
            subscription = event.get("data", {}).get("object", {})
            metadata = subscription.get("metadata", {}) or {}
            invoice_id_str = metadata.get("invoice_id")
            invoice_id = int(invoice_id_str) if invoice_id_str else None
            return WebhookResult(
                processed=True,
                invoice_id=invoice_id,
                message=f"{event_id}|cancelled",
            )

        # Payment failed
        if event_type == "invoice.payment_failed":
            invoice_obj = event.get("data", {}).get("object", {})
            metadata = (
                invoice_obj.get("subscription_details", {}).get("metadata", {}) or {}
            )
            invoice_id_str = metadata.get("invoice_id")
            invoice_id = int(invoice_id_str) if invoice_id_str else None
            return WebhookResult(
                processed=True,
                invoice_id=invoice_id,
                message=f"{event_id}|payment_failed",
            )

        return WebhookResult(processed=True, message=event_id)
