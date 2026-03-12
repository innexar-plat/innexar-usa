"""Workspace system: seed, reset-admin-password, setup-wizard."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.feature_flag_repository import FeatureFlagRepository
from app.repositories.integration_config_repository import (
    IntegrationConfigRepository,
)

from .schemas import ResetAdminPasswordRequest, SetupWizardRequest, SetupWizardResponse
from .seed_service import SystemSeedService

seed_router = APIRouter(prefix="/system", tags=["workspace-system-seed"])


def get_seed_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SystemSeedService:
    return SystemSeedService(
        db=db,
        feature_flag_repo=FeatureFlagRepository(db),
        integration_repo=IntegrationConfigRepository(db),
    )


@seed_router.post("/seed", status_code=204)
async def seed(
    service: Annotated[SystemSeedService, Depends(get_seed_service)],
    token: str | None = None,
) -> None:
    """Bootstrap: default admin, RBAC, feature flags. Protected by SEED_TOKEN or first-run."""
    await service.seed_allowed(token)
    await service.run_bootstrap()


@seed_router.post("/reset-admin-password", status_code=204)
async def reset_admin_password(
    body: ResetAdminPasswordRequest,
    service: Annotated[SystemSeedService, Depends(get_seed_service)],
    token: str | None = None,
) -> None:
    """Emergency: reset password for admin@innexar.app. Requires SEED_TOKEN."""
    await service.reset_admin_password(body.new_password, token)


@seed_router.post("/setup-wizard", response_model=SetupWizardResponse)
async def setup_wizard(
    body: SetupWizardRequest,
    service: Annotated[SystemSeedService, Depends(get_seed_service)],
    token: str | None = None,
) -> SetupWizardResponse:
    """One-shot setup: seed + optional IntegrationConfig (SMTP, Stripe, MP) and test."""
    return await service.run_setup_wizard(body, token)
