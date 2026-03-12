"""Workspace CRM routes: contacts. Thin layer: validate → call service → return response."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import RequirePermission
from app.models.user import User
from app.modules.crm.schemas import ContactCreate, ContactResponse, ContactUpdate
from app.modules.crm.service import ContactService

router = APIRouter(prefix="/crm", tags=["workspace-crm"])


def get_contact_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ContactService:
    """Dependency: contact service with repository layer."""
    return ContactService(db)


@router.get("/contacts", response_model=list[ContactResponse])
async def list_contacts(
    service: Annotated[ContactService, Depends(get_contact_service)],
    _: Annotated[User, Depends(RequirePermission("crm:read"))],
) -> list[ContactResponse]:
    """List contacts (workspace)."""
    return await service.list_contacts()


@router.post("/contacts", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(
    body: ContactCreate,
    service: Annotated[ContactService, Depends(get_contact_service)],
    _: Annotated[User, Depends(RequirePermission("crm:write"))],
) -> ContactResponse:
    """Create contact."""
    return await service.create_contact(body)


@router.get("/contacts/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: int,
    service: Annotated[ContactService, Depends(get_contact_service)],
    _: Annotated[User, Depends(RequirePermission("crm:read"))],
) -> ContactResponse:
    """Get contact by id."""
    result = await service.get_contact(contact_id)
    if not result:
        raise HTTPException(status_code=404, detail="Contact not found")
    return result


@router.patch("/contacts/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: int,
    body: ContactUpdate,
    service: Annotated[ContactService, Depends(get_contact_service)],
    _: Annotated[User, Depends(RequirePermission("crm:write"))],
) -> ContactResponse:
    """Update contact."""
    result = await service.update_contact(contact_id, body)
    if not result:
        raise HTTPException(status_code=404, detail="Contact not found")
    return result


@router.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: int,
    service: Annotated[ContactService, Depends(get_contact_service)],
    _: Annotated[User, Depends(RequirePermission("crm:write"))],
) -> None:
    """Delete contact."""
    existed = await service.delete_contact(contact_id)
    if not existed:
        raise HTTPException(status_code=404, detail="Contact not found")
