"""Public products API: response schemas."""

from typing import Any

from pydantic import BaseModel


class PricePlanOut(BaseModel):
    """Price plan for public catalog."""

    id: int
    name: str
    amount: float
    interval: str
    currency: str


class ProductSiteOut(BaseModel):
    """Site product with single plan and delivery/features meta."""

    id: int
    name: str
    description: str | None
    price_plan: PricePlanOut
    delivery_hours: int
    features: list[str]


class ProductCatalogOut(BaseModel):
    """Product with all price plans for catalog (monthly and/or one-time)."""

    id: int
    name: str
    description: str | None
    plans: list[PricePlanOut]


class WaaSPlanOut(BaseModel):
    """WaaS plan for frontend; frontend uses slug only."""

    slug: str
    name: str
    price: float
    currency: str
    features: list[str]


# Meta constants for site/waas (not in DB)
SITE_PRODUCT_NAMES = ("Site Essencial", "Site Completo")
WaaS_PRODUCT_NAMES = ("Starter Website", "Business Website", "Pro Website")

WaaS_PLAN_META: dict[str, dict[str, Any]] = {
    "Starter Website": {
        "slug": "starter",
        "features": [
            "5 pages",
            "Hosting included",
            "SSL security",
            "Basic SEO",
            "1 content update/month",
            "Email support",
        ],
    },
    "Business Website": {
        "slug": "business",
        "features": [
            "10 pages",
            "Blog",
            "Analytics integration",
            "SEO optimized",
            "3 updates/month",
            "Priority support",
        ],
    },
    "Pro Website": {
        "slug": "pro",
        "features": [
            "Unlimited pages",
            "Advanced SEO",
            "Integrations (CRM, etc.)",
            "Priority support",
        ],
    },
}

SITE_PLAN_META: dict[str, dict[str, Any]] = {
    "Site Essencial": {
        "delivery_hours": 48,
        "features": [
            "Site institucional",
            "Até 5 páginas",
            "Design profissional",
            "Responsivo (celular e computador)",
            "Integração WhatsApp",
            "SEO básico",
            "Hospedagem incluída",
            "SSL",
            "Manutenção e suporte",
        ],
    },
    "Site Completo": {
        "delivery_hours": 72,
        "features": [
            "Tudo do plano essencial",
            "Blog integrado",
            "Sistema de agendamento",
            "Painel administrativo",
            "SEO avançado",
            "Integrações",
            "Estrutura para crescimento",
        ],
    },
}
