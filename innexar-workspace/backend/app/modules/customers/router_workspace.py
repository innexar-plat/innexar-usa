"""Workspace routes: customers. Thin layer: validate → call service → return response."""

from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.rbac import RequirePermission
from app.models.user import User
from app.modules.customers.schemas import (
    CleanupTestResponse,
    CustomerCreate,
    CustomerResponse,
    CustomerUpdate,
    GeneratePasswordResponse,
    SendCredentialsResponse,
)
from app.modules.customers.service import CustomerService
from app.providers.email.loader import get_email_provider

router = APIRouter(prefix="/customers", tags=["workspace-customers"])


def get_customer_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CustomerService:
    """Dependency: customer service with repository layer."""
    return CustomerService(db)


async def _send_credentials_email(
    recipient_email: str,
    temporary_password: str,
    org_id: str,
) -> None:
    """Send email with portal URL and password. Uses new DB session for provider lookup."""
    from app.core.database import AsyncSessionLocal
    from app.modules.customers.email_templates import portal_credentials_email

    portal_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
    login_url = (
        f"{portal_url}/pt/login"
        if "portal." in portal_url
        else f"{portal_url}/portal/login"
    )
    subject, body_plain, body_html = portal_credentials_email(
        login_url=login_url,
        recipient_email=recipient_email,
        temporary_password=temporary_password,
        after_payment=False,
    )
    async with AsyncSessionLocal() as db:
        provider = await get_email_provider(db, org_id=org_id)
        if provider:
            provider.send(recipient_email, subject, body_plain, body_html)


@router.get("", response_model=list[CustomerResponse])
async def list_customers(
    service: Annotated[CustomerService, Depends(get_customer_service)],
    _: Annotated[User, Depends(RequirePermission("billing:read"))],
) -> list[CustomerResponse]:
    """List all customers. has_portal_access is true when at least one CustomerUser exists."""
    return await service.list_customers()


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    body: CustomerCreate,
    service: Annotated[CustomerService, Depends(get_customer_service)],
    _: Annotated[User, Depends(RequirePermission("billing:write"))],
) -> CustomerResponse:
    """Create a customer. Does not create portal user; use send-credentials to invite."""
    try:
        return await service.create_customer(body)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: int,
    service: Annotated[CustomerService, Depends(get_customer_service)],
    _: Annotated[User, Depends(RequirePermission("billing:read"))],
) -> CustomerResponse:
    """Get customer by id."""
    result = await service.get_customer(customer_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return result


@router.patch("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: int,
    body: CustomerUpdate,
    service: Annotated[CustomerService, Depends(get_customer_service)],
    _: Annotated[User, Depends(RequirePermission("billing:write"))],
) -> CustomerResponse:
    """Update customer."""
    try:
        result = await service.update_customer(customer_id, body)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    if result is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return result


@router.post(
    "/cleanup-test", response_model=CleanupTestResponse, status_code=status.HTTP_200_OK
)
async def cleanup_test_customers(
    service: Annotated[CustomerService, Depends(get_customer_service)],
    _: Annotated[User, Depends(RequirePermission("billing:write"))],
) -> CleanupTestResponse:
    """Delete test customers (email @test.innexar.com, name Test Customer or Acme Corp)."""
    return await service.cleanup_test_customers()


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: int,
    service: Annotated[CustomerService, Depends(get_customer_service)],
    _: Annotated[User, Depends(RequirePermission("billing:write"))],
) -> None:
    """Delete customer and related data: invoices, subscriptions, portal user."""
    existed = await service.delete_customer(customer_id)
    if not existed:
        raise HTTPException(status_code=404, detail="Customer not found")


@router.post(
    "/{customer_id}/generate-password",
    response_model=GeneratePasswordResponse,
)
async def generate_password(
    customer_id: int,
    service: Annotated[CustomerService, Depends(get_customer_service)],
    _: Annotated[User, Depends(RequirePermission("billing:write"))],
) -> GeneratePasswordResponse:
    """Generate temporary password for portal user. Use send-credentials to email it."""
    result = await service.generate_password(customer_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return result


@router.post("/{customer_id}/send-credentials", response_model=SendCredentialsResponse)
async def send_credentials(
    customer_id: int,
    service: Annotated[CustomerService, Depends(get_customer_service)],
    background_tasks: BackgroundTasks,
    current: Annotated[User, Depends(RequirePermission("billing:write"))],
) -> SendCredentialsResponse:
    """Create or ensure CustomerUser and send email with portal URL and temporary password."""
    prepared = await service.prepare_send_credentials(customer_id)
    if prepared is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    response, email, temporary_password = prepared
    org_id = current.org_id or "innexar"
    background_tasks.add_task(
        _send_credentials_email,
        email,
        temporary_password,
        org_id,
    )
    return response
