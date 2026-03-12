"""Contact aggregate repository: data access only."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.crm.models import Contact


class ContactRepository:
    """Repository for Contact. No business logic."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def list_all(self) -> list[Contact]:
        """List all contacts ordered by id."""
        r = await self._db.execute(select(Contact).order_by(Contact.id))
        return list(r.scalars().all())

    async def get_by_id(self, contact_id: int) -> Contact | None:
        """Get contact by id."""
        r = await self._db.execute(
            select(Contact).where(Contact.id == contact_id).limit(1)
        )
        return r.scalar_one_or_none()

    def add(self, contact: Contact) -> None:
        """Add contact to session (caller must flush/commit)."""
        self._db.add(contact)

    async def delete(self, contact: Contact) -> None:
        """Delete contact from session (caller must flush/commit)."""
        await self._db.delete(contact)
