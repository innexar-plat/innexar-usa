"""Portal requests service: new-project, site-briefing, site-briefing/upload."""

import uuid
from pathlib import Path
from typing import Any

from fastapi import UploadFile

from app.models.customer_user import CustomerUser
from app.models.project_request import ProjectRequest
from app.modules.support.models import Ticket, TicketMessage
from app.repositories.feature_flag_repository import FeatureFlagRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.project_request_repository import ProjectRequestRepository
from app.repositories.support_repository import SupportRepository

from .schemas import (
    NewProjectRequest,
    NewProjectResponse,
    SiteBriefingRequest,
    SiteBriefingResponse,
)


def _build_briefing_description_and_meta(
    company: str,
    services: str | None,
    city: str | None,
    whatsapp: str | None,
    domain: str | None,
    logo_url: str | None,
    colors: str | None,
    photos: str | None,
    description: str | None,
) -> tuple[str, dict[str, Any]]:
    """Build description text and meta dict from briefing fields."""
    description_parts = [
        f"Empresa: {company}",
        services and f"Serviços: {services}",
        city and f"Cidade: {city}",
        whatsapp and f"WhatsApp: {whatsapp}",
        domain and f"Domínio: {domain}",
        logo_url and f"Logo: {logo_url}",
        colors and f"Cores: {colors}",
        photos and f"Fotos: {photos}",
        description and f"Briefing completo:\n{description.strip()}",
    ]
    full_description = "\n".join(p for p in description_parts if p)
    meta: dict[str, Any] = {
        "company_name": company,
        "services": services,
        "city": city,
        "whatsapp": whatsapp,
        "domain": domain,
        "logo_url": logo_url,
        "colors": colors,
        "photos": photos,
        "full_briefing": description.strip() if description else None,
    }
    return full_description, meta


class PortalRequestsService:
    """Service for portal new-project and site-briefing flows."""

    def __init__(
        self,
        project_request_repo: ProjectRequestRepository,
        project_repo: ProjectRepository,
        feature_flag_repo: FeatureFlagRepository,
        support_repo: SupportRepository,
    ) -> None:
        self._request_repo = project_request_repo
        self._project_repo = project_repo
        self._ff = feature_flag_repo
        self._support = support_repo

    async def create_new_project(
        self, body: NewProjectRequest, current: CustomerUser
    ) -> NewProjectResponse:
        """Create a new project request (no briefing)."""
        req = ProjectRequest(
            customer_id=current.customer_id,
            project_name=body.project_name.strip(),
            project_type=body.project_type.strip(),
            description=body.description.strip() if body.description else None,
            budget=body.budget.strip() if body.budget else None,
            timeline=body.timeline.strip() if body.timeline else None,
            status="pending",
        )
        self._request_repo.add(req)
        await self._request_repo.flush_and_refresh(req)
        return NewProjectResponse(
            id=req.id,
            message="Solicitação enviada. Nossa equipe entrará em contato.",
        )

    async def submit_site_briefing(
        self, body: SiteBriefingRequest, current: CustomerUser
    ) -> SiteBriefingResponse:
        """Submit site briefing; link to project aguardando_briefing if any; create ticket if enabled."""
        company = body.company_name.strip() or "Sem nome"
        description, meta = _build_briefing_description_and_meta(
            company,
            body.services,
            body.city,
            body.whatsapp,
            body.domain,
            body.logo_url,
            body.colors,
            body.photos,
            body.description,
        )

        project_to_link = (
            await self._project_repo.get_first_aguardando_briefing_without_briefing(
                current.customer_id
            )
        )
        linked_project_id: int | None = project_to_link.id if project_to_link else None

        req = ProjectRequest(
            customer_id=current.customer_id,
            project_id=linked_project_id,
            project_name=company,
            project_type="site",
            description=description,
            status="pending",
            meta=meta,
        )
        self._request_repo.add(req)
        await self._request_repo.flush_and_refresh(req)

        if linked_project_id is not None and project_to_link:
            project_to_link.status = "briefing_recebido"
            await self._project_repo.flush_and_refresh(project_to_link)

        ticket_id = await self._create_briefing_ticket_if_enabled(
            current.customer_id, company, description, linked_project_id
        )

        return SiteBriefingResponse(
            id=req.id,
            project_id=linked_project_id or req.id,
            ticket_id=ticket_id,
            message="Dados do site enviados. Nossa equipe entrará em contato.",
        )

    async def submit_site_briefing_with_uploads(
        self,
        company_name: str,
        services: str | None,
        city: str | None,
        whatsapp: str | None,
        domain: str | None,
        logo_url: str | None,
        colors: str | None,
        photos: str | None,
        description: str | None,
        files: list[UploadFile],
        current: CustomerUser,
    ) -> SiteBriefingResponse:
        """Submit site briefing with optional file uploads (multipart)."""
        from fastapi import HTTPException

        from app.core.storage.loader import get_storage_backend

        company = (company_name or "").strip() or "Sem nome"
        full_description, meta = _build_briefing_description_and_meta(
            company,
            services,
            city,
            whatsapp,
            domain,
            logo_url,
            colors,
            photos,
            description,
        )

        project_to_link = (
            await self._project_repo.get_first_aguardando_briefing_without_briefing(
                current.customer_id
            )
        )
        linked_project_id: int | None = project_to_link.id if project_to_link else None

        prefix_project_id = linked_project_id if linked_project_id is not None else 0
        stored_files: list[str] = []
        storage = get_storage_backend()
        for upload in files or []:
            if not (upload.filename or "").strip():
                continue
            content = await upload.read()
            if len(content) > 50 * 1024 * 1024:
                raise HTTPException(
                    status_code=413, detail="Arquivo muito grande (máx. 50MB)"
                )
            if len(content) == 0:
                continue
            safe_name = Path(upload.filename or "file").name or "file"
            path_key = f"briefings/{prefix_project_id}/{uuid.uuid4().hex}_{safe_name}"
            await storage.put(path_key, content, content_type=upload.content_type)
            stored_files.append(path_key)
        if stored_files:
            meta["briefing_file_keys"] = stored_files

        req = ProjectRequest(
            customer_id=current.customer_id,
            project_id=linked_project_id,
            project_name=company,
            project_type="site",
            description=full_description,
            status="pending",
            meta=meta,
        )
        self._request_repo.add(req)
        await self._request_repo.flush_and_refresh(req)

        if linked_project_id is not None and project_to_link:
            project_to_link.status = "briefing_recebido"
            await self._project_repo.flush_and_refresh(project_to_link)

        ticket_id = await self._create_briefing_ticket_if_enabled(
            current.customer_id, company, full_description, linked_project_id
        )

        return SiteBriefingResponse(
            id=req.id,
            project_id=linked_project_id or req.id,
            ticket_id=ticket_id,
            message="Dados do site enviados. Nossa equipe entrará em contato.",
        )

    async def _create_briefing_ticket_if_enabled(
        self,
        customer_id: int,
        company: str,
        description: str,
        project_id: int | None,
    ) -> int | None:
        """Create ticket + first message if portal.tickets.enabled; return ticket_id or None."""
        tickets_enabled = await self._ff.is_enabled("portal.tickets.enabled")
        if not tickets_enabled:
            return None
        t = Ticket(
            customer_id=customer_id,
            subject=f"Novo site - {company}",
            status="open",
            category="novo_projeto",
            project_id=project_id,
        )
        self._support.add_ticket(t)
        await self._support.flush_and_refresh_ticket(t)
        msg = TicketMessage(
            ticket_id=t.id,
            author_type="customer",
            body=description,
        )
        self._support.add_message(msg)
        await self._support.flush_and_refresh_message(msg)
        return t.id
