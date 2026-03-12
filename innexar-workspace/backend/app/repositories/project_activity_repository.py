"""Repository for project messages and modification requests (workspace staff)."""

from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.projects.modification_request import ModificationRequest
from app.modules.projects.project_message import ProjectMessage


class ProjectActivityRepository:
    """Data access for ProjectMessage and ModificationRequest."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def list_messages_by_project_id(
        self, project_id: int
    ) -> list[ProjectMessage]:
        """Messages for a project, ordered by created_at asc."""
        r = await self._db.execute(
            select(ProjectMessage)
            .where(ProjectMessage.project_id == project_id)
            .order_by(ProjectMessage.created_at.asc())
        )
        return list(r.scalars().all())

    def add_message(self, message: ProjectMessage) -> None:
        self._db.add(message)

    async def flush_and_refresh_message(self, message: ProjectMessage) -> None:
        await self._db.flush()
        await self._db.refresh(message)

    async def list_modification_requests_by_project_id(
        self, project_id: int
    ) -> list[ModificationRequest]:
        """Modification requests for a project, newest first."""
        r = await self._db.execute(
            select(ModificationRequest)
            .where(ModificationRequest.project_id == project_id)
            .order_by(ModificationRequest.created_at.desc())
        )
        return list(r.scalars().all())

    async def count_modification_requests_this_month(
        self, project_id: int, customer_id: int, year: int, month: int
    ) -> int:
        """Count modification requests for project+customer in the given month (portal quota)."""
        r = await self._db.execute(
            select(func.count())
            .select_from(ModificationRequest)
            .where(
                ModificationRequest.project_id == project_id,
                ModificationRequest.customer_id == customer_id,
                extract("year", ModificationRequest.created_at) == year,
                extract("month", ModificationRequest.created_at) == month,
            )
        )
        return r.scalar() or 0

    def add_modification_request(self, req: ModificationRequest) -> None:
        self._db.add(req)

    async def get_modification_request_by_id(
        self, request_id: int
    ) -> ModificationRequest | None:
        r = await self._db.execute(
            select(ModificationRequest).where(ModificationRequest.id == request_id)
        )
        return r.scalar_one_or_none()

    async def flush_and_refresh_modification_request(
        self, req: ModificationRequest
    ) -> None:
        await self._db.flush()
        await self._db.refresh(req)
