"""Support workspace service: tickets CRUD via repository."""

from typing import TYPE_CHECKING

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.support.models import Ticket, TicketMessage
from app.modules.support.schemas import TicketCreate, TicketMessageCreate
from app.repositories.customer_repository import CustomerRepository
from app.repositories.support_repository import SupportRepository

if TYPE_CHECKING:
    from fastapi import BackgroundTasks


class SupportWorkspaceService:
    """Workspace support: tickets and messages. Uses SupportRepository and CustomerRepository."""

    def __init__(
        self,
        db: AsyncSession,
        support_repo: SupportRepository,
        customer_repo: CustomerRepository,
    ) -> None:
        self._db = db
        self._repo = support_repo
        self._customer_repo = customer_repo

    async def list_tickets(
        self,
        category: str | None = None,
        project_id: int | None = None,
    ) -> list[Ticket]:
        return await self._repo.list_tickets(category=category, project_id=project_id)

    async def get_ticket(self, ticket_id: int) -> Ticket | None:
        return await self._repo.get_ticket_by_id(ticket_id)

    async def create_ticket(
        self,
        body: TicketCreate,
        org_id: str,
        background_tasks: "BackgroundTasks",
    ) -> Ticket:
        if body.customer_id is None:
            raise ValueError("customer_id required")
        category = (body.category or "suporte").strip() or "suporte"
        t = Ticket(
            customer_id=body.customer_id,
            subject=body.subject,
            status="open",
            category=category,
            project_id=body.project_id,
        )
        self._repo.add_ticket(t)
        await self._repo.flush_and_refresh_ticket(t)

        from app.modules.notifications.service import (
            create_notification_and_maybe_send_email,
        )

        customer = await self._customer_repo.get_by_id_with_users(body.customer_id)
        cu = await self._customer_repo.get_customer_user_by_customer_id(
            body.customer_id
        )
        recipient = (customer.email if customer else None) or (cu.email if cu else None)
        if recipient:
            await create_notification_and_maybe_send_email(
                self._db,
                background_tasks,
                customer_user_id=cu.id if cu else None,
                channel="in_app,email",
                title="New ticket",
                body=f"Ticket: {t.subject}",
                recipient_email=recipient,
                org_id=org_id,
            )
        return t

    async def add_ticket_message(
        self, ticket_id: int, body: TicketMessageCreate
    ) -> TicketMessage | None:
        t = await self._repo.get_ticket_by_id(ticket_id)
        if not t:
            return None
        msg = TicketMessage(
            ticket_id=ticket_id,
            author_type="staff",
            body=body.body,
        )
        self._repo.add_message(msg)
        await self._repo.flush_and_refresh_message(msg)
        return msg
