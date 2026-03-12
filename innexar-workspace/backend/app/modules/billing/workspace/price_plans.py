"""Workspace billing: price plans CRUD. Thin layer: validate → call service → return response."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.rbac import RequirePermission
from app.models.user import User
from app.modules.billing.dependencies import (
    get_billing_workspace_service,
    require_billing_enabled,
)
from app.modules.billing.schemas import (
    PricePlanCreate,
    PricePlanResponse,
    PricePlanUpdate,
)
from app.modules.billing.workspace_service import BillingWorkspaceService

router = APIRouter()


@router.get("/price-plans", response_model=list[PricePlanResponse])
async def list_price_plans(
    service: Annotated[BillingWorkspaceService, Depends(get_billing_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("billing:read"))],
    __: Annotated[None, Depends(require_billing_enabled)],
    product_id: int | None = None,
):
    plans = await service.list_price_plans(product_id=product_id)
    return [PricePlanResponse.model_validate(pp) for pp in plans]


@router.post("/price-plans", response_model=PricePlanResponse, status_code=201)
async def create_price_plan(
    body: PricePlanCreate,
    service: Annotated[BillingWorkspaceService, Depends(get_billing_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("billing:write"))],
    __: Annotated[None, Depends(require_billing_enabled)],
):
    pp = await service.create_price_plan(body)
    return PricePlanResponse.model_validate(pp)


@router.patch("/price-plans/{plan_id}", response_model=PricePlanResponse)
async def update_price_plan(
    plan_id: int,
    body: PricePlanUpdate,
    service: Annotated[BillingWorkspaceService, Depends(get_billing_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("billing:write"))],
    __: Annotated[None, Depends(require_billing_enabled)],
):
    pp = await service.update_price_plan(plan_id, body)
    if not pp:
        raise HTTPException(status_code=404, detail="Price plan not found")
    return PricePlanResponse.model_validate(pp)
