"""Feature flag repository: read-only by key."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.feature_flag import FeatureFlag


class FeatureFlagRepository:
    """Repository for FeatureFlag. No business logic."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_key(self, key: str) -> FeatureFlag | None:
        """Get feature flag by key."""
        r = await self._db.execute(
            select(FeatureFlag).where(FeatureFlag.key == key).limit(1)
        )
        return r.scalar_one_or_none()

    async def is_enabled(self, key: str, default: bool = True) -> bool:
        """Return True if flag exists and enabled, else default (True when no row)."""
        flag = await self.get_by_key(key)
        return flag.enabled if flag is not None else default

    def add(self, flag: FeatureFlag) -> None:
        """Add feature flag to session (for seed/bootstrap)."""
        self._db.add(flag)

    async def flush_and_refresh(self, flag: FeatureFlag) -> None:
        """Flush and refresh a feature flag (e.g. after add or update)."""
        await self._db.flush()
        await self._db.refresh(flag)
