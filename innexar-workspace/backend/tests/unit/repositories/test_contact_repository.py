"""Unit tests for ContactRepository."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.crm.models import Contact
from app.repositories.contact_repository import ContactRepository


@pytest.mark.asyncio
async def test_list_all_empty(db_session: AsyncSession) -> None:
    """List when no contacts returns empty list."""
    repo = ContactRepository(db_session)
    result = await repo.list_all()
    assert result == []


@pytest.mark.asyncio
async def test_add_and_list(db_session: AsyncSession) -> None:
    """Add contact and list returns it."""
    repo = ContactRepository(db_session)
    c = Contact(
        org_id="innexar",
        name="Test Contact",
        email="contact@example.com",
        phone="+123",
    )
    repo.add(c)
    await db_session.flush()
    result = await repo.list_all()
    assert len(result) == 1
    assert result[0].email == "contact@example.com"
    assert result[0].name == "Test Contact"


@pytest.mark.asyncio
async def test_get_by_id(db_session: AsyncSession) -> None:
    """Get by id returns contact."""
    repo = ContactRepository(db_session)
    c = Contact(org_id="innexar", name="One", email="one@example.com")
    repo.add(c)
    await db_session.flush()
    await db_session.refresh(c)
    found = await repo.get_by_id(c.id)
    assert found is not None
    assert found.id == c.id
    assert found.email == "one@example.com"
    assert await repo.get_by_id(99999) is None


@pytest.mark.asyncio
async def test_delete(db_session: AsyncSession) -> None:
    """Delete removes contact."""
    repo = ContactRepository(db_session)
    c = Contact(org_id="innexar", name="Del", email="del@example.com")
    repo.add(c)
    await db_session.flush()
    await db_session.refresh(c)
    await repo.delete(c)
    await db_session.flush()
    found = await repo.get_by_id(c.id)
    assert found is None
