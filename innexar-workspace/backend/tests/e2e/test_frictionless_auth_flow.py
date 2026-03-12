"""E2E Test: Frictionless checkout auto-login and set password flow."""

import time

import pytest
from app.core.config import settings
from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from httpx import AsyncClient
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_frictionless_auth_flow(
    client: AsyncClient,
    db_session: AsyncSession,
) -> None:
    """Tests the auto-login JWT and the mandatory password set process."""
    # 1. Manually insert a customer that requires a password change (like webhook does)
    test_email = "auto.login@test.innexar.com"
    customer = Customer(
        org_id="innexar",
        name="Auto Login Tester",
        email=test_email,
    )
    db_session.add(customer)
    await db_session.flush()

    customer_user = CustomerUser(
        customer_id=customer.id,
        email=test_email,
        password_hash="temp_hash",
        requires_password_change=True,
    )
    db_session.add(customer_user)
    await db_session.commit()
    await db_session.refresh(customer_user)

    # 2. Forge a 'checkout_auto_login' token (mimicking checkout_success generation)
    expire = time.time() + 600  # 10 minutes from now
    payload = {
        "sub": str(customer_user.id),
        "exp": expire,
        "type": "customer",
        "scope": "checkout_auto_login",
    }
    checkout_token = jwt.encode(
        payload, settings.SECRET_KEY_CUSTOMER, algorithm="HS256"
    )

    # 3. Call endpoint to exchange checkout token for access token
    r_login = await client.post(
        "/api/public/auth/customer/checkout-login",
        json={"token": checkout_token},
    )
    assert r_login.status_code == 200, "Checkout login with token failed"
    data_login = r_login.json()
    assert "access_token" in data_login
    assert data_login["email"] == test_email

    access_token = data_login["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    # 4. Check dashboard API returns the flag requires_password_change = True
    r_dash_pre = await client.get("/api/portal/me/dashboard", headers=headers)
    assert r_dash_pre.status_code == 200
    data_dash_pre = r_dash_pre.json()
    assert (
        data_dash_pre.get("requires_password_change") is True
    ), "Dashboard should flag password change requirement"

    # 5. Set definitive password
    new_password = "my-secure-password-123"
    r_set_pwd = await client.post(
        "/api/portal/me/set-password",
        headers=headers,
        json={"new_password": new_password},
    )
    assert r_set_pwd.status_code == 200, "Should be able to set password"
    assert r_set_pwd.json().get("message") == "Senha configurada com sucesso."

    # 6. Check dashboard API returns the flag requires_password_change = False now
    r_dash_post = await client.get("/api/portal/me/dashboard", headers=headers)
    assert r_dash_post.status_code == 200
    data_dash_post = r_dash_post.json()
    assert (
        data_dash_post.get("requires_password_change") is False
    ), "Dashboard flag should be cleared after password set"
