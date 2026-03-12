"""Unit tests for workspace billing API: products, price-plans, subscriptions, invoices, mark-paid, process-overdue, generate-recurring, pay-bricks."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from app.core.security import create_token_staff
from app.models.user import User
from app.modules.billing.enums import InvoiceStatus
from app.modules.billing.models import Product
from app.providers.payments.mercadopago import MercadoPagoProvider
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


def _staff_headers(user: User) -> dict[str, str]:
    token = create_token_staff(user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_workspace_billing_products_get_200(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
) -> None:
    """GET /api/workspace/billing/products returns 200."""
    r = await client.get(
        "/api/workspace/billing/products",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_workspace_billing_products_post_201(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
) -> None:
    """POST /api/workspace/billing/products returns 201."""
    r = await client.post(
        "/api/workspace/billing/products",
        headers=_staff_headers(staff_user),
        json={"name": "Test Product", "provisioning_type": "manual"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Test Product"
    assert "id" in data


@pytest.mark.asyncio
async def test_workspace_billing_price_plans_get_200(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
) -> None:
    """GET /api/workspace/billing/price-plans returns 200."""
    r = await client.get(
        "/api/workspace/billing/price-plans",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_workspace_billing_price_plans_post_201(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
    override_get_db: AsyncSession,
) -> None:
    """POST /api/workspace/billing/price-plans returns 201."""
    product = Product(name="P", provisioning_type="manual")
    override_get_db.add(product)
    await override_get_db.flush()
    r = await client.post(
        "/api/workspace/billing/price-plans",
        headers=_staff_headers(staff_user),
        json={
            "product_id": product.id,
            "name": "Monthly",
            "interval": "month",
            "amount": 99.90,
            "currency": "BRL",
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Monthly"
    assert data["amount"] == 99.90


@pytest.mark.asyncio
async def test_workspace_billing_subscriptions_get_200(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
) -> None:
    """GET /api/workspace/billing/subscriptions returns 200."""
    r = await client.get(
        "/api/workspace/billing/subscriptions",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_workspace_billing_invoices_get_200(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
) -> None:
    """GET /api/workspace/billing/invoices returns 200."""
    r = await client.get(
        "/api/workspace/billing/invoices",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_workspace_billing_invoices_post_201(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
    customer_and_user: tuple,
) -> None:
    """POST /api/workspace/billing/invoices returns 201."""
    from datetime import date

    customer, _ = customer_and_user
    r = await client.post(
        "/api/workspace/billing/invoices",
        headers=_staff_headers(staff_user),
        json={
            "customer_id": customer.id,
            "due_date": date.today().isoformat(),
            "total": 100.0,
            "currency": "BRL",
            "line_items": [{"description": "Item", "amount": 100.0}],
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert data["total"] == 100.0
    assert data["status"] in (InvoiceStatus.PENDING.value, "draft")


@pytest.mark.asyncio
async def test_workspace_billing_invoice_payment_link_200(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
    customer_and_user: tuple,
) -> None:
    """POST /api/workspace/billing/invoices/{id}/payment-link returns 200 with mocked provider."""
    customer, _ = customer_and_user
    with patch(
        "app.modules.billing.workspace.invoices.create_payment_attempt",
        new_callable=AsyncMock,
        return_value=type("Res", (), {"payment_url": "https://pay.example.com/xxx"})(),
    ):
        # Create invoice first
        inv_r = await client.post(
            "/api/workspace/billing/invoices",
            headers=_staff_headers(staff_user),
            json={
                "customer_id": customer.id,
                "due_date": "2026-12-31",
                "total": 50.0,
                "currency": "BRL",
                "line_items": [{"description": "Test", "amount": 50.0}],
            },
        )
        assert inv_r.status_code == 201
        inv_id = inv_r.json()["id"]
        r = await client.post(
            f"/api/workspace/billing/invoices/{inv_id}/payment-link",
            headers=_staff_headers(staff_user),
            params={"success_url": "https://ok", "cancel_url": "https://cancel"},
        )
    assert r.status_code == 200
    data = r.json()
    assert "payment_url" in data


@pytest.mark.asyncio
async def test_workspace_billing_mark_paid_200(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
    customer_and_user: tuple,
) -> None:
    """POST /api/workspace/billing/invoices/{id}/mark-paid returns 200."""
    customer, _ = customer_and_user
    inv_r = await client.post(
        "/api/workspace/billing/invoices",
        headers=_staff_headers(staff_user),
        json={
            "customer_id": customer.id,
            "due_date": "2026-12-31",
            "total": 75.0,
            "currency": "BRL",
            "line_items": [{"description": "Item", "amount": 75.0}],
        },
    )
    assert inv_r.status_code == 201
    inv_id = inv_r.json()["id"]
    # Background task uses AsyncSessionLocal (different DB); mock so task body does not hit DB
    with patch(
        "app.modules.billing.workspace.invoices.trigger_provisioning_if_needed",
        new_callable=AsyncMock,
    ):
        r = await client.post(
            f"/api/workspace/billing/invoices/{inv_id}/mark-paid",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is True
    assert data.get("invoice_id") == inv_id


@pytest.mark.asyncio
async def test_workspace_billing_process_overdue_200(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """POST /api/workspace/billing/process-overdue returns 200 (no require_billing_enabled)."""
    r = await client.post(
        "/api/workspace/billing/process-overdue",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert "processed" in data


@pytest.mark.asyncio
async def test_workspace_billing_generate_recurring_invoices_200(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
) -> None:
    """POST /api/workspace/billing/generate-recurring-invoices returns 200."""
    r = await client.post(
        "/api/workspace/billing/generate-recurring-invoices",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert "generated" in data
    assert "reminders_sent" in data


@pytest.mark.asyncio
async def test_workspace_billing_get_invoice_404(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
) -> None:
    """GET /api/workspace/billing/invoices/99999 returns 404."""
    r = await client.get(
        "/api/workspace/billing/invoices/99999",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 404
    assert "not found" in r.json().get("detail", "").lower()


@pytest.mark.asyncio
async def test_workspace_billing_get_invoice_200(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
    customer_and_user: tuple,
) -> None:
    """GET /api/workspace/billing/invoices/{id} returns 200 with invoice data."""
    customer, _ = customer_and_user
    inv_r = await client.post(
        "/api/workspace/billing/invoices",
        headers=_staff_headers(staff_user),
        json={
            "customer_id": customer.id,
            "due_date": "2026-12-31",
            "total": 80.0,
            "currency": "BRL",
            "line_items": [{"description": "Item", "amount": 80.0}],
        },
    )
    assert inv_r.status_code == 201
    inv_id = inv_r.json()["id"]
    r = await client.get(
        f"/api/workspace/billing/invoices/{inv_id}",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == inv_id
    assert data["total"] == 80.0
    assert "status" in data


@pytest.mark.asyncio
async def test_workspace_billing_payment_link_400_invoice_not_found(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
) -> None:
    """POST payment-link for non-existent invoice returns 400."""
    with patch(
        "app.modules.billing.workspace.invoices.create_payment_attempt",
        new_callable=AsyncMock,
        side_effect=ValueError("Invoice not found"),
    ):
        r = await client.post(
            "/api/workspace/billing/invoices/99999/payment-link",
            headers=_staff_headers(staff_user),
            params={"success_url": "https://ok", "cancel_url": "https://cancel"},
        )
    assert r.status_code == 400
    assert "not found" in r.json().get("detail", "").lower()


@pytest.mark.asyncio
async def test_workspace_billing_mark_paid_400_not_found(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
) -> None:
    """POST mark-paid for non-existent invoice returns 400."""
    with patch(
        "app.modules.billing.workspace.invoices.trigger_provisioning_if_needed",
        new_callable=AsyncMock,
    ):
        r = await client.post(
            "/api/workspace/billing/invoices/99999/mark-paid",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 400
    assert (
        "not found" in r.json().get("detail", "").lower()
        or "already paid" in r.json().get("detail", "").lower()
    )


@pytest.mark.asyncio
async def test_workspace_billing_generate_recurring_with_reminders(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
) -> None:
    """POST generate-recurring-invoices with send_reminders=True returns 200 with reminders_sent."""
    r = await client.post(
        "/api/workspace/billing/generate-recurring-invoices",
        headers=_staff_headers(staff_user),
        params={"send_reminders": "true"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "generated" in data
    assert "reminders_sent" in data
    assert isinstance(data["reminders_sent"], int)


# ---------- pay-bricks: success and rejected (mocked provider) ----------


@pytest.mark.asyncio
async def test_workspace_billing_pay_bricks_approved(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
    customer_and_user: tuple,
) -> None:
    """POST pay-bricks with mocked MP provider returning approved returns 200 and payment_status approved."""
    customer, _ = customer_and_user
    inv_r = await client.post(
        "/api/workspace/billing/invoices",
        headers=_staff_headers(staff_user),
        json={
            "customer_id": customer.id,
            "due_date": "2026-12-31",
            "total": 100.0,
            "currency": "BRL",
            "line_items": [{"description": "Item", "amount": 100.0}],
        },
    )
    assert inv_r.status_code == 201
    inv_id = inv_r.json()["id"]
    mock_provider = MagicMock(spec=MercadoPagoProvider)
    mock_provider.create_or_get_customer.return_value = {"id": "mp_1"}
    mock_provider.create_payment.return_value = {
        "status": "approved",
        "id": "pay_br_1",
    }
    with (
        patch(
            "app.modules.billing.workspace.invoices._get_payment_provider",
            new_callable=AsyncMock,
            return_value=mock_provider,
        ),
        patch(
            "app.modules.billing.workspace.invoices.reactivate_subscription_after_payment",
            new_callable=AsyncMock,
        ),
        patch(
            "app.modules.billing.workspace.invoices._run_provisioning_after_payment",
        ),
        patch(
            "app.modules.billing.workspace.invoices.create_notification_and_maybe_send_email",
            new_callable=AsyncMock,
        ),
    ):
        r = await client.post(
            f"/api/workspace/billing/invoices/{inv_id}/pay-bricks",
            headers=_staff_headers(staff_user),
            json={
                "payer_email": customer.email,
                "payment_method_id": "card",
                "token": "tok_xyz",
            },
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("payment_status") == "approved"
    assert data.get("payment_id") == "pay_br_1"


@pytest.mark.asyncio
async def test_workspace_billing_pay_bricks_rejected(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
    customer_and_user: tuple,
) -> None:
    """POST pay-bricks with mocked provider returning rejected returns 200 and error_message."""
    customer, _ = customer_and_user
    inv_r = await client.post(
        "/api/workspace/billing/invoices",
        headers=_staff_headers(staff_user),
        json={
            "customer_id": customer.id,
            "due_date": "2026-12-31",
            "total": 50.0,
            "currency": "BRL",
            "line_items": [{"description": "Item", "amount": 50.0}],
        },
    )
    assert inv_r.status_code == 201
    inv_id = inv_r.json()["id"]
    mock_provider = MagicMock(spec=MercadoPagoProvider)
    mock_provider.create_payment.return_value = {
        "status": "rejected",
        "id": "pay_rej_br",
        "status_detail": "cc_rejected_other_reason",
    }
    with patch(
        "app.modules.billing.workspace.invoices._get_payment_provider",
        new_callable=AsyncMock,
        return_value=mock_provider,
    ):
        r = await client.post(
            f"/api/workspace/billing/invoices/{inv_id}/pay-bricks",
            headers=_staff_headers(staff_user),
            json={
                "payer_email": customer.email,
                "payment_method_id": "card",
                "token": "tok_abc",
            },
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("payment_status") == "rejected"
    assert data.get("error_message")
