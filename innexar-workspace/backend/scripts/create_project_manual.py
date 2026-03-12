"""Manually trigger post-payment project creation for an invoice."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import ALL models
from app.models import (  # noqa: F401
    AuditLog, Customer, CustomerUser, FeatureFlag, HestiaSettings,
    IntegrationConfig, Notification, Permission, ProjectRequest,
    Role, StaffPasswordResetToken, User
)
from app.modules.billing.models import (  # noqa: F401
    Invoice, MPSubscriptionCheckout, PaymentAttempt, PricePlan,
    Product, ProvisioningRecord, Subscription, WebhookEvent
)
from app.modules.crm.models import Contact  # noqa: F401
from app.modules.files.models import ProjectFile  # noqa: F401
from app.modules.projects.models import Project  # noqa: F401
from app.modules.support.models import Ticket, TicketMessage  # noqa: F401

from app.core.database import AsyncSessionLocal
from app.modules.billing.post_payment import create_project_and_notify_after_payment


async def main():
    invoice_id = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    print(f"Creating project for invoice_id={invoice_id}...")
    async with AsyncSessionLocal() as db:
        try:
            await create_project_and_notify_after_payment(db, invoice_id)
            await db.commit()
            print("Done! Project created successfully.")
        except Exception as e:
            await db.rollback()
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
