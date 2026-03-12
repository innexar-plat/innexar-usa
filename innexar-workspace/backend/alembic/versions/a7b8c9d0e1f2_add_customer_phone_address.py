"""add customer phone and address

Revision ID: a7b8c9d0e1f2
Revises: f6a7b8c9d0e1
Create Date: 2026-02-26

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a7b8c9d0e1f2"
down_revision: Union[str, None] = "f6a7b8c9d0e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("customers", sa.Column("phone", sa.String(64), nullable=True))
    op.add_column("customers", sa.Column("address", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("customers", "address")
    op.drop_column("customers", "phone")
