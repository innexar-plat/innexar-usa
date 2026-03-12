"""Unit tests for ProjectRepository."""

import pytest
from app.modules.projects.models import Project
from app.repositories.project_repository import ProjectRepository
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_list_all_empty(db_session: AsyncSession) -> None:
    """List when no projects returns empty list."""
    repo = ProjectRepository(db_session)
    result = await repo.list_all()
    assert result == []


@pytest.mark.asyncio
async def test_add_and_list(db_session: AsyncSession) -> None:
    """Add project and list returns it (order desc)."""
    repo = ProjectRepository(db_session)
    # Need a valid customer_id (FK). Create minimal customer first.
    from app.models.customer import Customer

    cust = Customer(org_id="innexar", name="C", email="c@example.com")
    db_session.add(cust)
    await db_session.flush()

    p = Project(customer_id=cust.id, name="Proj", status="active")
    repo.add(p)
    await repo.flush_and_refresh(p)
    result = await repo.list_all()
    assert len(result) == 1
    assert result[0].name == "Proj"
    assert result[0].status == "active"


@pytest.mark.asyncio
async def test_get_by_id(db_session: AsyncSession) -> None:
    """Get by id returns project or None."""
    from app.models.customer import Customer

    cust = Customer(org_id="innexar", name="C", email="c2@example.com")
    db_session.add(cust)
    await db_session.flush()
    p = Project(customer_id=cust.id, name="P", status="active")
    repo = ProjectRepository(db_session)
    repo.add(p)
    await repo.flush_and_refresh(p)

    found = await repo.get_by_id(p.id)
    assert found is not None
    assert found.id == p.id
    assert found.name == "P"
    assert await repo.get_by_id(99999) is None


@pytest.mark.asyncio
async def test_list_all_order_desc(db_session: AsyncSession) -> None:
    """List with order_desc returns newest first."""
    from app.models.customer import Customer

    cust = Customer(org_id="innexar", name="C", email="ord@example.com")
    db_session.add(cust)
    await db_session.flush()
    repo = ProjectRepository(db_session)
    p1 = Project(customer_id=cust.id, name="First", status="active")
    repo.add(p1)
    await repo.flush_and_refresh(p1)
    p2 = Project(customer_id=cust.id, name="Second", status="active")
    repo.add(p2)
    await repo.flush_and_refresh(p2)

    result = await repo.list_all(order_desc=True)
    assert len(result) == 2
    assert result[0].name == "Second"
    assert result[1].name == "First"
