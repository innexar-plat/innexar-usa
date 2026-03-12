"""Unit tests for BillingWorkspaceService."""

from datetime import UTC, datetime

import pytest
from app.models.customer import Customer
from app.modules.billing.models import PricePlan, Product
from app.modules.billing.schemas import (
    InvoiceCreate,
    PricePlanCreate,
    PricePlanUpdate,
    ProductCreate,
    ProductUpdate,
)
from app.modules.billing.workspace_service import BillingWorkspaceService
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_list_products_empty(db_session: AsyncSession) -> None:
    """List products when none returns empty list."""
    svc = BillingWorkspaceService(db_session)
    result = await svc.list_products()
    assert result == []


@pytest.mark.asyncio
async def test_list_products_with_plans(db_session: AsyncSession) -> None:
    """List products with_plans returns list of dicts with product and plans."""
    prod = Product(name="P", is_active=True)
    db_session.add(prod)
    await db_session.flush()
    plan = PricePlan(
        product_id=prod.id,
        name="Monthly",
        interval="monthly",
        amount=10,
        currency="BRL",
    )
    db_session.add(plan)
    await db_session.flush()
    await db_session.refresh(prod)
    await db_session.refresh(plan)

    svc = BillingWorkspaceService(db_session)
    result = await svc.list_products(with_plans=True)
    assert len(result) == 1
    assert "product" in result[0]
    assert "plans" in result[0]
    assert result[0]["product"].id == prod.id
    assert len(result[0]["plans"]) == 1
    assert result[0]["plans"][0].name == "Monthly"


@pytest.mark.asyncio
async def test_create_product(db_session: AsyncSession) -> None:
    """Create product returns Product."""
    svc = BillingWorkspaceService(db_session)
    body = ProductCreate(name="NewProd", description="D", is_active=True)
    p = await svc.create_product(body)
    assert p.id is not None
    assert p.name == "NewProd"


@pytest.mark.asyncio
async def test_get_product_not_found(db_session: AsyncSession) -> None:
    """Get non-existent product returns None."""
    svc = BillingWorkspaceService(db_session)
    assert await svc.get_product(99999) is None


@pytest.mark.asyncio
async def test_update_product_not_found(db_session: AsyncSession) -> None:
    """Update non-existent product returns None."""
    svc = BillingWorkspaceService(db_session)
    result = await svc.update_product(99999, ProductUpdate(name="X"))
    assert result is None


@pytest.mark.asyncio
async def test_list_price_plans(db_session: AsyncSession) -> None:
    """List price plans returns plans filtered by product_id when given."""
    prod = Product(name="P", is_active=True)
    db_session.add(prod)
    await db_session.flush()
    plan = PricePlan(
        product_id=prod.id, name="P1", interval="monthly", amount=5, currency="BRL"
    )
    db_session.add(plan)
    await db_session.flush()

    svc = BillingWorkspaceService(db_session)
    all_plans = await svc.list_price_plans()
    assert len(all_plans) == 1
    by_product = await svc.list_price_plans(product_id=prod.id)
    assert len(by_product) == 1
    assert by_product[0].name == "P1"


@pytest.mark.asyncio
async def test_create_price_plan(db_session: AsyncSession) -> None:
    """Create price plan returns PricePlan."""
    prod = Product(name="P", is_active=True)
    db_session.add(prod)
    await db_session.flush()

    svc = BillingWorkspaceService(db_session)
    body = PricePlanCreate(
        product_id=prod.id, name="Plan", interval="yearly", amount=99, currency="BRL"
    )
    pp = await svc.create_price_plan(body)
    assert pp.id is not None
    assert pp.amount == 99
    assert pp.interval == "yearly"


@pytest.mark.asyncio
async def test_update_price_plan_not_found(db_session: AsyncSession) -> None:
    """Update non-existent price plan returns None."""
    svc = BillingWorkspaceService(db_session)
    result = await svc.update_price_plan(99999, PricePlanUpdate(name="X"))
    assert result is None


@pytest.mark.asyncio
async def test_list_invoices_empty(db_session: AsyncSession) -> None:
    """List invoices when none returns empty list."""
    svc = BillingWorkspaceService(db_session)
    result = await svc.list_invoices()
    assert result == []


@pytest.mark.asyncio
async def test_get_invoice_not_found(db_session: AsyncSession) -> None:
    """Get non-existent invoice returns None."""
    svc = BillingWorkspaceService(db_session)
    assert await svc.get_invoice(99999) is None


@pytest.mark.asyncio
async def test_create_invoice(db_session: AsyncSession) -> None:
    """Create invoice via service returns invoice with subscription_id set."""
    cust = Customer(org_id="innexar", name="C", email="inv@example.com")
    db_session.add(cust)
    await db_session.flush()
    due = datetime.now(UTC)
    body = InvoiceCreate(
        customer_id=cust.id,
        due_date=due,
        total=100,
        currency="BRL",
        subscription_id=None,
    )

    svc = BillingWorkspaceService(db_session)
    inv = await svc.create_invoice(body)
    assert inv.id is not None
    assert inv.customer_id == cust.id
    assert inv.total == 100
    assert inv.subscription_id is None
