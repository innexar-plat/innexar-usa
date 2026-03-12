"""Portal dashboard service: /me/features, /me/project-aguardando-briefing, /me/dashboard."""

from app.models.customer_user import CustomerUser
from app.modules.billing.enums import InvoiceStatus, SubscriptionStatus
from app.modules.billing.models import PricePlan, Product, Subscription
from app.repositories.billing_repository import BillingRepository
from app.repositories.feature_flag_repository import FeatureFlagRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.project_file_repository import ProjectFileRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.support_repository import SupportRepository

from .schemas import (
    MeDashboardDiagnosticItem,
    MeDashboardFlagsResponse,
    MeDashboardInvoiceItem,
    MeDashboardMessagesItem,
    MeDashboardPanelItem,
    MeDashboardPlanItem,
    MeDashboardProductSummaryItem,
    MeDashboardResponse,
    MeDashboardSiteItem,
    MeDashboardSupportItem,
    ProjectAguardandoBriefingResponse,
    ProjectListItem,
)


class PortalDashboardService:
    """Service for portal /me features, project aguardando briefing, and dashboard."""

    def __init__(
        self,
        feature_flag_repo: FeatureFlagRepository,
        billing_repo: BillingRepository,
        support_repo: SupportRepository,
        notification_repo: NotificationRepository,
        project_repo: ProjectRepository,
        project_file_repo: ProjectFileRepository,
    ) -> None:
        self._ff = feature_flag_repo
        self._billing = billing_repo
        self._support = support_repo
        self._notification = notification_repo
        self._project = project_repo
        self._project_file = project_file_repo

    async def get_features(self) -> MeDashboardFlagsResponse:
        """Feature flags for menu visibility (invoices, tickets, projects)."""
        invoices = await self._ff.is_enabled(
            "billing.enabled"
        ) or await self._ff.is_enabled("portal.invoices.enabled")
        tickets = await self._ff.is_enabled("portal.tickets.enabled")
        projects = await self._ff.is_enabled("portal.projects.enabled")
        return MeDashboardFlagsResponse(
            invoices=invoices,
            tickets=tickets,
            projects=projects,
        )

    async def get_project_aguardando_briefing(
        self, current: CustomerUser
    ) -> ProjectAguardandoBriefingResponse | None:
        """One project aguardando_briefing with no linked briefing yet."""
        p = await self._project.get_first_aguardando_briefing_without_briefing(
            current.customer_id
        )
        if not p:
            return None
        return ProjectAguardandoBriefingResponse(id=p.id, name=p.name, status=p.status)

    async def get_dashboard(self, current: CustomerUser) -> MeDashboardResponse:
        """Dashboard for client (plan, site, invoice, support, messages, projects)."""
        customer_id = current.customer_id
        plan: MeDashboardPlanItem | None = None
        site: MeDashboardSiteItem | None = None
        invoice: MeDashboardInvoiceItem | None = None
        can_pay_invoice = False
        panel: MeDashboardPanelItem | None = None

        sub_rows = await self._billing.list_subscriptions_with_product_plan(customer_id)
        chosen_sub: tuple[Subscription, Product, PricePlan] | None = None
        for sub_row in sub_rows:
            sub, _product, _price_plan = sub_row
            rec = await self._billing.get_hestia_provisioning_for_subscription(sub.id)
            has_hestia = rec is not None
            if has_hestia and sub.status == SubscriptionStatus.ACTIVE.value:
                chosen_sub = sub_row
                break
        if chosen_sub is None and sub_rows:
            for sub_row in sub_rows:
                sub, _, _ = sub_row
                rec = await self._billing.get_hestia_provisioning_for_subscription(
                    sub.id
                )
                if rec is not None:
                    chosen_sub = sub_row
                    break
        if chosen_sub is None and sub_rows:
            chosen_sub = sub_rows[0]

        if chosen_sub:
            sub, product, price_plan = chosen_sub
            plan = MeDashboardPlanItem(
                status=sub.status,
                product_name=product.name,
                price_plan_name=price_plan.name,
                since=sub.start_date.isoformat() if sub.start_date else None,
                next_due_date=(
                    sub.next_due_date.isoformat()
                    if getattr(sub, "next_due_date", None)
                    else None
                ),
            )
            inv = await self._billing.get_last_invoice_for_subscription(sub.id)
            if inv:
                invoice = MeDashboardInvoiceItem(
                    id=inv.id,
                    status=inv.status,
                    due_date=inv.due_date.isoformat() if inv.due_date else None,
                    total=float(inv.total),
                    currency=inv.currency,
                )
                can_pay_invoice = inv.status == InvoiceStatus.PENDING.value
            rec = await self._billing.get_hestia_provisioning_for_subscription(sub.id)
            if rec:
                site = MeDashboardSiteItem(
                    url=rec.site_url,
                    status=rec.status,
                    domain=rec.domain,
                )
                panel = MeDashboardPanelItem(
                    login=rec.panel_login or "",
                    panel_url=rec.panel_url,
                    password_hint="••••••" if rec.panel_password_encrypted else None,
                )

        if invoice is None:
            inv_standalone = await self._billing.get_last_invoice_for_customer(
                customer_id
            )
            if inv_standalone:
                invoice = MeDashboardInvoiceItem(
                    id=inv_standalone.id,
                    status=inv_standalone.status,
                    due_date=(
                        inv_standalone.due_date.isoformat()
                        if inv_standalone.due_date
                        else None
                    ),
                    total=float(inv_standalone.total),
                    currency=inv_standalone.currency,
                )
                can_pay_invoice = inv_standalone.status == InvoiceStatus.PENDING.value

        tickets_open_count = await self._support.get_open_ticket_count_for_customer(
            customer_id
        )
        unread_count = await self._notification.get_unread_count(current.id)

        projects_rows = await self._project.list_by_customer_id(customer_id)
        project_ids = [p.id for p in projects_rows]
        files_by_project = await self._project_file.count_by_project_ids(project_ids)
        projects_aguardando_briefing: list[ProjectListItem] = []
        projects_summary: list[ProjectListItem] = []
        for p in projects_rows:
            files_count = files_by_project.get(p.id, 0)
            item = ProjectListItem(
                id=p.id,
                name=p.name,
                status=p.status,
                created_at=p.created_at.isoformat() if p.created_at else None,
                has_files=files_count > 0,
                files_count=files_count,
            )
            projects_summary.append(item)
            if p.status == "aguardando_briefing":
                projects_aguardando_briefing.append(item)

        products = await self._billing.list_active_products_for_customer(customer_id)
        products_summary: list[MeDashboardProductSummaryItem] = []
        has_site_delivery_product = False
        for product in products:
            prov_type = (product.provisioning_type or "").strip() or None
            products_summary.append(
                MeDashboardProductSummaryItem(
                    product_name=product.name,
                    provisioning_type=prov_type,
                )
            )
            if (prov_type or "").lower() == "site_delivery":
                has_site_delivery_product = True
        show_briefing = (
            has_site_delivery_product and len(projects_aguardando_briefing) > 0
        )
        show_panel = panel is not None
        nav_show_projects = has_site_delivery_product
        nav_show_hosting = has_site_delivery_product

        diagnostic: MeDashboardDiagnosticItem | None = None
        if plan is None and len(sub_rows) == 0:
            diagnostic = MeDashboardDiagnosticItem(
                customer_id=customer_id,
                subscriptions_count=0,
                message="Nenhuma assinatura no banco para este cliente. Rode o seed no mesmo ambiente (API/DB) que o portal usa.",
            )
        elif plan is None and len(sub_rows) > 0:
            diagnostic = MeDashboardDiagnosticItem(
                customer_id=customer_id,
                subscriptions_count=len(sub_rows),
                message="Cliente tem assinaturas mas nenhuma com Hestia escolhida para exibir plano/site.",
            )

        return MeDashboardResponse(
            plan=plan,
            site=site,
            invoice=invoice,
            can_pay_invoice=can_pay_invoice,
            panel=panel,
            support=MeDashboardSupportItem(tickets_open_count=tickets_open_count),
            messages=MeDashboardMessagesItem(unread_count=unread_count),
            projects=projects_summary,
            projects_aguardando_briefing=projects_aguardando_briefing,
            show_briefing=show_briefing,
            show_panel=show_panel,
            products_summary=products_summary,
            nav_show_projects=nav_show_projects,
            nav_show_hosting=nav_show_hosting,
            requires_password_change=current.requires_password_change,
            diagnostic=diagnostic,
        )
