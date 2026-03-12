"""Unit tests for SupportRepository."""

import pytest
from app.models.customer import Customer
from app.modules.support.models import Ticket, TicketMessage
from app.repositories.support_repository import SupportRepository
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_list_tickets_empty(db_session: AsyncSession) -> None:
    """List when no tickets returns empty list."""
    repo = SupportRepository(db_session)
    result = await repo.list_tickets()
    assert result == []


@pytest.mark.asyncio
async def test_add_ticket_and_list(db_session: AsyncSession) -> None:
    """Add ticket and list returns it."""
    cust = Customer(org_id="innexar", name="C", email="sup@example.com")
    db_session.add(cust)
    await db_session.flush()

    repo = SupportRepository(db_session)
    t = Ticket(customer_id=cust.id, subject="Help", status="open", category="suporte")
    repo.add_ticket(t)
    await repo.flush_and_refresh_ticket(t)

    result = await repo.list_tickets()
    assert len(result) == 1
    assert result[0].subject == "Help"
    assert result[0].category == "suporte"


@pytest.mark.asyncio
async def test_list_tickets_filter_category(db_session: AsyncSession) -> None:
    """List with category filter returns only matching tickets."""
    cust = Customer(org_id="innexar", name="C", email="cat@example.com")
    db_session.add(cust)
    await db_session.flush()
    repo = SupportRepository(db_session)
    t1 = Ticket(customer_id=cust.id, subject="S1", status="open", category="suporte")
    t2 = Ticket(customer_id=cust.id, subject="S2", status="open", category="financeiro")
    repo.add_ticket(t1)
    await repo.flush_and_refresh_ticket(t1)
    repo.add_ticket(t2)
    await repo.flush_and_refresh_ticket(t2)

    result = await repo.list_tickets(category="financeiro")
    assert len(result) == 1
    assert result[0].category == "financeiro"


@pytest.mark.asyncio
async def test_get_ticket_by_id(db_session: AsyncSession) -> None:
    """Get by id returns ticket or None."""
    cust = Customer(org_id="innexar", name="C", email="get@example.com")
    db_session.add(cust)
    await db_session.flush()
    repo = SupportRepository(db_session)
    t = Ticket(customer_id=cust.id, subject="Get me", status="open", category="suporte")
    repo.add_ticket(t)
    await repo.flush_and_refresh_ticket(t)

    found = await repo.get_ticket_by_id(t.id)
    assert found is not None
    assert found.id == t.id
    assert found.subject == "Get me"
    assert await repo.get_ticket_by_id(99999) is None


@pytest.mark.asyncio
async def test_add_message(db_session: AsyncSession) -> None:
    """Add message to ticket and refresh."""
    cust = Customer(org_id="innexar", name="C", email="msg@example.com")
    db_session.add(cust)
    await db_session.flush()
    repo = SupportRepository(db_session)
    t = Ticket(
        customer_id=cust.id, subject="Msg ticket", status="open", category="suporte"
    )
    repo.add_ticket(t)
    await repo.flush_and_refresh_ticket(t)

    msg = TicketMessage(ticket_id=t.id, author_type="staff", body="Hello")
    repo.add_message(msg)
    await repo.flush_and_refresh_message(msg)

    assert msg.id is not None
    assert msg.body == "Hello"
    assert msg.author_type == "staff"
