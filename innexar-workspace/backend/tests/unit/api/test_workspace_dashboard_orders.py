"""Unit tests for workspace dashboard and orders API: summary, revenue, orders, briefings."""

import uuid
from datetime import UTC, datetime

import pytest
from app.core.security import create_token_staff
from app.models.customer import Customer
from app.models.project_request import ProjectRequest
from app.models.user import User
from app.modules.billing.enums import InvoiceStatus, SubscriptionStatus
from app.modules.billing.models import Invoice, PricePlan, Product, Subscription
from app.modules.projects.models import Project
from app.modules.support.models import Ticket
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


def _staff_headers(user: User) -> dict[str, str]:
    token = create_token_staff(user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_workspace_dashboard_summary_200(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/dashboard/summary returns 200 and summary payload."""
    r = await client.get(
        "/api/workspace/dashboard/summary",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert "customers" in data
    assert "invoices" in data
    assert "subscriptions" in data
    assert "tickets" in data
    assert "projects" in data


@pytest.mark.asyncio
async def test_workspace_dashboard_summary_counts(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """GET /api/workspace/dashboard/summary with DB fixtures returns correct counts and totals."""
    customer = Customer(org_id="innexar", name="C", email="dashboard-summary@test.com")
    override_get_db.add(customer)
    await override_get_db.flush()
    product = Product(org_id="innexar", name="P")
    override_get_db.add(product)
    await override_get_db.flush()
    plan = PricePlan(
        product_id=product.id,
        name="Monthly",
        interval="monthly",
        amount=100.0,
        currency="BRL",
    )
    override_get_db.add(plan)
    await override_get_db.flush()
    sub = Subscription(
        customer_id=customer.id,
        product_id=product.id,
        price_plan_id=plan.id,
        status=SubscriptionStatus.ACTIVE.value,
    )
    override_get_db.add(sub)
    await override_get_db.flush()
    inv_paid = Invoice(
        customer_id=customer.id,
        subscription_id=sub.id,
        status=InvoiceStatus.PAID.value,
        due_date=datetime.now(UTC),
        paid_at=datetime.now(UTC),
        total=100.0,
        currency="BRL",
    )
    override_get_db.add(inv_paid)
    await override_get_db.flush()
    inv_pending = Invoice(
        customer_id=customer.id,
        status=InvoiceStatus.PENDING.value,
        due_date=datetime.now(UTC),
        total=50.0,
        currency="BRL",
    )
    override_get_db.add(inv_pending)
    ticket_open = Ticket(
        customer_id=customer.id,
        subject="Open",
        status="open",
    )
    override_get_db.add(ticket_open)
    ticket_closed = Ticket(
        customer_id=customer.id,
        subject="Closed",
        status="closed",
    )
    override_get_db.add(ticket_closed)
    proj = Project(
        org_id="innexar",
        customer_id=customer.id,
        name="Proj",
        status="em_producao",
    )
    override_get_db.add(proj)
    await override_get_db.flush()
    r = await client.get(
        "/api/workspace/dashboard/summary",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert data["customers"]["active"] >= 1
    assert data["invoices"]["total"] >= 2
    assert data["invoices"]["pending"] >= 1
    assert data["invoices"]["paid"] >= 1
    assert data["invoices"]["total_paid_amount"] >= 100.0
    assert data["subscriptions"]["active"] >= 1
    assert data["tickets"]["open"] >= 1
    assert data["tickets"]["closed"] >= 1
    assert data["projects"]["total"] >= 1
    assert (
        "em_producao" in data["projects"]["by_status"] or data["projects"]["total"] >= 1
    )


@pytest.mark.asyncio
async def test_workspace_dashboard_revenue_200(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/dashboard/revenue returns 200 and series."""
    r = await client.get(
        "/api/workspace/dashboard/revenue",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert "period_type" in data
    assert "series" in data
    assert isinstance(data["series"], list)


@pytest.mark.asyncio
async def test_workspace_dashboard_revenue_period_type_and_dates(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/dashboard/revenue with period_type=day and start/end returns 200."""
    r = await client.get(
        "/api/workspace/dashboard/revenue",
        headers=_staff_headers(staff_user),
        params={
            "period_type": "day",
            "start_date": "2025-01-01T00:00:00Z",
            "end_date": "2025-06-30T23:59:59Z",
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert data.get("period_type") == "day"
    assert "series" in data


@pytest.mark.asyncio
async def test_workspace_dashboard_revenue_period_week(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/dashboard/revenue with period_type=week returns 200."""
    r = await client.get(
        "/api/workspace/dashboard/revenue",
        headers=_staff_headers(staff_user),
        params={"period_type": "week"},
    )
    assert r.status_code == 200
    assert r.json().get("period_type") == "week"


@pytest.mark.asyncio
async def test_workspace_orders_200(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/orders returns 200 and list."""
    r = await client.get(
        "/api/workspace/orders",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_workspace_briefings_200(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """GET /api/workspace/briefings returns 200 and list."""
    r = await client.get(
        "/api/workspace/briefings",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_workspace_briefings_id_200(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """GET /api/workspace/briefings/{id} returns 200 when briefing exists."""
    suffix = uuid.uuid4().hex[:8]
    cust = Customer(
        org_id="innexar", name="Briefing Customer", email=f"brief-{suffix}@test.com"
    )
    override_get_db.add(cust)
    await override_get_db.flush()
    pr = ProjectRequest(
        customer_id=cust.id,
        project_name="Test Project",
        project_type="site",
        description="Desc",
        status="pending",
    )
    override_get_db.add(pr)
    await override_get_db.flush()
    r = await client.get(
        f"/api/workspace/briefings/{pr.id}",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == pr.id
    assert data["project_name"] == "Test Project"
