"""Hestia settings repository: get by org, add, flush_and_refresh."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.hestia_settings import HestiaSettings


class HestiaSettingsRepository:
    """Repository for HestiaSettings. No business logic."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_org_id(self, org_id: str) -> HestiaSettings | None:
        """Get Hestia settings by org_id."""
        r = await self._db.execute(
            select(HestiaSettings).where(HestiaSettings.org_id == org_id).limit(1)
        )
        return r.scalar_one_or_none()

    def add(self, settings: HestiaSettings) -> None:
        self._db.add(settings)

    async def flush_and_refresh(self, settings: HestiaSettings) -> None:
        await self._db.flush()
        await self._db.refresh(settings)
