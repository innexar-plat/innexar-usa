"""Workspace billing: subscriptions CRUD and link-hestia. Thin: validate → service → response."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.rbac import RequirePermission
from app.models.user import User
from app.modules.billing.dependencies import (
    get_billing_workspace_service,
    require_billing_enabled,
)
from app.modules.billing.schemas import (
    LinkHestiaBody,
    LinkHestiaResponse,
    SubscriptionCreate,
    SubscriptionResponse,
    SubscriptionUpdate,
)
from app.modules.billing.workspace_service import BillingWorkspaceService

router = APIRouter()


@router.get("/subscriptions", response_model=list[SubscriptionResponse])
async def list_subscriptions(
    service: Annotated[BillingWorkspaceService, Depends(get_billing_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("billing:read"))],
    __: Annotated[None, Depends(require_billing_enabled)],
    customer_id: int | None = None,
):
    subs = await service.list_subscriptions(customer_id=customer_id)
    return [SubscriptionResponse.model_validate(s) for s in subs]


@router.post("/subscriptions", response_model=SubscriptionResponse, status_code=201)
async def create_subscription(
    body: SubscriptionCreate,
    service: Annotated[BillingWorkspaceService, Depends(get_billing_workspace_service)],
    current: Annotated[User, Depends(RequirePermission("billing:write"))],
    __: Annotated[None, Depends(require_billing_enabled)],
):
    sub = await service.create_subscription(
        body,
        actor_id=str(current.id),
        org_id=current.org_id or "innexar",
    )
    return SubscriptionResponse.model_validate(sub)


@router.patch("/subscriptions/{subscription_id}", response_model=SubscriptionResponse)
async def update_subscription(
    subscription_id: int,
    body: SubscriptionUpdate,
    service: Annotated[BillingWorkspaceService, Depends(get_billing_workspace_service)],
    current: Annotated[User, Depends(RequirePermission("billing:write"))],
    __: Annotated[None, Depends(require_billing_enabled)],
):
    sub = await service.update_subscription(
        subscription_id,
        body,
        org_id=current.org_id or "innexar",
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return SubscriptionResponse.model_validate(sub)


@router.post(
    "/subscriptions/{subscription_id}/link-hestia",
    response_model=LinkHestiaResponse,
    status_code=status.HTTP_201_CREATED,
)
async def link_hestia_user(
    subscription_id: int,
    body: LinkHestiaBody,
    service: Annotated[BillingWorkspaceService, Depends(get_billing_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("billing:write"))],
    __: Annotated[None, Depends(require_billing_enabled)],
):
    """Link an existing Hestia user to a subscription (creates ProvisioningRecord only)."""
    try:
        rec = await service.link_hestia_user(subscription_id, body)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    if not rec:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return LinkHestiaResponse(ok=True, provisioning_record_id=rec.id)
