"""Portal projects: get project, list projects with files count. Uses repositories only."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.portal.schemas import ProjectListItem
from app.modules.projects.models import Project
from app.repositories.project_file_repository import ProjectFileRepository
from app.repositories.project_repository import ProjectRepository


class ProjectPortalService:
    """Portal project operations. Depends on ProjectRepository and ProjectFileRepository."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._repo = ProjectRepository(db)
        self._file_repo = ProjectFileRepository(db)

    async def get_project_for_customer(
        self, project_id: int, customer_id: int
    ) -> Project | None:
        """Get project by id if it belongs to customer. Returns None if not found."""
        return await self._repo.get_by_id_and_customer(project_id, customer_id)

    async def list_projects_with_files_count(
        self, customer_id: int
    ) -> list[ProjectListItem]:
        """List projects for customer with file counts (single batch query for counts)."""
        projects = await self._repo.list_by_customer_id(customer_id, order_desc=True)
        if not projects:
            return []
        counts = await self._file_repo.count_by_project_ids([p.id for p in projects])
        return [
            ProjectListItem(
                id=p.id,
                name=p.name,
                status=p.status,
                created_at=p.created_at.isoformat() if p.created_at else None,
                has_files=counts.get(p.id, 0) > 0,
                files_count=counts.get(p.id, 0),
            )
            for p in projects
        ]
