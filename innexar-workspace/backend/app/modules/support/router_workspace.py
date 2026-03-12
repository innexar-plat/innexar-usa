"""Workspace support routes: tickets. Thin: validate → service → response."""

from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import RequirePermission
from app.models.user import User
from app.modules.support.schemas import (
    TicketCreate,
    TicketMessageCreate,
    TicketMessageResponse,
    TicketResponse,
)
from app.modules.support.workspace_service import SupportWorkspaceService

router = APIRouter(prefix="/support", tags=["workspace-support"])


def get_support_workspace_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SupportWorkspaceService:
    from app.repositories.customer_repository import CustomerRepository
    from app.repositories.support_repository import SupportRepository

    return SupportWorkspaceService(
        db,
        support_repo=SupportRepository(db),
        customer_repo=CustomerRepository(db),
    )


@router.get("/tickets", response_model=list[TicketResponse])
async def list_tickets(
    service: Annotated[SupportWorkspaceService, Depends(get_support_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("support:read"))],
    category: str | None = Query(None, description="Filter by category"),
    project_id: int | None = Query(None, description="Filter by project_id"),
):
    """List tickets (workspace). Optional filters: category, project_id."""
    tickets = await service.list_tickets(category=category, project_id=project_id)
    return [TicketResponse.model_validate(t) for t in tickets]


@router.post("/tickets", response_model=TicketResponse, status_code=201)
async def create_ticket(
    body: TicketCreate,
    service: Annotated[SupportWorkspaceService, Depends(get_support_workspace_service)],
    background_tasks: BackgroundTasks,
    current: Annotated[User, Depends(RequirePermission("support:write"))],
):
    """Create ticket (workspace)."""
    try:
        t = await service.create_ticket(
            body,
            org_id=current.org_id or "innexar",
            background_tasks=background_tasks,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return TicketResponse.model_validate(t)


@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: int,
    service: Annotated[SupportWorkspaceService, Depends(get_support_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("support:read"))],
):
    """Get ticket by id."""
    t = await service.get_ticket(ticket_id)
    if not t:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return TicketResponse.model_validate(t)


@router.post(
    "/tickets/{ticket_id}/messages",
    response_model=TicketMessageResponse,
    status_code=201,
)
async def add_ticket_message(
    ticket_id: int,
    body: TicketMessageCreate,
    service: Annotated[SupportWorkspaceService, Depends(get_support_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("support:write"))],
):
    """Add message to ticket (as staff)."""
    msg = await service.add_ticket_message(ticket_id, body)
    if not msg:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return TicketMessageResponse.model_validate(msg)
