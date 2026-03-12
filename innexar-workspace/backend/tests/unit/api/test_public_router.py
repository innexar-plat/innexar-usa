"""Unit tests for public API: forgot-password, reset-password, checkout-login."""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, patch

import pytest
from app.core.security import create_token_customer
from app.models.customer_password_reset import CustomerPasswordResetToken
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_public_forgot_password_200(
    client: AsyncClient,
    customer_and_user: tuple,
) -> None:
    """POST /api/public/auth/customer/forgot-password returns 200."""
    _, customer_user = customer_and_user
    with patch(
        "app.providers.email.loader.get_email_provider",
        new_callable=AsyncMock,
        return_value=None,
    ):
        r = await client.post(
            "/api/public/auth/customer/forgot-password",
            json={"email": customer_user.email},
        )
    assert r.status_code == 200
    data = r.json()
    assert "message" in data


@pytest.mark.asyncio
async def test_public_forgot_password_200_unknown_email(client: AsyncClient) -> None:
    """POST forgot-password with unknown email still returns 200 (no leak)."""
    r = await client.post(
        "/api/public/auth/customer/forgot-password",
        json={"email": "nonexistent@test.com"},
    )
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_public_reset_password_200(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple,
) -> None:
    """POST /api/public/auth/customer/reset-password with valid token returns 200."""
    _, customer_user = customer_and_user
    token = "test-reset-token-123"
    expires_at = datetime.now(UTC) + timedelta(hours=24)
    row = CustomerPasswordResetToken(
        customer_user_id=customer_user.id,
        token=token,
        expires_at=expires_at,
    )
    override_get_db.add(row)
    await override_get_db.flush()
    r = await client.post(
        "/api/public/auth/customer/reset-password",
        json={"token": token, "new_password": "newpass123"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "message" in data


@pytest.mark.asyncio
async def test_public_reset_password_400_invalid_token(client: AsyncClient) -> None:
    """POST reset-password with invalid token returns 400."""
    r = await client.post(
        "/api/public/auth/customer/reset-password",
        json={"token": "invalid-token", "new_password": "newpass123"},
    )
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_public_reset_password_400_short_password(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple,
) -> None:
    """POST reset-password with short password returns 400."""
    _, customer_user = customer_and_user
    token = "short-pw-token"
    expires_at = datetime.now(UTC) + timedelta(hours=24)
    row = CustomerPasswordResetToken(
        customer_user_id=customer_user.id,
        token=token,
        expires_at=expires_at,
    )
    override_get_db.add(row)
    await override_get_db.flush()
    r = await client.post(
        "/api/public/auth/customer/reset-password",
        json={"token": token, "new_password": "12345"},
    )
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_public_checkout_login_200(
    client: AsyncClient,
    customer_and_user: tuple,
) -> None:
    """POST /api/public/auth/customer/checkout-login with valid token returns 200."""
    _, customer_user = customer_and_user
    checkout_token = create_token_customer(
        customer_user.id,
        extra_claims={"scope": "checkout_auto_login"},
    )
    r = await client.post(
        "/api/public/auth/customer/checkout-login",
        json={"token": checkout_token},
    )
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert data.get("email") == customer_user.email


@pytest.mark.asyncio
async def test_public_checkout_login_401_invalid_token(client: AsyncClient) -> None:
    """POST checkout-login with invalid token returns 401."""
    r = await client.post(
        "/api/public/auth/customer/checkout-login",
        json={"token": "invalid"},
    )
    assert r.status_code == 401
