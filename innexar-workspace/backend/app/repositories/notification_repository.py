"""Notification repository: data access only."""

from datetime import datetime
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


class NotificationRepository:
    """Repository for Notification. No business logic."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def list_by_customer_user_id(
        self, customer_user_id: int, limit: int = 100
    ) -> list[Notification]:
        """List notifications for a customer user, newest first."""
        r = await self._db.execute(
            select(Notification)
            .where(Notification.customer_user_id == customer_user_id)
            .order_by(Notification.id.desc())
            .limit(limit)
        )
        return list(r.scalars().all())

    async def get_by_id_and_customer_user(
        self, notification_id: int, customer_user_id: int
    ) -> Notification | None:
        """Get notification by id scoped to customer user."""
        r = await self._db.execute(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.customer_user_id == customer_user_id,
            ).limit(1)
        )
        return r.scalar_one_or_none()

    async def get_unread_count(self, customer_user_id: int) -> int:
        """Count unread notifications for customer user (portal dashboard)."""
        r = await self._db.execute(
            select(func.count())
            .select_from(Notification)
            .where(
                Notification.customer_user_id == customer_user_id,
                Notification.read_at.is_(None),
            )
        )
        return r.scalar() or 0

    async def mark_read(self, notification_id: int, customer_user_id: int, read_at: datetime) -> bool:
        """Mark notification as read. Returns True if found and updated."""
        n = await self.get_by_id_and_customer_user(notification_id, customer_user_id)
        if not n:
            return False
        n.read_at = read_at
        await self._db.flush()
        return True

    def add(self, notification: Notification) -> None:
        """Add notification to session."""
        self._db.add(notification)

    async def flush(self) -> None:
        """Flush pending changes."""
        await self._db.flush()
