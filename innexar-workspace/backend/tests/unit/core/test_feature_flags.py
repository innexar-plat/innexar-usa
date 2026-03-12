"""Unit tests for feature flags: get_flag, require_portal_feature (403 when disabled)."""

import pytest
from app.core.feature_flags import get_flag
from app.models.feature_flag import FeatureFlag
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_get_flag_returns_false_when_missing(
    override_get_db: AsyncSession,
) -> None:
    """get_flag returns False when key does not exist."""
    result = await get_flag(override_get_db, "nonexistent.flag")
    assert result is False


@pytest.mark.asyncio
async def test_get_flag_returns_true_when_enabled(
    override_get_db: AsyncSession,
) -> None:
    """get_flag returns True when flag exists and enabled=True."""
    flag = FeatureFlag(key="test.flag.enabled", enabled=True)
    override_get_db.add(flag)
    await override_get_db.flush()
    result = await get_flag(override_get_db, "test.flag.enabled")
    assert result is True


@pytest.mark.asyncio
async def test_get_flag_returns_false_when_disabled(
    override_get_db: AsyncSession,
) -> None:
    """get_flag returns False when flag exists and enabled=False."""
    flag = FeatureFlag(key="test.flag.disabled", enabled=False)
    override_get_db.add(flag)
    await override_get_db.flush()
    result = await get_flag(override_get_db, "test.flag.disabled")
    assert result is False
