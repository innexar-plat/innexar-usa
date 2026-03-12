"""Workspace orders and briefings. Thin layer: validate → call service → return."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import RequirePermission
from app.models.user import User
from app.modules.orders.schemas import BriefingDetail, BriefingItem, OrderItem
from app.modules.orders.workspace_service import OrderWorkspaceService

router = APIRouter(tags=["workspace-orders"])


def get_order_workspace_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> OrderWorkspaceService:
    """Dependency: orders workspace service."""
    return OrderWorkspaceService(db)


@router.get("/orders", response_model=list[OrderItem])
async def list_orders(
    service: Annotated[OrderWorkspaceService, Depends(get_order_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("projects:read"))],
) -> list[OrderItem]:
    """List orders: paid invoices for site products with project when created."""
    return await service.list_orders()


@router.get("/briefings", response_model=list[BriefingItem])
async def list_briefings(
    service: Annotated[OrderWorkspaceService, Depends(get_order_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("projects:read"))],
    project_id: int | None = Query(None, description="Filter by project_id"),
) -> list[BriefingItem]:
    """List briefings (project requests) with customer name. Optional filter by project_id."""
    return await service.list_briefings(project_id=project_id)


@router.get("/briefings/{briefing_id}", response_model=BriefingDetail)
async def get_briefing(
    briefing_id: int,
    service: Annotated[OrderWorkspaceService, Depends(get_order_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("projects:read"))],
) -> BriefingDetail:
    """Get full briefing (project request) by id, including meta."""
    result = await service.get_briefing(briefing_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Briefing not found"
        )
    return result


@router.get("/briefings/{briefing_id}/download")
async def download_briefing(
    briefing_id: int,
    service: Annotated[OrderWorkspaceService, Depends(get_order_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("projects:read"))],
):
    """Download briefing as plain text file."""
    row = await service.get_briefing_row(briefing_id)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Briefing not found"
        )
    pr, customer_name = row
    return service.download_briefing_as_response(pr, customer_name)
