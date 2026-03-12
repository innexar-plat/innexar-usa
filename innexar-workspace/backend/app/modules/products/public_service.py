"""Public products service: list waas, catalog, sites. Uses BillingRepository only."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.products.schemas_public import (
    SITE_PLAN_META,
    SITE_PRODUCT_NAMES,
    PricePlanOut,
    ProductCatalogOut,
    ProductSiteOut,
    WaaS_PLAN_META,
    WaaS_PRODUCT_NAMES,
    WaaSPlanOut,
)
from app.repositories.billing_repository import BillingRepository


class ProductPublicService:
    """Public product listing. Depends on BillingRepository."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._repo = BillingRepository(db)

    async def list_waas(self) -> list[WaaSPlanOut]:
        """Return WaaS USA plans (Starter, Business, Pro) by slug."""
        rows = await self._repo.list_products_and_plans_by_filter(
            org_id="innexar",
            product_names=WaaS_PRODUCT_NAMES,
            plan_interval="month",
            plan_currency="USD",
        )
        result: list[WaaSPlanOut] = []
        for product, price_plan in rows:
            meta = WaaS_PLAN_META.get(product.name, {})
            slug = meta.get("slug", "")
            if not slug:
                continue
            result.append(
                WaaSPlanOut(
                    slug=slug,
                    name=product.name,
                    price=float(price_plan.amount),
                    currency=price_plan.currency or "USD",
                    features=meta.get("features", []),
                )
            )
        return result

    async def list_catalog(self, interval: str = "all") -> list[ProductCatalogOut]:
        """Return active products with price plans. interval: all, month, one_time."""
        products = await self._repo.list_products_with_plans(
            org_id="innexar", is_active=True
        )
        result: list[ProductCatalogOut] = []
        for p in products:
            plans = [
                PricePlanOut(
                    id=pp.id,
                    name=pp.name,
                    amount=float(pp.amount),
                    interval=pp.interval,
                    currency=pp.currency or "BRL",
                )
                for pp in p.price_plans
                if interval == "all"
                or (interval == "month" and pp.interval == "month")
                or (interval == "one_time" and pp.interval == "one_time")
            ]
            if not plans:
                continue
            result.append(
                ProductCatalogOut(
                    id=p.id,
                    name=p.name,
                    description=p.description,
                    plans=plans,
                )
            )
        return result

    async def list_sites(self) -> list[ProductSiteOut]:
        """Return site products (Essencial, Completo) for landing."""
        rows = await self._repo.list_products_and_plans_by_filter(
            org_id="innexar",
            product_names=SITE_PRODUCT_NAMES,
            plan_interval="month",
        )
        result: list[ProductSiteOut] = []
        for product, price_plan in rows:
            meta = SITE_PLAN_META.get(product.name, {})
            result.append(
                ProductSiteOut(
                    id=product.id,
                    name=product.name,
                    description=product.description,
                    price_plan=PricePlanOut(
                        id=price_plan.id,
                        name=price_plan.name,
                        amount=float(price_plan.amount),
                        interval=price_plan.interval,
                        currency=price_plan.currency or "BRL",
                    ),
                    delivery_hours=meta.get("delivery_hours", 48),
                    features=meta.get("features", []),
                )
            )
        return result
