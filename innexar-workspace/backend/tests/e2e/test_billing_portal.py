"""E2E: portal invoices list, pay, and dashboard (requires billing module)."""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import pytest
from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from app.modules.billing.schemas import PayResponse
from app.modules.billing.service import create_manual_invoice
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


async def _customer_login(
    client: AsyncClient, email: str, password: str = "customer-secret"
) -> str:
    """Helper: POST login and return access_token."""
    r = await client.post(
        "/api/public/auth/customer/login",
        json={"email": email, "password": password},
    )
    assert r.status_code == 200
    return r.json()["access_token"]


@pytest.mark.asyncio
async def test_portal_dashboard_customer_without_subscription_returns_plan_site_null(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """GET /api/portal/me/dashboard with customer that has no subscription returns plan/site null or empty."""
    _customer, customer_user = customer_and_user
    token = await _customer_login(client, customer_user.email)
    r = await client.get(
        "/api/portal/me/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "plan" in data
    assert "site" in data
    assert data.get("plan") is None
    assert data.get("site") is None


@pytest.mark.asyncio
async def test_portal_pay_with_bricks_mock_returns_200_and_payload_structure(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    billing_enabled: None,
) -> None:
    """POST /api/portal/invoices/{id}/pay with payment_method_id (Bricks) and mocked MP returns 200 and expected payload."""
    customer, customer_user = customer_and_user
    inv = await create_manual_invoice(
        override_get_db,
        customer_id=customer.id,
        due_date=datetime.now(UTC),
        total=75.0,
        currency="BRL",
    )
    await override_get_db.flush()
    token = await _customer_login(client, customer_user.email)

    with patch(
        "app.modules.billing.portal_service.BillingPortalService._pay_invoice_bricks",
        new_callable=AsyncMock,
        return_value=PayResponse(
            payment_url="",
            attempt_id=0,
            payment_status="pending",
            payment_id="pay_mp_456",
            qr_code_base64="data:image/png;base64,abc",
        ),
    ):
        r = await client.post(
            f"/api/portal/invoices/{inv.id}/pay",
            json={
                "payment_method_id": "pix",
                "payer_email": customer_user.email,
            },
            headers={"Authorization": f"Bearer {token}"},
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("payment_status") == "pending"
    assert data.get("payment_id") == "pay_mp_456"
    assert "qr_code_base64" in data


@pytest.mark.asyncio
async def test_portal_invoices_list_empty(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
    billing_enabled: None,
) -> None:
    """GET /api/portal/invoices with no invoices returns []."""
    _customer, customer_user = customer_and_user
    login = await client.post(
        "/api/public/auth/customer/login",
        json={"email": customer_user.email, "password": "customer-secret"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    r = await client.get(
        "/api/portal/invoices", headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 0


@pytest.mark.asyncio
async def test_portal_invoices_pay_404(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
    billing_enabled: None,
) -> None:
    """POST /api/portal/invoices/999/pay returns 404 for non-existent invoice."""
    _customer, customer_user = customer_and_user
    login = await client.post(
        "/api/public/auth/customer/login",
        json={"email": customer_user.email, "password": "customer-secret"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    r = await client.post(
        "/api/portal/invoices/999/pay",
        json={
            "success_url": "https://example.com/ok",
            "cancel_url": "https://example.com/cancel",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 404
