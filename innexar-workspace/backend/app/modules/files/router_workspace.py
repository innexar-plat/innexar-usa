"""Workspace project files: list, download. Thin: validate → service → response."""

from typing import Annotated

from app.core.database import get_db
from app.core.rbac import RequirePermission
from app.models.user import User
from app.modules.files.schemas import ProjectFileResponse
from app.modules.files.workspace_service import FilesWorkspaceService
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import Response

router = APIRouter(prefix="/projects", tags=["workspace-project-files"])


def get_files_workspace_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> FilesWorkspaceService:
    return FilesWorkspaceService(db)


@router.get("/{project_id}/files", response_model=list[ProjectFileResponse])
async def list_project_files_workspace(
    project_id: int,
    service: Annotated[FilesWorkspaceService, Depends(get_files_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("projects:read"))],
):
    """List files for a project (workspace staff)."""
    files = await service.list_files(project_id)
    if files is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return [ProjectFileResponse.model_validate(f) for f in files]


@router.get("/{project_id}/files/{file_id}/download")
async def download_project_file_workspace(
    project_id: int,
    file_id: int,
    service: Annotated[FilesWorkspaceService, Depends(get_files_workspace_service)],
    _: Annotated[User, Depends(RequirePermission("projects:read"))],
):
    """Download a file from a project (workspace staff)."""
    result = await service.get_download(project_id, file_id)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found or file not found",
        )
    content, content_type, filename = result
    return Response(
        content=content,
        media_type=content_type or "application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
