"""Unit tests for post_payment: create_project_and_notify_after_payment, _is_site_product."""

from datetime import UTC, datetime

import pytest
from app.models.customer import Customer
from app.models.user import User
from app.modules.billing.enums import InvoiceStatus, SubscriptionStatus
from app.modules.billing.models import Invoice, PricePlan, Product, Subscription
from app.modules.billing.post_payment import (
    _is_site_product,
    create_project_and_notify_after_payment,
)
from app.modules.projects.models import Project
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class TestIsSiteProduct:
    """Tests for _is_site_product helper."""

    def test_site_delivery_provisioning_type(self) -> None:
        product = Product(provisioning_type="site_delivery", name="Web")
        assert _is_site_product(product) is True

    def test_name_contains_site(self) -> None:
        product = Product(provisioning_type=None, name="Site Package")
        assert _is_site_product(product) is True

    def test_non_site_product(self) -> None:
        product = Product(provisioning_type="hestia_hosting", name="Hosting")
        assert _is_site_product(product) is False

    def test_empty_name_and_type(self) -> None:
        product = Product(provisioning_type="", name="Other")
        assert _is_site_product(product) is False


@pytest.mark.asyncio
async def test_create_project_and_notify_invoice_not_found(
    db_session: AsyncSession,
) -> None:
    """When invoice does not exist, function returns without error."""
    await create_project_and_notify_after_payment(db_session, 999999)
    r = await db_session.execute(select(Project))
    assert r.scalars().all() == []


@pytest.mark.asyncio
async def test_create_project_and_notify_non_site_product(
    db_session: AsyncSession,
) -> None:
    """When product is not site_delivery and name has no 'site', no project created."""
    customer = Customer(org_id="innexar", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    product = Product(
        org_id="innexar",
        name="Hosting Only",
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
        status=InvoiceStatus.PAID.value,
        total=99,
        currency="BRL",
        due_date=datetime.now(UTC),
    )
    db_session.add(inv)
    await db_session.flush()

    await create_project_and_notify_after_payment(db_session, inv.id)

    r = await db_session.execute(
        select(Project).where(Project.subscription_id == sub.id)
    )
    assert r.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_create_project_and_notify_site_product_creates_project(
    db_session: AsyncSession,
) -> None:
    """When product is site_delivery, creates project and notifies staff."""
    customer = Customer(org_id="innexar", name="Site Customer", email="site@test.com")
    db_session.add(customer)
    await db_session.flush()
    product = Product(
        org_id="innexar",
        name="Starter Website",
        provisioning_type="site_delivery",
    )
    db_session.add(product)
    await db_session.flush()
    pp = PricePlan(
        product_id=product.id,
        name="Starter",
        interval="monthly",
        amount=99,
        currency="BRL",
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
        status=InvoiceStatus.PAID.value,
        total=99,
        currency="BRL",
        due_date=datetime.now(UTC),
    )
    db_session.add(inv)
    await db_session.flush()

    staff = User(
        email="staff@innexar.app",
        password_hash="hash",
        role="admin",
        org_id="innexar",
    )
    db_session.add(staff)
    await db_session.flush()

    await create_project_and_notify_after_payment(db_session, inv.id)

    r = await db_session.execute(
        select(Project).where(Project.subscription_id == sub.id)
    )
    project = r.scalar_one_or_none()
    assert project is not None
    assert project.name == "Site Site Customer"
    assert project.status == "aguardando_briefing"
    assert project.customer_id == customer.id


@pytest.mark.asyncio
async def test_create_project_and_notify_idempotent(
    db_session: AsyncSession,
) -> None:
    """Second call with same invoice does not create duplicate project."""
    customer = Customer(org_id="innexar", name="Dup", email="dup@test.com")
    db_session.add(customer)
    await db_session.flush()
    product = Product(
        org_id="innexar",
        name="Site Package",
        provisioning_type="site_delivery",
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
        status=InvoiceStatus.PAID.value,
        total=99,
        currency="BRL",
        due_date=datetime.now(UTC),
    )
    db_session.add(inv)
    await db_session.flush()
    db_session.add(
        User(email="s@innexar.app", password_hash="h", role="admin", org_id="innexar")
    )
    await db_session.flush()

    await create_project_and_notify_after_payment(db_session, inv.id)
    await create_project_and_notify_after_payment(db_session, inv.id)

    r = await db_session.execute(
        select(Project).where(Project.subscription_id == sub.id)
    )
    projects = r.scalars().all()
    assert len(projects) == 1
