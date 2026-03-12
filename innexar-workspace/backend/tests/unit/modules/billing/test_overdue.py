"""Unit tests for overdue: process_overdue_invoices and reactivate_subscription_after_payment."""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from app.models.hestia_settings import HestiaSettings
from app.models.user import (
    User,  # noqa: F401 (needed for SQLAlchemy relationship mapping)
)
from app.modules.billing.enums import InvoiceStatus, SubscriptionStatus
from app.modules.billing.models import (
    Invoice,
    Product,
    ProvisioningRecord,
    Subscription,
)
from app.modules.billing.overdue import (
    process_overdue_invoices,
    reactivate_subscription_after_payment,
)
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_process_overdue_returns_zero_when_no_hestia_settings(
    db_session: AsyncSession,
) -> None:
    """Without HestiaSettings for org, process_overdue_invoices returns 0."""
    count = await process_overdue_invoices(db_session, org_id="nonexistent-org")
    assert count == 0


@pytest.mark.asyncio
async def test_process_overdue_returns_zero_when_auto_suspend_disabled(
    db_session: AsyncSession,
) -> None:
    """With auto_suspend_enabled=False, process_overdue_invoices returns 0."""
    settings = HestiaSettings(
        org_id="innexar",
        grace_period_days=7,
        auto_suspend_enabled=False,
    )
    db_session.add(settings)
    await db_session.flush()
    count = await process_overdue_invoices(db_session, org_id="innexar")
    assert count == 0


@pytest.mark.asyncio
async def test_reactivate_no_op_when_subscription_not_suspended(
    db_session: AsyncSession,
) -> None:
    """reactivate_subscription_after_payment does nothing when subscription is ACTIVE."""
    from app.models.customer import Customer

    customer = Customer(org_id="innexar", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    product = Product(
        org_id="innexar",
        name="Hosting",
        is_active=True,
        provisioning_type="hestia_hosting",
    )
    db_session.add(product)
    await db_session.flush()
    from app.modules.billing.models import PricePlan

    pp = PricePlan(
        product_id=product.id, name="M", interval="monthly", amount=99, currency="BRL"
    )
    db_session.add(pp)
    await db_session.flush()
    sub = Subscription(
        customer_id=customer.id,
        product_id=product.id,
        price_plan_id=pp.id,
        status=SubscriptionStatus.ACTIVE.value,
    )
    db_session.add(sub)
    await db_session.flush()

    with patch(
        "app.modules.billing.overdue.get_hestia_client", new_callable=AsyncMock
    ) as mock_get:
        await reactivate_subscription_after_payment(
            db_session, sub.id, org_id="innexar"
        )
    mock_get.assert_not_called()


@pytest.mark.asyncio
async def test_reactivate_no_op_when_subscription_does_not_exist(
    db_session: AsyncSession,
) -> None:
    """reactivate_subscription_after_payment does nothing for non-existent subscription."""
    with patch(
        "app.modules.billing.overdue.get_hestia_client", new_callable=AsyncMock
    ) as mock_get:
        await reactivate_subscription_after_payment(
            db_session, 999999, org_id="innexar"
        )
    mock_get.assert_not_called()


@pytest.mark.asyncio
async def test_reactivate_calls_unsuspend_when_suspended_and_has_record(
    db_session: AsyncSession,
) -> None:
    """When subscription is SUSPENDED and has provisioned record, unsuspend_user is called."""
    from app.models.customer import Customer
    from app.modules.billing.models import PricePlan

    customer = Customer(org_id="innexar", name="C", email="c2@test.com")
    db_session.add(customer)
    await db_session.flush()
    product = Product(
        org_id="innexar",
        name="Hosting",
        is_active=True,
        provisioning_type="hestia_hosting",
    )
    db_session.add(product)
    await db_session.flush()
    pp = PricePlan(
        product_id=product.id, name="M", interval="monthly", amount=99, currency="BRL"
    )
    db_session.add(pp)
    await db_session.flush()
    sub = Subscription(
        customer_id=customer.id,
        product_id=product.id,
        price_plan_id=pp.id,
        status=SubscriptionStatus.SUSPENDED.value,
    )
    db_session.add(sub)
    await db_session.flush()
    inv = Invoice(
        customer_id=customer.id,
        subscription_id=sub.id,
        status=InvoiceStatus.PAID.value,
        total=99,
        currency="BRL",
        due_date=datetime.now(UTC),
    )
    db_session.add(inv)
    await db_session.flush()
    rec = ProvisioningRecord(
        subscription_id=sub.id,
        invoice_id=inv.id,
        provider="hestia",
        external_user="cust1_site",
        domain="example.com",
        status="provisioned",
    )
    db_session.add(rec)
    await db_session.flush()

    mock_client = MagicMock()
    mock_client.unsuspend_user = MagicMock()
    with patch(
        "app.modules.billing.overdue.get_hestia_client",
        new_callable=AsyncMock,
        return_value=mock_client,
    ):
        await reactivate_subscription_after_payment(
            db_session, sub.id, org_id="innexar"
        )
    mock_client.unsuspend_user.assert_called_once_with("cust1_site")


@pytest.mark.asyncio
async def test_process_overdue_suspends_hestia_user_when_overdue_invoices_exist(
    db_session: AsyncSession,
) -> None:
    """When auto_suspend enabled and overdue pending invoices exist, suspend_user is called."""
    from app.models.customer import Customer
    from app.modules.billing.models import PricePlan

    settings = HestiaSettings(
        org_id="innexar",
        grace_period_days=7,
        auto_suspend_enabled=True,
    )
    db_session.add(settings)
    await db_session.flush()

    customer = Customer(org_id="innexar", name="C", email="c3@test.com")
    db_session.add(customer)
    await db_session.flush()
    product = Product(
        org_id="innexar",
        name="Hosting",
        is_active=True,
        provisioning_type="hestia_hosting",
    )
    db_session.add(product)
    await db_session.flush()
    pp = PricePlan(
        product_id=product.id, name="M", interval="monthly", amount=99, currency="BRL"
    )
    db_session.add(pp)
    await db_session.flush()
    sub = Subscription(
        customer_id=customer.id,
        product_id=product.id,
        price_plan_id=pp.id,
        status=SubscriptionStatus.ACTIVE.value,
    )
    db_session.add(sub)
    await db_session.flush()
    inv = Invoice(
        customer_id=customer.id,
        subscription_id=sub.id,
        status=InvoiceStatus.PENDING.value,
        total=99,
        currency="BRL",
        due_date=datetime.now(UTC) - timedelta(days=30),
    )
    db_session.add(inv)
    await db_session.flush()
    rec = ProvisioningRecord(
        subscription_id=sub.id,
        invoice_id=inv.id,
        provider="hestia",
        external_user="cust3_site",
        domain="example.com",
        status="provisioned",
    )
    db_session.add(rec)
    await db_session.flush()

    mock_client = MagicMock()
    mock_client.suspend_user = MagicMock()
    with patch(
        "app.modules.billing.overdue.get_hestia_client",
        new_callable=AsyncMock,
        return_value=mock_client,
    ):
        count = await process_overdue_invoices(db_session, org_id="innexar")
    assert count == 1
    mock_client.suspend_user.assert_called_once_with("cust3_site")
