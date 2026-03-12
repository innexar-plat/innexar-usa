"""Manually trigger portal credentials email for a customer."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import ALL models first (same as main.py) so relationships resolve
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

from app.modules.customers.service import send_portal_credentials_after_payment


async def main():
    customer_id = int(sys.argv[1]) if len(sys.argv) > 1 else 2
    invoice_id = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    print(f"Sending portal credentials email for customer_id={customer_id}, invoice_id={invoice_id}...")
    try:
        await send_portal_credentials_after_payment(customer_id, "innexar", invoice_id)
        print("Done! Email sent successfully.")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
