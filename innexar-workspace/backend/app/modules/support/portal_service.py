"""Portal support: list/create tickets, list/add messages. Uses SupportRepository + ProjectRepository."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.support.models import Ticket, TicketMessage
from app.modules.support.schemas import TicketCreate
from app.repositories.project_repository import ProjectRepository
from app.repositories.support_repository import SupportRepository


class SupportPortalService:
    """Portal support operations. Depends on SupportRepository and ProjectRepository."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._repo = SupportRepository(db)
        self._project_repo = ProjectRepository(db)

    async def list_my_tickets(self, customer_id: int) -> list[Ticket]:
        """List tickets for customer."""
        return await self._repo.list_tickets_by_customer_id(customer_id)

    async def get_my_ticket(self, ticket_id: int, customer_id: int) -> Ticket | None:
        """Get ticket by id if owned by customer."""
        return await self._repo.get_ticket_by_id_and_customer(ticket_id, customer_id)

    async def create_ticket(self, body: TicketCreate, customer_id: int) -> Ticket:
        """Create ticket. Raises ValueError if project_id given and not owned by customer."""
        project_id = body.project_id
        if project_id is not None:
            project = await self._project_repo.get_by_id_and_customer(
                project_id, customer_id
            )
            if not project:
                raise ValueError("Project not found or not yours")
        category = (body.category or "suporte").strip() or "suporte"
        t = Ticket(
            customer_id=customer_id,
            subject=body.subject,
            status="open",
            category=category,
            project_id=project_id,
        )
        self._repo.add_ticket(t)
        await self._repo.flush_and_refresh_ticket(t)
        return t

    async def list_ticket_messages(
        self, ticket_id: int, customer_id: int
    ) -> list[TicketMessage] | None:
        """List messages for ticket. Returns None if ticket not found or not owned by customer."""
        t = await self._repo.get_ticket_by_id_and_customer(ticket_id, customer_id)
        if not t:
            return None
        return await self._repo.list_messages_by_ticket_id(ticket_id)

    async def add_ticket_message(
        self, ticket_id: int, customer_id: int, body: str
    ) -> TicketMessage | None:
        """Add message to ticket as customer. Returns None if ticket not found or not owned."""
        t = await self._repo.get_ticket_by_id_and_customer(ticket_id, customer_id)
        if not t:
            return None
        msg = TicketMessage(
            ticket_id=ticket_id,
            author_type="customer",
            body=body,
        )
        self._repo.add_message(msg)
        await self._repo.flush_and_refresh_message(msg)
        return msg
