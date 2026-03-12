"""Unit tests for workspace config: hestia settings, integrations (GET/POST/PATCH, test)."""

from unittest.mock import patch

import pytest
from app.core.security import create_token_staff
from app.models.integration_config import IntegrationConfig
from app.models.user import User
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


def _staff_headers(user: User) -> dict[str, str]:
    token = create_token_staff(user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_workspace_config_hestia_settings_get_200(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/config/hestia/settings returns 200."""
    r = await client.get(
        "/api/workspace/config/hestia/settings",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert "grace_period_days" in data
    assert "default_hestia_package" in data
    assert "auto_suspend_enabled" in data


@pytest.mark.asyncio
async def test_workspace_config_hestia_settings_put_200(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """PUT /api/workspace/config/hestia/settings returns 200."""
    r = await client.put(
        "/api/workspace/config/hestia/settings",
        headers=_staff_headers(staff_user),
        json={"grace_period_days": 7, "auto_suspend_enabled": True},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["grace_period_days"] == 7
    assert data["auto_suspend_enabled"] is True


@pytest.mark.asyncio
async def test_workspace_config_integrations_get_200(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/config/integrations returns 200."""
    r = await client.get(
        "/api/workspace/config/integrations",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_workspace_config_integrations_post_201(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """POST /api/workspace/config/integrations returns 201 when encryption available."""
    with patch(
        "app.modules.system.integration_service.encrypt_value",
        return_value="encrypted_value_placeholder",
    ):
        r = await client.post(
            "/api/workspace/config/integrations",
            headers=_staff_headers(staff_user),
            json={
                "scope": "org",
                "provider": "smtp",
                "key": "default",
                "value": "secret",
                "mode": "live",
                "enabled": True,
            },
        )
    assert r.status_code == 201
    data = r.json()
    assert data["provider"] == "smtp"
    assert data["key"] == "default"


@pytest.mark.asyncio
async def test_workspace_config_integrations_patch_200(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """PATCH /api/workspace/config/integrations/{id} returns 200."""
    suffix = "cfg-patch"
    cfg = IntegrationConfig(
        org_id="innexar",
        scope="org",
        provider="smtp",
        key=f"test-{suffix}",
        value_encrypted="enc",
        mode="live",
        enabled=True,
    )
    override_get_db.add(cfg)
    await override_get_db.flush()
    with patch(
        "app.modules.system.integration_service.encrypt_value",
        return_value="encrypted_value_placeholder",
    ):
        r = await client.patch(
            f"/api/workspace/config/integrations/{cfg.id}",
            headers=_staff_headers(staff_user),
            json={"enabled": False},
        )
    assert r.status_code == 200
    data = r.json()
    assert data["enabled"] is False


@pytest.mark.asyncio
async def test_workspace_config_integrations_test_200(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """POST /api/workspace/config/integrations/{id}/test returns 200 (ok or error response)."""
    cfg = IntegrationConfig(
        org_id="innexar",
        scope="org",
        provider="smtp",
        key="test-integration",
        value_encrypted="enc",
        mode="live",
        enabled=True,
    )
    override_get_db.add(cfg)
    await override_get_db.flush()
    r = await client.post(
        f"/api/workspace/config/integrations/{cfg.id}/test",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert "ok" in data


@pytest.mark.asyncio
async def test_workspace_config_integrations_test_404(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """POST /api/workspace/config/integrations/99999/test returns 404 when config not found."""
    r = await client.post(
        "/api/workspace/config/integrations/99999/test",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 404
