"""Repository layer: data access only. One repository per aggregate."""

from app.repositories.billing_repository import BillingRepository
from app.repositories.contact_repository import ContactRepository
from app.repositories.customer_repository import CustomerRepository
from app.repositories.feature_flag_repository import FeatureFlagRepository
from app.repositories.hestia_settings_repository import HestiaSettingsRepository
from app.repositories.integration_config_repository import (
    IntegrationConfigRepository,
)
from app.repositories.notification_repository import NotificationRepository
from app.repositories.project_activity_repository import ProjectActivityRepository
from app.repositories.project_file_repository import ProjectFileRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.project_request_repository import ProjectRequestRepository
from app.repositories.support_repository import SupportRepository
from app.repositories.user_repository import UserRepository

__all__ = [
    "BillingRepository",
    "ContactRepository",
    "CustomerRepository",
    "FeatureFlagRepository",
    "HestiaSettingsRepository",
    "IntegrationConfigRepository",
    "NotificationRepository",
    "ProjectActivityRepository",
    "ProjectFileRepository",
    "ProjectRepository",
    "ProjectRequestRepository",
    "SupportRepository",
    "UserRepository",
]
