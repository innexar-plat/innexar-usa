"""Unit tests for BillingRepository (products, plans, subscriptions, invoices, cascade delete)."""

from datetime import UTC, datetime

import pytest
from app.models.customer import Customer
from app.modules.billing.models import (
    Invoice,
    PricePlan,
    Product,
    Subscription,
)
from app.repositories.billing_repository import BillingRepository
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_list_products_empty(db_session: AsyncSession) -> None:
    """List products when none returns empty list."""
    repo = BillingRepository(db_session)
    result = await repo.list_products()
    assert result == []


@pytest.mark.asyncio
async def test_add_product_and_get(db_session: AsyncSession) -> None:
    """Add product and get by id."""
    repo = BillingRepository(db_session)
    p = Product(name="Prod", description="D", is_active=True)
    repo.add_product(p)
    await db_session.flush()
    await repo.update_product(p)

    found = await repo.get_product_by_id(p.id)
    assert found is not None
    assert found.name == "Prod"
    assert await repo.get_product_by_id(99999) is None


@pytest.mark.asyncio
async def test_list_price_plans_by_product(db_session: AsyncSession) -> None:
    """List price plans filtered by product_id."""
    repo = BillingRepository(db_session)
    prod = Product(name="P", is_active=True)
    repo.add_product(prod)
    await db_session.flush()
    await repo.update_product(prod)

    pp1 = PricePlan(
        product_id=prod.id,
        name="Monthly",
        interval="monthly",
        amount=10,
        currency="BRL",
    )
    pp2 = PricePlan(
        product_id=prod.id, name="Yearly", interval="yearly", amount=100, currency="BRL"
    )
    repo.add_price_plan(pp1)
    await db_session.flush()
    await repo.update_price_plan(pp1)
    repo.add_price_plan(pp2)
    await db_session.flush()
    await repo.update_price_plan(pp2)

    all_plans = await repo.list_price_plans()
    assert len(all_plans) == 2
    by_product = await repo.list_price_plans(product_id=prod.id)
    assert len(by_product) == 2
    other = await repo.list_price_plans(product_id=99999)
    assert len(other) == 0


@pytest.mark.asyncio
async def test_list_subscriptions_and_get(db_session: AsyncSession) -> None:
    """List subscriptions and get by id."""
    cust = Customer(org_id="innexar", name="C", email="sub@example.com")
    db_session.add(cust)
    await db_session.flush()
    prod = Product(name="P", is_active=True)
    db_session.add(prod)
    await db_session.flush()
    plan = PricePlan(
        product_id=prod.id, name="Plan", interval="monthly", amount=5, currency="BRL"
    )
    db_session.add(plan)
    await db_session.flush()

    repo = BillingRepository(db_session)
    sub = Subscription(
        customer_id=cust.id,
        product_id=prod.id,
        price_plan_id=plan.id,
        status="active",
    )
    repo.add_subscription(sub)
    await repo.update_subscription(sub)

    list_all = await repo.list_subscriptions()
    assert len(list_all) == 1
    by_customer = await repo.list_subscriptions(customer_id=cust.id)
    assert len(by_customer) == 1
    found = await repo.get_subscription_by_id(sub.id)
    assert found is not None
    assert found.status == "active"
    assert await repo.get_subscription_by_id(99999) is None


@pytest.mark.asyncio
async def test_list_invoices_and_get(db_session: AsyncSession) -> None:
    """List invoices and get by id."""
    cust = Customer(org_id="innexar", name="C", email="inv@example.com")
    db_session.add(cust)
    await db_session.flush()

    repo = BillingRepository(db_session)
    inv = Invoice(
        customer_id=cust.id,
        due_date=datetime.now(UTC),
        total=100,
        currency="BRL",
        status="draft",
    )
    db_session.add(inv)
    await db_session.flush()
    await db_session.refresh(inv)

    result = await repo.list_invoices()
    assert len(result) == 1
    assert result[0].total == 100
    by_customer = await repo.list_invoices(customer_id=cust.id)
    assert len(by_customer) == 1
    by_status = await repo.list_invoices(status="draft")
    assert len(by_status) == 1
    found = await repo.get_invoice_by_id(inv.id)
    assert found is not None
    assert await repo.get_invoice_by_id(99999) is None


@pytest.mark.asyncio
async def test_delete_all_by_customer_id(db_session: AsyncSession) -> None:
    """Cascade delete removes subscriptions and invoices for customer."""
    cust = Customer(org_id="innexar", name="Del", email="del@example.com")
    db_session.add(cust)
    await db_session.flush()
    prod = Product(name="P", is_active=True)
    db_session.add(prod)
    await db_session.flush()
    plan = PricePlan(
        product_id=prod.id, name="Plan", interval="monthly", amount=1, currency="BRL"
    )
    db_session.add(plan)
    await db_session.flush()

    repo = BillingRepository(db_session)
    sub = Subscription(
        customer_id=cust.id,
        product_id=prod.id,
        price_plan_id=plan.id,
        status="inactive",
    )
    repo.add_subscription(sub)
    await repo.update_subscription(sub)
    inv = Invoice(
        customer_id=cust.id,
        due_date=datetime.now(UTC),
        total=50,
        currency="BRL",
        status="draft",
    )
    db_session.add(inv)
    await db_session.flush()

    await repo.delete_all_by_customer_id(cust.id)

    subs = await repo.list_subscriptions(customer_id=cust.id)
    assert len(subs) == 0
    invs = await repo.list_invoices(customer_id=cust.id)
    assert len(invs) == 0
