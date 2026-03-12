"""Unit tests for ProjectActivityRepository."""

import pytest
from app.models.customer import Customer
from app.modules.projects.models import Project
from app.modules.projects.modification_request import ModificationRequest
from app.modules.projects.project_message import ProjectMessage
from app.repositories.project_activity_repository import ProjectActivityRepository
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_list_messages_empty(db_session: AsyncSession) -> None:
    """List messages for non-existent or empty project returns empty list."""
    repo = ProjectActivityRepository(db_session)
    result = await repo.list_messages_by_project_id(1)
    assert result == []


@pytest.mark.asyncio
async def test_add_message_and_list(db_session: AsyncSession) -> None:
    """Add message and list by project_id returns it in order."""
    cust = Customer(org_id="innexar", name="C", email="msg@example.com")
    db_session.add(cust)
    await db_session.flush()
    proj = Project(customer_id=cust.id, name="P", status="active")
    db_session.add(proj)
    await db_session.flush()

    repo = ProjectActivityRepository(db_session)
    msg = ProjectMessage(
        project_id=proj.id,
        sender_type="staff",
        sender_id=1,
        sender_name="Staff",
        body="Hello",
    )
    repo.add_message(msg)
    await repo.flush_and_refresh_message(msg)

    result = await repo.list_messages_by_project_id(proj.id)
    assert len(result) == 1
    assert result[0].body == "Hello"
    assert result[0].sender_type == "staff"
    assert await repo.list_messages_by_project_id(99999) == []


@pytest.mark.asyncio
async def test_list_modification_requests_empty(db_session: AsyncSession) -> None:
    """List modification requests for empty project returns empty list."""
    repo = ProjectActivityRepository(db_session)
    result = await repo.list_modification_requests_by_project_id(1)
    assert result == []


@pytest.mark.asyncio
async def test_add_mod_req_and_list(db_session: AsyncSession) -> None:
    """Add modification request and list by project_id returns it."""
    cust = Customer(org_id="innexar", name="C", email="mod@example.com")
    db_session.add(cust)
    await db_session.flush()
    proj = Project(customer_id=cust.id, name="P", status="active")
    db_session.add(proj)
    await db_session.flush()

    req = ModificationRequest(
        project_id=proj.id,
        customer_id=cust.id,
        title="Change color",
        description="Make it blue",
        status="pending",
    )
    db_session.add(req)
    await db_session.flush()

    repo = ProjectActivityRepository(db_session)
    result = await repo.list_modification_requests_by_project_id(proj.id)
    assert len(result) == 1
    assert result[0].title == "Change color"
    assert result[0].status == "pending"


@pytest.mark.asyncio
async def test_get_modification_request_by_id(db_session: AsyncSession) -> None:
    """Get modification request by id returns it or None."""
    cust = Customer(org_id="innexar", name="C", email="getmod@example.com")
    db_session.add(cust)
    await db_session.flush()
    proj = Project(customer_id=cust.id, name="P", status="active")
    db_session.add(proj)
    await db_session.flush()
    req = ModificationRequest(
        project_id=proj.id,
        customer_id=cust.id,
        title="T",
        description="D",
        status="pending",
    )
    db_session.add(req)
    await db_session.flush()

    repo = ProjectActivityRepository(db_session)
    found = await repo.get_modification_request_by_id(req.id)
    assert found is not None
    assert found.id == req.id
    assert found.title == "T"
    assert await repo.get_modification_request_by_id(99999) is None
