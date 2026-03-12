"""Workspace dashboard: summary and revenue. Uses Billing, Support, Project repositories."""

from collections import defaultdict
from datetime import UTC, datetime, timedelta
from typing import Literal

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.dashboard.schemas import (
    DashboardCustomersSummary,
    DashboardInvoicesSummary,
    DashboardProjectsSummary,
    DashboardRevenuePoint,
    DashboardRevenueResponse,
    DashboardSubscriptionsSummary,
    DashboardSummaryResponse,
    DashboardTicketsSummary,
)
from app.repositories.billing_repository import BillingRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.support_repository import SupportRepository


def _period_key(paid_at: datetime | None, period_type: str) -> str:
    """Return period key for grouping: YYYY-MM-DD, YYYY-Www, or YYYY-MM."""
    if not paid_at:
        return ""
    if period_type == "day":
        return paid_at.strftime("%Y-%m-%d")
    if period_type == "week":
        return paid_at.strftime("%Y-W%W")
    if period_type == "month":
        return paid_at.strftime("%Y-%m")
    return paid_at.strftime("%Y-%m-%d")


PeriodType = Literal["day", "week", "month"]


class DashboardWorkspaceService:
    """Dashboard summary and revenue. Uses Billing, Support, Project repositories."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._billing = BillingRepository(db)
        self._support = SupportRepository(db)
        self._projects = ProjectRepository(db)

    async def get_summary(self) -> DashboardSummaryResponse:
        """Dashboard summary: active customers, invoices, subscriptions, tickets, projects."""
        active_customers = await self._billing.get_active_customer_count()
        inv_total, inv_pending, inv_paid_count, total_paid_amount = (
            await self._billing.get_dashboard_invoice_summary()
        )
        sub_active, sub_canceled, sub_total = (
            await self._billing.get_dashboard_subscription_summary()
        )
        tickets_open, tickets_closed = await self._support.get_ticket_counts()
        by_status, projects_total = await self._projects.get_project_counts_by_status()

        return DashboardSummaryResponse(
            customers=DashboardCustomersSummary(active=active_customers),
            invoices=DashboardInvoicesSummary(
                total=inv_total,
                pending=inv_pending,
                paid=inv_paid_count,
                total_paid_amount=total_paid_amount,
            ),
            subscriptions=DashboardSubscriptionsSummary(
                active=sub_active,
                canceled=sub_canceled,
                total=sub_total,
            ),
            tickets=DashboardTicketsSummary(open=tickets_open, closed=tickets_closed),
            projects=DashboardProjectsSummary(by_status=by_status, total=projects_total),
        )

    async def get_revenue(
        self,
        period_type: PeriodType = "month",
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> DashboardRevenueResponse:
        """Revenue time series (paid invoices) for charts."""
        end = end_date or datetime.now(UTC)
        start = start_date or (end - timedelta(days=365))
        if start > end:
            start, end = end, start
        rows = await self._billing.get_revenue_rows(start, end)
        by_period: defaultdict[str, float] = defaultdict(float)
        for paid_at, total in rows:
            key = _period_key(paid_at, period_type)
            if key:
                by_period[key] += total
        series = [
            DashboardRevenuePoint(period=k, revenue=round(v, 2))
            for k, v in sorted(by_period.items())
        ]
        return DashboardRevenueResponse(period_type=period_type, series=series)
