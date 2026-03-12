"""Project files service: upload, list, download via storage backend."""

import uuid
from pathlib import Path

from app.core.storage.loader import get_storage_backend
from app.modules.files.models import ProjectFile
from app.repositories.project_file_repository import ProjectFileRepository
from sqlalchemy.ext.asyncio import AsyncSession


def _safe_filename(name: str) -> str:
    """Keep a safe filename (strip path components)."""
    return Path(name).name or "file"


async def upload_project_file(
    db: AsyncSession,
    project_id: int,
    customer_id: int,
    filename: str,
    content: bytes,
    content_type: str | None = None,
) -> ProjectFile:
    """Store file in MinIO and create ProjectFile record. Caller must verify project belongs to customer."""
    storage = get_storage_backend()
    path_key = f"projects/{project_id}/{uuid.uuid4().hex}_{_safe_filename(filename)}"
    await storage.put(path_key, content, content_type=content_type)
    size = len(content)
    pf = ProjectFile(
        project_id=project_id,
        customer_id=customer_id,
        path_key=path_key,
        filename=_safe_filename(filename),
        content_type=content_type or "application/octet-stream",
        size=size,
    )
    repo = ProjectFileRepository(db)
    repo.add(pf)
    await repo.flush_and_refresh(pf)
    return pf


async def list_project_files(db: AsyncSession, project_id: int) -> list[ProjectFile]:
    """List files for a project."""
    repo = ProjectFileRepository(db)
    return await repo.list_by_project_id(project_id)


async def get_project_file(
    db: AsyncSession, file_id: int, project_id: int | None = None
) -> ProjectFile | None:
    """Get ProjectFile by id, optionally scoped to project_id."""
    repo = ProjectFileRepository(db)
    return await repo.get_by_id(file_id, project_id)


async def get_file_content(path_key: str) -> tuple[bytes, str | None]:
    """Read file from storage by path_key."""
    storage = get_storage_backend()
    return await storage.get(path_key)


async def delete_project_file(db: AsyncSession, pf: ProjectFile) -> None:
    """Remove file from storage and delete ProjectFile record."""
    storage = get_storage_backend()
    await storage.delete(pf.path_key)
    repo = ProjectFileRepository(db)
    await repo.delete(pf)
