"""Portal project activity service: messages and modification-requests."""

import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException, UploadFile

from app.models.customer_user import CustomerUser
from app.modules.projects.project_message import ProjectMessage
from app.repositories.billing_repository import BillingRepository
from app.repositories.customer_repository import CustomerRepository
from app.repositories.project_activity_repository import ProjectActivityRepository
from app.repositories.project_repository import ProjectRepository

from .schemas import (
    ModificationRequestCreateResponse,
    ModificationRequestItemResponse,
    ModificationRequestsResponse,
    PortalMessageItem,
    PortalMessageItemWithAttachment,
    SendMessageRequest,
)

DEFAULT_MONTHLY_LIMIT = 5


class PortalProjectActivityService:
    """Service for portal project messages and modification requests."""

    def __init__(
        self,
        project_repo: ProjectRepository,
        project_activity_repo: ProjectActivityRepository,
        customer_repo: CustomerRepository,
        billing_repo: BillingRepository,
    ) -> None:
        self._project = project_repo
        self._activity = project_activity_repo
        self._customer = customer_repo
        self._billing = billing_repo

    async def _get_project_or_404(
        self, project_id: int, customer_id: int
    ):
        """Return project if owned by customer; else raise 404."""
        project = await self._project.get_by_id_and_customer(
            project_id, customer_id
        )
        if not project:
            raise HTTPException(
                status_code=404, detail="Projeto não encontrado"
            )
        return project

    async def _customer_sender_name(self, customer_id: int) -> str:
        """Customer name for message sender, or fallback."""
        cust = await self._customer.get_by_id_with_users(customer_id)
        return cust.name if cust else "Cliente"

    async def _monthly_limit_for_project(self, project_id: int) -> int:
        """Monthly modification request limit from project subscription plan."""
        project = await self._project.get_by_id(project_id)
        if not project or not project.subscription_id:
            return DEFAULT_MONTHLY_LIMIT
        sub = await self._billing.get_subscription_by_id(
            project.subscription_id
        )
        if not sub:
            return DEFAULT_MONTHLY_LIMIT
        plan = await self._billing.get_price_plan_by_id(sub.price_plan_id)
        if not plan:
            return DEFAULT_MONTHLY_LIMIT
        return getattr(
            plan, "monthly_adjustments_limit", DEFAULT_MONTHLY_LIMIT
        )

    async def list_messages(
        self, project_id: int, current: CustomerUser
    ) -> list[PortalMessageItemWithAttachment]:
        """List messages for a project (customer must own project)."""
        await self._get_project_or_404(project_id, current.customer_id)
        msgs = await self._activity.list_messages_by_project_id(project_id)
        return [
            PortalMessageItemWithAttachment(
                id=m.id,
                sender_type=m.sender_type,
                sender_name=m.sender_name,
                body=m.body,
                attachment_key=m.attachment_key,
                attachment_name=m.attachment_name,
                created_at=(
                    m.created_at.isoformat() if m.created_at else None
                ),
            )
            for m in msgs
        ]

    async def send_message(
        self, project_id: int, body: SendMessageRequest, current: CustomerUser
    ) -> PortalMessageItem:
        """Send a text message in the project thread."""
        await self._get_project_or_404(project_id, current.customer_id)
        sender_name = await self._customer_sender_name(current.customer_id)
        msg = ProjectMessage(
            project_id=project_id,
            sender_type="customer",
            sender_id=current.customer_id,
            sender_name=sender_name,
            body=body.body,
        )
        self._activity.add_message(msg)
        await self._activity.flush_and_refresh_message(msg)
        return PortalMessageItem(
            id=msg.id,
            sender_type=msg.sender_type,
            sender_name=msg.sender_name,
            body=msg.body,
            created_at=(
                msg.created_at.isoformat() if msg.created_at else None
            ),
        )

    async def send_message_with_file(
        self, project_id: int, file: UploadFile, current: CustomerUser
    ) -> PortalMessageItemWithAttachment:
        """Send a message with file attachment."""
        from app.core.storage.loader import get_storage_backend

        await self._get_project_or_404(project_id, current.customer_id)
        content = await file.read()
        if len(content) > 50 * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail="Arquivo muito grande (máx. 50MB)",
            )
        storage = get_storage_backend()
        filename = file.filename or "file"
        path_key = f"messages/{project_id}/{uuid.uuid4().hex}_{filename}"
        await storage.put(
            path_key, content, content_type=file.content_type
        )
        sender_name = await self._customer_sender_name(current.customer_id)
        msg = ProjectMessage(
            project_id=project_id,
            sender_type="customer",
            sender_id=current.customer_id,
            sender_name=sender_name,
            body=f"📎 {filename}",
            attachment_key=path_key,
            attachment_name=filename,
        )
        self._activity.add_message(msg)
        await self._activity.flush_and_refresh_message(msg)
        return PortalMessageItemWithAttachment(
            id=msg.id,
            sender_type=msg.sender_type,
            sender_name=msg.sender_name,
            body=msg.body,
            attachment_key=msg.attachment_key,
            attachment_name=msg.attachment_name,
            created_at=(
                msg.created_at.isoformat() if msg.created_at else None
            ),
        )

    async def list_modification_requests(
        self, project_id: int, current: CustomerUser
    ) -> ModificationRequestsResponse:
        """List modification requests for project and quota (monthly limit from plan)."""
        await self._get_project_or_404(project_id, current.customer_id)
        monthly_limit = await self._monthly_limit_for_project(project_id)
        now = datetime.now(timezone.utc)
        used = await self._activity.count_modification_requests_this_month(
            project_id, current.customer_id, now.year, now.month
        )
        items = await self._activity.list_modification_requests_by_project_id(
            project_id
        )
        return ModificationRequestsResponse(
            items=[
                ModificationRequestItemResponse(
                    id=r.id,
                    title=r.title,
                    description=r.description,
                    status=r.status,
                    staff_notes=r.staff_notes,
                    attachment_name=r.attachment_name,
                    created_at=(
                        r.created_at.isoformat()
                        if r.created_at
                        else None
                    ),
                )
                for r in items
            ],
            monthly_limit=monthly_limit,
            used_this_month=used,
            remaining=max(0, monthly_limit - used),
        )

    async def create_modification_request(
        self,
        project_id: int,
        title: str,
        description: str,
        file: UploadFile | None,
        current: CustomerUser,
    ) -> ModificationRequestCreateResponse:
        """Create modification request (enforces monthly plan limit); optional file."""
        from app.modules.projects.modification_request import ModificationRequest

        await self._get_project_or_404(project_id, current.customer_id)
        monthly_limit = await self._monthly_limit_for_project(project_id)
        now = datetime.now(timezone.utc)
        used = await self._activity.count_modification_requests_this_month(
            project_id, current.customer_id, now.year, now.month
        )
        if used >= monthly_limit:
            raise HTTPException(
                status_code=429,
                detail=(
                    f"Limite de {monthly_limit} solicitações/mês atingido. "
                    "Restam 0."
                ),
            )
        attachment_key: str | None = None
        attachment_name: str | None = None
        if file and (file.filename or "").strip():
            from app.core.storage.loader import get_storage_backend

            content = await file.read()
            if len(content) > 50 * 1024 * 1024:
                raise HTTPException(
                    status_code=413,
                    detail="Arquivo muito grande (máx. 50MB)",
                )
            if len(content) > 0:
                storage = get_storage_backend()
                safe_name = Path(file.filename or "file").name or "file"
                path_key = (
                    f"modifications/{project_id}/"
                    f"{uuid.uuid4().hex}_{safe_name}"
                )
                await storage.put(
                    path_key, content, content_type=file.content_type
                )
                attachment_key = path_key
                attachment_name = safe_name
        req = ModificationRequest(
            project_id=project_id,
            customer_id=current.customer_id,
            title=title.strip(),
            description=description.strip(),
            attachment_key=attachment_key,
            attachment_name=attachment_name,
        )
        self._activity.add_modification_request(req)
        await self._activity.flush_and_refresh_modification_request(req)
        return ModificationRequestCreateResponse(
            id=req.id,
            title=req.title,
            description=req.description,
            status=req.status,
            attachment_name=req.attachment_name,
            remaining=max(0, monthly_limit - used - 1),
            created_at=(
                req.created_at.isoformat() if req.created_at else None
            ),
        )
