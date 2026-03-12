"""CRM service: contact business logic. Uses ContactRepository only."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.crm.models import Contact
from app.modules.crm.schemas import ContactCreate, ContactUpdate, ContactResponse
from app.repositories.contact_repository import ContactRepository


def _to_response(c: Contact) -> ContactResponse:
    """Map Contact entity to Pydantic response."""
    return ContactResponse.model_validate(c)


class ContactService:
    """Contact business logic. Depends on ContactRepository."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._repo = ContactRepository(db)

    async def list_contacts(self) -> list[ContactResponse]:
        """List all contacts."""
        contacts = await self._repo.list_all()
        return [_to_response(c) for c in contacts]

    async def get_contact(self, contact_id: int) -> ContactResponse | None:
        """Get contact by id. Returns None if not found."""
        c = await self._repo.get_by_id(contact_id)
        if not c:
            return None
        return _to_response(c)

    async def create_contact(self, body: ContactCreate) -> ContactResponse:
        """Create contact."""
        contact = Contact(
            org_id="innexar",
            name=body.name,
            email=body.email,
            phone=body.phone,
            customer_id=body.customer_id,
        )
        self._repo.add(contact)
        await self._db.flush()
        await self._db.refresh(contact)
        return _to_response(contact)

    async def update_contact(
        self, contact_id: int, body: ContactUpdate
    ) -> ContactResponse | None:
        """Update contact. Returns None if not found."""
        c = await self._repo.get_by_id(contact_id)
        if not c:
            return None
        if body.name is not None:
            c.name = body.name
        if body.email is not None:
            c.email = body.email
        if body.phone is not None:
            c.phone = body.phone
        if body.customer_id is not None:
            c.customer_id = body.customer_id
        await self._db.flush()
        await self._db.refresh(c)
        return _to_response(c)

    async def delete_contact(self, contact_id: int) -> bool:
        """Delete contact. Returns True if existed, False if not found."""
        c = await self._repo.get_by_id(contact_id)
        if not c:
            return False
        await self._repo.delete(c)
        await self._db.flush()
        return True
