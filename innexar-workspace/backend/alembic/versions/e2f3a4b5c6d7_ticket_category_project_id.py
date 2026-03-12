"""add ticket category and project_id

Revision ID: e2f3a4b5c6d7
Revises: d1e2f3a4b5c6
Create Date: 2026-03-04

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "e2f3a4b5c6d7"
down_revision: Union[str, None] = "d1e2f3a4b5c6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "support_tickets",
        sa.Column("category", sa.String(64), nullable=True, server_default="suporte"),
    )
    op.add_column(
        "support_tickets",
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id"), nullable=True),
    )
    op.create_index("ix_support_tickets_category", "support_tickets", ["category"])
    op.create_index("ix_support_tickets_project_id", "support_tickets", ["project_id"])


def downgrade() -> None:
    op.drop_index("ix_support_tickets_project_id", table_name="support_tickets")
    op.drop_index("ix_support_tickets_category", table_name="support_tickets")
    op.drop_column("support_tickets", "project_id")
    op.drop_column("support_tickets", "category")
