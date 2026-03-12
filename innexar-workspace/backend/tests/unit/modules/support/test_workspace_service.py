"""Unit tests for SupportWorkspaceService."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from app.models.customer import Customer
from app.modules.support.schemas import TicketCreate, TicketMessageCreate
from app.modules.support.workspace_service import SupportWorkspaceService
from app.repositories.customer_repository import CustomerRepository
from app.repositories.support_repository import SupportRepository
from sqlalchemy.ext.asyncio import AsyncSession


def _make_service(db: AsyncSession) -> SupportWorkspaceService:
    return SupportWorkspaceService(
        db,
        support_repo=SupportRepository(db),
        customer_repo=CustomerRepository(db),
    )


@pytest.mark.asyncio
async def test_list_tickets_empty(db_session: AsyncSession) -> None:
    """List when no tickets returns empty list."""
    svc = _make_service(db_session)
    result = await svc.list_tickets()
    assert result == []


@pytest.mark.asyncio
async def test_create_ticket_customer_id_required(db_session: AsyncSession) -> None:
    """Create ticket without customer_id raises ValueError."""
    svc = _make_service(db_session)
    body = TicketCreate(subject="Help", customer_id=None)
    mock_bg = MagicMock()
    with pytest.raises(ValueError, match="customer_id required"):
        await svc.create_ticket(body, org_id="innexar", background_tasks=mock_bg)


@pytest.mark.asyncio
async def test_create_ticket_success(db_session: AsyncSession) -> None:
    """Create ticket returns Ticket; notification is called when customer has email."""
    cust = Customer(org_id="innexar", name="C", email="ticket@example.com")
    db_session.add(cust)
    await db_session.flush()

    with patch(
        "app.modules.notifications.service.create_notification_and_maybe_send_email",
        new_callable=AsyncMock,
    ) as mock_notif:
        svc = _make_service(db_session)
        body = TicketCreate(
            subject="Need help", customer_id=cust.id, category="suporte"
        )
        mock_bg = MagicMock()
        t = await svc.create_ticket(body, org_id="innexar", background_tasks=mock_bg)

        assert t.id is not None
        assert t.subject == "Need help"
        assert t.customer_id == cust.id
        assert t.status == "open"
        assert t.category == "suporte"
        mock_notif.assert_called_once()


@pytest.mark.asyncio
async def test_get_ticket_not_found(db_session: AsyncSession) -> None:
    """Get non-existent ticket returns None."""
    svc = _make_service(db_session)
    assert await svc.get_ticket(99999) is None


@pytest.mark.asyncio
async def test_add_ticket_message_not_found(db_session: AsyncSession) -> None:
    """Add message to non-existent ticket returns None."""
    svc = _make_service(db_session)
    result = await svc.add_ticket_message(99999, TicketMessageCreate(body="Hi"))
    assert result is None


@pytest.mark.asyncio
async def test_add_ticket_message_success(db_session: AsyncSession) -> None:
    """Add message to ticket returns TicketMessage."""
    cust = Customer(org_id="innexar", name="C", email="msg2@example.com")
    db_session.add(cust)
    await db_session.flush()
    from app.modules.support.models import Ticket

    t = Ticket(customer_id=cust.id, subject="S", status="open", category="suporte")
    db_session.add(t)
    await db_session.flush()
    await db_session.refresh(t)

    svc = _make_service(db_session)
    msg = await svc.add_ticket_message(t.id, TicketMessageCreate(body="Staff reply"))
    assert msg is not None
    assert msg.ticket_id == t.id
    assert msg.body == "Staff reply"
    assert msg.author_type == "staff"
