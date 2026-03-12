"""Unit tests for RBAC: RequirePermission (401 without user, 403 without permission, pass with permission)."""

import pytest
from app.core.rbac import get_user_permission_slugs
from app.core.security import create_token_staff, hash_password
from app.models.permission import Permission
from app.models.role import Role
from app.models.user import User
from httpx import AsyncClient
from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_require_permission_401_without_token(client: AsyncClient) -> None:
    """Calling a workspace endpoint without token returns 401."""
    r = await client.get("/api/workspace/billing/products")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_require_permission_200_with_permission(
    client: AsyncClient,
    staff_user: User,
    billing_enabled: None,
) -> None:
    """User with permission (admin has all) gets 200."""
    token = create_token_staff(staff_user.id)
    r = await client.get(
        "/api/workspace/billing/products",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_require_permission_403_without_permission(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """Staff user without billing:read gets 403 on GET /api/workspace/billing/products."""
    import uuid

    from app.models.role import role_permissions, user_roles

    # Create permission support:read only
    p = Permission(slug="support:read", description="Support read")
    override_get_db.add(p)
    await override_get_db.flush()
    role = Role(org_id="innexar", name="Support", slug="support")
    override_get_db.add(role)
    await override_get_db.flush()
    await override_get_db.execute(
        insert(role_permissions).values(role_id=role.id, permission_id=p.id)
    )
    user = User(
        email=f"support-{uuid.uuid4().hex[:8]}@test.innexar.com",
        password_hash=hash_password("pwd"),
        role="support",
        org_id="innexar",
    )
    override_get_db.add(user)
    await override_get_db.flush()
    await override_get_db.execute(
        insert(user_roles).values(user_id=user.id, role_id=role.id)
    )
    await override_get_db.flush()
    token = create_token_staff(user.id)
    r = await client.get(
        "/api/workspace/billing/products",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_get_user_permission_slugs_admin_has_all(
    override_get_db: AsyncSession,
    staff_user: User,
) -> None:
    """get_user_permission_slugs returns all permissions for admin user."""
    slugs = await get_user_permission_slugs(override_get_db, staff_user.id)
    assert "billing:read" in slugs
    assert "billing:write" in slugs
    assert "dashboard:read" in slugs
