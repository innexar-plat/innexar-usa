"""Integration tests: HestiaSettings CRUD."""

import pytest
from app.models.hestia_settings import HestiaSettings
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_hestia_settings_create_and_read(db_session: AsyncSession) -> None:
    """Create HestiaSettings for org and read it."""
    settings = HestiaSettings(
        org_id="test-org",
        grace_period_days=7,
        default_hestia_package="default",
        auto_suspend_enabled=True,
    )
    db_session.add(settings)
    await db_session.flush()
    await db_session.refresh(settings)
    assert settings.id is not None
    assert settings.grace_period_days == 7
    assert settings.auto_suspend_enabled is True

    r = await db_session.execute(
        select(HestiaSettings).where(HestiaSettings.org_id == "test-org").limit(1)
    )
    found = r.scalar_one_or_none()
    assert found is not None
    assert found.grace_period_days == 7
    assert found.default_hestia_package == "default"


@pytest.mark.asyncio
async def test_hestia_settings_update(db_session: AsyncSession) -> None:
    """Update grace_period_days and auto_suspend_enabled."""
    settings = HestiaSettings(
        org_id="org2", grace_period_days=5, auto_suspend_enabled=True
    )
    db_session.add(settings)
    await db_session.flush()
    settings.grace_period_days = 14
    settings.auto_suspend_enabled = False
    settings.default_hestia_package = "premium"
    await db_session.flush()
    await db_session.refresh(settings)
    assert settings.grace_period_days == 14
    assert settings.auto_suspend_enabled is False
    assert settings.default_hestia_package == "premium"
