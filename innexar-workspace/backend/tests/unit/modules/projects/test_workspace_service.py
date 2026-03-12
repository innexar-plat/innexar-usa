"""Unit tests for ProjectWorkspaceService."""

import pytest
from app.models.customer import Customer
from app.models.user import User
from app.modules.projects.models import Project
from app.modules.projects.modification_request import ModificationRequest
from app.modules.projects.project_message import ProjectMessage
from app.modules.projects.schemas import ProjectCreate, ProjectUpdate
from app.modules.projects.workspace_service import ProjectWorkspaceService
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_list_projects_empty(db_session: AsyncSession) -> None:
    """List when no projects returns empty list."""
    svc = ProjectWorkspaceService(db_session)
    result = await svc.list_projects()
    assert result == []


@pytest.mark.asyncio
async def test_create_project(db_session: AsyncSession) -> None:
    """Create project returns Project with correct fields."""
    cust = Customer(org_id="innexar", name="C", email="proj@example.com")
    db_session.add(cust)
    await db_session.flush()

    svc = ProjectWorkspaceService(db_session)
    body = ProjectCreate(customer_id=cust.id, name="My Project", status="active")
    p = await svc.create_project(body)
    assert p.id is not None
    assert p.name == "My Project"
    assert p.customer_id == cust.id
    assert p.status == "active"


@pytest.mark.asyncio
async def test_get_project_not_found(db_session: AsyncSession) -> None:
    """Get non-existent project returns None."""
    svc = ProjectWorkspaceService(db_session)
    assert await svc.get_project(99999) is None


@pytest.mark.asyncio
async def test_update_project_not_found(db_session: AsyncSession) -> None:
    """Update non-existent project returns None."""
    svc = ProjectWorkspaceService(db_session)
    result = await svc.update_project(99999, ProjectUpdate(name="X"))
    assert result is None


@pytest.mark.asyncio
async def test_update_project_invalid_status_raises(db_session: AsyncSession) -> None:
    """Update with invalid status raises ValueError."""
    cust = Customer(org_id="innexar", name="C", email="upd@example.com")
    db_session.add(cust)
    await db_session.flush()
    svc = ProjectWorkspaceService(db_session)
    body = ProjectCreate(customer_id=cust.id, name="P", status="active")
    p = await svc.create_project(body)

    with pytest.raises(ValueError, match="status must be one of"):
        await svc.update_project(p.id, ProjectUpdate(status="invalid_status"))


@pytest.mark.asyncio
async def test_update_project_name_and_status(db_session: AsyncSession) -> None:
    """Update project name and status succeeds."""
    cust = Customer(org_id="innexar", name="C", email="up2@example.com")
    db_session.add(cust)
    await db_session.flush()
    svc = ProjectWorkspaceService(db_session)
    body = ProjectCreate(customer_id=cust.id, name="Original", status="active")
    p = await svc.create_project(body)

    updated = await svc.update_project(
        p.id,
        ProjectUpdate(name="Updated", status="desenvolvimento"),
    )
    assert updated is not None
    assert updated.name == "Updated"
    assert updated.status == "desenvolvimento"


@pytest.mark.asyncio
async def test_list_project_messages_empty(db_session: AsyncSession) -> None:
    """List messages for project returns empty list when none."""
    svc = ProjectWorkspaceService(db_session)
    result = await svc.list_project_messages(1)
    assert result == []


@pytest.mark.asyncio
async def test_list_project_messages_returns_messages(db_session: AsyncSession) -> None:
    """List messages returns ProjectMessageResponse list."""
    cust = Customer(org_id="innexar", name="C", email="lm@example.com")
    db_session.add(cust)
    await db_session.flush()
    proj = Project(customer_id=cust.id, name="P", status="active")
    db_session.add(proj)
    await db_session.flush()
    msg = ProjectMessage(
        project_id=proj.id,
        sender_type="customer",
        sender_id=cust.id,
        sender_name="C",
        body="Hi",
    )
    db_session.add(msg)
    await db_session.flush()

    svc = ProjectWorkspaceService(db_session)
    result = await svc.list_project_messages(proj.id)
    assert len(result) == 1
    assert result[0].body == "Hi"
    assert result[0].sender_type == "customer"


@pytest.mark.asyncio
async def test_send_project_message(db_session: AsyncSession) -> None:
    """Send staff message returns ProjectMessageResponse."""
    cust = Customer(org_id="innexar", name="C", email="send@example.com")
    db_session.add(cust)
    await db_session.flush()
    proj = Project(customer_id=cust.id, name="P", status="active")
    db_session.add(proj)
    await db_session.flush()
    staff = User(
        email="staff.user@test.com",
        password_hash="x",
        role="admin",
        org_id="innexar",
    )
    db_session.add(staff)
    await db_session.flush()

    svc = ProjectWorkspaceService(db_session)
    out = await svc.send_project_message(proj.id, "Staff reply", staff)
    assert out.id is not None
    assert out.body == "Staff reply"
    assert out.sender_type == "staff"
    assert (
        "staff" in (out.sender_name or "").lower()
        or "user" in (out.sender_name or "").lower()
    )


@pytest.mark.asyncio
async def test_list_modification_requests_empty(db_session: AsyncSession) -> None:
    """List modification requests returns empty list when none."""
    svc = ProjectWorkspaceService(db_session)
    result = await svc.list_modification_requests(1)
    assert result == []


@pytest.mark.asyncio
async def test_list_modification_requests_returns_list(
    db_session: AsyncSession,
) -> None:
    """List modification requests returns list of items."""
    cust = Customer(org_id="innexar", name="C", email="modl@example.com")
    db_session.add(cust)
    await db_session.flush()
    proj = Project(customer_id=cust.id, name="P", status="active")
    db_session.add(proj)
    await db_session.flush()
    req = ModificationRequest(
        project_id=proj.id,
        customer_id=cust.id,
        title="Adjust",
        description="Desc",
        status="pending",
    )
    db_session.add(req)
    await db_session.flush()

    svc = ProjectWorkspaceService(db_session)
    result = await svc.list_modification_requests(proj.id)
    assert len(result) == 1
    assert result[0].title == "Adjust"
    assert result[0].status == "pending"


@pytest.mark.asyncio
async def test_update_modification_request_not_found(db_session: AsyncSession) -> None:
    """Update non-existent modification request returns None."""
    svc = ProjectWorkspaceService(db_session)
    result = await svc.update_modification_request(
        99999, status="in_progress", staff_notes="Note"
    )
    assert result is None


@pytest.mark.asyncio
async def test_update_modification_request_success(db_session: AsyncSession) -> None:
    """Update modification request status and notes succeeds."""
    cust = Customer(org_id="innexar", name="C", email="umod@example.com")
    db_session.add(cust)
    await db_session.flush()
    proj = Project(customer_id=cust.id, name="P", status="active")
    db_session.add(proj)
    await db_session.flush()
    req = ModificationRequest(
        project_id=proj.id,
        customer_id=cust.id,
        title="Req",
        description="D",
        status="pending",
    )
    db_session.add(req)
    await db_session.flush()

    svc = ProjectWorkspaceService(db_session)
    out = await svc.update_modification_request(
        req.id, status="in_progress", staff_notes="Working on it"
    )
    assert out is not None
    assert out.id == req.id
    assert out.status == "in_progress"
    assert out.staff_notes == "Working on it"
