"""Unit tests for workspace Hestia API: overview, users, packages, domains, suspend/unsuspend/delete. Mock HestiaClient."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from app.core.security import create_token_staff
from app.models.user import User
from httpx import AsyncClient


def _staff_headers(user: User) -> dict[str, str]:
    token = create_token_staff(user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_workspace_hestia_overview_200_not_configured(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/hestia/overview returns 200 when Hestia not configured (connected=False)."""
    with patch(
        "app.modules.hestia.router_workspace.get_hestia_client",
        new_callable=AsyncMock,
        return_value=None,
    ):
        r = await client.get(
            "/api/workspace/hestia/overview",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 200
    data = r.json()
    assert data["connected"] is False
    assert "total_users" in data


@pytest.mark.asyncio
async def test_workspace_hestia_overview_200_connected(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/hestia/overview returns 200 with connected=True when client returns users."""
    mock_client = MagicMock()
    mock_client.list_users = MagicMock(
        return_value=[{"name": "user1"}, {"name": "user2"}]
    )
    with patch(
        "app.modules.hestia.router_workspace.get_hestia_client",
        new_callable=AsyncMock,
        return_value=mock_client,
    ):
        r = await client.get(
            "/api/workspace/hestia/overview",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 200
    data = r.json()
    assert data["connected"] is True
    assert data["total_users"] == 2


@pytest.mark.asyncio
async def test_workspace_hestia_users_get_503_when_not_configured(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/hestia/users returns 503 when Hestia not configured."""
    with patch(
        "app.modules.hestia.router_workspace.get_hestia_client",
        new_callable=AsyncMock,
        return_value=None,
    ):
        r = await client.get(
            "/api/workspace/hestia/users",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 503


@pytest.mark.asyncio
async def test_workspace_hestia_users_get_200(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/hestia/users returns 200 with mocked client."""
    mock_client = MagicMock()
    mock_client.list_users = MagicMock(return_value=[{"name": "u1"}])
    with patch(
        "app.modules.hestia.router_workspace.get_hestia_client",
        new_callable=AsyncMock,
        return_value=mock_client,
    ):
        r = await client.get(
            "/api/workspace/hestia/users",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0].get("name") == "u1"


@pytest.mark.asyncio
async def test_workspace_hestia_packages_get_503_when_not_configured(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/hestia/packages returns 503 when Hestia not configured."""
    with patch(
        "app.modules.hestia.router_workspace.get_hestia_client",
        new_callable=AsyncMock,
        return_value=None,
    ):
        r = await client.get(
            "/api/workspace/hestia/packages",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 503


@pytest.mark.asyncio
async def test_workspace_hestia_packages_get_200(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/hestia/packages returns 200 with mocked client."""
    mock_client = MagicMock()
    mock_client.list_packages = MagicMock(return_value=[{"name": "default"}])
    with patch(
        "app.modules.hestia.router_workspace.get_hestia_client",
        new_callable=AsyncMock,
        return_value=mock_client,
    ):
        r = await client.get(
            "/api/workspace/hestia/packages",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_workspace_hestia_users_domains_get_503_when_not_configured(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/hestia/users/{user}/domains returns 503 when not configured."""
    with patch(
        "app.modules.hestia.router_workspace.get_hestia_client",
        new_callable=AsyncMock,
        return_value=None,
    ):
        r = await client.get(
            "/api/workspace/hestia/users/testuser/domains",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 503


@pytest.mark.asyncio
async def test_workspace_hestia_users_post_201(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """POST /api/workspace/hestia/users returns 201 with mocked client."""
    mock_client = MagicMock()
    mock_client.create_user = MagicMock(return_value=None)
    with patch(
        "app.modules.hestia.router_workspace.get_hestia_client",
        new_callable=AsyncMock,
        return_value=mock_client,
    ):
        r = await client.post(
            "/api/workspace/hestia/users",
            headers=_staff_headers(staff_user),
            json={
                "user": "newuser",
                "password": "secret123",
                "email": "newuser@example.com",
                "package": "default",
            },
        )
    assert r.status_code == 201


@pytest.mark.asyncio
async def test_workspace_hestia_users_domains_post_201(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """POST /api/workspace/hestia/users/{user}/domains returns 201 with mocked client."""
    mock_client = MagicMock()
    mock_client.add_domain = MagicMock(return_value=None)
    with patch(
        "app.modules.hestia.router_workspace.get_hestia_client",
        new_callable=AsyncMock,
        return_value=mock_client,
    ):
        r = await client.post(
            "/api/workspace/hestia/users/testuser/domains",
            headers=_staff_headers(staff_user),
            json={"domain": "example.com"},
        )
    assert r.status_code == 201


@pytest.mark.asyncio
async def test_workspace_hestia_users_delete_200(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """DELETE /api/workspace/hestia/users/{user} returns 200 with mocked client."""
    mock_client = MagicMock()
    mock_client.delete_user = MagicMock(return_value=None)
    with patch(
        "app.modules.hestia.router_workspace.get_hestia_client",
        new_callable=AsyncMock,
        return_value=mock_client,
    ):
        r = await client.delete(
            "/api/workspace/hestia/users/testuser",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_workspace_hestia_users_domains_delete_200(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """DELETE /api/workspace/hestia/users/{user}/domains/{domain} returns 200 with mocked client."""
    mock_client = MagicMock()
    mock_client.delete_web_domain = MagicMock(return_value=None)
    with patch(
        "app.modules.hestia.router_workspace.get_hestia_client",
        new_callable=AsyncMock,
        return_value=mock_client,
    ):
        r = await client.delete(
            "/api/workspace/hestia/users/testuser/domains/example.com",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is True


@pytest.mark.asyncio
async def test_workspace_hestia_suspend_unsuspend_200(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """POST suspend and unsuspend return 200 with mocked client."""
    mock_client = MagicMock()
    mock_client.suspend_user = MagicMock(return_value=None)
    mock_client.unsuspend_user = MagicMock(return_value=None)
    with patch(
        "app.modules.hestia.router_workspace.get_hestia_client",
        new_callable=AsyncMock,
        return_value=mock_client,
    ):
        r1 = await client.post(
            "/api/workspace/hestia/users/u1/suspend",
            headers=_staff_headers(staff_user),
        )
        r2 = await client.post(
            "/api/workspace/hestia/users/u1/unsuspend",
            headers=_staff_headers(staff_user),
        )
    assert r1.status_code == 200
    assert r2.status_code == 200
