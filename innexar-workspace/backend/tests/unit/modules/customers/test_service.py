"""Unit tests for CustomerService."""

import pytest
from app.modules.customers.schemas import CustomerCreate, CustomerUpdate
from app.modules.customers.service import CustomerService
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_list_customers_empty(db_session: AsyncSession) -> None:
    """List when no customers returns empty list."""
    svc = CustomerService(db_session)
    result = await svc.list_customers()
    assert result == []


@pytest.mark.asyncio
async def test_create_customer(db_session: AsyncSession) -> None:
    """Create customer returns CustomerResponse."""
    svc = CustomerService(db_session)
    body = CustomerCreate(name="New", email="new@example.com")
    resp = await svc.create_customer(body)
    assert resp.name == "New"
    assert resp.email == "new@example.com"
    assert resp.id is not None
    assert resp.has_portal_access is False


@pytest.mark.asyncio
async def test_create_customer_duplicate_email_raises(db_session: AsyncSession) -> None:
    """Create with existing email raises ValueError."""
    svc = CustomerService(db_session)
    body = CustomerCreate(name="A", email="dup@example.com")
    await svc.create_customer(body)
    with pytest.raises(ValueError, match="already exists"):
        await svc.create_customer(body)


@pytest.mark.asyncio
async def test_get_customer_not_found(db_session: AsyncSession) -> None:
    """Get non-existent customer returns None."""
    svc = CustomerService(db_session)
    assert await svc.get_customer(999) is None


@pytest.mark.asyncio
async def test_update_customer_not_found(db_session: AsyncSession) -> None:
    """Update non-existent customer returns None."""
    svc = CustomerService(db_session)
    result = await svc.update_customer(999, CustomerUpdate(name="X"))
    assert result is None


@pytest.mark.asyncio
async def test_delete_customer_not_found(db_session: AsyncSession) -> None:
    """Delete non-existent customer returns False."""
    svc = CustomerService(db_session)
    assert await svc.delete_customer(999) is False
