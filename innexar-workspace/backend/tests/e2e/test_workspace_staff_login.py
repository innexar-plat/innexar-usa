"""E2E: POST /api/workspace/auth/staff/login."""

import pytest
from app.models.user import User
from httpx import AsyncClient

PWD = "staff-secret"


@pytest.mark.asyncio
async def test_staff_login_ok(client: AsyncClient, staff_user: User) -> None:
    r = await client.post(
        "/api/workspace/auth/staff/login",
        json={"email": staff_user.email, "password": PWD},
    )
    assert r.status_code == 200
    d = r.json()
    assert "access_token" in d
    assert d.get("token_type") == "bearer"
    assert "email" in d and "user_id" in d
    assert d.get("email") == staff_user.email
    assert d.get("user_id") == staff_user.id


@pytest.mark.asyncio
async def test_staff_login_wrong_password_401(
    client: AsyncClient, staff_user: User
) -> None:
    r = await client.post(
        "/api/workspace/auth/staff/login",
        json={"email": staff_user.email, "password": "wrong"},
    )
    assert r.status_code == 401
    assert "detail" in r.json()
