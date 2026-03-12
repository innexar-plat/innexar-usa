"""Unit tests for portal /me routes: me, features, dashboard, profile, password, set-password."""

import pytest
from app.core.security import create_token_customer, hash_password
from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


def _auth_headers(customer_user: CustomerUser) -> dict[str, str]:
    token = create_token_customer(customer_user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_portal_me_200(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """GET /api/portal/me returns 200 and customer payload."""
    _, customer_user = customer_and_user
    r = await client.get("/api/portal/me", headers=_auth_headers(customer_user))
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == customer_user.id
    assert data["email"] == customer_user.email
    assert data["customer_id"] == customer_user.customer_id
    assert "email_verified" in data


@pytest.mark.asyncio
async def test_portal_me_features_200(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """GET /api/portal/me/features returns 200 and feature flags dict."""
    _, customer_user = customer_and_user
    r = await client.get(
        "/api/portal/me/features", headers=_auth_headers(customer_user)
    )
    assert r.status_code == 200
    data = r.json()
    assert "invoices" in data
    assert "tickets" in data
    assert "projects" in data
    assert isinstance(data["invoices"], bool)
    assert isinstance(data["tickets"], bool)
    assert isinstance(data["projects"], bool)


@pytest.mark.asyncio
async def test_portal_me_dashboard_200(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """GET /api/portal/me/dashboard returns 200 and dashboard dict."""
    _, customer_user = customer_and_user
    r = await client.get(
        "/api/portal/me/dashboard", headers=_auth_headers(customer_user)
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, dict)


@pytest.mark.asyncio
async def test_portal_me_profile_get_200(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """GET /api/portal/me/profile returns 200 and profile (name, email, phone, address)."""
    customer, customer_user = customer_and_user
    r = await client.get("/api/portal/me/profile", headers=_auth_headers(customer_user))
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == customer.name
    assert data["email"] == customer.email
    assert "phone" in data
    assert "address" in data


@pytest.mark.asyncio
async def test_portal_me_profile_patch_200(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """PATCH /api/portal/me/profile returns 200 and updated profile."""
    _, customer_user = customer_and_user
    r = await client.patch(
        "/api/portal/me/profile",
        headers=_auth_headers(customer_user),
        json={"name": "Updated Name", "phone": "+5511999999999"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "Updated Name"
    assert data["phone"] == "+5511999999999"


@pytest.mark.asyncio
async def test_portal_me_password_patch_200(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """PATCH /api/portal/me/password returns 200 when current password is correct."""
    _, customer_user = customer_and_user
    new_password = "newpass123"
    customer_user.password_hash = hash_password("oldpass123")
    override_get_db.add(customer_user)
    await override_get_db.flush()
    r = await client.patch(
        "/api/portal/me/password",
        headers=_auth_headers(customer_user),
        json={"current_password": "oldpass123", "new_password": new_password},
    )
    assert r.status_code == 200
    data = r.json()
    assert "message" in data


@pytest.mark.asyncio
async def test_portal_me_set_password_200(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """POST /api/portal/me/set-password returns 200 when user has requires_password_change."""
    _, customer_user = customer_and_user
    customer_user.requires_password_change = True
    override_get_db.add(customer_user)
    await override_get_db.flush()
    r = await client.post(
        "/api/portal/me/set-password",
        headers=_auth_headers(customer_user),
        json={"new_password": "firstpass123"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "message" in data


@pytest.mark.asyncio
async def test_portal_me_password_400_short_new_password(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """PATCH /api/portal/me/password returns 400 when new password has less than 6 chars."""
    _, customer_user = customer_and_user
    customer_user.password_hash = hash_password("oldpass123")
    override_get_db.add(customer_user)
    await override_get_db.flush()
    r = await client.patch(
        "/api/portal/me/password",
        headers=_auth_headers(customer_user),
        json={"current_password": "oldpass123", "new_password": "short"},
    )
    assert r.status_code == 400
    assert "6" in (r.json().get("detail") or "")


@pytest.mark.asyncio
async def test_portal_me_password_401_wrong_current_password(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """PATCH /api/portal/me/password returns 401 when current password is wrong."""
    _, customer_user = customer_and_user
    customer_user.password_hash = hash_password("correct")
    override_get_db.add(customer_user)
    await override_get_db.flush()
    r = await client.patch(
        "/api/portal/me/password",
        headers=_auth_headers(customer_user),
        json={"current_password": "wrong", "new_password": "newvalid123"},
    )
    assert r.status_code == 401
    assert (
        "incorreta" in (r.json().get("detail") or "").lower()
        or "incorrect" in (r.json().get("detail") or "").lower()
    )


@pytest.mark.asyncio
async def test_portal_me_set_password_400_when_already_has_password(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """POST /api/portal/me/set-password returns 400 when requires_password_change is False."""
    _, customer_user = customer_and_user
    assert not customer_user.requires_password_change
    r = await client.post(
        "/api/portal/me/set-password",
        headers=_auth_headers(customer_user),
        json={"new_password": "newpass123"},
    )
    assert r.status_code == 400
    assert (
        "senha" in (r.json().get("detail") or "").lower()
        or "password" in (r.json().get("detail") or "").lower()
    )


@pytest.mark.asyncio
async def test_portal_me_set_password_400_short_password(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """POST /api/portal/me/set-password returns 400 when new password has less than 6 chars."""
    _, customer_user = customer_and_user
    customer_user.requires_password_change = True
    override_get_db.add(customer_user)
    await override_get_db.flush()
    r = await client.post(
        "/api/portal/me/set-password",
        headers=_auth_headers(customer_user),
        json={"new_password": "abc"},
    )
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_portal_me_profile_patch_partial(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """PATCH /api/portal/me/profile with only name updates name and keeps email."""
    customer, customer_user = customer_and_user
    r = await client.patch(
        "/api/portal/me/profile",
        headers=_auth_headers(customer_user),
        json={"name": "Only Name Updated"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "Only Name Updated"
    assert data["email"] == customer.email


@pytest.mark.asyncio
async def test_portal_me_dashboard_includes_plan_and_support(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """GET /api/portal/me/dashboard returns plan, support, messages keys."""
    _, customer_user = customer_and_user
    r = await client.get(
        "/api/portal/me/dashboard", headers=_auth_headers(customer_user)
    )
    assert r.status_code == 200
    data = r.json()
    assert "plan" in data
    assert "support" in data
    assert "messages" in data
    assert "projects" in data
    assert "can_pay_invoice" in data
    assert "requires_password_change" in data


@pytest.mark.asyncio
async def test_portal_me_dashboard_diagnostic_when_no_subscriptions(
    client: AsyncClient,
    db_session: AsyncSession,
) -> None:
    """GET /api/portal/me/dashboard includes diagnostic when customer has no subscriptions."""
    from app.core.security import hash_password

    # Use a dedicated customer with no subscriptions so diagnostic is guaranteed
    email = "no-subs-dashboard@test.innexar.com"
    customer = Customer(org_id="innexar", name="No Subs", email=email)
    db_session.add(customer)
    await db_session.flush()
    customer_user = CustomerUser(
        customer_id=customer.id,
        email=email,
        password_hash=hash_password("secret"),
        email_verified=True,
    )
    db_session.add(customer_user)
    await db_session.commit()
    await db_session.refresh(customer_user)

    r = await client.get(
        "/api/portal/me/dashboard", headers=_auth_headers(customer_user)
    )
    assert r.status_code == 200
    data = r.json()
    assert data.get("plan") is None
    assert "diagnostic" in data
    assert data["diagnostic"] is not None
    assert data["diagnostic"]["subscriptions_count"] == 0
