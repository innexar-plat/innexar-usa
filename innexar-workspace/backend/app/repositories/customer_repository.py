"""Customer aggregate repository: data access only."""

from datetime import datetime

from sqlalchemy import and_, delete, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.customer import Customer
from app.models.customer_password_reset import CustomerPasswordResetToken
from app.models.customer_user import CustomerUser


class CustomerRepository:
    """Repository for Customer and CustomerUser. No business logic."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def list_all_with_users(self) -> list[Customer]:
        """List all customers with users relation loaded. Ordered by id desc."""
        r = await self._db.execute(
            select(Customer)
            .options(selectinload(Customer.users))
            .order_by(Customer.id.desc())
        )
        return list(r.scalars().unique().all())

    async def get_by_id_with_users(self, customer_id: int) -> Customer | None:
        """Get customer by id with users loaded."""
        r = await self._db.execute(
            select(Customer)
            .options(selectinload(Customer.users))
            .where(Customer.id == customer_id)
            .limit(1)
        )
        return r.scalar_one_or_none()

    async def list_test_customer_ids_for_cleanup(self) -> list[int]:
        """Ids of test customers (email @test.innexar.com, name Test Customer/Acme Corp), excluding Toufic."""
        keep_name = "INSTITUTO LASER OCULAR TOUFIC SLEIMAN"
        is_test = or_(
            Customer.email.like("%@test.innexar.com"),
            Customer.name == "Test Customer",
            Customer.name == "Acme Corp",
        )
        not_toufic = ~Customer.name.like(f"%{keep_name}%")
        r = await self._db.execute(select(Customer.id).where(and_(is_test, not_toufic)))
        return [row[0] for row in r.all()]

    async def get_by_email(self, email: str) -> Customer | None:
        """Get customer by email (case-sensitive)."""
        r = await self._db.execute(
            select(Customer).where(Customer.email == email).limit(1)
        )
        return r.scalar_one_or_none()

    async def get_customer_user_by_email(self, email: str) -> CustomerUser | None:
        """Get CustomerUser by email (for checkout / login)."""
        r = await self._db.execute(
            select(CustomerUser).where(CustomerUser.email == email).limit(1)
        )
        return r.scalar_one_or_none()

    async def get_customer_user_by_id(self, user_id: int) -> CustomerUser | None:
        """Get CustomerUser by id (for checkout-login, reset password)."""
        r = await self._db.execute(
            select(CustomerUser).where(CustomerUser.id == user_id).limit(1)
        )
        return r.scalar_one_or_none()

    async def get_customer_user_by_customer_id(
        self, customer_id: int
    ) -> CustomerUser | None:
        """Get CustomerUser for customer if exists."""
        r = await self._db.execute(
            select(CustomerUser).where(CustomerUser.customer_id == customer_id).limit(1)
        )
        return r.scalar_one_or_none()

    def add_password_reset_token(self, token: CustomerPasswordResetToken) -> None:
        """Add password reset token (caller must flush)."""
        self._db.add(token)

    async def get_valid_reset_token(
        self, token: str, now: datetime
    ) -> CustomerPasswordResetToken | None:
        """Get reset token by value if not expired."""
        r = await self._db.execute(
            select(CustomerPasswordResetToken)
            .where(
                CustomerPasswordResetToken.token == token,
                CustomerPasswordResetToken.expires_at > now,
            )
            .limit(1)
        )
        return r.scalar_one_or_none()

    async def delete_reset_tokens_for_customer_user(
        self, customer_user_id: int
    ) -> None:
        """Delete all reset tokens for a customer user."""
        await self._db.execute(
            delete(CustomerPasswordResetToken).where(
                CustomerPasswordResetToken.customer_user_id == customer_user_id
            )
        )
        await self._db.flush()

    async def delete_reset_token_by_id(self, token_id: int) -> None:
        """Delete a single reset token by id."""
        await self._db.execute(
            delete(CustomerPasswordResetToken).where(
                CustomerPasswordResetToken.id == token_id
            )
        )
        await self._db.flush()

    async def update_customer_user_password(
        self, customer_user_id: int, password_hash: str
    ) -> None:
        """Update CustomerUser password hash by id."""
        cu = await self.get_customer_user_by_id(customer_user_id)
        if cu:
            cu.password_hash = password_hash
            await self._db.flush()

    async def update_customer_user(self, user: CustomerUser) -> None:
        """Flush and refresh CustomerUser (e.g. after updating password_hash, requires_password_change)."""
        await self._db.flush()
        await self._db.refresh(user)

    async def update_customer(self, customer: Customer) -> None:
        """Flush and refresh Customer (e.g. after updating profile fields)."""
        await self._db.flush()
        await self._db.refresh(customer)

    def add(self, customer: Customer) -> None:
        """Add customer to session (caller must flush/commit)."""
        self._db.add(customer)

    def add_customer_user(self, customer_user: CustomerUser) -> None:
        """Add CustomerUser to session."""
        self._db.add(customer_user)

    async def delete_customer_and_users(self, customer_id: int) -> bool:
        """Delete CustomerUser rows for customer then Customer. Returns True if customer existed."""
        customer = await self.get_by_id_with_users(customer_id)
        if not customer:
            return False
        for cu in customer.users:
            await self._db.delete(cu)
        await self._db.delete(customer)
        return True
