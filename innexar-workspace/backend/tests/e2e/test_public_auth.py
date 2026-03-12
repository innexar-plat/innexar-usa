"""E2E: POST /api/public/auth/customer/login and GET /api/portal/me."""

import pytest
from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_returns_ok(client: AsyncClient) -> None:
    """GET /health returns 200 and status ok."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"


@pytest.mark.asyncio
async def test_public_customer_login_returns_token(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """POST /api/public/auth/customer/login with valid creds returns 200 and token."""
    _customer, customer_user = customer_and_user
    response = await client.post(
        "/api/public/auth/customer/login",
        json={"email": customer_user.email, "password": "customer-secret"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data.get("email") == customer_user.email
    assert data.get("customer_id") == customer_user.customer_id


@pytest.mark.asyncio
async def test_public_customer_login_wrong_password_returns_401(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """POST /api/public/auth/customer/login with wrong password returns 401."""
    _customer, customer_user = customer_and_user
    response = await client.post(
        "/api/public/auth/customer/login",
        json={"email": customer_user.email, "password": "wrong"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_portal_me_with_token(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """Login then GET /api/portal/me with Bearer token returns 200 and profile."""
    _customer, customer_user = customer_and_user
    login_resp = await client.post(
        "/api/public/auth/customer/login",
        json={"email": customer_user.email, "password": "customer-secret"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    me_resp = await client.get(
        "/api/portal/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    data = me_resp.json()
    assert data.get("email") == customer_user.email
    assert data.get("customer_id") == customer_user.customer_id
