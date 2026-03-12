"""add mp_customer_id to customers

Revision ID: b9c0d1e2f3a4
Revises: a8b9c0d1e2f3
Create Date: 2026-03-04

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "b9c0d1e2f3a4"
down_revision: Union[str, None] = "a8b9c0d1e2f3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("customers", sa.Column("mp_customer_id", sa.String(255), nullable=True))
    op.create_index("ix_customers_mp_customer_id", "customers", ["mp_customer_id"])


def downgrade() -> None:
    op.drop_index("ix_customers_mp_customer_id", table_name="customers")
    op.drop_column("customers", "mp_customer_id")
