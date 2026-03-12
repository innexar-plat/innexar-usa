"""Pydantic schemas for portal API (customer-only routes)."""

from typing import Any

from pydantic import BaseModel

# ----- Response schemas (padronização: retorno Pydantic em vez de dict) -----


class MessageResponse(BaseModel):
    """Portal: message-only response (e.g. change-password, set-password)."""

    message: str


class MeDashboardFlagsResponse(BaseModel):
    """Portal: GET /me/feature-flags."""

    invoices: bool
    tickets: bool
    projects: bool


class ProjectAguardandoBriefingResponse(BaseModel):
    """Portal: one project aguardando_briefing."""

    id: int
    name: str
    status: str


class PortalMessageItem(BaseModel):
    """Portal: message in project thread."""

    id: int
    sender_type: str
    sender_name: str
    body: str
    created_at: str | None = None


class PortalMessageItemWithAttachment(BaseModel):
    """Portal: message with optional attachment (list or upload response)."""

    id: int
    sender_type: str
    sender_name: str
    body: str
    attachment_key: str | None = None
    attachment_name: str | None = None
    created_at: str | None = None


class ModificationRequestItemResponse(BaseModel):
    """Portal: one modification request in list."""

    id: int
    title: str
    description: str | None
    status: str
    staff_notes: str | None
    attachment_name: str | None
    created_at: str | None


class ModificationRequestsResponse(BaseModel):
    """Portal: list modification requests + quota."""

    items: list[ModificationRequestItemResponse]
    monthly_limit: int
    used_this_month: int
    remaining: int


class NewProjectResponse(BaseModel):
    """Portal: POST /new-project."""

    id: int
    message: str


class SiteBriefingResponse(BaseModel):
    """Portal: POST /site-briefing or /site-briefing/upload."""

    id: int
    project_id: int
    ticket_id: int | None
    message: str


class ProjectListItem(BaseModel):
    """Portal: project in list GET /projects."""

    id: int
    name: str
    status: str
    created_at: str | None = None
    has_files: bool
    files_count: int


# ----- GET /me/dashboard (nested response) -----


class MeDashboardPlanItem(BaseModel):
    """Dashboard: current plan summary."""

    status: str
    product_name: str
    price_plan_name: str
    since: str | None = None
    next_due_date: str | None = None


class MeDashboardInvoiceItem(BaseModel):
    """Dashboard: invoice summary."""

    id: int
    status: str
    due_date: str | None = None
    total: float
    currency: str


class MeDashboardSiteItem(BaseModel):
    """Dashboard: site/hosting summary."""

    url: str
    status: str
    domain: str | None = None


class MeDashboardPanelItem(BaseModel):
    """Dashboard: panel access summary."""

    login: str
    panel_url: str | None = None
    password_hint: str | None = None


class MeDashboardSupportItem(BaseModel):
    """Dashboard: support summary."""

    tickets_open_count: int


class MeDashboardMessagesItem(BaseModel):
    """Dashboard: messages summary."""

    unread_count: int


class MeDashboardProductSummaryItem(BaseModel):
    """Dashboard: product summary line."""

    product_name: str
    provisioning_type: str | None = None


class MeDashboardDiagnosticItem(BaseModel):
    """Dashboard: optional diagnostic (no plan found)."""

    customer_id: int
    subscriptions_count: int
    message: str


class MeDashboardResponse(BaseModel):
    """Portal: GET /me/dashboard response."""

    plan: MeDashboardPlanItem | None = None
    site: MeDashboardSiteItem | None = None
    invoice: MeDashboardInvoiceItem | None = None
    can_pay_invoice: bool = False
    panel: MeDashboardPanelItem | None = None
    support: MeDashboardSupportItem
    messages: MeDashboardMessagesItem
    projects: list[ProjectListItem]
    projects_aguardando_briefing: list[ProjectListItem]
    show_briefing: bool = False
    show_panel: bool = False
    products_summary: list[MeDashboardProductSummaryItem]
    nav_show_projects: bool = False
    nav_show_hosting: bool = False
    requires_password_change: bool = False
    diagnostic: MeDashboardDiagnosticItem | None = None


class FileUploadResponse(BaseModel):
    """Portal: uploaded file metadata."""

    id: int
    filename: str
    content_type: str | None
    size: int
    created_at: str | None = None


class ProjectFileItem(BaseModel):
    """Portal: file in list."""

    id: int
    filename: str
    content_type: str | None
    size: int
    created_at: str | None = None


class ModificationRequestCreateResponse(BaseModel):
    """Portal: POST /projects/{id}/modification-requests."""

    id: int
    title: str
    description: str
    status: str
    attachment_name: str | None
    remaining: int
    created_at: str | None = None


class NewProjectRequest(BaseModel):
    """Body for POST /new-project (portal)."""

    project_name: str
    project_type: str
    description: str | None = None
    budget: str | None = None
    timeline: str | None = None


class SiteBriefingRequest(BaseModel):
    """Body for POST /site-briefing (portal): dados do site para criar projeto + ticket."""

    company_name: str
    services: str | None = None
    city: str | None = None
    whatsapp: str | None = None
    domain: str | None = None
    logo_url: str | None = None
    colors: str | None = None
    photos: str | None = None
    description: str | None = None


class ProfileRead(BaseModel):
    """Portal customer profile (GET /me/profile)."""

    name: str
    email: str
    phone: str | None
    address: dict[str, Any] | None


class SetPasswordRequest(BaseModel):
    """Portal: set permanent password for the first time."""

    new_password: str


class ProfileUpdate(BaseModel):
    """Body for PATCH /me/profile (name, phone, address only; email read-only)."""

    name: str | None = None
    phone: str | None = None
    address: dict[str, Any] | None = None


class SendMessageRequest(BaseModel):
    """Body for POST /projects/{id}/messages."""

    body: str
