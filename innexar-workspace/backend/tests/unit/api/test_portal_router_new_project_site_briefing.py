"""Unit tests for portal new-project and site-briefing routes."""

import pytest
from app.core.security import create_token_customer
from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from app.modules.projects.models import Project
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


def _auth_headers(customer_user: CustomerUser) -> dict[str, str]:
    token = create_token_customer(customer_user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_portal_new_project_201(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """POST /api/portal/new-project returns 201 and request id."""
    _, customer_user = customer_and_user
    r = await client.post(
        "/api/portal/new-project",
        headers=_auth_headers(customer_user),
        json={
            "project_name": "My New Site",
            "project_type": "site",
            "description": "A new website",
            "budget": "R$ 5k",
            "timeline": "2 months",
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert "id" in data
    assert "message" in data


@pytest.mark.asyncio
async def test_portal_project_aguardando_briefing_200_with_project(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """GET /api/portal/me/project-aguardando-briefing returns 200 with project when one exists."""
    customer, customer_user = customer_and_user
    project = Project(
        org_id="innexar",
        name="Aguardando briefing",
        customer_id=customer.id,
        status="aguardando_briefing",
    )
    override_get_db.add(project)
    await override_get_db.flush()
    r = await client.get(
        "/api/portal/me/project-aguardando-briefing",
        headers=_auth_headers(customer_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert data is not None
    assert data["id"] == project.id
    assert data["name"] == project.name
    assert data["status"] == "aguardando_briefing"


@pytest.mark.asyncio
async def test_portal_project_aguardando_briefing_200_empty(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """GET /api/portal/me/project-aguardando-briefing returns 200 with null when none."""
    _, customer_user = customer_and_user
    r = await client.get(
        "/api/portal/me/project-aguardando-briefing",
        headers=_auth_headers(customer_user),
    )
    assert r.status_code == 200
    # No project aguardando_briefing without linked briefing -> None (null in JSON or 204)
    if r.content:
        data = r.json()
        assert data is None
    # else: 204 No Content is also acceptable


@pytest.mark.asyncio
async def test_portal_site_briefing_201(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """POST /api/portal/site-briefing returns 201 with id and message."""
    _, customer_user = customer_and_user
    r = await client.post(
        "/api/portal/site-briefing",
        headers=_auth_headers(customer_user),
        json={
            "company_name": "Test Co",
            "services": "Web design",
            "city": "São Paulo",
            "whatsapp": "+5511999999999",
            "domain": "testco.com",
            "description": "Full briefing text",
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert "id" in data
    assert "message" in data
    assert "project_id" in data
    assert "ticket_id" in data


@pytest.mark.asyncio
async def test_portal_new_project_returns_new_project_response_schema(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """POST /api/portal/new-project returns NewProjectResponse (id, message)."""
    _, customer_user = customer_and_user
    r = await client.post(
        "/api/portal/new-project",
        headers=_auth_headers(customer_user),
        json={
            "project_name": "Landing",
            "project_type": "landing",
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert "id" in data and isinstance(data["id"], int)
    assert "message" in data and isinstance(data["message"], str)


@pytest.mark.asyncio
async def test_portal_site_briefing_upload_201(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_projects_tickets_enabled: None,
    fake_storage,
) -> None:
    """POST /api/portal/site-briefing/upload returns 201 with SiteBriefingResponse (multipart)."""
    import io

    _, customer_user = customer_and_user
    r = await client.post(
        "/api/portal/site-briefing/upload",
        headers=_auth_headers(customer_user),
        data={
            "company_name": "Upload Co",
            "services": "Design",
            "description": "Brief",
        },
        files=[("files", ("doc.pdf", io.BytesIO(b"pdf"), "application/pdf"))],
    )
    assert r.status_code == 201
    data = r.json()
    assert "id" in data
    assert "message" in data
    assert "project_id" in data
    assert "ticket_id" in data


@pytest.mark.asyncio
async def test_portal_project_aguardando_briefing_none_when_all_linked(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """GET /api/portal/me/project-aguardando-briefing returns null when project has linked ProjectRequest."""
    customer, customer_user = customer_and_user
    project = Project(
        org_id="innexar",
        name="Linked",
        customer_id=customer.id,
        status="aguardando_briefing",
    )
    override_get_db.add(project)
    await override_get_db.flush()
    from app.models.project_request import ProjectRequest

    pr = ProjectRequest(
        customer_id=customer.id,
        project_id=project.id,
        project_name="Linked",
        project_type="site",
        description="x",
        status="pending",
    )
    override_get_db.add(pr)
    await override_get_db.commit()
    r = await client.get(
        "/api/portal/me/project-aguardando-briefing",
        headers=_auth_headers(customer_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert data is None
