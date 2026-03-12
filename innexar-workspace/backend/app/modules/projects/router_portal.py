"""Portal projects: get single project for current customer. Thin: validate → service → return."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_customer import get_current_customer
from app.core.database import get_db
from app.core.feature_flags import require_portal_feature
from app.models.customer_user import CustomerUser
from app.modules.projects.portal_service import ProjectPortalService
from app.modules.projects.schemas import ProjectResponse

router = APIRouter(prefix="/projects", tags=["portal-projects"])


def get_project_portal_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ProjectPortalService:
    """Dependency: portal project service."""
    return ProjectPortalService(db)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_my_project(
    project_id: int,
    service: Annotated[ProjectPortalService, Depends(get_project_portal_service)],
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    _: Annotated[None, require_portal_feature("portal.projects.enabled")],
) -> ProjectResponse:
    """Get project detail (only if owned by current customer)."""
    p = await service.get_project_for_customer(project_id, current.customer_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse.model_validate(p)
