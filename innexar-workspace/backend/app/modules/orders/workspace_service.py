"""Workspace orders and briefings. Uses BillingRepository, ProjectRepository, ProjectRequestRepository."""

from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project_request import ProjectRequest
from app.modules.orders.schemas import BriefingDetail, BriefingItem, OrderItem
from app.repositories.billing_repository import BillingRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.project_request_repository import ProjectRequestRepository


def _format_briefing_as_text(pr: ProjectRequest, customer_name: str) -> str:
    """Format briefing as plain text for download."""
    lines = [
        f"Briefing #{pr.id}",
        f"Cliente: {customer_name}",
        f"Projeto: {pr.project_name}",
        f"Tipo: {pr.project_type}",
        f"Status: {pr.status}",
        f"Data: {pr.created_at.isoformat() if pr.created_at else ''}",
        "",
        "--- Descrição ---",
        pr.description or "(vazio)",
        "",
    ]
    if pr.budget:
        lines.append(f"Orçamento: {pr.budget}\n")
    if pr.timeline:
        lines.append(f"Prazo: {pr.timeline}\n")
    if pr.meta and isinstance(pr.meta, dict):
        lines.append("--- Dados do briefing (meta) ---")
        for k, v in pr.meta.items():
            if v is not None and v != "":
                lines.append(f"{k}: {v}")
    return "\n".join(lines)


class OrderWorkspaceService:
    """Workspace orders and briefings. Depends on billing, project, project_request repos."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._billing_repo = BillingRepository(db)
        self._project_repo = ProjectRepository(db)
        self._request_repo = ProjectRequestRepository(db)

    async def list_orders(self) -> list[OrderItem]:
        """List paid site_delivery orders with project when exists."""
        rows = await self._billing_repo.list_paid_site_delivery_orders()
        if not rows:
            return []
        sub_ids = [sub_id for _, _, _, sub_id in rows]
        projects_map = await self._project_repo.list_by_subscription_ids(sub_ids)
        out: list[OrderItem] = []
        for inv, customer_name, product_name, sub_id in rows:
            proj = projects_map.get(sub_id)
            project_id: int | None = proj.id if proj else None
            project_status: str | None = proj.status if proj else None
            status = project_status or "aguardando_briefing"
            out.append(
                OrderItem(
                    invoice_id=inv.id,
                    customer_id=inv.customer_id,
                    customer_name=customer_name or "",
                    product_name=product_name or "",
                    subscription_id=sub_id,
                    project_id=project_id,
                    project_status=project_status,
                    status=status,
                    total=float(inv.total),
                    currency=inv.currency or "BRL",
                    paid_at=inv.paid_at,
                    created_at=inv.created_at,
                )
            )
        return out

    async def list_briefings(self, project_id: int | None = None) -> list[BriefingItem]:
        """List briefings with customer name. Optional filter by project_id."""
        rows = await self._request_repo.list_with_customer_name(project_id=project_id)
        return [
            BriefingItem(
                id=pr.id,
                customer_id=pr.customer_id,
                customer_name=customer_name,
                project_id=pr.project_id,
                project_name=pr.project_name,
                project_type=pr.project_type,
                description=pr.description,
                status=pr.status,
                created_at=pr.created_at,
            )
            for pr, customer_name in rows
        ]

    async def get_briefing(self, briefing_id: int) -> BriefingDetail | None:
        """Get full briefing by id. Returns None if not found."""
        row = await self._request_repo.get_by_id_with_customer_name(briefing_id)
        if not row:
            return None
        pr, customer_name = row
        return BriefingDetail(
            id=pr.id,
            customer_id=pr.customer_id,
            customer_name=customer_name,
            project_id=pr.project_id,
            project_name=pr.project_name,
            project_type=pr.project_type,
            description=pr.description,
            status=pr.status,
            created_at=pr.created_at,
            meta=pr.meta,
            budget=pr.budget,
            timeline=pr.timeline,
        )

    async def get_briefing_row(
        self, briefing_id: int
    ) -> tuple[ProjectRequest, str] | None:
        """Get briefing and customer name for download. Returns None if not found."""
        return await self._request_repo.get_by_id_with_customer_name(briefing_id)

    def download_briefing_as_response(
        self, pr: ProjectRequest, customer_name: str
    ) -> Response:
        """Build plain-text file response for briefing download."""
        safe_name = "".join(
            c if c.isalnum() or c in " -_" else "_"
            for c in (pr.project_name or "briefing")
        )
        filename = f"briefing-{pr.id}-{safe_name}.txt"
        content = _format_briefing_as_text(pr, customer_name)
        return Response(
            content=content.encode("utf-8"),
            media_type="text/plain; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
