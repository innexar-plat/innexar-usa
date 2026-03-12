"""Unit tests for portal requests: new-project, site-briefing."""

import pytest
from app.core.security import create_token_customer
from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from app.models.project_request import ProjectRequest
from app.modules.projects.models import Project
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


def _auth_headers(customer_user: CustomerUser) -> dict[str, str]:
    token = create_token_customer(customer_user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_portal_new_project_201(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """POST /api/portal/new-project creates request and returns 201."""
    _, customer_user = customer_and_user
    r = await client.post(
        "/api/portal/new-project",
        headers=_auth_headers(customer_user),
        json={
            "project_name": "My New Site",
            "project_type": "website",
            "description": "Landing page",
            "budget": "1000",
            "timeline": "1 month",
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert "id" in data
    assert data["id"] > 0
    assert "message" in data
    req = (
        await override_get_db.execute(
            select(ProjectRequest).where(ProjectRequest.id == data["id"])
        )
    ).scalar_one_or_none()
    assert req is not None
    assert req.project_name == "My New Site"
    assert req.status == "pending"


@pytest.mark.asyncio
async def test_portal_site_briefing_201(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_projects_tickets_enabled: None,
) -> None:
    """POST /api/portal/site-briefing creates briefing (and ticket when project linked)."""
    customer, customer_user = customer_and_user
    project = Project(
        org_id="innexar",
        customer_id=customer.id,
        name="Site Customer",
        status="aguardando_briefing",
    )
    override_get_db.add(project)
    await override_get_db.flush()
    r = await client.post(
        "/api/portal/site-briefing",
        headers=_auth_headers(customer_user),
        json={
            "company_name": "Acme Inc",
            "services": "Web design",
            "city": "NYC",
            "whatsapp": "+1234567890",
            "domain": "acme.com",
            "description": "Full briefing text",
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert "message" in data or "id" in data
