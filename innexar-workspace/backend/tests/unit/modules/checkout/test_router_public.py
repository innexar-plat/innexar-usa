"""Unit tests for public checkout router: validation, 404, 400, happy path with mocks."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from app.modules.billing.models import PricePlan, Product
from app.providers.payments.mercadopago import MercadoPagoProvider
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_checkout_start_404_unknown_plan_slug(client: AsyncClient) -> None:
    """POST /api/public/checkout/start with unknown plan_slug returns 404."""
    r = await client.post(
        "/api/public/checkout/start",
        json={
            "plan_slug": "unknown_plan",
            "customer_email": "user@test.com",
            "customer_name": "User",
            "success_url": "https://example.com/success",
            "cancel_url": "https://example.com/cancel",
        },
    )
    assert r.status_code == 404
    data = r.json()
    assert (
        "plan_slug" in data.get("detail", "").lower()
        or "unknown" in data.get("detail", "").lower()
    )


@pytest.mark.asyncio
async def test_checkout_start_400_domain_required_for_hestia_hosting(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """POST with plan_slug that resolves to hestia_hosting product without domain returns 400."""
    product = Product(
        org_id="innexar",
        name="Starter Website",
        is_active=True,
        provisioning_type="hestia_hosting",
    )
    override_get_db.add(product)
    await override_get_db.flush()
    pp = PricePlan(
        product_id=product.id,
        name="Monthly",
        interval="month",
        amount=99.0,
        currency="USD",
    )
    override_get_db.add(pp)
    await override_get_db.flush()

    r = await client.post(
        "/api/public/checkout/start",
        json={
            "plan_slug": "starter",
            "customer_email": "user@test.com",
            "customer_name": "User",
            "success_url": "https://example.com/success",
            "cancel_url": "https://example.com/cancel",
        },
    )
    assert r.status_code == 400
    data = r.json()
    assert "domain" in data.get("detail", "").lower()


@pytest.mark.asyncio
async def test_checkout_start_200_redirect_with_mock(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """POST with valid plan_slug and success_url returns 200 and payment_url when create_payment_attempt is mocked."""
    product = Product(
        org_id="innexar",
        name="Starter Website",
        is_active=True,
        provisioning_type="",  # not hestia_hosting so no domain required
    )
    override_get_db.add(product)
    await override_get_db.flush()
    pp = PricePlan(
        product_id=product.id,
        name="Monthly",
        interval="month",
        amount=99.0,
        currency="USD",
    )
    override_get_db.add(pp)
    await override_get_db.flush()

    with patch(
        "app.modules.checkout.checkout_service.create_payment_attempt",
        new_callable=AsyncMock,
    ) as mock_create:
        mock_create.return_value = type(
            "Res",
            (),
            {"payment_url": "https://mp.com/checkout/abc", "attempt_id": 1},
        )()
        r = await client.post(
            "/api/public/checkout/start",
            json={
                "plan_slug": "starter",
                "customer_email": "newuser@test.com",
                "customer_name": "New User",
                "success_url": "https://example.com/success",
                "cancel_url": "https://example.com/cancel",
            },
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("payment_url") == "https://mp.com/checkout/abc"
    assert "checkout_token" in data
    mock_create.assert_called_once()


@pytest.mark.asyncio
async def test_checkout_start_404_product_not_found(
    client: AsyncClient,
) -> None:
    """When no product exists for plan_slug (e.g. starter), returns 404."""
    r = await client.post(
        "/api/public/checkout/start",
        json={
            "plan_slug": "starter",
            "customer_email": "user@test.com",
            "customer_name": "User",
            "success_url": "https://example.com/success",
            "cancel_url": "https://example.com/cancel",
        },
    )
    assert r.status_code == 404
    data = r.json()
    assert (
        "not found" in data.get("detail", "").lower()
        or "waas" in data.get("detail", "").lower()
    )


@pytest.mark.asyncio
async def test_checkout_start_404_product_or_plan_by_id(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """POST with product_id/price_plan_id when plan not found returns 404."""
    product = Product(
        org_id="innexar",
        name="Other Product",
        is_active=True,
    )
    override_get_db.add(product)
    await override_get_db.flush()
    pp = PricePlan(
        product_id=product.id,
        name="Monthly",
        interval="month",
        amount=50.0,
        currency="USD",
    )
    override_get_db.add(pp)
    await override_get_db.flush()
    # use non-existent price_plan_id (e.g. pp.id + 999) so join fails
    r = await client.post(
        "/api/public/checkout/start",
        json={
            "product_id": product.id,
            "price_plan_id": pp.id + 9999,
            "customer_email": "user@test.com",
            "customer_name": "User",
            "success_url": "https://example.com/success",
            "cancel_url": "https://example.com/cancel",
        },
    )
    assert r.status_code == 404
    assert "not found" in r.json().get("detail", "").lower()


@pytest.mark.asyncio
async def test_checkout_start_200_with_product_id_and_mock(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """POST with product_id/price_plan_id returns 200 and payment_url when create_payment_attempt mocked."""
    product = Product(
        org_id="innexar",
        name="Some Product",
        is_active=True,
    )
    override_get_db.add(product)
    await override_get_db.flush()
    pp = PricePlan(
        product_id=product.id,
        name="Monthly",
        interval="month",
        amount=25.0,
        currency="USD",
    )
    override_get_db.add(pp)
    await override_get_db.flush()
    with patch(
        "app.modules.checkout.checkout_service.create_payment_attempt",
        new_callable=AsyncMock,
    ) as mock_create:
        mock_create.return_value = type(
            "Res",
            (),
            {"payment_url": "https://checkout.example/pay", "attempt_id": 2},
        )()
        r = await client.post(
            "/api/public/checkout/start",
            json={
                "product_id": product.id,
                "price_plan_id": pp.id,
                "customer_email": "another@test.com",
                "customer_name": "Another",
                "success_url": "https://example.com/success",
                "cancel_url": "https://example.com/cancel",
            },
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("payment_url") == "https://checkout.example/pay"
    assert "checkout_token" in data
    mock_create.assert_called_once()


# ---------- Bricks flow: _process_bricks_payment (mocked provider) ----------


async def _make_brl_product_and_plan(
    override_get_db: AsyncSession,
) -> tuple[Product, PricePlan]:
    """Create a BRL product and monthly plan for Bricks tests."""
    product = Product(
        org_id="innexar",
        name="Produto BRL",
        is_active=True,
        provisioning_type="",
    )
    override_get_db.add(product)
    await override_get_db.flush()
    pp = PricePlan(
        product_id=product.id,
        name="Mensal",
        interval="month",
        amount=99.0,
        currency="BRL",
    )
    override_get_db.add(pp)
    await override_get_db.flush()
    return product, pp


@pytest.mark.asyncio
async def test_checkout_bricks_approved(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """POST checkout/start with payment_method_id (Bricks) and mocked MP provider returns approved."""
    product, pp = await _make_brl_product_and_plan(override_get_db)
    mock_provider = MagicMock(spec=MercadoPagoProvider)
    mock_provider.create_or_get_customer.return_value = {"id": "mp_cust_123"}
    mock_provider.create_payment.return_value = {
        "status": "approved",
        "id": "pay_approved_1",
    }
    mock_provider.save_card.return_value = {"id": "card_1"}
    with (
        patch(
            "app.modules.checkout.checkout_bricks._get_payment_provider",
            new_callable=AsyncMock,
            return_value=mock_provider,
        ),
        patch(
            "app.modules.checkout.checkout_bricks.reactivate_subscription_after_payment",
            new_callable=AsyncMock,
        ),
        patch(
            "app.modules.notifications.service.create_notification_and_maybe_send_email",
            new_callable=AsyncMock,
        ),
        patch(
            "app.modules.customers.service.send_portal_credentials_after_payment",
        ),
        patch(
            "app.modules.billing.post_payment.create_project_and_notify_after_payment",
            new_callable=AsyncMock,
        ),
    ):
        r = await client.post(
            "/api/public/checkout/start",
            json={
                "product_id": product.id,
                "price_plan_id": pp.id,
                "customer_email": "bricks@test.com",
                "customer_name": "Bricks User",
                "payment_method_id": "card",
                "token": "card_token_xyz",
                "success_url": "https://example.com/success",
                "cancel_url": "https://example.com/cancel",
            },
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("payment_status") == "approved"
    assert data.get("payment_id") == "pay_approved_1"
    assert "checkout_token" in data
    mock_provider.create_payment.assert_called_once()


@pytest.mark.asyncio
async def test_checkout_bricks_rejected(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """POST checkout/start Bricks with mocked provider returning rejected status."""
    product, pp = await _make_brl_product_and_plan(override_get_db)
    mock_provider = MagicMock(spec=MercadoPagoProvider)
    mock_provider.create_or_get_customer.return_value = {"id": "mp_cust_456"}
    mock_provider.create_payment.return_value = {
        "status": "rejected",
        "id": "pay_rej_1",
        "status_detail": "cc_rejected_insufficient_amount",
    }
    with patch(
        "app.modules.checkout.checkout_bricks._get_payment_provider",
        new_callable=AsyncMock,
        return_value=mock_provider,
    ):
        r = await client.post(
            "/api/public/checkout/start",
            json={
                "product_id": product.id,
                "price_plan_id": pp.id,
                "customer_email": "rej@test.com",
                "customer_name": "Rej User",
                "payment_method_id": "card",
                "token": "card_token_abc",
                "success_url": "https://example.com/success",
                "cancel_url": "https://example.com/cancel",
            },
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("payment_status") == "rejected"
    assert "Saldo insuficiente" in (data.get("error_message") or "")


@pytest.mark.asyncio
async def test_checkout_bricks_pending(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """POST checkout/start Bricks with pending payment returns 200 and payment_status pending."""
    product, pp = await _make_brl_product_and_plan(override_get_db)
    mock_provider = MagicMock(spec=MercadoPagoProvider)
    mock_provider.create_or_get_customer.return_value = {}
    mock_provider.create_payment.return_value = {
        "status": "pending",
        "id": "pay_pending_1",
        "point_of_interaction": {
            "transaction_data": {
                "qr_code_base64": "data:image/png;base64,abc",
                "ticket_url": "https://mp.com/ticket",
            }
        },
    }
    with patch(
        "app.modules.checkout.checkout_bricks._get_payment_provider",
        new_callable=AsyncMock,
        return_value=mock_provider,
    ):
        r = await client.post(
            "/api/public/checkout/start",
            json={
                "product_id": product.id,
                "price_plan_id": pp.id,
                "customer_email": "pending@test.com",
                "customer_name": "Pending User",
                "payment_method_id": "card",
                "token": "token",
                "success_url": "https://example.com/success",
                "cancel_url": "https://example.com/cancel",
            },
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("payment_status") == "pending"
    assert data.get("payment_id") == "pay_pending_1"
    assert data.get("qr_code_base64") or data.get("ticket_url")


@pytest.mark.asyncio
async def test_checkout_bricks_400_when_provider_not_mp(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """POST checkout/start with payment_method_id but provider is Stripe (USD) returns 400."""
    product = Product(
        org_id="innexar",
        name="USD Product",
        is_active=True,
    )
    override_get_db.add(product)
    await override_get_db.flush()
    pp = PricePlan(
        product_id=product.id,
        name="Monthly",
        interval="month",
        amount=99.0,
        currency="USD",
    )
    override_get_db.add(pp)
    await override_get_db.flush()
    from app.providers.payments.stripe import StripeProvider

    with patch(
        "app.modules.checkout.checkout_bricks._get_payment_provider",
        new_callable=AsyncMock,
        return_value=StripeProvider(api_key="sk_test"),
    ):
        r = await client.post(
            "/api/public/checkout/start",
            json={
                "product_id": product.id,
                "price_plan_id": pp.id,
                "customer_email": "u@test.com",
                "customer_name": "U",
                "payment_method_id": "card",
                "token": "tok",
                "success_url": "https://example.com/success",
                "cancel_url": "https://example.com/cancel",
            },
        )
    assert r.status_code == 400
    assert "Bricks" in r.json().get("detail", "") or "Mercado Pago" in r.json().get(
        "detail", ""
    )
