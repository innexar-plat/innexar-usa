"""ProjectFile repository: data access only."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.files.models import ProjectFile


class ProjectFileRepository:
    """Repository for ProjectFile. No business logic."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def count_by_project_ids(
        self, project_ids: list[int]
    ) -> dict[int, int]:
        """Return mapping project_id -> file count for given project ids."""
        if not project_ids:
            return {}
        r = await self._db.execute(
            select(ProjectFile.project_id, func.count(ProjectFile.id))
            .where(ProjectFile.project_id.in_(project_ids))
            .group_by(ProjectFile.project_id)
        )
        return dict(r.all())

    async def list_by_project_id(
        self, project_id: int, order_desc: bool = True
    ) -> list[ProjectFile]:
        """List files for a project."""
        q = (
            select(ProjectFile)
            .where(ProjectFile.project_id == project_id)
            .order_by(
                ProjectFile.created_at.desc()
                if order_desc
                else ProjectFile.created_at
            )
        )
        r = await self._db.execute(q)
        return list(r.scalars().all())

    async def get_by_id(
        self, file_id: int, project_id: int | None = None
    ) -> ProjectFile | None:
        """Get ProjectFile by id, optionally scoped to project_id."""
        q = select(ProjectFile).where(ProjectFile.id == file_id)
        if project_id is not None:
            q = q.where(ProjectFile.project_id == project_id)
        r = await self._db.execute(q)
        return r.scalar_one_or_none()

    def add(self, pf: ProjectFile) -> None:
        self._db.add(pf)

    async def flush_and_refresh(self, pf: ProjectFile) -> None:
        await self._db.flush()
        await self._db.refresh(pf)

    async def delete(self, pf: ProjectFile) -> None:
        """Delete ProjectFile record and flush."""
        await self._db.delete(pf)
        await self._db.flush()
