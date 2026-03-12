"""add project_requests.meta (JSON) for site briefing

Revision ID: f2a3b4c5d6e1
Revises: e1f2a3b4c5d6
Create Date: 2026-03-03

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "f2a3b4c5d6e1"
down_revision: Union[str, None] = "e1f2a3b4c5d6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("project_requests", sa.Column("meta", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("project_requests", "meta")
