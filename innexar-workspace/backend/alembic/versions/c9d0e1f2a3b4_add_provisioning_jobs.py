"""add billing_provisioning_jobs

Revision ID: c9d0e1f2a3b4
Revises: b8c9d0e1f2a3
Create Date: 2026-02-26

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "c9d0e1f2a3b4"
down_revision: Union[str, None] = "b8c9d0e1f2a3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "billing_provisioning_jobs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("subscription_id", sa.Integer(), sa.ForeignKey("billing_subscriptions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("invoice_id", sa.Integer(), sa.ForeignKey("billing_invoices.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(32), nullable=False, server_default="queued"),
        sa.Column("step", sa.String(64), nullable=True),
        sa.Column("logs", sa.Text(), nullable=True),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_billing_provisioning_jobs_subscription_id", "billing_provisioning_jobs", ["subscription_id"])
    op.create_index("ix_billing_provisioning_jobs_invoice_id", "billing_provisioning_jobs", ["invoice_id"])
    op.create_index("ix_billing_provisioning_jobs_status", "billing_provisioning_jobs", ["status"])


def downgrade() -> None:
    op.drop_index("ix_billing_provisioning_jobs_status", table_name="billing_provisioning_jobs")
    op.drop_index("ix_billing_provisioning_jobs_invoice_id", table_name="billing_provisioning_jobs")
    op.drop_index("ix_billing_provisioning_jobs_subscription_id", table_name="billing_provisioning_jobs")
    op.drop_table("billing_provisioning_jobs")
