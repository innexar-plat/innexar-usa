"""Customer service: business logic. Uses repositories only."""

import logging
import secrets
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from app.modules.customers.schemas import (
    CleanupTestResponse,
    CustomerCreate,
    CustomerResponse,
    CustomerUpdate,
    GeneratePasswordResponse,
    SendCredentialsResponse,
)
from app.repositories.billing_repository import BillingRepository
from app.repositories.customer_repository import CustomerRepository

logger = logging.getLogger(__name__)


def _customer_to_response(
    c: Customer, has_portal_access: bool = False
) -> CustomerResponse:
    """Map Customer entity to Pydantic response."""
    address: dict[str, Any] | None = c.address if isinstance(c.address, dict) else None
    return CustomerResponse(
        id=c.id,
        org_id=str(c.org_id),
        name=str(c.name),
        email=str(c.email),
        phone=c.phone,
        address=address,
        created_at=c.created_at,
        has_portal_access=has_portal_access,
    )


def _locale_from_invoice_line_items(line_items: list | dict | None) -> str:
    """Extract preferred_locale from invoice line_items. Returns en, pt, or es; default en."""
    if not line_items:
        return "en"
    if isinstance(line_items, list) and line_items and isinstance(line_items[0], dict):
        loc = (line_items[0].get("preferred_locale") or "en").strip().lower()
        return loc if loc in ("en", "pt", "es") else "en"
    if isinstance(line_items, dict):
        loc = (line_items.get("preferred_locale") or "en").strip().lower()
        if loc in ("en", "pt", "es"):
            return loc
        items = line_items.get("items") or line_items.get("line_items") or []
        if items and isinstance(items[0], dict):
            loc = (items[0].get("preferred_locale") or "en").strip().lower()
            return loc if loc in ("en", "pt", "es") else "en"
    return "en"


class CustomerService:
    """Customer business logic. Depends on repositories."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._repo = CustomerRepository(db)
        self._billing_repo = BillingRepository(db)

    async def list_customers(self) -> list[CustomerResponse]:
        """List all customers with has_portal_access."""
        customers = await self._repo.list_all_with_users()
        return [
            _customer_to_response(c, has_portal_access=len(c.users) > 0)
            for c in customers
        ]

    async def get_customer(self, customer_id: int) -> CustomerResponse | None:
        """Get customer by id. Returns None if not found."""
        c = await self._repo.get_by_id_with_users(customer_id)
        if not c:
            return None
        return _customer_to_response(c, has_portal_access=len(c.users) > 0)

    async def create_customer(self, body: CustomerCreate) -> CustomerResponse:
        """Create customer. Raises ValueError if email already exists."""
        email_lower = body.email.lower().strip()
        existing = await self._repo.get_by_email(email_lower)
        if existing:
            raise ValueError("Customer with this email already exists")
        customer = Customer(
            org_id="innexar",
            name=body.name.strip(),
            email=email_lower,
            phone=body.phone.strip() if body.phone else None,
            address=body.address,
        )
        self._repo.add(customer)
        await self._db.flush()
        await self._db.refresh(customer)
        return _customer_to_response(customer, has_portal_access=False)

    async def update_customer(
        self, customer_id: int, body: CustomerUpdate
    ) -> CustomerResponse | None:
        """Update customer. Returns None if not found, raises ValueError if email taken."""
        c = await self._repo.get_by_id_with_users(customer_id)
        if not c:
            return None
        has_portal_access = len(c.users) > 0
        if body.name is not None:
            c.name = body.name.strip()
        if body.email is not None:
            email_lower = body.email.lower().strip()
            existing = await self._repo.get_by_email(email_lower)
            if existing and existing.id != customer_id:
                raise ValueError("Outro cliente já usa este e-mail")
            c.email = email_lower
        if body.phone is not None:
            c.phone = body.phone.strip() or None
        if body.address is not None:
            c.address = body.address
        await self._db.flush()
        return _customer_to_response(c, has_portal_access=has_portal_access)

    async def delete_customer(self, customer_id: int) -> bool:
        """Delete customer and all related billing data and users. Returns True if existed."""
        c = await self._repo.get_by_id_with_users(customer_id)
        if not c:
            return False
        await self._billing_repo.delete_all_by_customer_id(customer_id)
        await self._repo.delete_customer_and_users(customer_id)
        await self._db.flush()
        return True

    async def cleanup_test_customers(self) -> CleanupTestResponse:
        """Delete test customers (email @test.innexar.com, name Test Customer or Acme Corp)."""
        ids_to_delete = await self._repo.list_test_customer_ids_for_cleanup()
        deleted = 0
        for cid in ids_to_delete:
            ok = await self.delete_customer(cid)
            if ok:
                deleted += 1
        await self._db.flush()
        return CleanupTestResponse(
            deleted=deleted,
            message=f"Removidos {deleted} cliente(s) de teste.",
        )

    async def generate_password(
        self, customer_id: int
    ) -> GeneratePasswordResponse | None:
        """Generate temporary password for portal user. Returns None if customer not found."""
        customer = await self._repo.get_by_id_with_users(customer_id)
        if not customer:
            return None
        temporary_password = secrets.token_urlsafe(12)
        cu = await self._repo.get_customer_user_by_customer_id(customer_id)
        if cu:
            cu.password_hash = hash_password(temporary_password)
            await self._db.flush()
        else:
            cu = CustomerUser(
                customer_id=customer_id,
                email=customer.email,
                password_hash=hash_password(temporary_password),
                email_verified=False,
            )
            self._repo.add_customer_user(cu)
            await self._db.flush()
        return GeneratePasswordResponse(password=temporary_password)

    async def prepare_send_credentials(
        self, customer_id: int
    ) -> tuple[SendCredentialsResponse, str, str] | None:
        """Create or update CustomerUser with temp password. Returns (response, email, password) or None."""
        customer = await self._repo.get_by_id_with_users(customer_id)
        if not customer:
            return None
        email = customer.email
        cu = await self._repo.get_customer_user_by_customer_id(customer_id)
        temporary_password = secrets.token_urlsafe(12)
        if cu:
            cu.password_hash = hash_password(temporary_password)
            await self._db.flush()
        else:
            cu = CustomerUser(
                customer_id=customer_id,
                email=email,
                password_hash=hash_password(temporary_password),
                email_verified=False,
            )
            self._repo.add_customer_user(cu)
            await self._db.flush()
        return (SendCredentialsResponse(), email, temporary_password)

    async def send_portal_credentials_after_payment(
        self,
        customer_id: int,
        org_id: str = "innexar",
        invoice_id: int | None = None,
    ) -> None:
        """Create or update CustomerUser and send portal credentials email (after payment)."""
        inv = (
            await self._billing_repo.get_invoice_by_id(invoice_id)
            if invoice_id
            else None
        )
        locale = "en"
        if inv and inv.line_items:
            locale = _locale_from_invoice_line_items(inv.line_items)

        customer = await self._repo.get_by_id_with_users(customer_id)
        if not customer or not customer.email:
            logger.warning(
                "No customer or email found for id %s, skipping email.", customer_id
            )
            return
        email = customer.email
        cu = await self._repo.get_customer_user_by_customer_id(customer_id)
        temporary_password = None
        if cu:
            if not cu.requires_password_change:
                temporary_password = None
            else:
                temporary_password = (
                    "(You will be asked to create your password on first login)"
                )
        else:
            temporary_password = secrets.token_urlsafe(12)
            cu = CustomerUser(
                customer_id=customer_id,
                email=email,
                password_hash=hash_password(temporary_password),
                requires_password_change=True,
                email_verified=False,
            )
            self._repo.add_customer_user(cu)
            await self._db.flush()
            temporary_password = (
                "(You will be asked to create your password on first login)"
            )
        await self._db.commit()

        from app.core.config import settings
        from app.modules.customers.email_templates import portal_credentials_email
        from app.providers.email.loader import get_email_provider

        portal_url = getattr(settings, "PORTAL_URL", None) or getattr(
            settings, "FRONTEND_URL", "http://localhost:3000"
        )
        portal_url = str(portal_url).rstrip("/")
        login_url = f"{portal_url}/{locale}/login"
        briefing_url = f"{portal_url}/{locale}/site-briefing"
        subject, body_plain, body_html = portal_credentials_email(
            login_url=login_url,
            recipient_email=email,
            temporary_password=temporary_password or "******",
            after_payment=True,
            briefing_url=briefing_url,
            locale=locale,
        )
        provider = await get_email_provider(self._db, org_id=org_id)
        if provider:
            logger.info(
                "Sending portal credentials email to %s using %s",
                email,
                provider.__class__.__name__,
            )
            provider.send(email, subject, body_plain, body_html)
        else:
            logger.error(
                "No email provider configured! Could not send credentials email."
            )


async def send_portal_credentials_after_payment(
    customer_id: int,
    org_id: str = "innexar",
    invoice_id: int | None = None,
) -> None:
    """Standalone entry point: create session and send portal credentials (e.g. after payment)."""
    from app.core.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        try:
            svc = CustomerService(db)
            await svc.send_portal_credentials_after_payment(
                customer_id, org_id=org_id, invoice_id=invoice_id
            )
        except Exception as e:
            await db.rollback()
            logger.error(
                "Failed to send portal credentials to customer_id=%s: %s",
                customer_id,
                e,
                exc_info=True,
            )
            raise
