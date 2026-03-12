"""Portal API tests: projects list (files_count), project files, messages, modification-requests."""

import io

import pytest
from app.core.security import create_token_customer
from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from app.modules.files.models import ProjectFile
from app.modules.projects.models import Project
from app.modules.projects.modification_request import ModificationRequest
from app.modules.projects.project_message import ProjectMessage
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from tests.storage_fake import FakeStorageBackend


def _auth_headers(customer_user: CustomerUser) -> dict[str, str]:
    token = create_token_customer(customer_user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_portal_list_projects_returns_files_count(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
) -> None:
    """GET /api/portal/projects returns list with files_count and has_files."""
    customer, customer_user = customer_and_user
    headers = _auth_headers(customer_user)
    r = await client.get("/api/portal/projects", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    proj = next(p for p in data if p["id"] == portal_project.id)
    assert proj["name"] == portal_project.name
    assert "files_count" in proj
    assert "has_files" in proj
    assert proj["files_count"] == 0
    assert proj["has_files"] is False


@pytest.mark.asyncio
async def test_portal_list_projects_includes_files_count_when_project_has_files(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
    fake_storage: FakeStorageBackend,
) -> None:
    """GET /api/portal/projects returns files_count > 0 when project has files."""
    customer, customer_user = customer_and_user
    pf = ProjectFile(
        project_id=portal_project.id,
        customer_id=customer.id,
        path_key="projects/1/test.pdf",
        filename="test.pdf",
        content_type="application/pdf",
        size=100,
    )
    override_get_db.add(pf)
    await override_get_db.commit()
    headers = _auth_headers(customer_user)
    r = await client.get("/api/portal/projects", headers=headers)
    assert r.status_code == 200
    data = r.json()
    proj = next(p for p in data if p["id"] == portal_project.id)
    assert proj["files_count"] == 1
    assert proj["has_files"] is True


@pytest.mark.asyncio
async def test_portal_upload_file_201(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
    fake_storage: FakeStorageBackend,
) -> None:
    """POST /api/portal/projects/{id}/files returns 201 and file metadata."""
    _, customer_user = customer_and_user
    headers = _auth_headers(customer_user)
    files = {"file": ("doc.pdf", io.BytesIO(b"pdf content"), "application/pdf")}
    r = await client.post(
        f"/api/portal/projects/{portal_project.id}/files",
        headers=headers,
        files=files,
    )
    assert r.status_code == 201
    data = r.json()
    assert "id" in data
    assert data["filename"] == "doc.pdf"
    assert data["size"] == len(b"pdf content")
    assert data["content_type"] == "application/pdf"


@pytest.mark.asyncio
async def test_portal_upload_file_404_other_customer_project(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    fake_storage: FakeStorageBackend,
) -> None:
    """POST /api/portal/projects/{id}/files returns 404 for project of another customer."""
    _, customer_user = customer_and_user
    other_customer = Customer(org_id="innexar", name="Other", email="other@test.com")
    override_get_db.add(other_customer)
    await override_get_db.flush()
    other_project = Project(
        org_id="innexar",
        customer_id=other_customer.id,
        name="Other Project",
        status="active",
    )
    override_get_db.add(other_project)
    await override_get_db.commit()
    await override_get_db.refresh(other_project)
    headers = _auth_headers(customer_user)
    files = {"file": ("x.pdf", io.BytesIO(b"x"), "application/pdf")}
    r = await client.post(
        f"/api/portal/projects/{other_project.id}/files",
        headers=headers,
        files=files,
    )
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_portal_list_files_200(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
) -> None:
    """GET /api/portal/projects/{id}/files returns 200 and list."""
    _, customer_user = customer_and_user
    headers = _auth_headers(customer_user)
    r = await client.get(
        f"/api/portal/projects/{portal_project.id}/files",
        headers=headers,
    )
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.asyncio
async def test_portal_list_files_404_other_customer(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """GET /api/portal/projects/{id}/files returns 404 for other customer's project."""
    from app.models.customer import Customer

    _, customer_user = customer_and_user
    other = Customer(org_id="innexar", name="O", email="o@t.com")
    override_get_db.add(other)
    await override_get_db.flush()
    other_proj = Project(
        org_id="innexar", customer_id=other.id, name="O", status="active"
    )
    override_get_db.add(other_proj)
    await override_get_db.commit()
    await override_get_db.refresh(other_proj)
    headers = _auth_headers(customer_user)
    r = await client.get(
        f"/api/portal/projects/{other_proj.id}/files",
        headers=headers,
    )
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_portal_download_file_200(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
    fake_storage: FakeStorageBackend,
) -> None:
    """GET /api/portal/projects/{id}/files/{file_id}/download returns 200 with content."""
    customer, customer_user = customer_and_user
    await fake_storage.put(
        "projects/1/abc.pdf", b"pdf bytes", content_type="application/pdf"
    )
    pf = ProjectFile(
        project_id=portal_project.id,
        customer_id=customer.id,
        path_key="projects/1/abc.pdf",
        filename="abc.pdf",
        content_type="application/pdf",
        size=9,
    )
    override_get_db.add(pf)
    await override_get_db.commit()
    await override_get_db.refresh(pf)
    headers = _auth_headers(customer_user)
    r = await client.get(
        f"/api/portal/projects/{portal_project.id}/files/{pf.id}/download",
        headers=headers,
    )
    assert r.status_code == 200
    assert r.content == b"pdf bytes"
    assert "attachment" in r.headers.get("content-disposition", "")


@pytest.mark.asyncio
async def test_portal_download_file_404(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
) -> None:
    """GET download returns 404 for non-existent file_id."""
    _, customer_user = customer_and_user
    headers = _auth_headers(customer_user)
    r = await client.get(
        f"/api/portal/projects/{portal_project.id}/files/99999/download",
        headers=headers,
    )
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_portal_delete_file_204(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
    fake_storage: FakeStorageBackend,
) -> None:
    """DELETE /api/portal/projects/{id}/files/{file_id} returns 204 when customer owns file."""
    customer, customer_user = customer_and_user
    await fake_storage.put("projects/1/del.pdf", b"x", content_type="application/pdf")
    pf = ProjectFile(
        project_id=portal_project.id,
        customer_id=customer.id,
        path_key="projects/1/del.pdf",
        filename="del.pdf",
        content_type="application/pdf",
        size=1,
    )
    override_get_db.add(pf)
    await override_get_db.commit()
    await override_get_db.refresh(pf)
    headers = _auth_headers(customer_user)
    r = await client.delete(
        f"/api/portal/projects/{portal_project.id}/files/{pf.id}",
        headers=headers,
    )
    assert r.status_code == 204
    check = await override_get_db.execute(
        select(ProjectFile).where(ProjectFile.id == pf.id)
    )
    assert check.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_portal_delete_file_403_when_file_owned_by_other_customer(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
    fake_storage: FakeStorageBackend,
) -> None:
    """DELETE file returns 403 when file was uploaded by another customer (same project)."""
    from app.models.customer import Customer as CustomerModel

    customer, customer_user = customer_and_user
    other_cust = CustomerModel(org_id="innexar", name="Other", email="other2@test.com")
    override_get_db.add(other_cust)
    await override_get_db.flush()
    await fake_storage.put("projects/1/other.pdf", b"x", content_type="application/pdf")
    pf = ProjectFile(
        project_id=portal_project.id,
        customer_id=other_cust.id,
        path_key="projects/1/other.pdf",
        filename="other.pdf",
        content_type="application/pdf",
        size=1,
    )
    override_get_db.add(pf)
    await override_get_db.commit()
    await override_get_db.refresh(pf)
    headers = _auth_headers(customer_user)
    r = await client.delete(
        f"/api/portal/projects/{portal_project.id}/files/{pf.id}",
        headers=headers,
    )
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_portal_list_messages_200(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
) -> None:
    """GET /api/portal/projects/{id}/messages returns 200 and list."""
    _, customer_user = customer_and_user
    headers = _auth_headers(customer_user)
    r = await client.get(
        f"/api/portal/projects/{portal_project.id}/messages",
        headers=headers,
    )
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.asyncio
async def test_portal_list_messages_404_other_customer(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """GET messages returns 404 for other customer's project."""
    from app.models.customer import Customer as CustomerModel

    _, customer_user = customer_and_user
    other = CustomerModel(org_id="innexar", name="O2", email="o2@t.com")
    override_get_db.add(other)
    await override_get_db.flush()
    other_proj = Project(
        org_id="innexar", customer_id=other.id, name="O", status="active"
    )
    override_get_db.add(other_proj)
    await override_get_db.commit()
    await override_get_db.refresh(other_proj)
    headers = _auth_headers(customer_user)
    r = await client.get(
        f"/api/portal/projects/{other_proj.id}/messages",
        headers=headers,
    )
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_portal_post_message_201(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
) -> None:
    """POST /api/portal/projects/{id}/messages creates message with sender_type customer."""
    _, customer_user = customer_and_user
    headers = _auth_headers(customer_user)
    r = await client.post(
        f"/api/portal/projects/{portal_project.id}/messages",
        headers=headers,
        json={"body": "Hello team"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["body"] == "Hello team"
    assert data["sender_type"] == "customer"
    msg_r = await override_get_db.execute(
        select(ProjectMessage).where(ProjectMessage.project_id == portal_project.id)
    )
    msg = msg_r.scalar_one_or_none()
    assert msg is not None
    assert msg.sender_type == "customer"
    assert msg.sender_id == customer_user.customer_id


@pytest.mark.asyncio
async def test_portal_post_message_upload_201(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
    fake_storage: FakeStorageBackend,
) -> None:
    """POST /api/portal/projects/{id}/messages/upload returns 201 and stores file."""
    _, customer_user = customer_and_user
    headers = _auth_headers(customer_user)
    files = {"file": ("attach.txt", io.BytesIO(b"attachment content"), "text/plain")}
    r = await client.post(
        f"/api/portal/projects/{portal_project.id}/messages/upload",
        headers=headers,
        files=files,
    )
    assert r.status_code == 201
    data = r.json()
    assert data["attachment_name"] == "attach.txt"
    keys = list(fake_storage._store.keys())
    assert any("messages" in k for k in keys)


@pytest.mark.asyncio
async def test_portal_get_modification_requests_200(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
) -> None:
    """GET /api/portal/projects/{id}/modification-requests returns 200 with items and quota."""
    _, customer_user = customer_and_user
    headers = _auth_headers(customer_user)
    r = await client.get(
        f"/api/portal/projects/{portal_project.id}/modification-requests",
        headers=headers,
    )
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert "monthly_limit" in data
    assert "used_this_month" in data
    assert "remaining" in data
    assert data["monthly_limit"] == 5
    assert data["used_this_month"] == 0
    assert data["remaining"] == 5


@pytest.mark.asyncio
async def test_portal_get_modification_requests_404_other_customer(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """GET modification-requests returns 404 for other customer's project."""
    from app.models.customer import Customer as CustomerModel

    _, customer_user = customer_and_user
    other = CustomerModel(org_id="innexar", name="O3", email="o3@t.com")
    override_get_db.add(other)
    await override_get_db.flush()
    other_proj = Project(
        org_id="innexar", customer_id=other.id, name="O", status="active"
    )
    override_get_db.add(other_proj)
    await override_get_db.commit()
    await override_get_db.refresh(other_proj)
    headers = _auth_headers(customer_user)
    r = await client.get(
        f"/api/portal/projects/{other_proj.id}/modification-requests",
        headers=headers,
    )
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_portal_post_modification_request_201(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
) -> None:
    """POST modification-request returns 201 when under limit (multipart form)."""
    _, customer_user = customer_and_user
    headers = _auth_headers(customer_user)
    r = await client.post(
        f"/api/portal/projects/{portal_project.id}/modification-requests",
        headers=headers,
        data={"title": "Change color", "description": "Make header blue"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["title"] == "Change color"
    assert data["status"] == "pending"
    assert "remaining" in data


@pytest.mark.asyncio
async def test_portal_post_modification_request_with_attachment_201(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
    fake_storage: FakeStorageBackend,
) -> None:
    """POST modification-request with optional file returns 201 and stores attachment."""
    _, customer_user = customer_and_user
    headers = _auth_headers(customer_user)
    files = {"file": ("spec.pdf", io.BytesIO(b"pdf spec content"), "application/pdf")}
    r = await client.post(
        f"/api/portal/projects/{portal_project.id}/modification-requests",
        headers=headers,
        data={"title": "Add feature", "description": "See attached spec"},
        files=files,
    )
    assert r.status_code == 201
    data = r.json()
    assert data["title"] == "Add feature"
    assert data["attachment_name"] == "spec.pdf"
    keys = [k for k in fake_storage._store if "modifications/" in k]
    assert len(keys) == 1
    assert "spec.pdf" in keys[0] or "spec" in keys[0]


@pytest.mark.asyncio
async def test_portal_post_modification_request_429_when_limit_reached(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project_with_plan: tuple[Project, object],
) -> None:
    """POST modification-request returns 429 when monthly limit reached."""
    project, plan = portal_project_with_plan
    customer, customer_user = customer_and_user
    assert project.customer_id == customer.id
    limit = getattr(plan, "monthly_adjustments_limit", 2)
    for i in range(limit):
        req = ModificationRequest(
            project_id=project.id,
            customer_id=customer.id,
            title=f"Req {i}",
            description="Desc",
        )
        override_get_db.add(req)
    await override_get_db.commit()
    headers = _auth_headers(customer_user)
    r = await client.post(
        f"/api/portal/projects/{project.id}/modification-requests",
        headers=headers,
        data={"title": "One more", "description": "Should fail"},
    )
    assert r.status_code == 429


@pytest.mark.asyncio
async def test_portal_upload_file_413_when_too_large(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
    fake_storage: FakeStorageBackend,
) -> None:
    """POST /api/portal/projects/{id}/files returns 413 for file > 50MB."""
    _, customer_user = customer_and_user
    headers = _auth_headers(customer_user)
    big = io.BytesIO(b"x" * (51 * 1024 * 1024))
    files = {"file": ("big.bin", big, "application/octet-stream")}
    r = await client.post(
        f"/api/portal/projects/{portal_project.id}/files",
        headers=headers,
        files=files,
    )
    assert r.status_code == 413


@pytest.mark.asyncio
async def test_portal_list_messages_returns_schema_with_attachment_fields(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
) -> None:
    """GET /api/portal/projects/{id}/messages returns list of PortalMessageItemWithAttachment."""
    _, customer_user = customer_and_user
    await client.post(
        f"/api/portal/projects/{portal_project.id}/messages",
        headers=_auth_headers(customer_user),
        json={"body": "Hello"},
    )
    r = await client.get(
        f"/api/portal/projects/{portal_project.id}/messages",
        headers=_auth_headers(customer_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 1
    msg = data[0]
    assert msg["body"] == "Hello"
    assert msg["sender_type"] == "customer"
    assert "id" in msg
    assert "attachment_key" in msg
    assert "attachment_name" in msg
    assert "created_at" in msg


@pytest.mark.asyncio
async def test_portal_message_upload_413_when_too_large(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
    fake_storage: FakeStorageBackend,
) -> None:
    """POST /api/portal/projects/{id}/messages/upload returns 413 for file > 50MB."""
    _, customer_user = customer_and_user
    headers = _auth_headers(customer_user)
    big = io.BytesIO(b"x" * (51 * 1024 * 1024))
    files = {"file": ("huge.bin", big, "application/octet-stream")}
    r = await client.post(
        f"/api/portal/projects/{portal_project.id}/messages/upload",
        headers=headers,
        files=files,
    )
    assert r.status_code == 413


@pytest.mark.asyncio
async def test_portal_modification_request_413_when_file_too_large(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
    fake_storage: FakeStorageBackend,
) -> None:
    """POST modification-request with file > 50MB returns 413."""
    _, customer_user = customer_and_user
    headers = _auth_headers(customer_user)
    big = io.BytesIO(b"y" * (51 * 1024 * 1024))
    files = {"file": ("huge.pdf", big, "application/pdf")}
    r = await client.post(
        f"/api/portal/projects/{portal_project.id}/modification-requests",
        headers=headers,
        data={"title": "T", "description": "D"},
        files=files,
    )
    assert r.status_code == 413


@pytest.mark.asyncio
async def test_portal_list_modification_requests_with_items_schema(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_project: Project,
) -> None:
    """GET modification-requests returns ModificationRequestsResponse schema with items."""
    _, customer_user = customer_and_user
    await client.post(
        f"/api/portal/projects/{portal_project.id}/modification-requests",
        headers=_auth_headers(customer_user),
        data={"title": "Fix header", "description": "Change color"},
    )
    r = await client.get(
        f"/api/portal/projects/{portal_project.id}/modification-requests",
        headers=_auth_headers(customer_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Fix header"
    assert data["items"][0]["status"] == "pending"
    assert data["remaining"] == 4
    assert data["used_this_month"] == 1
