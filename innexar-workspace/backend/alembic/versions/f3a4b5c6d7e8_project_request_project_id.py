"""add project_request.project_id

Revision ID: f3a4b5c6d7e8
Revises: e2f3a4b5c6d7
Create Date: 2026-03-04

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "f3a4b5c6d7e8"
down_revision: Union[str, None] = "e2f3a4b5c6d7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "project_requests",
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id"), nullable=True),
    )
    op.create_index("ix_project_requests_project_id", "project_requests", ["project_id"])


def downgrade() -> None:
    op.drop_index("ix_project_requests_project_id", table_name="project_requests")
    op.drop_column("project_requests", "project_id")
