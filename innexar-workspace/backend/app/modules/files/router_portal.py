"""Portal project files: upload, list, download (customer must own project). Thin: validate via service → call files.service."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import Response

from app.core.auth_customer import get_current_customer
from app.core.database import get_db
from app.models.customer_user import CustomerUser
from app.modules.files.schemas import ProjectFileResponse
from app.modules.files.service import (
    get_file_content,
    get_project_file,
    list_project_files,
    upload_project_file,
)
from app.modules.projects.portal_service import ProjectPortalService

router = APIRouter(prefix="/projects", tags=["portal-project-files"])

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB


def get_project_portal_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ProjectPortalService:
    """Dependency: portal project service for ownership check."""
    return ProjectPortalService(db)


@router.get("/{project_id}/files", response_model=list[ProjectFileResponse])
async def list_my_project_files(
    project_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    project_service: Annotated[ProjectPortalService, Depends(get_project_portal_service)],
    current: Annotated[CustomerUser, Depends(get_current_customer)],
):
    """List files for a project (only if owned by current customer)."""
    if not await project_service.get_project_for_customer(project_id, current.customer_id):
        raise HTTPException(status_code=404, detail="Project not found")
    files = await list_project_files(db, project_id)
    return files


@router.post("/{project_id}/files", response_model=ProjectFileResponse, status_code=201)
async def upload_my_project_file(
    project_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    project_service: Annotated[ProjectPortalService, Depends(get_project_portal_service)],
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    file: UploadFile,
):
    """Upload a file to the project (only if owned by current customer)."""
    if not await project_service.get_project_for_customer(project_id, current.customer_id):
        raise HTTPException(status_code=404, detail="Project not found")
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)} MB",
        )
    filename = file.filename or "file"
    content_type = file.content_type
    pf = await upload_project_file(
        db, project_id, current.customer_id, filename, content, content_type
    )
    await db.commit()
    await db.refresh(pf)
    return pf


@router.get("/{project_id}/files/{file_id}/download")
async def download_my_project_file(
    project_id: int,
    file_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    project_service: Annotated[ProjectPortalService, Depends(get_project_portal_service)],
    current: Annotated[CustomerUser, Depends(get_current_customer)],
):
    """Download a file (only if project owned by current customer)."""
    if not await project_service.get_project_for_customer(project_id, current.customer_id):
        raise HTTPException(status_code=404, detail="Project not found")
    pf = await get_project_file(db, file_id, project_id=project_id)
    if not pf:
        raise HTTPException(status_code=404, detail="File not found")
    content, content_type = await get_file_content(pf.path_key)
    return Response(
        content=content,
        media_type=content_type or "application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{pf.filename}"',
        },
    )
