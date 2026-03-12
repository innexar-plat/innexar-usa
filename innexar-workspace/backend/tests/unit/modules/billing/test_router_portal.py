"""Unit tests for portal billing router (pay_invoice: Bricks vs Checkout Pro, 401, 404)."""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import pytest
from app.core.security import create_token_customer
from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from app.modules.billing.schemas import PayResponse
from app.modules.billing.service import create_manual_invoice
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_pay_invoice_without_payment_method_id_calls_checkout_pro_not_bricks(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    billing_enabled: None,
) -> None:
    """POST pay with empty body or no payment_method_id uses create_payment_attempt (Checkout Pro), not _pay_invoice_bricks."""
    customer, customer_user = customer_and_user
    inv = await create_manual_invoice(
        override_get_db,
        customer_id=customer.id,
        due_date=datetime.now(UTC),
        total=100.0,
        currency="BRL",
    )
    await override_get_db.flush()
    token = create_token_customer(customer_user.id)

    with patch(
        "app.modules.billing.portal_service.create_payment_attempt",
        new_callable=AsyncMock,
    ) as mock_create:
        mock_create.return_value = type("Result", (), {"payment_url": "https://checkout.pro/pay"})()
        with patch(
            "app.modules.billing.portal_service.BillingPortalService._pay_invoice_bricks",
            new_callable=AsyncMock,
        ) as mock_bricks:
            r = await client.post(
                f"/api/portal/invoices/{inv.id}/pay",
                json={},
                headers={"Authorization": f"Bearer {token}"},
            )
            mock_create.assert_called_once()
            mock_bricks.assert_not_called()
    assert r.status_code == 200
    assert r.json().get("payment_url") == "https://checkout.pro/pay"


@pytest.mark.asyncio
async def test_pay_invoice_with_payment_method_id_calls_bricks_returns_200(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    billing_enabled: None,
) -> None:
    """POST pay with payment_method_id uses _pay_invoice_bricks and returns 200 with payment_status."""
    customer, customer_user = customer_and_user
    inv = await create_manual_invoice(
        override_get_db,
        customer_id=customer.id,
        due_date=datetime.now(UTC),
        total=50.0,
        currency="BRL",
    )
    await override_get_db.flush()
    token = create_token_customer(customer_user.id)

    bricks_response = PayResponse(
        payment_url="",
        attempt_id=0,
        payment_status="approved",
        payment_id="pay_123",
    )
    with patch(
        "app.modules.billing.portal_service.BillingPortalService._pay_invoice_bricks",
        new_callable=AsyncMock,
        return_value=bricks_response,
    ):
        r = await client.post(
            f"/api/portal/invoices/{inv.id}/pay",
            json={"payment_method_id": "pix", "payer_email": customer_user.email},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("payment_status") == "approved"
    assert data.get("payment_id") == "pay_123"


@pytest.mark.asyncio
async def test_pay_invoice_other_customer_returns_404(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    billing_enabled: None,
) -> None:
    """POST pay for an invoice that belongs to another customer returns 404."""
    customer, customer_user = customer_and_user
    inv = await create_manual_invoice(
        override_get_db,
        customer_id=customer.id,
        due_date=datetime.now(UTC),
        total=50.0,
        currency="BRL",
    )
    await override_get_db.flush()
    # Invoice belongs to customer; authenticate as a different customer to get 404.
    from app.core.security import hash_password

    other_customer = Customer(
        org_id="innexar", name="Other", email="other@test.innexar.com"
    )
    override_get_db.add(other_customer)
    await override_get_db.flush()
    other_user = CustomerUser(
        customer_id=other_customer.id,
        email=other_customer.email,
        password_hash=hash_password("other-secret"),
        email_verified=True,
    )
    override_get_db.add(other_user)
    await override_get_db.flush()
    token_other = create_token_customer(other_user.id)
    # Invoice belongs to `customer`, we're authenticated as other_user (other_customer)
    r = await client.post(
        f"/api/portal/invoices/{inv.id}/pay",
        json={},
        headers={"Authorization": f"Bearer {token_other}"},
    )
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_pay_invoice_without_token_returns_401(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    billing_enabled: None,
) -> None:
    """POST pay without Authorization header returns 401."""
    customer, customer_user = customer_and_user
    inv = await create_manual_invoice(
        override_get_db,
        customer_id=customer.id,
        due_date=datetime.now(UTC),
        total=50.0,
        currency="BRL",
    )
    await override_get_db.flush()
    r = await client.post(
        f"/api/portal/invoices/{inv.id}/pay",
        json={},
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_pay_invoice_with_invalid_token_returns_401(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    billing_enabled: None,
) -> None:
    """POST pay with invalid or expired token returns 401."""
    customer, customer_user = customer_and_user
    inv = await create_manual_invoice(
        override_get_db,
        customer_id=customer.id,
        due_date=datetime.now(UTC),
        total=50.0,
        currency="BRL",
    )
    await override_get_db.flush()
    r = await client.post(
        f"/api/portal/invoices/{inv.id}/pay",
        json={},
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_list_my_invoices_200(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    billing_enabled: None,
) -> None:
    """GET /api/portal/invoices returns 200 and list of InvoiceResponse."""
    customer, customer_user = customer_and_user
    inv = await create_manual_invoice(
        override_get_db,
        customer_id=customer.id,
        due_date=datetime.now(UTC),
        total=100.0,
        currency="BRL",
    )
    await override_get_db.flush()
    token = create_token_customer(customer_user.id)
    r = await client.get(
        "/api/portal/invoices",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    found = next((i for i in data if i["id"] == inv.id), None)
    assert found is not None
    assert found["customer_id"] == customer.id
    assert found["status"] == inv.status
    assert float(found["total"]) == 100.0


@pytest.mark.asyncio
async def test_get_my_invoice_200(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    billing_enabled: None,
) -> None:
    """GET /api/portal/invoices/{id} returns 200 and InvoiceResponse when owned by customer."""
    customer, customer_user = customer_and_user
    inv = await create_manual_invoice(
        override_get_db,
        customer_id=customer.id,
        due_date=datetime.now(UTC),
        total=75.0,
        currency="BRL",
    )
    await override_get_db.flush()
    token = create_token_customer(customer_user.id)
    r = await client.get(
        f"/api/portal/invoices/{inv.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == inv.id
    assert data["customer_id"] == customer.id
    assert float(data["total"]) == 75.0


@pytest.mark.asyncio
async def test_get_my_invoice_404_other_customer(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    billing_enabled: None,
) -> None:
    """GET /api/portal/invoices/{id} returns 404 when invoice belongs to another customer."""
    customer, customer_user = customer_and_user
    inv = await create_manual_invoice(
        override_get_db,
        customer_id=customer.id,
        due_date=datetime.now(UTC),
        total=50.0,
        currency="BRL",
    )
    await override_get_db.flush()
    from app.core.security import hash_password

    other = Customer(org_id="innexar", name="Other", email="other-inv@test.innexar.com")
    override_get_db.add(other)
    await override_get_db.flush()
    other_user = CustomerUser(
        customer_id=other.id,
        email=other.email,
        password_hash=hash_password("x"),
        email_verified=True,
    )
    override_get_db.add(other_user)
    await override_get_db.flush()
    token_other = create_token_customer(other_user.id)
    r = await client.get(
        f"/api/portal/invoices/{inv.id}",
        headers={"Authorization": f"Bearer {token_other}"},
    )
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_pay_invoice_400_already_paid(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    billing_enabled: None,
) -> None:
    """POST pay returns 400 when invoice is already paid."""
    from app.modules.billing.enums import InvoiceStatus

    customer, customer_user = customer_and_user
    inv = await create_manual_invoice(
        override_get_db,
        customer_id=customer.id,
        due_date=datetime.now(UTC),
        total=50.0,
        currency="BRL",
    )
    await override_get_db.flush()
    inv.status = InvoiceStatus.PAID.value
    await override_get_db.flush()
    token = create_token_customer(customer_user.id)
    r = await client.post(
        f"/api/portal/invoices/{inv.id}/pay",
        json={},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 400
    assert "already paid" in (r.json().get("detail") or "").lower()


@pytest.mark.asyncio
async def test_download_invoice_html_200(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    billing_enabled: None,
) -> None:
    """GET /api/portal/invoices/{id}/download returns 200 with HTML content."""
    customer, customer_user = customer_and_user
    inv = await create_manual_invoice(
        override_get_db,
        customer_id=customer.id,
        due_date=datetime.now(UTC),
        total=100.0,
        currency="BRL",
    )
    await override_get_db.flush()
    token = create_token_customer(customer_user.id)
    r = await client.get(
        f"/api/portal/invoices/{inv.id}/download",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert "text/html" in r.headers.get("content-type", "")
    assert f"Fatura #{inv.id}" in r.text or f"#{inv.id}" in r.text


@pytest.mark.asyncio
async def test_download_invoice_html_404(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
    billing_enabled: None,
) -> None:
    """GET /api/portal/invoices/{id}/download returns 404 for non-existent or other customer."""
    _, customer_user = customer_and_user
    token = create_token_customer(customer_user.id)
    r = await client.get(
        "/api/portal/invoices/99999/download",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 404
