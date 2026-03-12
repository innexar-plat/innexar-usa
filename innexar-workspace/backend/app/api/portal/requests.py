"""Portal: /new-project, /site-briefing, /site-briefing/upload."""

from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_customer import get_current_customer
from app.core.database import get_db
from app.models.customer_user import CustomerUser

from .requests_service import PortalRequestsService
from .schemas import (
    NewProjectRequest,
    NewProjectResponse,
    SiteBriefingRequest,
    SiteBriefingResponse,
)


def get_portal_requests_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PortalRequestsService:
    from app.repositories.feature_flag_repository import FeatureFlagRepository
    from app.repositories.project_repository import ProjectRepository
    from app.repositories.project_request_repository import ProjectRequestRepository
    from app.repositories.support_repository import SupportRepository

    return PortalRequestsService(
        project_request_repo=ProjectRequestRepository(db),
        project_repo=ProjectRepository(db),
        feature_flag_repo=FeatureFlagRepository(db),
        support_repo=SupportRepository(db),
    )


router = APIRouter()


@router.post("/new-project", status_code=201)
async def portal_new_project(
    body: NewProjectRequest,
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    service: Annotated[PortalRequestsService, Depends(get_portal_requests_service)],
) -> NewProjectResponse:
    """Portal: submit a new project request. Persisted for staff to review."""
    return await service.create_new_project(body, current)


@router.post("/site-briefing", status_code=201)
async def portal_site_briefing(
    body: SiteBriefingRequest,
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    service: Annotated[PortalRequestsService, Depends(get_portal_requests_service)],
) -> SiteBriefingResponse:
    """Portal: submit site briefing. Links to project aguardando_briefing if any; creates ticket if enabled."""
    return await service.submit_site_briefing(body, current)


@router.post("/site-briefing/upload", status_code=201)
async def portal_site_briefing_upload(
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    service: Annotated[PortalRequestsService, Depends(get_portal_requests_service)],
    company_name: str = Form(""),
    services: str | None = Form(None),
    city: str | None = Form(None),
    whatsapp: str | None = Form(None),
    domain: str | None = Form(None),
    logo_url: str | None = Form(None),
    colors: str | None = Form(None),
    photos: str | None = Form(None),
    description: str | None = Form(None),
    files: list[UploadFile] | UploadFile | None = File(None),  # noqa: B008
) -> SiteBriefingResponse:
    """Portal: submit site briefing with optional file uploads (multipart)."""
    file_list: list[UploadFile] = (
        files if isinstance(files, list) else ([files] if files else [])
    )
    return await service.submit_site_briefing_with_uploads(
        company_name=company_name,
        services=services,
        city=city,
        whatsapp=whatsapp,
        domain=domain,
        logo_url=logo_url,
        colors=colors,
        photos=photos,
        description=description,
        files=file_list,
        current=current,
    )
