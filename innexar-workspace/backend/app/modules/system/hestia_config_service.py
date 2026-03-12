"""System Hestia config service: get or create settings, update."""

from app.models.hestia_settings import HestiaSettings
from app.repositories.hestia_settings_repository import (
    HestiaSettingsRepository,
)

from .schemas import HestiaSettingsResponse, HestiaSettingsUpdate


class SystemHestiaConfigService:
    """Service for workspace Hestia provisioning settings."""

    def __init__(self, hestia_repo: HestiaSettingsRepository) -> None:
        self._repo = hestia_repo

    async def get_or_create_settings(self, org_id: str) -> HestiaSettingsResponse:
        """Get Hestia settings for org; create default if missing."""
        row = await self._repo.get_by_org_id(org_id)
        if not row:
            row = HestiaSettings(org_id=org_id)
            self._repo.add(row)
            await self._repo.flush_and_refresh(row)
        return HestiaSettingsResponse(
            grace_period_days=row.grace_period_days,
            default_hestia_package=row.default_hestia_package,
            auto_suspend_enabled=row.auto_suspend_enabled,
        )

    async def update_settings(
        self, org_id: str, body: HestiaSettingsUpdate
    ) -> HestiaSettingsResponse:
        """Update Hestia settings."""
        row = await self._repo.get_by_org_id(org_id)
        if not row:
            row = HestiaSettings(org_id=org_id)
            self._repo.add(row)
            await self._repo.flush_and_refresh(row)
        if body.grace_period_days is not None:
            row.grace_period_days = body.grace_period_days
        if body.default_hestia_package is not None:
            row.default_hestia_package = body.default_hestia_package
        if body.auto_suspend_enabled is not None:
            row.auto_suspend_enabled = body.auto_suspend_enabled
        await self._repo.flush_and_refresh(row)
        return HestiaSettingsResponse(
            grace_period_days=row.grace_period_days,
            default_hestia_package=row.default_hestia_package,
            auto_suspend_enabled=row.auto_suspend_enabled,
        )
