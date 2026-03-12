"""Portal notifications: list and mark read. Thin layer: validate → call service → return."""

from datetime import datetime
from typing import Annotated

from app.core.auth_customer import get_current_customer
from app.core.database import get_db
from app.models.customer_user import CustomerUser
from app.models.notification import Notification
from app.modules.notifications.portal_service import NotificationPortalService
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/notifications", tags=["portal-notifications"])


class NotificationResponse(BaseModel):
    """Notification response."""

    id: int
    channel: str
    title: str
    body: str | None
    read_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


def get_notification_portal_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> NotificationPortalService:
    """Dependency: portal notification service."""
    return NotificationPortalService(db)


@router.get("", response_model=list[NotificationResponse])
async def list_my_notifications(
    service: Annotated[
        NotificationPortalService, Depends(get_notification_portal_service)
    ],
    current: Annotated[CustomerUser, Depends(get_current_customer)],
) -> list[Notification]:
    """List notifications for current customer user."""
    return await service.list_my_notifications(current.id)


@router.patch("/{notification_id}/read", status_code=204)
async def mark_read(
    notification_id: int,
    service: Annotated[
        NotificationPortalService, Depends(get_notification_portal_service)
    ],
    current: Annotated[CustomerUser, Depends(get_current_customer)],
) -> None:
    """Mark notification as read."""
    updated = await service.mark_read(notification_id, current.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Notification not found")
