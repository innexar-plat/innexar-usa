"""add_billing_tables

Revision ID: 5d8e42c68fc6
Revises: 
Create Date: 2026-02-24 18:51:08.562905

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5d8e42c68fc6'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "billing_products",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("org_id", sa.String(64), nullable=True, server_default="innexar"),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_billing_products_org_id", "billing_products", ["org_id"])

    op.create_table(
        "billing_price_plans",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("billing_products.id"), nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("interval", sa.String(32), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(8), nullable=True, server_default="BRL"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_billing_price_plans_product_id", "billing_price_plans", ["product_id"])

    op.create_table(
        "billing_subscriptions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("customers.id"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("billing_products.id"), nullable=False),
        sa.Column("price_plan_id", sa.Integer(), sa.ForeignKey("billing_price_plans.id"), nullable=False),
        sa.Column("status", sa.String(32), nullable=True, server_default="inactive"),
        sa.Column("start_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("end_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_billing_subscriptions_customer_id", "billing_subscriptions", ["customer_id"])
    op.create_index("ix_billing_subscriptions_product_id", "billing_subscriptions", ["product_id"])
    op.create_index("ix_billing_subscriptions_price_plan_id", "billing_subscriptions", ["price_plan_id"])
    op.create_index("ix_billing_subscriptions_status", "billing_subscriptions", ["status"])

    op.create_table(
        "billing_invoices",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("customers.id"), nullable=False),
        sa.Column("subscription_id", sa.Integer(), sa.ForeignKey("billing_subscriptions.id"), nullable=True),
        sa.Column("status", sa.String(32), nullable=True, server_default="draft"),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("total", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(8), nullable=True, server_default="BRL"),
        sa.Column("line_items", sa.JSON(), nullable=True),
        sa.Column("external_id", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_billing_invoices_customer_id", "billing_invoices", ["customer_id"])
    op.create_index("ix_billing_invoices_subscription_id", "billing_invoices", ["subscription_id"])
    op.create_index("ix_billing_invoices_status", "billing_invoices", ["status"])
    op.create_index("ix_billing_invoices_external_id", "billing_invoices", ["external_id"])

    op.create_table(
        "billing_payment_attempts",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("invoice_id", sa.Integer(), sa.ForeignKey("billing_invoices.id"), nullable=False),
        sa.Column("provider", sa.String(32), nullable=False),
        sa.Column("external_id", sa.String(255), nullable=True),
        sa.Column("payment_url", sa.Text(), nullable=True),
        sa.Column("status", sa.String(32), nullable=True, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_billing_payment_attempts_invoice_id", "billing_payment_attempts", ["invoice_id"])
    op.create_index("ix_billing_payment_attempts_provider", "billing_payment_attempts", ["provider"])

    op.create_table(
        "billing_webhook_events",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("provider", sa.String(32), nullable=False),
        sa.Column("event_id", sa.String(255), nullable=False),
        sa.Column("payload_hash", sa.String(64), nullable=True),
        sa.Column("processed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_billing_webhook_events_provider", "billing_webhook_events", ["provider"])
    op.create_index("ix_billing_webhook_events_event_id", "billing_webhook_events", ["event_id"])
    op.create_unique_constraint(
        "uq_webhook_provider_event_id", "billing_webhook_events", ["provider", "event_id"]
    )


def downgrade() -> None:
    op.drop_table("billing_webhook_events")
    op.drop_table("billing_payment_attempts")
    op.drop_table("billing_invoices")
    op.drop_table("billing_subscriptions")
    op.drop_table("billing_price_plans")
    op.drop_table("billing_products")
