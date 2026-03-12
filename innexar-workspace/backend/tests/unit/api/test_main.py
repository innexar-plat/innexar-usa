"""Unit tests for main app: GET /health, GET /."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_200(client: AsyncClient) -> None:
    """GET /health returns 200 and status ok."""
    r = await client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
    assert "database" in data


@pytest.mark.asyncio
async def test_root_200(client: AsyncClient) -> None:
    """GET / returns 200 and message."""
    r = await client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert "message" in data
    assert "Innexar" in data.get("message", "")
    assert "version" in data
