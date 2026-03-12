"""add_provisioning_hestia: Product.provisioning_type, provisioning_records, hestia_settings.

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-02-24

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "e5f6a7b8c9d0"
down_revision: Union[str, None] = "d4e5f6a7b8c9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "billing_products",
        sa.Column("provisioning_type", sa.String(64), nullable=True),
    )
    op.add_column(
        "billing_products",
        sa.Column("hestia_package", sa.String(128), nullable=True),
    )
    op.create_index(
        "ix_billing_products_provisioning_type",
        "billing_products",
        ["provisioning_type"],
        unique=False,
    )

    op.create_table(
        "provisioning_records",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("subscription_id", sa.Integer(), sa.ForeignKey("billing_subscriptions.id"), nullable=False),
        sa.Column("invoice_id", sa.Integer(), sa.ForeignKey("billing_invoices.id"), nullable=True),
        sa.Column("provider", sa.String(32), nullable=False),
        sa.Column("external_user", sa.String(128), nullable=False),
        sa.Column("domain", sa.String(255), nullable=False),
        sa.Column("site_url", sa.String(512), nullable=True),
        sa.Column("panel_login", sa.String(128), nullable=True),
        sa.Column("panel_password_encrypted", sa.String(512), nullable=True),
        sa.Column("panel_url", sa.String(512), nullable=True),
        sa.Column("status", sa.String(32), nullable=False, server_default="pending"),
        sa.Column("meta", sa.JSON(), nullable=True),
        sa.Column("provisioned_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_provisioning_records_subscription_id", "provisioning_records", ["subscription_id"])
    op.create_index("ix_provisioning_records_provider", "provisioning_records", ["provider"])
    op.create_index("ix_provisioning_records_status", "provisioning_records", ["status"])

    op.create_table(
        "hestia_settings",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("org_id", sa.String(64), nullable=False, server_default="innexar"),
        sa.Column("grace_period_days", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("default_hestia_package", sa.String(128), nullable=True, server_default="default"),
        sa.Column("auto_suspend_enabled", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_hestia_settings_org_id", "hestia_settings", ["org_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_hestia_settings_org_id", "hestia_settings")
    op.drop_table("hestia_settings")
    op.drop_index("ix_provisioning_records_status", "provisioning_records")
    op.drop_index("ix_provisioning_records_provider", "provisioning_records")
    op.drop_index("ix_provisioning_records_subscription_id", "provisioning_records")
    op.drop_table("provisioning_records")
    op.drop_index("ix_billing_products_provisioning_type", "billing_products")
    op.drop_column("billing_products", "hestia_package")
    op.drop_column("billing_products", "provisioning_type")
