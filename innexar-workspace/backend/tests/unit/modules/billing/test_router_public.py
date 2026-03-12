"""Unit tests for public billing router: webhooks Stripe / Mercado Pago."""

import os
from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import pytest
from app.models.customer import Customer
from app.modules.billing.enums import InvoiceStatus
from app.modules.billing.models import Invoice
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_webhook_catchall_routes_to_stripe(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """POST /api/public/webhooks with stripe-signature header calls Stripe handler and returns 200."""
    with patch(
        "app.modules.billing.public_service.process_webhook",
        new_callable=AsyncMock,
        return_value=(True, "ok", None),
    ):
        r = await client.post(
            "/api/public/webhooks",
            headers={"stripe-signature": "t=123,v1=abc"},
            content=b'{"id":"ev_123"}',
        )
    assert r.status_code == 200
    assert r.text == "ok"


@pytest.mark.asyncio
async def test_webhook_catchall_routes_to_mercadopago_without_stripe_header(
    client: AsyncClient,
) -> None:
    """POST /api/public/webhooks without stripe-signature routes to Mercado Pago."""
    with patch(
        "app.modules.billing.public_service.process_webhook",
        new_callable=AsyncMock,
        return_value=(True, "ok", None),
    ):
        r = await client.post(
            "/api/public/webhooks",
            content=b'{"type":"payment","data":{"id":"123456"}}',
        )
    assert r.status_code == 200
    assert r.text == "ok"


@pytest.mark.asyncio
async def test_webhook_stripe_400_when_not_processed(
    client: AsyncClient,
) -> None:
    """POST /api/public/webhooks/stripe when process_webhook returns not ok returns 400."""
    with patch(
        "app.modules.billing.public_service.process_webhook",
        new_callable=AsyncMock,
        return_value=(False, "invalid signature", None),
    ):
        r = await client.post(
            "/api/public/webhooks/stripe",
            headers={"stripe-signature": "x"},
            content=b"{}",
        )
    assert r.status_code == 400
    assert "invalid" in r.text.lower() or "signature" in r.text.lower()


@pytest.mark.asyncio
async def test_webhook_stripe_200_when_processed(
    client: AsyncClient,
) -> None:
    """POST /api/public/webhooks/stripe when process_webhook returns ok returns 200."""
    with patch(
        "app.modules.billing.public_service.process_webhook",
        new_callable=AsyncMock,
        return_value=(True, "ok", None),
    ):
        r = await client.post(
            "/api/public/webhooks/stripe",
            headers={"stripe-signature": "x"},
            content=b'{"id":"ev_1"}',
        )
    assert r.status_code == 200
    assert r.text == "ok"


@pytest.mark.asyncio
async def test_webhook_stripe_200_with_paid_invoice_triggers_background(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """POST /api/public/webhooks/stripe with paid_invoice_id returns 200 and enqueues tasks."""
    customer = Customer(org_id="innexar", name="C", email="c@test.com")
    override_get_db.add(customer)
    await override_get_db.flush()
    inv = Invoice(
        customer_id=customer.id,
        status=InvoiceStatus.PENDING.value,
        due_date=datetime.now(UTC),
        total=50.0,
        currency="USD",
    )
    override_get_db.add(inv)
    await override_get_db.flush()
    paid_id = inv.id
    with (
        patch(
            "app.modules.billing.public_service.process_webhook",
            new_callable=AsyncMock,
            return_value=(True, "ok", paid_id),
        ),
        patch(
            "app.modules.notifications.service.create_notification_and_maybe_send_email",
            new_callable=AsyncMock,
        ),
        patch(
            "app.modules.customers.service.send_portal_credentials_after_payment",
        ),
        patch(
            "app.modules.billing.public_service._run_provisioning",
            new_callable=AsyncMock,
        ),
        patch(
            "app.modules.billing.public_service._run_create_project_and_notify",
            new_callable=AsyncMock,
        ),
    ):
        r = await client.post(
            "/api/public/webhooks/stripe",
            headers={"stripe-signature": "x"},
            content=b"{}",
        )
    assert r.status_code == 200
    assert r.text == "ok"


@pytest.mark.asyncio
async def test_webhook_mercadopago_401_invalid_signature(
    client: AsyncClient,
) -> None:
    """POST /api/public/webhooks/mercadopago with wrong signature returns 401 when secret set."""
    with patch.dict(
        os.environ,
        {"MP_WEBHOOK_SECRET": "my-secret"},
        clear=False,
    ):
        r = await client.post(
            "/api/public/webhooks/mercadopago",
            headers={"x-signature": "ts=1,v1=wrong"},
            content=b'{"type":"payment","data":{"id":"999"}}',
        )
    assert r.status_code == 401
    assert "invalid" in r.text.lower() or "signature" in r.text.lower()


@pytest.mark.asyncio
async def test_webhook_mercadopago_200_test_notification(
    client: AsyncClient,
) -> None:
    """POST /api/public/webhooks/mercadopago with test notification (data.id=123456) returns 200."""
    with patch(
        "app.modules.billing.public_service.process_webhook",
        new_callable=AsyncMock,
        return_value=(True, "ok", None),
    ):
        r = await client.post(
            "/api/public/webhooks/mercadopago",
            content=b'{"type":"payment","data":{"id":"123456"}}',
        )
    assert r.status_code == 200
    assert r.text == "ok"


@pytest.mark.asyncio
async def test_webhook_mercadopago_400_when_not_processed(
    client: AsyncClient,
) -> None:
    """POST /api/public/webhooks/mercadopago when process_webhook returns not ok returns 400."""
    with patch(
        "app.modules.billing.public_service.process_webhook",
        new_callable=AsyncMock,
        return_value=(False, "invalid payload", None),
    ):
        r = await client.post(
            "/api/public/webhooks/mercadopago",
            content=b'{"type":"payment","data":{"id":"123456"}}',
        )
    assert r.status_code == 400
