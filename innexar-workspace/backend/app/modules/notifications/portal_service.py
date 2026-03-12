"""Portal notifications: list and mark read. Uses NotificationRepository only."""

from datetime import UTC, datetime

from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository
from sqlalchemy.ext.asyncio import AsyncSession


class NotificationPortalService:
    """Portal notification operations. Depends on NotificationRepository."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._repo = NotificationRepository(db)

    async def list_my_notifications(self, customer_user_id: int) -> list[Notification]:
        """List notifications for customer user, newest first, limit 100."""
        return await self._repo.list_by_customer_user_id(customer_user_id, limit=100)

    async def mark_read(self, notification_id: int, customer_user_id: int) -> bool:
        """Mark notification as read. Returns True if found and updated."""
        return await self._repo.mark_read(
            notification_id, customer_user_id, datetime.now(UTC)
        )
