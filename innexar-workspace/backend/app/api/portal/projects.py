"""Portal: /projects list and /projects/{id}/files (CRUD)."""

from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_customer import get_current_customer
from app.core.database import get_db
from app.models.customer_user import CustomerUser
from app.modules.projects.portal_service import ProjectPortalService

from .schemas import FileUploadResponse, ProjectFileItem, ProjectListItem

router = APIRouter()


def get_project_portal_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ProjectPortalService:
    """Dependency: portal project service."""
    return ProjectPortalService(db)


@router.get("/projects", response_model=list[ProjectListItem])
async def portal_list_projects(
    service: Annotated[ProjectPortalService, Depends(get_project_portal_service)],
    current: Annotated[CustomerUser, Depends(get_current_customer)],
) -> list[ProjectListItem]:
    """Portal: list all projects for customer."""
    return await service.list_projects_with_files_count(current.customer_id)


@router.post("/projects/{project_id}/files", status_code=201)
async def portal_upload_file(
    project_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    project_service: Annotated[
        ProjectPortalService, Depends(get_project_portal_service)
    ],
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    file: UploadFile = File(...),  # noqa: B008 — FastAPI File() pattern
) -> FileUploadResponse:
    """Portal: upload a file to a project (stored in MinIO)."""
    from app.modules.files.service import upload_project_file

    if not await project_service.get_project_for_customer(
        project_id, current.customer_id
    ):
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:  # 50 MB limit
        raise HTTPException(status_code=413, detail="Arquivo muito grande (máx. 50MB)")
    pf = await upload_project_file(
        db,
        project_id,
        current.customer_id,
        file.filename or "file",
        content,
        file.content_type,
    )
    return FileUploadResponse(
        id=pf.id,
        filename=pf.filename,
        content_type=pf.content_type,
        size=pf.size,
        created_at=pf.created_at.isoformat() if pf.created_at else None,
    )


@router.get("/projects/{project_id}/files")
async def portal_list_files(
    project_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    project_service: Annotated[
        ProjectPortalService, Depends(get_project_portal_service)
    ],
    current: Annotated[CustomerUser, Depends(get_current_customer)],
) -> list[ProjectFileItem]:
    """Portal: list files for a project."""
    from app.modules.files.service import list_project_files

    if not await project_service.get_project_for_customer(
        project_id, current.customer_id
    ):
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    files = await list_project_files(db, project_id)
    return [
        ProjectFileItem(
            id=f.id,
            filename=f.filename,
            content_type=f.content_type,
            size=f.size,
            created_at=f.created_at.isoformat() if f.created_at else None,
        )
        for f in files
    ]


@router.get("/projects/{project_id}/files/{file_id}/download")
async def portal_download_file(
    project_id: int,
    file_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    project_service: Annotated[
        ProjectPortalService, Depends(get_project_portal_service)
    ],
    current: Annotated[CustomerUser, Depends(get_current_customer)],
):
    """Portal: download a file from a project."""
    from fastapi.responses import Response

    from app.modules.files.service import get_file_content, get_project_file

    if not await project_service.get_project_for_customer(
        project_id, current.customer_id
    ):
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    pf = await get_project_file(db, file_id, project_id)
    if not pf:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    content, ct = await get_file_content(pf.path_key)
    return Response(
        content=content,
        media_type=ct or pf.content_type or "application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{pf.filename}"'},
    )


@router.delete("/projects/{project_id}/files/{file_id}", status_code=204)
async def portal_delete_file(
    project_id: int,
    file_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    project_service: Annotated[
        ProjectPortalService, Depends(get_project_portal_service)
    ],
    current: Annotated[CustomerUser, Depends(get_current_customer)],
):
    """Portal: delete a file from a project (customer can only delete own files)."""
    from app.modules.files.service import delete_project_file, get_project_file

    if not await project_service.get_project_for_customer(
        project_id, current.customer_id
    ):
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    pf = await get_project_file(db, file_id, project_id)
    if not pf:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    if pf.customer_id != current.customer_id:
        raise HTTPException(
            status_code=403, detail="Sem permissão para deletar este arquivo"
        )
    await delete_project_file(db, pf)
