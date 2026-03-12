"""add customer_password_reset_tokens

Revision ID: b8c9d0e1f2a3
Revises: a7b8c9d0e1f2
Create Date: 2026-02-26

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "b8c9d0e1f2a3"
down_revision: Union[str, None] = "a7b8c9d0e1f2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "customer_password_reset_tokens",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("customer_user_id", sa.Integer(), sa.ForeignKey("customer_users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token", sa.String(255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_customer_password_reset_tokens_customer_user_id", "customer_password_reset_tokens", ["customer_user_id"])
    op.create_index("ix_customer_password_reset_tokens_token", "customer_password_reset_tokens", ["token"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_customer_password_reset_tokens_token", table_name="customer_password_reset_tokens")
    op.drop_index("ix_customer_password_reset_tokens_customer_user_id", table_name="customer_password_reset_tokens")
    op.drop_table("customer_password_reset_tokens")
