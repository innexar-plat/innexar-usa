"""Unit tests for workspace customers API: list, create, get, update, delete, send-credentials, generate-password, cleanup-test."""

from unittest.mock import AsyncMock, patch

import pytest
from app.core.security import create_token_staff
from app.models.user import User
from httpx import AsyncClient


def _staff_headers(user: User) -> dict[str, str]:
    token = create_token_staff(user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_workspace_customers_list_200(
    client: AsyncClient, staff_user: User
) -> None:
    """GET /api/workspace/customers returns 200 and list."""
    r = await client.get(
        "/api/workspace/customers",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_workspace_customers_post_201(
    client: AsyncClient, staff_user: User
) -> None:
    """POST /api/workspace/customers returns 201 and customer."""
    r = await client.post(
        "/api/workspace/customers",
        headers=_staff_headers(staff_user),
        json={
            "name": "New Customer",
            "email": "newcustomer@example.com",
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "New Customer"
    assert data["email"] == "newcustomer@example.com"
    assert "id" in data
    assert "has_portal_access" in data


@pytest.mark.asyncio
async def test_workspace_customers_get_200(
    client: AsyncClient,
    staff_user: User,
    customer_and_user: tuple,
) -> None:
    """GET /api/workspace/customers/{id} returns 200."""
    customer, _ = customer_and_user
    r = await client.get(
        f"/api/workspace/customers/{customer.id}",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == customer.id
    assert data["email"] == customer.email
    assert data["has_portal_access"] is True


@pytest.mark.asyncio
async def test_workspace_customers_patch_200(
    client: AsyncClient,
    staff_user: User,
    customer_and_user: tuple,
) -> None:
    """PATCH /api/workspace/customers/{id} returns 200."""
    customer, _ = customer_and_user
    r = await client.patch(
        f"/api/workspace/customers/{customer.id}",
        headers=_staff_headers(staff_user),
        json={"name": "Updated Name"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "Updated Name"


@pytest.mark.asyncio
async def test_workspace_customers_send_credentials_200(
    client: AsyncClient,
    staff_user: User,
    customer_and_user: tuple,
) -> None:
    """POST /api/workspace/customers/{id}/send-credentials returns 200."""
    customer, _ = customer_and_user
    with patch(
        "app.modules.customers.router_workspace.get_email_provider",
        new_callable=AsyncMock,
        return_value=None,
    ):
        r = await client.post(
            f"/api/workspace/customers/{customer.id}/send-credentials",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is True or "message" in data


@pytest.mark.asyncio
async def test_workspace_customers_generate_password_200(
    client: AsyncClient,
    staff_user: User,
    customer_and_user: tuple,
) -> None:
    """POST /api/workspace/customers/{id}/generate-password returns 200 and password."""
    customer, _ = customer_and_user
    r = await client.post(
        f"/api/workspace/customers/{customer.id}/generate-password",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert "password" in data
    assert len(data["password"]) >= 12


@pytest.mark.asyncio
async def test_workspace_customers_cleanup_test_200(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """POST /api/workspace/customers/cleanup-test returns 200."""
    r = await client.post(
        "/api/workspace/customers/cleanup-test",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert "deleted" in data
    assert "message" in data


@pytest.mark.asyncio
async def test_workspace_customers_delete_204(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """DELETE /api/workspace/customers/{id} returns 204 when customer exists and has no complex relations."""
    # Create a customer with no subscriptions/invoices so delete is simple
    create_r = await client.post(
        "/api/workspace/customers",
        headers=_staff_headers(staff_user),
        json={"name": "To Delete", "email": "todelete@example.com"},
    )
    assert create_r.status_code == 201
    customer_id = create_r.json()["id"]
    r = await client.delete(
        f"/api/workspace/customers/{customer_id}",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 204
