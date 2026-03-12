"""add subscription_id and expected_delivery_at to projects

Revision ID: c0d1e2f3a4b5
Revises: b9c0d1e2f3a4
Create Date: 2026-03-04

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "c0d1e2f3a4b5"
down_revision: Union[str, None] = "b9c0d1e2f3a4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "projects",
        sa.Column("subscription_id", sa.Integer(), sa.ForeignKey("billing_subscriptions.id"), nullable=True),
    )
    op.add_column(
        "projects",
        sa.Column("expected_delivery_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_projects_subscription_id", "projects", ["subscription_id"])
    op.create_index("ix_projects_status", "projects", ["status"])


def downgrade() -> None:
    op.drop_index("ix_projects_status", table_name="projects")
    op.drop_index("ix_projects_subscription_id", table_name="projects")
    op.drop_column("projects", "expected_delivery_at")
    op.drop_column("projects", "subscription_id")
