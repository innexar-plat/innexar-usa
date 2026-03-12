"""Workspace projects routes. Thin: validate → call service → return response."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import RequirePermission
from app.models.user import User
from app.modules.projects.schemas import ProjectCreate, ProjectResponse, ProjectUpdate
from app.modules.projects.workspace_service import ProjectWorkspaceService

router = APIRouter(prefix="/projects", tags=["workspace-projects"])


def get_project_workspace_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ProjectWorkspaceService:
    return ProjectWorkspaceService(db)


@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    service: Annotated[ProjectWorkspaceService, Depends(get_project_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("projects:read"))],
):
    """List projects (workspace)."""
    projects = await service.list_projects()
    return [ProjectResponse.model_validate(p) for p in projects]


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    body: ProjectCreate,
    service: Annotated[ProjectWorkspaceService, Depends(get_project_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("projects:write"))],
):
    """Create project."""
    p = await service.create_project(body)
    return ProjectResponse.model_validate(p)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    service: Annotated[ProjectWorkspaceService, Depends(get_project_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("projects:read"))],
):
    """Get project by id."""
    p = await service.get_project(project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse.model_validate(p)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    body: ProjectUpdate,
    service: Annotated[ProjectWorkspaceService, Depends(get_project_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("projects:write"))],
):
    """Update project."""
    try:
        p = await service.update_project(project_id, body)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        ) from e
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse.model_validate(p)
