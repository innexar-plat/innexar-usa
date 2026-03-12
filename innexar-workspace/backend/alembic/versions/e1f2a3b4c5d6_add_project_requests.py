"""add project_requests

Revision ID: e1f2a3b4c5d6
Revises: d0e1f2a3b4c5
Create Date: 2026-03-03

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "e1f2a3b4c5d6"
down_revision: Union[str, None] = "d0e1f2a3b4c5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "project_requests",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("customers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("project_name", sa.String(255), nullable=False),
        sa.Column("project_type", sa.String(64), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("budget", sa.String(128), nullable=True),
        sa.Column("timeline", sa.String(128), nullable=True),
        sa.Column("status", sa.String(32), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_project_requests_customer_id", "project_requests", ["customer_id"])
    op.create_index("ix_project_requests_status", "project_requests", ["status"])


def downgrade() -> None:
    op.drop_index("ix_project_requests_status", table_name="project_requests")
    op.drop_index("ix_project_requests_customer_id", table_name="project_requests")
    op.drop_table("project_requests")
