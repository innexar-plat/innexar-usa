"""add_integration_configs

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-02-24 19:25:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "integration_configs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("org_id", sa.String(64), nullable=True, server_default="innexar"),
        sa.Column("scope", sa.String(32), nullable=False),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("customers.id"), nullable=True),
        sa.Column("provider", sa.String(64), nullable=False),
        sa.Column("key", sa.String(128), nullable=False),
        sa.Column("value_encrypted", sa.String(1024), nullable=True),
        sa.Column("mode", sa.String(32), nullable=True, server_default="test"),
        sa.Column("enabled", sa.Boolean(), nullable=True, server_default="true"),
        sa.Column("last_tested_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_integration_configs_org_id", "integration_configs", ["org_id"])
    op.create_index("ix_integration_configs_customer_id", "integration_configs", ["customer_id"])
    op.create_index("ix_integration_configs_provider", "integration_configs", ["provider"])
    op.create_index("ix_integration_configs_key", "integration_configs", ["key"])


def downgrade() -> None:
    op.drop_table("integration_configs")
