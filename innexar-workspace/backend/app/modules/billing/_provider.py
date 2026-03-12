"""Payment provider resolution from IntegrationConfig or env. Internal use by billing services."""

import os

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.encryption import decrypt_value
from app.models.integration_config import IntegrationConfig
from app.providers.payments.mercadopago import MercadoPagoProvider
from app.providers.payments.stripe import StripeProvider


async def get_payment_provider(
    db: AsyncSession,
    customer_id: int,
    org_id: str,
    currency: str,
    mode: str = "test",
) -> StripeProvider | MercadoPagoProvider:
    """Resolve provider from IntegrationConfig (customer → tenant → global), else env fallback."""
    provider_name = (
        "mercadopago" if (currency or "BRL").upper() == "BRL" else "stripe"
    )
    key_name = (
        "access_token" if provider_name == "mercadopago" else "secret_key"
    )

    if provider_name == "mercadopago":
        env_token = (
            os.environ.get("MP_ACCESS_TOKEN")
            or os.environ.get("MERCADOPAGO_ACCESS_TOKEN")
            or ""
        ).strip()
        if env_token:
            return MercadoPagoProvider(access_token=env_token)

    base_filters = [
        IntegrationConfig.provider == provider_name,
        IntegrationConfig.key == key_name,
        IntegrationConfig.enabled.is_(True),
        IntegrationConfig.mode == mode,
    ]

    for scope in ["customer", "tenant", "global"]:
        if scope == "customer":
            q = (
                select(IntegrationConfig)
                .where(
                    IntegrationConfig.scope == "customer",
                    IntegrationConfig.customer_id == customer_id,
                    *base_filters,
                )
                .limit(1)
            )
        elif scope == "tenant":
            q = (
                select(IntegrationConfig)
                .where(
                    IntegrationConfig.scope == "tenant",
                    IntegrationConfig.org_id == org_id,
                    IntegrationConfig.customer_id.is_(None),
                    *base_filters,
                )
                .limit(1)
            )
        else:
            q = (
                select(IntegrationConfig)
                .where(
                    IntegrationConfig.scope == "global",
                    IntegrationConfig.customer_id.is_(None),
                    *base_filters,
                )
                .limit(1)
            )
        r = await db.execute(q)
        cfg = r.scalar_one_or_none()
        if cfg and cfg.value_encrypted:
            secret = decrypt_value(cfg.value_encrypted)
            if secret:
                if provider_name == "stripe":
                    return StripeProvider(api_key=secret)
                return MercadoPagoProvider(access_token=secret)

    if provider_name == "stripe":
        return StripeProvider()
    return MercadoPagoProvider()
