"""Workspace config: integrations (list, create, update, test)."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import RequirePermission
from app.models.user import User
from app.repositories.integration_config_repository import (
    IntegrationConfigRepository,
)

from .integration_service import SystemIntegrationService
from .schemas import (
    IntegrationConfigCreate,
    IntegrationConfigResponse,
    IntegrationConfigUpdate,
    IntegrationTestResponse,
)

integrations_router = APIRouter(prefix="/config", tags=["workspace-config"])


def get_integration_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SystemIntegrationService:
    return SystemIntegrationService(
        integration_repo=IntegrationConfigRepository(db),
        db=db,
    )


@integrations_router.get(
    "/integrations", response_model=list[IntegrationConfigResponse]
)
async def list_integrations(
    _: Annotated[User, Depends(RequirePermission("config:read"))],
    service: Annotated[SystemIntegrationService, Depends(get_integration_service)],
) -> list[IntegrationConfigResponse]:
    """List integration configs (value masked)."""
    return await service.list_integrations()


@integrations_router.post(
    "/integrations", response_model=IntegrationConfigResponse, status_code=201
)
async def create_integration(
    body: IntegrationConfigCreate,
    current: Annotated[User, Depends(RequirePermission("config:write"))],
    service: Annotated[SystemIntegrationService, Depends(get_integration_service)],
) -> IntegrationConfigResponse:
    """Create integration config (value stored encrypted)."""
    return await service.create_integration(body, current)


@integrations_router.patch(
    "/integrations/{config_id}", response_model=IntegrationConfigResponse
)
async def update_integration(
    config_id: int,
    body: IntegrationConfigUpdate,
    current: Annotated[User, Depends(RequirePermission("config:write"))],
    service: Annotated[SystemIntegrationService, Depends(get_integration_service)],
) -> IntegrationConfigResponse:
    """Update integration config (value encrypted if provided)."""
    return await service.update_integration(config_id, body, current)


@integrations_router.post(
    "/integrations/{config_id}/test",
    response_model=IntegrationTestResponse,
    responses={404: {"description": "Integration config not found"}},
)
async def test_integration(
    config_id: int,
    _: Annotated[User, Depends(RequirePermission("config:write"))],
    service: Annotated[SystemIntegrationService, Depends(get_integration_service)],
) -> IntegrationTestResponse:
    """Test an integration config (Stripe, SMTP, Mercado Pago, Hestia)."""
    return await service.test_integration(config_id)
