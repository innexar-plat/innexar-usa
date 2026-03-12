"""Projects workspace service: CRUD via repository + messages/modification requests."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.modules.projects.models import Project
from app.modules.projects.project_message import ProjectMessage
from app.modules.projects.schemas import (
    ModificationRequestListItem,
    ModificationRequestUpdateResponse,
    ProjectCreate,
    ProjectMessageResponse,
    ProjectUpdate,
)
from app.repositories.project_activity_repository import ProjectActivityRepository
from app.repositories.project_repository import ProjectRepository

ALLOWED_STATUSES = (
    "aguardando_briefing",
    "briefing_recebido",
    "design",
    "desenvolvimento",
    "revisao",
    "entrega",
    "projeto_concluido",
    "active",
    "delivered",
    "cancelled",
)


class ProjectWorkspaceService:
    """Workspace projects CRUD. Uses ProjectRepository."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._repo = ProjectRepository(db)
        self._activity_repo = ProjectActivityRepository(db)

    async def list_projects(self) -> list[Project]:
        return await self._repo.list_all()

    async def get_project(self, project_id: int) -> Project | None:
        return await self._repo.get_by_id(project_id)

    async def create_project(self, body: ProjectCreate) -> Project:
        p = Project(
            customer_id=body.customer_id,
            name=body.name,
            status=body.status,
            subscription_id=body.subscription_id,
        )
        self._repo.add(p)
        await self._repo.flush_and_refresh(p)
        return p

    async def update_project(
        self, project_id: int, body: ProjectUpdate
    ) -> Project | None:
        p = await self._repo.get_by_id(project_id)
        if not p:
            return None
        if body.name is not None:
            p.name = body.name
        if body.status is not None:
            if body.status not in ALLOWED_STATUSES:
                raise ValueError(
                    f"status must be one of: {', '.join(ALLOWED_STATUSES)}"
                )
            p.status = body.status
        if body.expected_delivery_at is not None:
            p.expected_delivery_at = body.expected_delivery_at
        if body.delivery_info is not None:
            p.delivery_info = body.delivery_info
        await self._repo.flush_and_refresh(p)
        return p

    async def list_project_messages(
        self, project_id: int
    ) -> list[ProjectMessageResponse]:
        """List messages for a project (workspace staff)."""
        messages = await self._activity_repo.list_messages_by_project_id(project_id)
        return [ProjectMessageResponse.model_validate(m) for m in messages]

    async def send_project_message(
        self, project_id: int, body: str, staff_user: User
    ) -> ProjectMessageResponse:
        """Add staff message to project. Assumes project exists (caller checks)."""
        sender_name = staff_user.email.split("@")[0].replace(".", " ").title()
        msg = ProjectMessage(
            project_id=project_id,
            sender_type="staff",
            sender_id=staff_user.id,
            sender_name=sender_name,
            body=body,
        )
        self._activity_repo.add_message(msg)
        await self._activity_repo.flush_and_refresh_message(msg)
        return ProjectMessageResponse.model_validate(msg)

    async def list_modification_requests(
        self, project_id: int
    ) -> list[ModificationRequestListItem]:
        """List modification requests for a project (workspace staff)."""
        reqs = await self._activity_repo.list_modification_requests_by_project_id(
            project_id
        )
        return [ModificationRequestListItem.model_validate(r) for r in reqs]

    async def update_modification_request(
        self,
        request_id: int,
        status: str | None = None,
        staff_notes: str | None = None,
    ) -> ModificationRequestUpdateResponse | None:
        """Update modification request status/notes. Returns None if not found."""
        req = await self._activity_repo.get_modification_request_by_id(request_id)
        if not req:
            return None
        if status:
            req.status = status
        if staff_notes is not None:
            req.staff_notes = staff_notes
        await self._activity_repo.flush_and_refresh_modification_request(req)
        return ModificationRequestUpdateResponse.model_validate(req)
