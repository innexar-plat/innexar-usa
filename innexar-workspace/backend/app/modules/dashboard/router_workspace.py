"""Workspace dashboard: summary (counts and totals) and revenue series."""

from datetime import datetime
from typing import Annotated

from app.core.database import get_db
from app.core.rbac import RequirePermission
from app.models.user import User
from app.modules.dashboard.schemas import (
    DashboardRevenueResponse,
    DashboardSummaryResponse,
)
from app.modules.dashboard.workspace_service import (
    DashboardWorkspaceService,
    PeriodType,
)
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/dashboard", tags=["workspace-dashboard"])


def get_dashboard_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DashboardWorkspaceService:
    return DashboardWorkspaceService(db)


@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(
    _: Annotated[User, Depends(RequirePermission("dashboard:read"))],
    service: Annotated[DashboardWorkspaceService, Depends(get_dashboard_service)],
) -> DashboardSummaryResponse:
    """Get dashboard summary: active customers, invoices, subscriptions, tickets, projects."""
    return await service.get_summary()


@router.get("/revenue", response_model=DashboardRevenueResponse)
async def get_dashboard_revenue(
    _: Annotated[User, Depends(RequirePermission("dashboard:read"))],
    service: Annotated[DashboardWorkspaceService, Depends(get_dashboard_service)],
    period_type: PeriodType = Query("month", description="day, week, or month"),  # noqa: B008
    start_date: datetime | None = Query(None, description="Start of range (UTC)"),  # noqa: B008
    end_date: datetime | None = Query(None, description="End of range (UTC)"),  # noqa: B008
) -> DashboardRevenueResponse:
    """Get revenue time series (paid invoices) for charts."""
    return await service.get_revenue(
        period_type=period_type,
        start_date=start_date,
        end_date=end_date,
    )
