"""User (staff) and StaffPasswordResetToken repository: data access only."""

from datetime import datetime

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staff_password_reset import StaffPasswordResetToken
from app.models.user import User


class UserRepository:
    """Repository for User (workspace staff) and StaffPasswordResetToken. No business logic."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_email(self, email: str) -> User | None:
        """Get User by email (case-sensitive)."""
        r = await self._db.execute(
            select(User).where(User.email == email).limit(1)
        )
        return r.scalar_one_or_none()

    async def get_by_id(self, user_id: int) -> User | None:
        """Get User by id."""
        r = await self._db.execute(
            select(User).where(User.id == user_id).limit(1)
        )
        return r.scalar_one_or_none()

    async def list_by_org_id(self, org_id: str) -> list[User]:
        """List staff users by org_id (for post_payment notifications)."""
        r = await self._db.execute(
            select(User).where(User.org_id == org_id)
        )
        return list(r.scalars().all())

    def add_reset_token(self, token: StaffPasswordResetToken) -> None:
        """Add StaffPasswordResetToken to session."""
        self._db.add(token)

    async def flush(self) -> None:
        """Flush pending changes."""
        await self._db.flush()

    async def get_valid_reset_token(
        self, token_str: str, now: datetime | None = None
    ) -> StaffPasswordResetToken | None:
        """Get StaffPasswordResetToken by token string if not expired."""
        from datetime import UTC, datetime

        if now is None:
            now = datetime.now(UTC)
        r = await self._db.execute(
            select(StaffPasswordResetToken)
            .where(
                StaffPasswordResetToken.token == token_str.strip(),
                StaffPasswordResetToken.expires_at > now,
            )
            .limit(1)
        )
        return r.scalar_one_or_none()

    async def delete_reset_token_by_id(self, token_id: int) -> None:
        """Delete a single StaffPasswordResetToken by id."""
        await self._db.execute(
            delete(StaffPasswordResetToken).where(
                StaffPasswordResetToken.id == token_id
            )
        )
        await self._db.flush()

    async def delete_reset_tokens_for_user(self, user_id: int) -> None:
        """Delete all StaffPasswordResetToken for a user."""
        await self._db.execute(
            delete(StaffPasswordResetToken).where(
                StaffPasswordResetToken.user_id == user_id
            )
        )
        await self._db.flush()

    async def update_user_password(self, user: User, password_hash: str) -> None:
        """Update User password hash and flush."""
        user.password_hash = password_hash
        await self._db.flush()
