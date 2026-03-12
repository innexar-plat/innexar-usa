"""Public API: unauthenticated routes (login, webhooks, web-to-lead, etc.)."""

from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.public_service import PublicService
from app.core.database import get_db
from app.schemas.auth import CustomerLoginResponse, LoginRequest, MessageResponse

router = APIRouter()


class CheckoutLoginRequest(BaseModel):
    """Auto-login payload from checkout success URL."""

    token: str


class ForgotPasswordRequest(BaseModel):
    """Portal: forgot password (email)."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Portal: reset password (token from email link + new password)."""

    token: str
    new_password: str


class WebToLeadRequest(BaseModel):
    """Web-to-lead: name, email, phone, optional message/source."""

    name: str
    email: EmailStr
    phone: str | None = None
    message: str | None = None
    source: str | None = None


class WebToLeadResponse(BaseModel):
    """Web-to-lead success: created contact id."""

    id: int


def get_public_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PublicService:
    return PublicService(db)


@router.post("/auth/customer/login", response_model=CustomerLoginResponse)
async def customer_login(
    body: LoginRequest,
    service: Annotated[PublicService, Depends(get_public_service)],
) -> CustomerLoginResponse:
    """Public: customer login (portal). Returns JWT for /api/portal/*."""
    cu, token = await service.customer_login(body.email, body.password)
    return CustomerLoginResponse(
        access_token=token,
        customer_user_id=cu.id,
        customer_id=cu.customer_id,
        email=cu.email,
    )


@router.post("/auth/customer/checkout-login", response_model=CustomerLoginResponse)
async def checkout_login(
    body: CheckoutLoginRequest,
    service: Annotated[PublicService, Depends(get_public_service)],
) -> CustomerLoginResponse:
    """Public: exchange checkout_token for permanent access token."""
    cu, access_token = await service.checkout_login(body.token)
    return CustomerLoginResponse(
        access_token=access_token,
        customer_user_id=cu.id,
        customer_id=cu.customer_id,
        email=cu.email,
    )


@router.post(
    "/auth/customer/forgot-password",
    response_model=MessageResponse,
    status_code=200,
)
async def customer_forgot_password(
    body: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    service: Annotated[PublicService, Depends(get_public_service)],
) -> MessageResponse:
    """Public: request password reset. Sends email with link if account exists. Always returns 200."""
    await service.forgot_password(body.email, background_tasks)
    return MessageResponse(
        message="If an account exists with this email, you will receive a reset link."
    )


@router.post(
    "/auth/customer/reset-password",
    response_model=MessageResponse,
    status_code=200,
)
async def customer_reset_password(
    body: ResetPasswordRequest,
    service: Annotated[PublicService, Depends(get_public_service)],
) -> MessageResponse:
    """Public: set new password using token from email. Invalidates token."""
    await service.reset_password(body.token, body.new_password)
    return MessageResponse(message="Password updated. You can now log in.")


@router.post("/web-to-lead", response_model=WebToLeadResponse, status_code=201)
async def web_to_lead(
    body: WebToLeadRequest,
    request: Request,
    service: Annotated[PublicService, Depends(get_public_service)],
) -> WebToLeadResponse:
    """Public: create Contact (lead) from form. Rate limited by IP and email."""
    client_host = request.client.host if request.client else "unknown"
    contact_id = await service.web_to_lead(
        name=body.name,
        email=body.email,
        phone=body.phone,
        client_host=client_host,
        message=body.message,
        source=body.source,
    )
    return WebToLeadResponse(id=contact_id)
