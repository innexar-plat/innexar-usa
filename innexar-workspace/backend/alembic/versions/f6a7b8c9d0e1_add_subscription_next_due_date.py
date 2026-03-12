"""add subscription next_due_date

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-02-26

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "f6a7b8c9d0e1"
down_revision: Union[str, None] = "e5f6a7b8c9d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "billing_subscriptions",
        sa.Column("next_due_date", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "ix_billing_subscriptions_next_due_date",
        "billing_subscriptions",
        ["next_due_date"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_billing_subscriptions_next_due_date",
        table_name="billing_subscriptions",
    )
    op.drop_column("billing_subscriptions", "next_due_date")
