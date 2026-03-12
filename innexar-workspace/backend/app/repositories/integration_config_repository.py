"""Integration config repository: list, get, add, update."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.integration_config import IntegrationConfig


class IntegrationConfigRepository:
    """Repository for IntegrationConfig. No business logic."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def list_all(self, order_by_id: bool = True) -> list[IntegrationConfig]:
        """List all integration configs."""
        q = select(IntegrationConfig)
        if order_by_id:
            q = q.order_by(IntegrationConfig.id)
        r = await self._db.execute(q)
        return list(r.scalars().all())

    async def get_by_id(self, config_id: int) -> IntegrationConfig | None:
        """Get integration config by id."""
        r = await self._db.execute(
            select(IntegrationConfig).where(IntegrationConfig.id == config_id)
        )
        return r.scalar_one_or_none()

    async def get_by_provider_key_org(
        self, provider: str, key: str, org_id: str
    ) -> IntegrationConfig | None:
        """Get integration config by provider, key and org_id (for setup-wizard upsert)."""
        r = await self._db.execute(
            select(IntegrationConfig)
            .where(
                IntegrationConfig.provider == provider,
                IntegrationConfig.key == key,
                IntegrationConfig.org_id == org_id,
            )
            .limit(1)
        )
        return r.scalar_one_or_none()

    async def get_first_by_provider_org(
        self, provider: str, org_id: str
    ) -> IntegrationConfig | None:
        """Get first integration config by provider and org_id (e.g. for test_connection)."""
        r = await self._db.execute(
            select(IntegrationConfig)
            .where(
                IntegrationConfig.provider == provider,
                IntegrationConfig.org_id == org_id,
            )
            .limit(1)
        )
        return r.scalar_one_or_none()

    def add(self, config: IntegrationConfig) -> None:
        self._db.add(config)

    async def flush_and_refresh(self, config: IntegrationConfig) -> None:
        await self._db.flush()
        await self._db.refresh(config)
