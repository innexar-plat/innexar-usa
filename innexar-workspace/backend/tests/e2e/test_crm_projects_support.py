"""E2E smoke: workspace creates contact/project/ticket; portal lists only own projects/tickets; portal creates ticket, workspace sees it."""

import pytest
from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from app.models.user import User
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_workspace_creates_contact(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """Workspace: POST /api/workspace/crm/contacts creates contact."""
    from app.core.security import create_token_staff

    token = create_token_staff(staff_user.id)
    r = await client.post(
        "/api/workspace/crm/contacts",
        json={"name": "Contact One", "email": "c1@test.com"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Contact One"
    assert data["email"] == "c1@test.com"


@pytest.mark.asyncio
async def test_workspace_creates_project_and_portal_lists_only_own(
    client: AsyncClient,
    staff_user: User,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_projects_tickets_enabled: None,
) -> None:
    """Workspace creates project for customer; portal lists only that customer's projects."""
    customer, customer_user = customer_and_user
    from app.core.security import create_token_staff

    staff_token = create_token_staff(staff_user.id)
    # Create project as staff
    r1 = await client.post(
        "/api/workspace/projects",
        json={"customer_id": customer.id, "name": "Project A", "status": "active"},
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert r1.status_code == 201
    project_id = r1.json()["id"]
    # Portal: list projects as customer
    customer_token = await client.post(
        "/api/public/auth/customer/login",
        json={"email": customer_user.email, "password": "customer-secret"},
    )
    assert customer_token.status_code == 200
    token = customer_token.json()["access_token"]
    r2 = await client.get(
        "/api/portal/projects", headers={"Authorization": f"Bearer {token}"}
    )
    assert r2.status_code == 200
    projects = r2.json()
    assert isinstance(projects, list)
    assert any(p["id"] == project_id and p["name"] == "Project A" for p in projects)
    # Portal get one
    r3 = await client.get(
        f"/api/portal/projects/{project_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r3.status_code == 200
    assert r3.json()["name"] == "Project A"


@pytest.mark.asyncio
async def test_workspace_creates_ticket(
    client: AsyncClient,
    staff_user: User,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """Workspace: POST /api/workspace/support/tickets creates ticket."""
    customer, _ = customer_and_user
    from app.core.security import create_token_staff

    token = create_token_staff(staff_user.id)
    r = await client.post(
        "/api/workspace/support/tickets",
        json={"subject": "Help me", "customer_id": customer.id},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 201
    assert r.json()["subject"] == "Help me"
    assert r.json()["status"] == "open"


@pytest.mark.asyncio
async def test_portal_creates_ticket_and_workspace_sees_it(
    client: AsyncClient,
    staff_user: User,
    customer_and_user: tuple[Customer, CustomerUser],
    portal_projects_tickets_enabled: None,
) -> None:
    """Portal creates ticket; workspace list includes it."""
    customer, customer_user = customer_and_user
    # Customer login and create ticket
    login = await client.post(
        "/api/public/auth/customer/login",
        json={"email": customer_user.email, "password": "customer-secret"},
    )
    assert login.status_code == 200
    customer_token = login.json()["access_token"]
    r1 = await client.post(
        "/api/portal/tickets",
        json={"subject": "Portal ticket"},
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert r1.status_code == 201
    ticket_id = r1.json()["id"]
    # Workspace list tickets
    from app.core.security import create_token_staff

    staff_token = create_token_staff(staff_user.id)
    r2 = await client.get(
        "/api/workspace/support/tickets",
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert r2.status_code == 200
    tickets = r2.json()
    assert any(
        t["id"] == ticket_id and t["subject"] == "Portal ticket" for t in tickets
    )
