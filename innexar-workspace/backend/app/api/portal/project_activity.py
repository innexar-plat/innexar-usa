"""Portal: /projects/{id}/messages and /projects/{id}/modification-requests."""

from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_customer import get_current_customer
from app.core.database import get_db
from app.models.customer_user import CustomerUser

from .project_activity_service import PortalProjectActivityService
from .schemas import (
    ModificationRequestCreateResponse,
    ModificationRequestsResponse,
    PortalMessageItem,
    PortalMessageItemWithAttachment,
    SendMessageRequest,
)


def get_portal_project_activity_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PortalProjectActivityService:
    from app.repositories.billing_repository import BillingRepository
    from app.repositories.customer_repository import CustomerRepository
    from app.repositories.project_activity_repository import ProjectActivityRepository
    from app.repositories.project_repository import ProjectRepository

    return PortalProjectActivityService(
        project_repo=ProjectRepository(db),
        project_activity_repo=ProjectActivityRepository(db),
        customer_repo=CustomerRepository(db),
        billing_repo=BillingRepository(db),
    )


router = APIRouter()


@router.get("/projects/{project_id}/messages")
async def portal_list_messages(
    project_id: int,
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    service: Annotated[
        PortalProjectActivityService, Depends(get_portal_project_activity_service)
    ],
) -> list[PortalMessageItemWithAttachment]:
    """Portal: list messages for a project."""
    return await service.list_messages(project_id, current)


@router.post("/projects/{project_id}/messages", status_code=201)
async def portal_send_message(
    project_id: int,
    body: SendMessageRequest,
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    service: Annotated[
        PortalProjectActivityService, Depends(get_portal_project_activity_service)
    ],
) -> PortalMessageItem:
    """Portal: send a message in a project thread."""
    return await service.send_message(project_id, body, current)


@router.post("/projects/{project_id}/messages/upload", status_code=201)
async def portal_send_message_with_file(
    project_id: int,
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    service: Annotated[
        PortalProjectActivityService, Depends(get_portal_project_activity_service)
    ],
    file: UploadFile = File(...),  # noqa: B008 — FastAPI File() pattern
) -> PortalMessageItemWithAttachment:
    """Portal: send a message with file attachment in a project thread."""
    return await service.send_message_with_file(project_id, file, current)


@router.get("/projects/{project_id}/modification-requests")
async def portal_list_modification_requests(
    project_id: int,
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    service: Annotated[
        PortalProjectActivityService, Depends(get_portal_project_activity_service)
    ],
) -> ModificationRequestsResponse:
    """Portal: list modification requests for a project + remaining quota."""
    return await service.list_modification_requests(project_id, current)


@router.post("/projects/{project_id}/modification-requests", status_code=201)
async def portal_create_modification_request(
    project_id: int,
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    service: Annotated[
        PortalProjectActivityService, Depends(get_portal_project_activity_service)
    ],
    title: str = Form(...),
    description: str = Form(...),
    file: UploadFile | None = File(None),  # noqa: B008
) -> ModificationRequestCreateResponse:
    """Portal: submit a modification request (enforces monthly plan limit)."""
    return await service.create_modification_request(
        project_id, title, description, file, current
    )
