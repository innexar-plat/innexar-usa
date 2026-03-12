"""Subscription helpers used by invoice and webhook flows. Internal use."""

from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.billing.models import PricePlan, Subscription

INTERVAL_ONE_TIME = "one_time"


async def set_subscription_next_due_if_recurring(
    db: AsyncSession, sub: Subscription
) -> None:
    """Set sub.next_due_date to start_date + 30 days when price plan is recurring (not one_time)."""
    if sub.next_due_date or not sub.start_date:
        return
    pp_r = await db.execute(
        select(PricePlan).where(PricePlan.id == sub.price_plan_id).limit(1)
    )
    pp = pp_r.scalar_one_or_none()
    if pp and (pp.interval or "").lower() != INTERVAL_ONE_TIME:
        sub.next_due_date = sub.start_date + timedelta(days=30)
