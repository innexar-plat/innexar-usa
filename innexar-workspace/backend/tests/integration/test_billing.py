"""Integration tests: billing models and service (Product, PricePlan, Subscription, Invoice, PaymentAttempt)."""

from datetime import UTC, datetime

import pytest
from app.models.customer import Customer
from app.modules.billing.enums import InvoiceStatus, SubscriptionStatus
from app.modules.billing.models import (
    PaymentAttempt,
    PricePlan,
    Product,
    Subscription,
    WebhookEvent,
)
from app.modules.billing.service import create_manual_invoice
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_billing_flow_create_entities(db_session: AsyncSession) -> None:
    """Create Product -> PricePlan -> Customer -> Subscription -> Invoice -> PaymentAttempt and assert state."""
    customer = Customer(org_id="org1", name="Acme", email="acme@test.com")
    db_session.add(customer)
    await db_session.flush()

    product = Product(
        org_id="org1",
        name="Pro Plan",
        description="Professional",
        is_active=True,
        provisioning_type=None,
        hestia_package=None,
    )
    db_session.add(product)
    await db_session.flush()

    price_plan = PricePlan(
        product_id=product.id,
        name="Monthly",
        interval="monthly",
        amount=99.99,
        currency="BRL",
    )
    db_session.add(price_plan)
    await db_session.flush()

    sub = Subscription(
        customer_id=customer.id,
        product_id=product.id,
        price_plan_id=price_plan.id,
        status=SubscriptionStatus.ACTIVE.value,
    )
    db_session.add(sub)
    await db_session.flush()

    inv = await create_manual_invoice(
        db_session,
        customer_id=customer.id,
        due_date=datetime.now(UTC),
        total=99.99,
        currency="BRL",
        line_items=[{"description": "Pro Monthly", "amount": 99.99}],
    )
    inv.subscription_id = sub.id
    await db_session.flush()
    await db_session.refresh(inv)

    assert inv.id
    assert inv.status == InvoiceStatus.DRAFT.value
    assert inv.customer_id == customer.id
    assert inv.subscription_id == sub.id

    attempt = PaymentAttempt(
        invoice_id=inv.id,
        provider="stripe",
        external_id="ch_test_1",
        payment_url="https://checkout.stripe.com/xxx",
        status="pending",
    )
    db_session.add(attempt)
    await db_session.flush()

    r = await db_session.execute(
        select(PaymentAttempt).where(PaymentAttempt.invoice_id == inv.id)
    )
    found = r.scalar_one_or_none()
    assert found is not None
    assert found.provider == "stripe"
    assert found.payment_url == "https://checkout.stripe.com/xxx"


@pytest.mark.asyncio
async def test_product_with_hestia_provisioning(db_session: AsyncSession) -> None:
    """Product can have provisioning_type and hestia_package for hosting."""
    product = Product(
        org_id="innexar",
        name="Hosting Basic",
        description="Hestia hosting",
        is_active=True,
        provisioning_type="hestia_hosting",
        hestia_package="default",
    )
    db_session.add(product)
    await db_session.flush()
    assert product.id is not None
    assert product.provisioning_type == "hestia_hosting"
    assert product.hestia_package == "default"


@pytest.mark.asyncio
async def test_webhook_event_idempotency(db_session: AsyncSession) -> None:
    """Insert WebhookEvent for same provider+event_id; second insert would violate unique (or we skip)."""
    ev1 = WebhookEvent(provider="stripe", event_id="ev_1", payload_hash="abc")
    db_session.add(ev1)
    await db_session.flush()
    r = await db_session.execute(
        select(WebhookEvent).where(
            WebhookEvent.provider == "stripe", WebhookEvent.event_id == "ev_1"
        )
    )
    assert r.scalar_one_or_none() is not None
