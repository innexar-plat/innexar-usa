"""add_monthly_adjustments_limit to billing_price_plans

Revision ID: i6j7k8l9m0n1
Revises: c7079727f866
Create Date: 2026-03-07

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "i6j7k8l9m0n1"
down_revision: str | None = "c7079727f866"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "billing_price_plans",
        sa.Column(
            "monthly_adjustments_limit",
            sa.Integer(),
            nullable=False,
            server_default="5",
        ),
    )


def downgrade() -> None:
    op.drop_column("billing_price_plans", "monthly_adjustments_limit")
