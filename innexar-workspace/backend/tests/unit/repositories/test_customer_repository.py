"""Unit tests for CustomerRepository."""

import pytest
from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from app.repositories.customer_repository import CustomerRepository
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_list_all_with_users_empty(db_session: AsyncSession) -> None:
    """List when no customers returns empty list."""
    repo = CustomerRepository(db_session)
    result = await repo.list_all_with_users()
    assert result == []


@pytest.mark.asyncio
async def test_add_and_list(db_session: AsyncSession) -> None:
    """Add customer and list returns it with users loaded."""
    repo = CustomerRepository(db_session)
    c = Customer(org_id="innexar", name="Test", email="test@example.com")
    repo.add(c)
    await db_session.flush()
    result = await repo.list_all_with_users()
    assert len(result) == 1
    assert result[0].email == "test@example.com"
    assert result[0].users == []


@pytest.mark.asyncio
async def test_get_by_id_with_users(db_session: AsyncSession) -> None:
    """Get by id returns customer with users."""
    repo = CustomerRepository(db_session)
    c = Customer(org_id="innexar", name="One", email="one@example.com")
    repo.add(c)
    await db_session.flush()
    await db_session.refresh(c)
    found = await repo.get_by_id_with_users(c.id)
    assert found is not None
    assert found.id == c.id
    assert found.email == "one@example.com"


@pytest.mark.asyncio
async def test_get_by_email(db_session: AsyncSession) -> None:
    """Get by email returns customer."""
    repo = CustomerRepository(db_session)
    c = Customer(org_id="innexar", name="E", email="e@example.com")
    repo.add(c)
    await db_session.flush()
    found = await repo.get_by_email("e@example.com")
    assert found is not None
    assert found.id == c.id
    assert await repo.get_by_email("other@example.com") is None


@pytest.mark.asyncio
async def test_delete_customer_and_users(db_session: AsyncSession) -> None:
    """Delete removes customer and its users."""
    repo = CustomerRepository(db_session)
    c = Customer(org_id="innexar", name="Del", email="del@example.com")
    repo.add(c)
    await db_session.flush()
    await db_session.refresh(c)
    cu = CustomerUser(
        customer_id=c.id,
        email=c.email,
        password_hash="hash",
    )
    repo.add_customer_user(cu)
    await db_session.flush()
    ok = await repo.delete_customer_and_users(c.id)
    assert ok is True
    await db_session.flush()
    found = await repo.get_by_id_with_users(c.id)
    assert found is None
