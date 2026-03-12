"""Portal: /me/features, /me/project-aguardando-briefing, /me/dashboard."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_customer import get_current_customer
from app.core.database import get_db
from app.models.customer_user import CustomerUser

from .me_dashboard_service import PortalDashboardService
from .schemas import (
    MeDashboardFlagsResponse,
    MeDashboardResponse,
    ProjectAguardandoBriefingResponse,
)


def get_portal_dashboard_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PortalDashboardService:
    from app.repositories.billing_repository import BillingRepository
    from app.repositories.feature_flag_repository import FeatureFlagRepository
    from app.repositories.notification_repository import NotificationRepository
    from app.repositories.project_file_repository import ProjectFileRepository
    from app.repositories.project_repository import ProjectRepository
    from app.repositories.support_repository import SupportRepository

    return PortalDashboardService(
        feature_flag_repo=FeatureFlagRepository(db),
        billing_repo=BillingRepository(db),
        support_repo=SupportRepository(db),
        notification_repo=NotificationRepository(db),
        project_repo=ProjectRepository(db),
        project_file_repo=ProjectFileRepository(db),
    )


router = APIRouter()


@router.get("/me/features", response_model=MeDashboardFlagsResponse)
async def customer_me_features(
    _: Annotated[CustomerUser, Depends(get_current_customer)],
    service: Annotated[PortalDashboardService, Depends(get_portal_dashboard_service)],
) -> MeDashboardFlagsResponse:
    """Portal: feature flags for menu visibility (invoices, tickets, projects)."""
    return await service.get_features()


@router.get("/me/project-aguardando-briefing")
async def get_project_aguardando_briefing(
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    service: Annotated[PortalDashboardService, Depends(get_portal_dashboard_service)],
) -> ProjectAguardandoBriefingResponse | None:
    """Portal: one project aguardando_briefing with no linked briefing yet."""
    return await service.get_project_aguardando_briefing(current)


@router.get("/me/dashboard", response_model=MeDashboardResponse)
async def customer_dashboard(
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    service: Annotated[PortalDashboardService, Depends(get_portal_dashboard_service)],
) -> MeDashboardResponse:
    """Portal: dashboard for client (plan, site, invoice, pay button, panel login, support, messages)."""
    return await service.get_dashboard(current)
