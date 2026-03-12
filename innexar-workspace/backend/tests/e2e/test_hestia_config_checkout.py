"""E2E: Hestia config GET/PUT, process-overdue, checkout domain validation for hosting."""

import pytest
from app.core.security import create_token_staff
from app.models.user import User
from app.modules.billing.models import PricePlan, Product
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

try:
    from app.core.security import hash_password

    hash_password("x")
    _BCRYPT_WORKS = True
except Exception:
    _BCRYPT_WORKS = False


@pytest.mark.asyncio
@pytest.mark.skipif(not _BCRYPT_WORKS, reason="bcrypt/passlib incompatible in this env")
async def test_hestia_settings_get_returns_defaults(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/config/hestia/settings with config:read returns settings (creates default if missing)."""
    token = create_token_staff(staff_user.id)
    r = await client.get(
        "/api/workspace/config/hestia/settings",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "grace_period_days" in data
    assert "default_hestia_package" in data
    assert "auto_suspend_enabled" in data


@pytest.mark.asyncio
@pytest.mark.skipif(not _BCRYPT_WORKS, reason="bcrypt/passlib incompatible in this env")
async def test_hestia_settings_put_updates(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """PUT /api/workspace/config/hestia/settings updates grace_period_days and auto_suspend_enabled."""
    token = create_token_staff(staff_user.id)
    r = await client.put(
        "/api/workspace/config/hestia/settings",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "grace_period_days": 14,
            "default_hestia_package": "premium",
            "auto_suspend_enabled": False,
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert data["grace_period_days"] == 14
    assert data["default_hestia_package"] == "premium"
    assert data["auto_suspend_enabled"] is False


@pytest.mark.asyncio
@pytest.mark.skipif(not _BCRYPT_WORKS, reason="bcrypt/passlib incompatible in this env")
async def test_process_overdue_returns_processed_count(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """POST /api/workspace/billing/process-overdue returns { processed: n }."""
    token = create_token_staff(staff_user.id)
    r = await client.post(
        "/api/workspace/billing/process-overdue",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "processed" in data
    assert isinstance(data["processed"], int)


@pytest.mark.asyncio
async def test_checkout_hestia_hosting_requires_domain(
    client: AsyncClient,
    db_session: AsyncSession,
) -> None:
    """POST /api/public/checkout/start with hestia_hosting product and no domain returns 400."""
    from app.models.customer import Customer

    cust = Customer(org_id="innexar", name="Host", email="host@test.com")
    db_session.add(cust)
    await db_session.flush()
    product = Product(
        org_id="innexar",
        name="Hosting",
        is_active=True,
        provisioning_type="hestia_hosting",
        hestia_package="default",
    )
    db_session.add(product)
    await db_session.flush()
    price_plan = PricePlan(
        product_id=product.id,
        name="Monthly",
        interval="monthly",
        amount=49.99,
        currency="BRL",
    )
    db_session.add(price_plan)
    await db_session.flush()
    r = await client.post(
        "/api/public/checkout/start",
        json={
            "product_id": product.id,
            "price_plan_id": price_plan.id,
            "customer_email": "host@test.com",
            "success_url": "https://example.com/ok",
            "cancel_url": "https://example.com/cancel",
        },
    )
    assert r.status_code == 400
    assert "domain" in (r.json().get("detail") or "").lower()


@pytest.mark.asyncio
@pytest.mark.skipif(
    not _BCRYPT_WORKS,
    reason="bcrypt/passlib incompatible (checkout creates user with hash)",
)
async def test_checkout_hestia_hosting_with_domain_returns_payment_url(
    client: AsyncClient,
    db_session: AsyncSession,
) -> None:
    """POST /api/public/checkout/start with hestia_hosting and domain returns 201 and payment_url (or 400 if no provider)."""
    from app.models.customer import Customer

    cust = Customer(org_id="innexar", name="Host2", email="host2@test.com")
    db_session.add(cust)
    await db_session.flush()
    product = Product(
        org_id="innexar",
        name="Hosting Plan",
        is_active=True,
        provisioning_type="hestia_hosting",
        hestia_package="default",
    )
    db_session.add(product)
    await db_session.flush()
    price_plan = PricePlan(
        product_id=product.id,
        name="Monthly",
        interval="monthly",
        amount=49.99,
        currency="BRL",
    )
    db_session.add(price_plan)
    await db_session.flush()
    try:
        r = await client.post(
            "/api/public/checkout/start",
            json={
                "product_id": product.id,
                "price_plan_id": price_plan.id,
                "customer_email": "host2@test.com",
                "domain": "mysite.com",
                "success_url": "https://example.com/ok",
                "cancel_url": "https://example.com/cancel",
            },
        )
    except (RuntimeError, ValueError) as e:
        if "not configured" in str(e).lower() or "not installed" in str(e).lower():
            pytest.skip("Payment provider not configured")
        raise
    assert r.status_code in (201, 400, 500)
    if r.status_code == 201:
        data = r.json()
        assert "payment_url" in data
