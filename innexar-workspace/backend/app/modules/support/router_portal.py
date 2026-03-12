"""Portal support routes: tickets for current customer. Thin: validate → service → return."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_customer import get_current_customer
from app.core.database import get_db
from app.core.feature_flags import require_portal_feature
from app.models.customer_user import CustomerUser
from app.modules.support.models import Ticket, TicketMessage
from app.modules.support.portal_service import SupportPortalService
from app.modules.support.schemas import (
    TicketCreate,
    TicketMessageCreate,
    TicketMessageResponse,
    TicketResponse,
)

router = APIRouter(prefix="/tickets", tags=["portal-support"])


def get_support_portal_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SupportPortalService:
    """Dependency: portal support service."""
    return SupportPortalService(db)


@router.get("", response_model=list[TicketResponse])
async def list_my_tickets(
    service: Annotated[SupportPortalService, Depends(get_support_portal_service)],
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    _: Annotated[None, require_portal_feature("portal.tickets.enabled")],
) -> list[Ticket]:
    """List tickets for the current customer."""
    return await service.list_my_tickets(current.customer_id)


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    body: TicketCreate,
    service: Annotated[SupportPortalService, Depends(get_support_portal_service)],
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    _: Annotated[None, require_portal_feature("portal.tickets.enabled")],
) -> Ticket:
    """Create ticket (as current customer). Optionally link to project (must own project)."""
    try:
        return await service.create_ticket(body, current.customer_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        ) from e


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_my_ticket(
    ticket_id: int,
    service: Annotated[SupportPortalService, Depends(get_support_portal_service)],
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    _: Annotated[None, require_portal_feature("portal.tickets.enabled")],
) -> Ticket:
    """Get ticket (only if owned by current customer)."""
    t = await service.get_my_ticket(ticket_id, current.customer_id)
    if not t:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return t


@router.get("/{ticket_id}/messages", response_model=list[TicketMessageResponse])
async def list_my_ticket_messages(
    ticket_id: int,
    service: Annotated[SupportPortalService, Depends(get_support_portal_service)],
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    _: Annotated[None, require_portal_feature("portal.tickets.enabled")],
) -> list[TicketMessage]:
    """List messages for a ticket (only if owned by current customer)."""
    t = await service.get_my_ticket(ticket_id, current.customer_id)
    if not t:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return await service.list_ticket_messages(ticket_id, current.customer_id) or []


@router.post(
    "/{ticket_id}/messages",
    response_model=TicketMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_ticket_message(
    ticket_id: int,
    body: TicketMessageCreate,
    service: Annotated[SupportPortalService, Depends(get_support_portal_service)],
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    _: Annotated[None, require_portal_feature("portal.tickets.enabled")],
) -> TicketMessage:
    """Add message to ticket (as customer)."""
    msg = await service.add_ticket_message(
        ticket_id, current.customer_id, body.body
    )
    if not msg:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return msg
