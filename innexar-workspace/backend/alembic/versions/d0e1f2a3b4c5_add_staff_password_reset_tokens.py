"""add staff_password_reset_tokens

Revision ID: d0e1f2a3b4c5
Revises: c9d0e1f2a3b4
Create Date: 2026-03-03

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "d0e1f2a3b4c5"
down_revision: Union[str, None] = "c9d0e1f2a3b4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "staff_password_reset_tokens",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token", sa.String(255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_staff_password_reset_tokens_user_id", "staff_password_reset_tokens", ["user_id"])
    op.create_index("ix_staff_password_reset_tokens_token", "staff_password_reset_tokens", ["token"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_staff_password_reset_tokens_token", table_name="staff_password_reset_tokens")
    op.drop_index("ix_staff_password_reset_tokens_user_id", table_name="staff_password_reset_tokens")
    op.drop_table("staff_password_reset_tokens")
