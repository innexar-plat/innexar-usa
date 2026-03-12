"""Unit tests for workspace: project files (list, download), CRM contacts, support tickets and messages."""

from unittest.mock import AsyncMock, patch

import pytest
from app.core.security import create_token_staff
from app.models.user import User
from app.modules.crm.models import Contact
from app.modules.files.models import ProjectFile
from app.modules.projects.models import Project
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


def _staff_headers(user: User) -> dict[str, str]:
    token = create_token_staff(user.id)
    return {"Authorization": f"Bearer {token}"}


# ----- Project files -----
@pytest.mark.asyncio
async def test_workspace_projects_files_get_200(
    client: AsyncClient,
    staff_user: User,
    portal_project: Project,
) -> None:
    """GET /api/workspace/projects/{id}/files returns 200 and list."""
    r = await client.get(
        f"/api/workspace/projects/{portal_project.id}/files",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_workspace_projects_files_download_200(
    client: AsyncClient,
    staff_user: User,
    portal_project: Project,
    override_get_db: AsyncSession,
) -> None:
    """GET /api/workspace/projects/{id}/files/{file_id}/download returns 200 with mocked content."""
    pf = ProjectFile(
        project_id=portal_project.id,
        customer_id=portal_project.customer_id,
        path_key="projects/1/test.txt",
        filename="test.txt",
        content_type="text/plain",
        size=5,
    )
    override_get_db.add(pf)
    await override_get_db.flush()
    with patch(
        "app.modules.files.workspace_service.get_file_content",
        new_callable=AsyncMock,
        return_value=(b"hello", "text/plain"),
    ):
        r = await client.get(
            f"/api/workspace/projects/{portal_project.id}/files/{pf.id}/download",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 200
    assert r.content == b"hello"
    assert "attachment" in r.headers.get("content-disposition", "")


# ----- CRM contacts -----
@pytest.mark.asyncio
async def test_workspace_crm_contacts_get_200(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/crm/contacts returns 200."""
    r = await client.get(
        "/api/workspace/crm/contacts",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_workspace_crm_contacts_post_201(
    client: AsyncClient,
    staff_user: User,
    customer_and_user: tuple,
) -> None:
    """POST /api/workspace/crm/contacts returns 201."""
    customer, _ = customer_and_user
    r = await client.post(
        "/api/workspace/crm/contacts",
        headers=_staff_headers(staff_user),
        json={
            "name": "Contact One",
            "email": "contact@example.com",
            "customer_id": customer.id,
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Contact One"
    assert data["email"] == "contact@example.com"


@pytest.mark.asyncio
async def test_workspace_crm_contacts_get_by_id_200(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
    customer_and_user: tuple,
) -> None:
    """GET /api/workspace/crm/contacts/{id} returns 200."""
    customer, _ = customer_and_user
    c = Contact(name="C", email="c@x.com", customer_id=customer.id)
    override_get_db.add(c)
    await override_get_db.flush()
    r = await client.get(
        f"/api/workspace/crm/contacts/{c.id}",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    assert r.json()["name"] == "C"


@pytest.mark.asyncio
async def test_workspace_crm_contacts_patch_200(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
    customer_and_user: tuple,
) -> None:
    """PATCH /api/workspace/crm/contacts/{id} returns 200."""
    customer, _ = customer_and_user
    c = Contact(name="Original", email="o@x.com", customer_id=customer.id)
    override_get_db.add(c)
    await override_get_db.flush()
    r = await client.patch(
        f"/api/workspace/crm/contacts/{c.id}",
        headers=_staff_headers(staff_user),
        json={"name": "Updated"},
    )
    assert r.status_code == 200
    assert r.json()["name"] == "Updated"


@pytest.mark.asyncio
async def test_workspace_crm_contacts_delete_204(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
    customer_and_user: tuple,
) -> None:
    """DELETE /api/workspace/crm/contacts/{id} returns 204."""
    customer, _ = customer_and_user
    c = Contact(name="ToDelete", email="del@x.com", customer_id=customer.id)
    override_get_db.add(c)
    await override_get_db.flush()
    r = await client.delete(
        f"/api/workspace/crm/contacts/{c.id}",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 204


# ----- Support tickets -----
@pytest.mark.asyncio
async def test_workspace_support_tickets_get_200(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/support/tickets returns 200."""
    r = await client.get(
        "/api/workspace/support/tickets",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_workspace_support_tickets_post_201(
    client: AsyncClient,
    staff_user: User,
    customer_and_user: tuple,
) -> None:
    """POST /api/workspace/support/tickets returns 201."""
    customer, _ = customer_and_user
    r = await client.post(
        "/api/workspace/support/tickets",
        headers=_staff_headers(staff_user),
        json={
            "customer_id": customer.id,
            "subject": "Test ticket",
            "category": "suporte",
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert data["subject"] == "Test ticket"
    assert data["status"] == "open"


@pytest.mark.asyncio
async def test_workspace_support_tickets_messages_post_201(
    client: AsyncClient,
    staff_user: User,
    customer_and_user: tuple,
) -> None:
    """POST /api/workspace/support/tickets/{id}/messages returns 201."""
    customer, _ = customer_and_user
    create_r = await client.post(
        "/api/workspace/support/tickets",
        headers=_staff_headers(staff_user),
        json={"customer_id": customer.id, "subject": "T", "category": "suporte"},
    )
    assert create_r.status_code == 201
    ticket_id = create_r.json()["id"]
    r = await client.post(
        f"/api/workspace/support/tickets/{ticket_id}/messages",
        headers=_staff_headers(staff_user),
        json={"body": "Staff reply"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["body"] == "Staff reply"
    assert data["author_type"] == "staff"
