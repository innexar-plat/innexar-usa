"""Billing-related repository: CRUD for products, plans, subscriptions, invoices; cascade delete."""

from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.customer import Customer
from app.modules.billing.models import (
    Invoice,
    MPSubscriptionCheckout,
    PaymentAttempt,
    PricePlan,
    Product,
    ProvisioningJob,
    ProvisioningRecord,
    Subscription,
    WebhookEvent,
)


class BillingRepository:
    """Repository for billing entities. Cascade delete by customer; CRUD for workspace."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    # ----- Products -----
    async def list_products(self, order_by_id: bool = True) -> list[Product]:
        q = select(Product)
        if order_by_id:
            q = q.order_by(Product.id)
        r = await self._db.execute(q)
        return list(r.scalars().all())

    async def get_product_by_id(self, product_id: int) -> Product | None:
        r = await self._db.execute(select(Product).where(Product.id == product_id))
        return r.scalar_one_or_none()

    async def list_products_with_plans(
        self,
        org_id: str = "innexar",
        is_active: bool | None = True,
        order_by_id: bool = True,
    ) -> list[Product]:
        """List products with price_plans relation loaded."""
        q = (
            select(Product)
            .options(selectinload(Product.price_plans))
            .where(Product.org_id == org_id)
        )
        if is_active is not None:
            q = q.where(Product.is_active.is_(is_active))
        if order_by_id:
            q = q.order_by(Product.id)
        r = await self._db.execute(q)
        return list(r.scalars().unique().all())

    async def list_products_and_plans_by_filter(
        self,
        org_id: str = "innexar",
        product_names: tuple[str, ...] | None = None,
        plan_interval: str | None = "month",
        plan_currency: str | None = None,
    ) -> list[tuple[Product, PricePlan]]:
        """List Product+PricePlan rows (join). Filter by product names, plan interval/currency."""
        q = (
            select(Product, PricePlan)
            .join(PricePlan, PricePlan.product_id == Product.id)
            .where(Product.org_id == org_id, Product.is_active.is_(True))
            .order_by(Product.id)
        )
        if product_names:
            q = q.where(Product.name.in_(product_names))
        if plan_interval is not None:
            q = q.where(PricePlan.interval == plan_interval)
        if plan_currency is not None:
            q = q.where(PricePlan.currency == plan_currency)
        r = await self._db.execute(q)
        return list(r.all())

    def add_product(self, product: Product) -> None:
        self._db.add(product)

    async def update_product(self, product: Product) -> None:
        await self._db.flush()
        await self._db.refresh(product)

    # ----- Price plans -----
    async def list_price_plans(
        self, product_id: int | None = None, order_by_id: bool = True
    ) -> list[PricePlan]:
        q = select(PricePlan)
        if product_id is not None:
            q = q.where(PricePlan.product_id == product_id)
        if order_by_id:
            q = q.order_by(PricePlan.id)
        r = await self._db.execute(q)
        return list(r.scalars().all())

    async def get_price_plan_by_id(self, plan_id: int) -> PricePlan | None:
        r = await self._db.execute(select(PricePlan).where(PricePlan.id == plan_id))
        return r.scalar_one_or_none()

    def add_price_plan(self, plan: PricePlan) -> None:
        self._db.add(plan)

    async def update_price_plan(self, plan: PricePlan) -> None:
        await self._db.flush()
        await self._db.refresh(plan)

    # ----- Subscriptions -----
    async def list_subscriptions(
        self, customer_id: int | None = None, order_desc: bool = True
    ) -> list[Subscription]:
        q = select(Subscription)
        if customer_id is not None:
            q = q.where(Subscription.customer_id == customer_id)
        if order_desc:
            q = q.order_by(Subscription.id.desc())
        r = await self._db.execute(q)
        return list(r.scalars().all())

    async def get_subscription_by_id(self, subscription_id: int) -> Subscription | None:
        r = await self._db.execute(
            select(Subscription).where(Subscription.id == subscription_id).limit(1)
        )
        return r.scalar_one_or_none()

    def add_subscription(self, sub: Subscription) -> None:
        self._db.add(sub)

    async def update_subscription(self, sub: Subscription) -> None:
        await self._db.flush()
        await self._db.refresh(sub)

    async def list_subscriptions_with_product_plan(
        self, customer_id: int, order_desc: bool = True
    ) -> list[tuple[Subscription, Product, PricePlan]]:
        """List subscriptions with Product and PricePlan joined (portal dashboard)."""
        q = (
            select(Subscription, Product, PricePlan)
            .join(Product, Subscription.product_id == Product.id)
            .join(PricePlan, Subscription.price_plan_id == PricePlan.id)
            .where(Subscription.customer_id == customer_id)
        )
        if order_desc:
            q = q.order_by(Subscription.id.desc())
        r = await self._db.execute(q)
        return list(r.all())

    async def get_last_invoice_for_subscription(
        self, subscription_id: int
    ) -> Invoice | None:
        """Latest invoice for subscription (portal dashboard)."""
        r = await self._db.execute(
            select(Invoice)
            .where(Invoice.subscription_id == subscription_id)
            .order_by(Invoice.id.desc())
            .limit(1)
        )
        return r.scalar_one_or_none()

    async def get_last_invoice_for_customer(self, customer_id: int) -> Invoice | None:
        """Latest invoice for customer (portal dashboard fallback)."""
        r = await self._db.execute(
            select(Invoice)
            .where(Invoice.customer_id == customer_id)
            .order_by(Invoice.id.desc())
            .limit(1)
        )
        return r.scalar_one_or_none()

    async def get_hestia_provisioning_for_subscription(
        self, subscription_id: int
    ) -> ProvisioningRecord | None:
        """Latest Hestia provisioning record for subscription (portal dashboard)."""
        r = await self._db.execute(
            select(ProvisioningRecord)
            .where(
                ProvisioningRecord.subscription_id == subscription_id,
                ProvisioningRecord.provider == "hestia",
            )
            .order_by(ProvisioningRecord.id.desc())
            .limit(1)
        )
        return r.scalar_one_or_none()

    async def list_active_products_for_customer(
        self, customer_id: int
    ) -> list[Product]:
        """Products from active subscriptions for customer (portal dashboard)."""
        from app.modules.billing.enums import SubscriptionStatus

        r = await self._db.execute(
            select(Product)
            .join(Subscription, Subscription.product_id == Product.id)
            .where(
                Subscription.customer_id == customer_id,
                Subscription.status == SubscriptionStatus.ACTIVE.value,
            )
        )
        return list(r.scalars().unique().all())

    def add_provisioning_record(self, rec: ProvisioningRecord) -> None:
        self._db.add(rec)

    async def refresh_provisioning_record(self, rec: ProvisioningRecord) -> None:
        await self._db.flush()
        await self._db.refresh(rec)

    # ----- Invoices -----
    async def list_invoices(
        self,
        customer_id: int | None = None,
        status: str | None = None,
        order_desc: bool = True,
    ) -> list[Invoice]:
        q = select(Invoice)
        if customer_id is not None:
            q = q.where(Invoice.customer_id == customer_id)
        if status is not None:
            q = q.where(Invoice.status == status)
        if order_desc:
            q = q.order_by(Invoice.id.desc())
        r = await self._db.execute(q)
        return list(r.scalars().all())

    async def get_invoice_by_id(self, invoice_id: int) -> Invoice | None:
        r = await self._db.execute(select(Invoice).where(Invoice.id == invoice_id))
        return r.scalar_one_or_none()

    def add_invoice(self, invoice: Invoice) -> None:
        """Add invoice to session (caller must flush/commit)."""
        self._db.add(invoice)

    async def get_invoice_by_id_and_customer(
        self, invoice_id: int, customer_id: int
    ) -> Invoice | None:
        """Get invoice by id scoped to customer (portal)."""
        r = await self._db.execute(
            select(Invoice)
            .where(
                Invoice.id == invoice_id,
                Invoice.customer_id == customer_id,
            )
            .limit(1)
        )
        return r.scalar_one_or_none()

    async def get_latest_payment_attempt_by_invoice_id(
        self, invoice_id: int
    ) -> PaymentAttempt | None:
        """Latest payment attempt for invoice (for portal pay response)."""
        r = await self._db.execute(
            select(PaymentAttempt)
            .where(PaymentAttempt.invoice_id == invoice_id)
            .order_by(PaymentAttempt.id.desc())
            .limit(1)
        )
        return r.scalar_one_or_none()

    async def get_invoice_for_subscription(
        self, invoice_id: int, subscription_id: int
    ) -> Invoice | None:
        r = await self._db.execute(
            select(Invoice)
            .where(
                Invoice.id == invoice_id,
                Invoice.subscription_id == subscription_id,
            )
            .limit(1)
        )
        return r.scalar_one_or_none()

    # ----- Dashboard aggregates -----
    async def get_dashboard_invoice_summary(
        self,
    ) -> tuple[int, int, int, float]:
        """Returns (total, pending_count, paid_count, total_paid_amount)."""
        from app.modules.billing.enums import InvoiceStatus

        r = await self._db.execute(select(func.count()).select_from(Invoice))
        total = r.scalar() or 0
        r = await self._db.execute(
            select(func.count())
            .select_from(Invoice)
            .where(Invoice.status == InvoiceStatus.PENDING.value)
        )
        pending = r.scalar() or 0
        r = await self._db.execute(
            select(func.count())
            .select_from(Invoice)
            .where(Invoice.status == InvoiceStatus.PAID.value)
        )
        paid_count = r.scalar() or 0
        r = await self._db.execute(
            select(func.coalesce(func.sum(Invoice.total), 0)).where(
                Invoice.status == InvoiceStatus.PAID.value
            )
        )
        total_paid = float(r.scalar() or 0)
        return (total, pending, paid_count, total_paid)

    async def get_dashboard_subscription_summary(
        self,
    ) -> tuple[int, int, int]:
        """Returns (active_count, canceled_count, total)."""
        from app.modules.billing.enums import SubscriptionStatus

        r = await self._db.execute(
            select(func.count())
            .select_from(Subscription)
            .where(Subscription.status == SubscriptionStatus.ACTIVE.value)
        )
        active = r.scalar() or 0
        r = await self._db.execute(
            select(func.count())
            .select_from(Subscription)
            .where(Subscription.status == SubscriptionStatus.CANCELED.value)
        )
        canceled = r.scalar() or 0
        r = await self._db.execute(select(func.count()).select_from(Subscription))
        total = r.scalar() or 0
        return (active, canceled, total)

    async def get_active_customer_count(self) -> int:
        """Count distinct customers with active subscription or at least one paid invoice."""
        from app.modules.billing.enums import InvoiceStatus, SubscriptionStatus

        sub_ids = (
            select(Subscription.customer_id)
            .where(Subscription.status == SubscriptionStatus.ACTIVE.value)
            .distinct()
        )
        inv_ids = (
            select(Invoice.customer_id)
            .where(Invoice.status == InvoiceStatus.PAID.value)
            .distinct()
        )
        union_ids = sub_ids.union(inv_ids).subquery()
        r = await self._db.execute(select(func.count()).select_from(union_ids))
        return r.scalar() or 0

    async def get_revenue_rows(
        self, start: datetime, end: datetime
    ) -> list[tuple[datetime | None, float]]:
        """Paid invoices in [start, end]: list of (paid_at, total). For dashboard revenue series."""
        from app.modules.billing.enums import InvoiceStatus

        r = await self._db.execute(
            select(Invoice.paid_at, Invoice.total).where(
                Invoice.status == InvoiceStatus.PAID.value,
                Invoice.paid_at.isnot(None),
                Invoice.paid_at >= start,
                Invoice.paid_at <= end,
            )
        )
        return [(row[0], float(row[1])) for row in r.all()]

    async def list_paid_site_delivery_orders(
        self,
    ) -> list[tuple[Invoice, str, str, int]]:
        """List paid invoices for site_delivery products with customer and product names.
        Returns list of (Invoice, customer_name, product_name, subscription_id)."""
        from app.modules.billing.enums import InvoiceStatus

        q = (
            select(
                Invoice,
                Customer.name.label("customer_name"),
                Product.name.label("product_name"),
                Subscription.id.label("sub_id"),
            )
            .join(Customer, Invoice.customer_id == Customer.id)
            .join(Subscription, Invoice.subscription_id == Subscription.id)
            .join(Product, Subscription.product_id == Product.id)
            .where(
                Invoice.status == InvoiceStatus.PAID.value,
                func.lower(func.coalesce(Product.provisioning_type, ""))
                == "site_delivery",
            )
            .order_by(Invoice.paid_at.desc().nullslast(), Invoice.id.desc())
        )
        r = await self._db.execute(q)
        return list(r.all())

    async def list_overdue_invoice_subscription_product(
        self, cutoff_due_date: datetime
    ) -> list[tuple[Invoice, Subscription, Product]]:
        """Pending invoices past cutoff with active/overdue subscription and hestia_hosting product (overdue processing)."""
        from app.modules.billing.enums import InvoiceStatus, SubscriptionStatus

        r = await self._db.execute(
            select(Invoice, Subscription, Product)
            .join(Subscription, Invoice.subscription_id == Subscription.id)
            .join(Product, Subscription.product_id == Product.id)
            .where(
                Invoice.status == InvoiceStatus.PENDING.value,
                Invoice.due_date < cutoff_due_date,
                Subscription.status.in_(
                    [
                        SubscriptionStatus.ACTIVE.value,
                        SubscriptionStatus.OVERDUE.value,
                    ]
                ),
                func.lower(func.coalesce(Product.provisioning_type, ""))
                == "hestia_hosting",
            )
        )
        return list(r.all())

    async def get_hestia_provisioned_record_for_subscription(
        self, subscription_id: int
    ) -> ProvisioningRecord | None:
        """Hestia provisioning record with status=provisioned for subscription (overdue/reactivate)."""
        r = await self._db.execute(
            select(ProvisioningRecord)
            .where(
                ProvisioningRecord.subscription_id == subscription_id,
                ProvisioningRecord.provider == "hestia",
                ProvisioningRecord.status == "provisioned",
            )
            .limit(1)
        )
        return r.scalar_one_or_none()

    async def get_invoice_with_subscription_product_customer(
        self, invoice_id: int
    ) -> Invoice | None:
        """Get invoice by id with subscription, product and customer loaded (post_payment)."""
        r = await self._db.execute(
            select(Invoice)
            .where(Invoice.id == invoice_id)
            .options(
                selectinload(Invoice.subscription).selectinload(Subscription.product),
                selectinload(Invoice.customer),
            )
            .limit(1)
        )
        return r.scalar_one_or_none()

    async def get_invoice_subscription_product(
        self, invoice_id: int
    ) -> tuple[Invoice, Subscription, Product] | None:
        """Get (Invoice, Subscription, Product) for invoice_id (provisioning)."""
        r = await self._db.execute(
            select(Invoice, Subscription, Product)
            .join(Subscription, Invoice.subscription_id == Subscription.id)
            .join(Product, Subscription.product_id == Product.id)
            .where(Invoice.id == invoice_id)
            .limit(1)
        )
        row = r.one_or_none()
        return row if row else None

    def add_provisioning_job(self, job: ProvisioningJob) -> None:
        """Add ProvisioningJob to session."""
        self._db.add(job)

    async def flush(self) -> None:
        """Flush pending changes."""
        await self._db.flush()

    def add_payment_attempt(self, attempt: PaymentAttempt) -> None:
        """Add PaymentAttempt to session."""
        self._db.add(attempt)

    async def get_subscription_with_plan_product(
        self, subscription_id: int
    ) -> tuple[Subscription, PricePlan, Product] | None:
        """Get (Subscription, PricePlan, Product) for subscription_id (subscription checkout)."""
        r = await self._db.execute(
            select(Subscription, PricePlan, Product)
            .join(PricePlan, Subscription.price_plan_id == PricePlan.id)
            .join(Product, Subscription.product_id == Product.id)
            .where(Subscription.id == subscription_id)
            .limit(1)
        )
        row = r.one_or_none()
        return row if row else None

    def add_mp_subscription_checkout(self, link: MPSubscriptionCheckout) -> None:
        """Add MPSubscriptionCheckout to session."""
        self._db.add(link)

    async def get_webhook_event_by_provider_and_event_id(
        self, provider: str, event_id: str
    ) -> WebhookEvent | None:
        """Find WebhookEvent by provider and event_id (idempotency)."""
        r = await self._db.execute(
            select(WebhookEvent)
            .where(
                WebhookEvent.provider == provider,
                WebhookEvent.event_id == event_id,
            )
            .limit(1)
        )
        return r.scalar_one_or_none()

    def add_webhook_event(self, ev: WebhookEvent) -> None:
        """Add WebhookEvent to session."""
        self._db.add(ev)

    async def get_mp_subscription_checkout_by_plan_id(
        self, mp_plan_id: str
    ) -> MPSubscriptionCheckout | None:
        """Get MPSubscriptionCheckout by mp_plan_id (webhook)."""
        r = await self._db.execute(
            select(MPSubscriptionCheckout)
            .where(MPSubscriptionCheckout.mp_plan_id == mp_plan_id)
            .limit(1)
        )
        return r.scalar_one_or_none()

    async def list_subscriptions_due_with_plan_product(
        self, cutoff: datetime
    ) -> list[tuple[Subscription, PricePlan, Product]]:
        """Active subscriptions with next_due_date <= cutoff (recurring invoice generation)."""
        from app.modules.billing.enums import SubscriptionStatus

        r = await self._db.execute(
            select(Subscription, PricePlan, Product)
            .join(PricePlan, Subscription.price_plan_id == PricePlan.id)
            .join(Product, Subscription.product_id == Product.id)
            .where(
                Subscription.status == SubscriptionStatus.ACTIVE.value,
                Subscription.next_due_date.isnot(None),
                Subscription.next_due_date <= cutoff,
            )
        )
        return list(r.all())

    async def list_pending_invoices_with_subscription_customer(
        self,
    ) -> list[tuple[Invoice, Subscription, Customer]]:
        """Pending invoices with active subscription and customer that has mp_customer_id (recurring charge)."""
        from app.modules.billing.enums import InvoiceStatus, SubscriptionStatus

        r = await self._db.execute(
            select(Invoice, Subscription, Customer)
            .join(Subscription, Invoice.subscription_id == Subscription.id)
            .join(Customer, Invoice.customer_id == Customer.id)
            .where(
                Invoice.status == InvoiceStatus.PENDING.value,
                Subscription.status == SubscriptionStatus.ACTIVE.value,
                Customer.mp_customer_id.isnot(None),
            )
        )
        return list(r.all())

    async def list_pending_invoices_for_reminders(
        self, now: datetime, end: datetime
    ) -> list[Invoice]:
        """Pending invoices with due_date in [now, end] and reminder_sent_at null."""
        from app.modules.billing.enums import InvoiceStatus

        r = await self._db.execute(
            select(Invoice).where(
                Invoice.status == InvoiceStatus.PENDING.value,
                Invoice.due_date >= now,
                Invoice.due_date <= end,
                Invoice.reminder_sent_at.is_(None),
            )
        )
        return list(r.scalars().all())

    # ----- Cascade delete -----
    async def delete_all_by_customer_id(self, customer_id: int) -> None:
        """Delete all billing data for a customer: jobs, invoices, records, subscriptions."""
        r = await self._db.execute(
            select(Subscription.id).where(Subscription.customer_id == customer_id)
        )
        sub_ids = list(r.scalars().all())

        if sub_ids:
            jobs = (
                (
                    await self._db.execute(
                        select(ProvisioningJob).where(
                            ProvisioningJob.subscription_id.in_(sub_ids)
                        )
                    )
                )
                .scalars()
                .all()
            )
            for job in jobs:
                await self._db.delete(job)

            records = (
                (
                    await self._db.execute(
                        select(ProvisioningRecord).where(
                            ProvisioningRecord.subscription_id.in_(sub_ids)
                        )
                    )
                )
                .scalars()
                .all()
            )
            for rec in records:
                await self._db.delete(rec)

        invoices = (
            (
                await self._db.execute(
                    select(Invoice).where(Invoice.customer_id == customer_id)
                )
            )
            .scalars()
            .all()
        )
        for inv in invoices:
            await self._db.delete(inv)

        subs = (
            (
                await self._db.execute(
                    select(Subscription).where(Subscription.customer_id == customer_id)
                )
            )
            .scalars()
            .all()
        )
        for sub in subs:
            await self._db.delete(sub)
        await self._db.flush()
