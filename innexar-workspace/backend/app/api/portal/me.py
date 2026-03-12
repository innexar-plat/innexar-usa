"""Portal: /me, /me/password, /me/set-password, /me/profile."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_customer import get_current_customer
from app.core.database import get_db
from app.models.customer_user import CustomerUser
from app.schemas.auth import ChangePasswordRequest, CustomerMeResponse

from .me_service import PortalMeService
from .schemas import MessageResponse, ProfileRead, ProfileUpdate, SetPasswordRequest

router = APIRouter()


def get_portal_me_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PortalMeService:
    return PortalMeService(db)


@router.get("/me", response_model=CustomerMeResponse)
async def customer_me(
    current_user: Annotated[CustomerUser, Depends(get_current_customer)],
) -> CustomerMeResponse:
    """Portal: current customer user profile."""
    return CustomerMeResponse(
        id=current_user.id,
        email=current_user.email,
        customer_id=current_user.customer_id,
        email_verified=current_user.email_verified,
    )


@router.patch("/me/password", status_code=200)
async def customer_change_password(
    body: ChangePasswordRequest,
    current_user: Annotated[CustomerUser, Depends(get_current_customer)],
    service: Annotated[PortalMeService, Depends(get_portal_me_service)],
) -> MessageResponse:
    """Portal: change password for current customer (current + new password)."""
    await service.change_password(
        current_user, body.current_password, body.new_password
    )
    return MessageResponse(message="Senha alterada com sucesso.")


@router.post("/me/set-password", status_code=200)
async def customer_set_initial_password(
    body: SetPasswordRequest,
    current_user: Annotated[CustomerUser, Depends(get_current_customer)],
    service: Annotated[PortalMeService, Depends(get_portal_me_service)],
) -> MessageResponse:
    """Portal: set initial password and clear requires_password_change flag."""
    await service.set_initial_password(current_user, body.new_password)
    return MessageResponse(message="Senha configurada com sucesso.")


@router.get("/me/profile", response_model=ProfileRead)
async def get_my_profile(
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    service: Annotated[PortalMeService, Depends(get_portal_me_service)],
) -> ProfileRead:
    """Portal: get current customer profile (name, email, phone, address)."""
    return await service.get_profile(current.customer_id)


@router.patch("/me/profile", response_model=ProfileRead)
async def update_my_profile(
    body: ProfileUpdate,
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    service: Annotated[PortalMeService, Depends(get_portal_me_service)],
) -> ProfileRead:
    """Portal: update current customer profile (name, phone, address; email read-only)."""
    return await service.update_profile(current.customer_id, body)
