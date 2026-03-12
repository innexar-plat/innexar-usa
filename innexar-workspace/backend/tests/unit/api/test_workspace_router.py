"""Unit tests for workspace API: me, auth forgot/reset, me/password, project messages, modification-requests."""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, patch

import pytest
from app.core.security import create_token_staff, hash_password
from app.models.staff_password_reset import StaffPasswordResetToken
from app.models.user import User
from app.modules.projects.models import Project
from app.modules.projects.modification_request import ModificationRequest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

STAFF_PWD = "staff-secret"


def _staff_headers(user: User) -> dict[str, str]:
    token = create_token_staff(user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_workspace_me_200(client: AsyncClient, staff_user: User) -> None:
    """GET /api/workspace/me returns 200 and staff payload."""
    r = await client.get("/api/workspace/me", headers=_staff_headers(staff_user))
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == staff_user.id
    assert data["email"] == staff_user.email
    assert data["role"] == staff_user.role
    assert data["org_id"] == staff_user.org_id


@pytest.mark.asyncio
async def test_workspace_forgot_password_200(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """POST /api/workspace/auth/staff/forgot-password returns 200."""
    # Background task uses app's AsyncSessionLocal (different DB in tests); mock so no DB access in task
    with patch(
        "app.providers.email.loader.get_email_provider",
        new_callable=AsyncMock,
        return_value=None,
    ):
        r = await client.post(
            "/api/workspace/auth/staff/forgot-password",
            json={"email": staff_user.email},
        )
    assert r.status_code == 200
    data = r.json()
    assert "message" in data


@pytest.mark.asyncio
async def test_workspace_reset_password_200(
    client: AsyncClient,
    override_get_db: AsyncSession,
    staff_user: User,
) -> None:
    """POST /api/workspace/auth/staff/reset-password with valid token returns 200."""
    token = "staff-reset-token-valid"
    expires_at = datetime.now(UTC) + timedelta(hours=24)
    row = StaffPasswordResetToken(
        user_id=staff_user.id,
        token=token,
        expires_at=expires_at,
    )
    override_get_db.add(row)
    await override_get_db.flush()
    r = await client.post(
        "/api/workspace/auth/staff/reset-password",
        json={"token": token, "new_password": "newstaff123"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "message" in data


@pytest.mark.asyncio
async def test_workspace_reset_password_400_invalid_token(client: AsyncClient) -> None:
    """POST workspace reset-password with invalid token returns 400."""
    r = await client.post(
        "/api/workspace/auth/staff/reset-password",
        json={"token": "invalid", "new_password": "newpass123"},
    )
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_workspace_reset_password_400_short_password(
    client: AsyncClient,
    override_get_db: AsyncSession,
    staff_user: User,
) -> None:
    """POST workspace reset-password with short password returns 400."""
    token = "staff-short-pw-token"
    expires_at = datetime.now(UTC) + timedelta(hours=24)
    row = StaffPasswordResetToken(
        user_id=staff_user.id,
        token=token,
        expires_at=expires_at,
    )
    override_get_db.add(row)
    await override_get_db.flush()
    r = await client.post(
        "/api/workspace/auth/staff/reset-password",
        json={"token": token, "new_password": "12345"},
    )
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_workspace_me_password_patch_200(
    client: AsyncClient,
    override_get_db: AsyncSession,
    staff_user: User,
) -> None:
    """PATCH /api/workspace/me/password returns 200 when current password correct."""
    staff_user.password_hash = hash_password("oldstaff123")
    override_get_db.add(staff_user)
    await override_get_db.flush()
    r = await client.patch(
        "/api/workspace/me/password",
        headers=_staff_headers(staff_user),
        json={"current_password": "oldstaff123", "new_password": "newstaff456"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "message" in data


@pytest.mark.asyncio
async def test_workspace_projects_messages_get_200(
    client: AsyncClient,
    staff_user: User,
    portal_project: Project,
) -> None:
    """GET /api/workspace/projects/{id}/messages returns 200 and list."""
    r = await client.get(
        f"/api/workspace/projects/{portal_project.id}/messages",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_workspace_projects_messages_post_201(
    client: AsyncClient,
    staff_user: User,
    portal_project: Project,
) -> None:
    """POST /api/workspace/projects/{id}/messages returns 201."""
    r = await client.post(
        f"/api/workspace/projects/{portal_project.id}/messages",
        headers=_staff_headers(staff_user),
        json={"body": "Staff reply message"},
    )
    assert r.status_code == 201
    data = r.json()
    assert "id" in data
    assert data["body"] == "Staff reply message"
    assert data["sender_type"] == "staff"


@pytest.mark.asyncio
async def test_workspace_projects_modification_requests_get_200(
    client: AsyncClient,
    staff_user: User,
    portal_project: Project,
) -> None:
    """GET /api/workspace/projects/{id}/modification-requests returns 200 and list."""
    r = await client.get(
        f"/api/workspace/projects/{portal_project.id}/modification-requests",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_workspace_modification_requests_patch_200(
    client: AsyncClient,
    override_get_db: AsyncSession,
    staff_user: User,
    portal_project: Project,
) -> None:
    """PATCH /api/workspace/modification-requests/{id} returns 200."""
    mod_req = ModificationRequest(
        project_id=portal_project.id,
        customer_id=portal_project.customer_id,
        title="Test request",
        description="Description",
        status="pending",
    )
    override_get_db.add(mod_req)
    await override_get_db.flush()
    r = await client.patch(
        f"/api/workspace/modification-requests/{mod_req.id}",
        headers=_staff_headers(staff_user),
        json={"status": "in_progress", "staff_notes": "Working on it"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == mod_req.id
    assert data["status"] == "in_progress"
    assert data["staff_notes"] == "Working on it"
