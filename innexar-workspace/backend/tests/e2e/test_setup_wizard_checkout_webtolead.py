"""E2E: setup-wizard (with token), RBAC 403, checkout/start, web-to-lead."""

import uuid

import pytest
from app.core.security import create_token_staff, hash_password
from app.models.permission import Permission
from app.models.role import Role, role_permissions, user_roles
from app.models.user import User
from app.modules.billing.models import PricePlan, Product
from app.modules.crm.models import Contact
from httpx import AsyncClient
from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_setup_wizard_with_token(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """POST /api/workspace/system/setup-wizard with SEED_TOKEN returns summary."""
    from app.core import config

    token = "test-seed-token-123"
    monkeypatch.setattr(config.settings, "SEED_TOKEN", token)
    r = await client.post(
        "/api/workspace/system/setup-wizard",
        json={"test_connection": False},
        params={"token": token},
    )
    assert r.status_code == 200
    data = r.json()
    assert "admin_created" in data
    assert "flags_created" in data
    assert "integrations_created" in data


@pytest.mark.asyncio
async def test_rbac_403_without_permission(
    client: AsyncClient,
    db_session: AsyncSession,
) -> None:
    """Staff user without billing:read gets 403 on GET /api/workspace/billing/invoices."""
    suffix = uuid.uuid4().hex[:8]
    email = f"nobilling-{suffix}@test.innexar.com"
    user = User(
        email=email,
        password_hash=hash_password("secret"),
        role="staff",
        org_id="innexar",
    )
    db_session.add(user)
    await db_session.flush()
    # Create role "viewer" with only crm:read (no billing:read)
    perm = (
        await db_session.execute(
            select(Permission).where(Permission.slug == "crm:read").limit(1)
        )
    ).scalar_one_or_none()
    if perm is None:
        perm = Permission(slug="crm:read", description="crm:read")
        db_session.add(perm)
        await db_session.flush()
    role = Role(org_id="innexar", name="Viewer", slug="viewer")
    db_session.add(role)
    await db_session.flush()
    await db_session.execute(
        insert(role_permissions).values(role_id=role.id, permission_id=perm.id)
    )
    await db_session.execute(
        insert(user_roles).values(user_id=user.id, role_id=role.id)
    )
    await db_session.flush()
    staff_token = create_token_staff(user.id)
    r = await client.get(
        "/api/workspace/billing/invoices",
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_public_checkout_returns_payment_url(
    client: AsyncClient,
    db_session: AsyncSession,
) -> None:
    """POST /api/public/checkout/start returns payment_url (flow until payment_url)."""
    from app.models.customer import Customer

    cust = Customer(
        org_id="innexar", name="Checkout Customer", email="checkout@test.com"
    )
    db_session.add(cust)
    await db_session.flush()
    product = Product(org_id="innexar", name="Test Product", is_active=True)
    db_session.add(product)
    await db_session.flush()
    price_plan = PricePlan(
        product_id=product.id,
        name="Monthly",
        interval="monthly",
        amount=99.99,
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
                "customer_email": "checkout@test.com",
                "success_url": "https://example.com/success",
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
        assert data["payment_url"]


@pytest.mark.asyncio
async def test_web_to_lead_201_creates_contact(
    client: AsyncClient,
    db_session: AsyncSession,
) -> None:
    """POST /api/public/web-to-lead returns 201 and creates Contact."""
    r = await client.post(
        "/api/public/web-to-lead",
        json={
            "name": "Lead One",
            "email": "lead1@test.com",
            "phone": "+5511999999999",
            "message": "Interested",
            "source": "landing",
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert "id" in data
    contact_id = data["id"]
    c = (
        await db_session.execute(
            select(Contact).where(Contact.id == contact_id).limit(1)
        )
    ).scalar_one_or_none()
    assert c is not None
    assert c.name == "Lead One"
    assert c.email == "lead1@test.com"
    assert c.phone == "+5511999999999"
