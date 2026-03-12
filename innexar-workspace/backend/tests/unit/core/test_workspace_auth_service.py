"""Unit tests for workspace auth service (staff login, forgot, reset, change password)."""

from datetime import UTC, datetime, timedelta
from unittest.mock import MagicMock

import pytest
from app.core.security import hash_password
from app.core.workspace_auth_service import (
    staff_change_password,
    staff_forgot_password,
    staff_login,
    staff_reset_password,
)
from app.models.staff_password_reset import StaffPasswordResetToken
from app.models.user import User
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_staff_login_success(db_session: AsyncSession) -> None:
    """Login with valid credentials returns StaffLoginResponse."""
    user = User(
        email="staff@test.com",
        password_hash=hash_password("secret123"),
        role="admin",
        org_id="innexar",
    )
    db_session.add(user)
    await db_session.flush()

    result = await staff_login(db_session, "staff@test.com", "secret123")

    assert result.user_id == user.id
    assert result.email == user.email
    assert result.access_token


@pytest.mark.asyncio
async def test_staff_login_wrong_password_raises(db_session: AsyncSession) -> None:
    """Login with wrong password raises ValueError."""
    user = User(
        email="staff2@test.com",
        password_hash=hash_password("secret123"),
        role="admin",
        org_id="innexar",
    )
    db_session.add(user)
    await db_session.flush()

    with pytest.raises(ValueError, match="Email ou senha incorretos"):
        await staff_login(db_session, "staff2@test.com", "wrong")


@pytest.mark.asyncio
async def test_staff_login_unknown_email_raises(db_session: AsyncSession) -> None:
    """Login with unknown email raises ValueError."""
    with pytest.raises(ValueError, match="Email ou senha incorretos"):
        await staff_login(db_session, "unknown@test.com", "any")


@pytest.mark.asyncio
async def test_staff_login_normalizes_email(db_session: AsyncSession) -> None:
    """Login accepts email with different casing."""
    user = User(
        email="staff@test.com",
        password_hash=hash_password("secret123"),
        role="admin",
        org_id="innexar",
    )
    db_session.add(user)
    await db_session.flush()

    result = await staff_login(db_session, "  STAFF@TEST.COM  ", "secret123")

    assert result.email == user.email


@pytest.mark.asyncio
async def test_staff_forgot_password_returns_message(
    db_session: AsyncSession,
) -> None:
    """Forgot password always returns same message; no error when user missing."""
    mock_bg = MagicMock()
    out = await staff_forgot_password(db_session, "nobody@test.com", mock_bg)
    assert out.message
    assert "account" in out.message.lower() or "email" in out.message.lower()


@pytest.mark.asyncio
async def test_staff_forgot_password_creates_token_when_user_exists(
    db_session: AsyncSession,
) -> None:
    """Forgot password for existing user creates token and queues email task."""
    user = User(
        email="forgot@test.com",
        password_hash=hash_password("x"),
        role="admin",
        org_id="innexar",
    )
    db_session.add(user)
    await db_session.flush()
    mock_bg = MagicMock()

    out = await staff_forgot_password(db_session, "forgot@test.com", mock_bg)

    assert out.message
    mock_bg.add_task.assert_called_once()
    r = await db_session.execute(
        select(StaffPasswordResetToken).where(
            StaffPasswordResetToken.user_id == user.id
        )
    )
    row = r.scalar_one_or_none()
    assert row is not None
    assert row.token
    # SQLite may return naive datetime; avoid comparing naive vs aware
    assert row.expires_at is not None


@pytest.mark.asyncio
async def test_staff_reset_password_success(
    db_session: AsyncSession,
) -> None:
    """Reset password with valid token updates user and removes token."""
    user = User(
        email="reset@test.com",
        password_hash=hash_password("old"),
        role="admin",
        org_id="innexar",
    )
    db_session.add(user)
    await db_session.flush()
    token = "valid-reset-token"
    expires = datetime.now(UTC) + timedelta(hours=24)
    row = StaffPasswordResetToken(user_id=user.id, token=token, expires_at=expires)
    db_session.add(row)
    await db_session.flush()

    result = await staff_reset_password(db_session, token, "newpass123")

    assert result.message
    await db_session.refresh(user)
    from app.core.security import verify_password

    assert verify_password("newpass123", user.password_hash)
    r2 = await db_session.execute(
        select(StaffPasswordResetToken).where(
            StaffPasswordResetToken.user_id == user.id
        )
    )
    assert r2.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_staff_reset_password_invalid_token_raises(
    db_session: AsyncSession,
) -> None:
    """Reset with invalid token raises ValueError."""
    with pytest.raises(ValueError, match="Token inválido ou expirado"):
        await staff_reset_password(db_session, "invalid-token", "newpass123")


@pytest.mark.asyncio
async def test_staff_reset_password_short_password_raises(
    db_session: AsyncSession,
) -> None:
    """Reset with short password raises ValueError."""
    with pytest.raises(ValueError, match="obrigatórios"):
        await staff_reset_password(db_session, "some-token", "12345")


@pytest.mark.asyncio
async def test_staff_change_password_success(db_session: AsyncSession) -> None:
    """Change password with correct current password succeeds."""
    user = User(
        email="change@test.com",
        password_hash=hash_password("current123"),
        role="admin",
        org_id="innexar",
    )
    db_session.add(user)
    await db_session.flush()

    result = await staff_change_password(db_session, user, "current123", "newpass456")

    assert result.message
    await db_session.refresh(user)
    from app.core.security import verify_password

    assert verify_password("newpass456", user.password_hash)


@pytest.mark.asyncio
async def test_staff_change_password_wrong_current_raises(
    db_session: AsyncSession,
) -> None:
    """Change password with wrong current password raises ValueError."""
    user = User(
        email="change2@test.com",
        password_hash=hash_password("current123"),
        role="admin",
        org_id="innexar",
    )
    db_session.add(user)
    await db_session.flush()

    with pytest.raises(ValueError, match="Senha atual incorreta"):
        await staff_change_password(db_session, user, "wrong", "newpass456")


@pytest.mark.asyncio
async def test_staff_change_password_short_new_raises(db_session: AsyncSession) -> None:
    """Change password with too short new password raises ValueError."""
    user = User(
        email="change3@test.com",
        password_hash=hash_password("current123"),
        role="admin",
        org_id="innexar",
    )
    db_session.add(user)
    await db_session.flush()

    with pytest.raises(ValueError, match="mínimo 6"):
        await staff_change_password(db_session, user, "current123", "12345")
