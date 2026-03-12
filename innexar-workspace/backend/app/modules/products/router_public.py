"""Public products API: list site plans and catalog. Thin layer: validate → call service → return."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.products.schemas_public import (
    ProductCatalogOut,
    ProductSiteOut,
    WaaSPlanOut,
)
from app.modules.products.public_service import ProductPublicService

router = APIRouter(prefix="/products", tags=["public-products"])


def get_product_public_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ProductPublicService:
    """Dependency: public products service."""
    return ProductPublicService(db)


@router.get("/waas", response_model=list[WaaSPlanOut])
async def list_products_waas(
    service: Annotated[ProductPublicService, Depends(get_product_public_service)],
) -> list[WaaSPlanOut]:
    """Return WaaS USA plans (Starter $129, Business $199, Pro $299) by slug. No auth."""
    return await service.list_waas()


@router.get("/catalog", response_model=list[ProductCatalogOut])
async def list_products_catalog(
    service: Annotated[ProductPublicService, Depends(get_product_public_service)],
    interval: str = Query(
        "all",
        description="Filter by plan interval: all, month (mensal), one_time (pagamento único)",
    ),
) -> list[ProductCatalogOut]:
    """Return active products with their price plans. Use interval=one_time for pagamento único."""
    return await service.list_catalog(interval=interval)


@router.get("/sites", response_model=list[ProductSiteOut])
async def list_products_sites(
    service: Annotated[ProductPublicService, Depends(get_product_public_service)],
) -> list[ProductSiteOut]:
    """Return site products (Essencial, Completo) for the landing. No auth."""
    return await service.list_sites()
