"""Overdue: suspend Hestia user and subscription when invoice not paid after grace period."""

import logging
from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.billing.enums import SubscriptionStatus
from app.providers.hestia.loader import get_hestia_client
from app.repositories.billing_repository import BillingRepository
from app.repositories.hestia_settings_repository import HestiaSettingsRepository

logger = logging.getLogger(__name__)


async def process_overdue_invoices(db: AsyncSession, org_id: str = "innexar") -> int:
    """Find pending invoices past due_date + grace_period, suspend Hestia user and set subscription SUSPENDED. Returns count processed."""
    hestia_repo = HestiaSettingsRepository(db)
    billing_repo = BillingRepository(db)
    hestia_settings = await hestia_repo.get_by_org_id(org_id)
    if not hestia_settings or not hestia_settings.auto_suspend_enabled:
        return 0
    grace_days = hestia_settings.grace_period_days
    cutoff = datetime.now(UTC) - timedelta(days=grace_days)
    rows = await billing_repo.list_overdue_invoice_subscription_product(cutoff)
    client = await get_hestia_client(db, org_id=org_id)
    count = 0
    for inv, sub, _product in rows:
        sub.status = SubscriptionStatus.SUSPENDED.value
        rec = await billing_repo.get_hestia_provisioned_record_for_subscription(sub.id)
        if rec and client:
            try:
                client.suspend_user(rec.external_user)
                logger.info(
                    "Suspended Hestia user %s for overdue invoice %s",
                    rec.external_user,
                    inv.id,
                )
            except Exception as e:
                logger.warning(
                    "Failed to suspend Hestia user %s: %s", rec.external_user, e
                )
        count += 1
    await db.flush()
    return count


async def reactivate_subscription_after_payment(
    db: AsyncSession, subscription_id: int, org_id: str = "innexar"
) -> None:
    """If subscription was SUSPENDED, unsuspend Hestia user."""
    billing_repo = BillingRepository(db)
    sub = await billing_repo.get_subscription_by_id(subscription_id)
    if not sub or sub.status != SubscriptionStatus.SUSPENDED.value:
        return
    rec = await billing_repo.get_hestia_provisioned_record_for_subscription(
        subscription_id
    )
    if not rec:
        return
    client = await get_hestia_client(db, org_id=org_id)
    if not client:
        return
    try:
        client.unsuspend_user(rec.external_user)
        logger.info(
            "Unsuspended Hestia user %s for subscription %s",
            rec.external_user,
            subscription_id,
        )
    except Exception as e:
        logger.warning("Failed to unsuspend Hestia user %s: %s", rec.external_user, e)


async def sync_subscription_status_to_hestia(
    db: AsyncSession, subscription_id: int, new_status: str, org_id: str = "innexar"
) -> None:
    """When subscription status is changed manually (PATCH), sync with Hestia: suspend or unsuspend user."""
    billing_repo = BillingRepository(db)
    rec = await billing_repo.get_hestia_provisioned_record_for_subscription(
        subscription_id
    )
    if not rec:
        return
    client = await get_hestia_client(db, org_id=org_id)
    if not client:
        return
    if new_status in (
        SubscriptionStatus.SUSPENDED.value,
        SubscriptionStatus.CANCELED.value,
    ):
        try:
            client.suspend_user(rec.external_user)
            logger.info(
                "Suspended Hestia user %s for subscription %s (manual status=%s)",
                rec.external_user,
                subscription_id,
                new_status,
            )
        except Exception as e:
            logger.warning("Failed to suspend Hestia user %s: %s", rec.external_user, e)
    elif new_status == SubscriptionStatus.ACTIVE.value:
        try:
            client.unsuspend_user(rec.external_user)
            logger.info(
                "Unsuspended Hestia user %s for subscription %s (manual status=active)",
                rec.external_user,
                subscription_id,
            )
        except Exception as e:
            logger.warning(
                "Failed to unsuspend Hestia user %s: %s", rec.external_user, e
            )
