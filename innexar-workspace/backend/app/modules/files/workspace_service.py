"""Files workspace service: list and download project files (staff). Uses ProjectRepository + files.service."""

from app.modules.files.models import ProjectFile
from app.modules.files.service import (
    get_file_content,
    get_project_file,
    list_project_files,
)
from app.repositories.project_repository import ProjectRepository
from sqlalchemy.ext.asyncio import AsyncSession


class FilesWorkspaceService:
    """Workspace project files: list and download. Verifies project exists via repository."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._project_repo = ProjectRepository(db)

    async def list_files(self, project_id: int) -> list[ProjectFile] | None:
        """List files for project. Returns None if project not found."""
        project = await self._project_repo.get_by_id(project_id)
        if not project:
            return None
        return await list_project_files(self._db, project_id)

    async def get_download(
        self, project_id: int, file_id: int
    ) -> tuple[bytes, str | None, str] | None:
        """Get file content for download. Returns (content, content_type, filename) or None."""
        project = await self._project_repo.get_by_id(project_id)
        if not project:
            return None
        pf = await get_project_file(self._db, file_id, project_id=project_id)
        if not pf:
            return None
        content, content_type = await get_file_content(pf.path_key)
        return (content, content_type, pf.filename)
