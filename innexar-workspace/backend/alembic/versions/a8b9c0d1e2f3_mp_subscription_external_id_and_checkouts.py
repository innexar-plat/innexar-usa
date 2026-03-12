"""MP subscription: external_id on subscriptions, billing_mp_subscription_checkouts table

Revision ID: a8b9c0d1e2f3
Revises: f2a3b4c5d6e1
Create Date: 2026-03-03

Uses idempotent DDL (IF NOT EXISTS) so it can run after create_all or when re-running.
"""
from typing import Sequence, Union

from alembic import op

revision: str = "a8b9c0d1e2f3"
down_revision: Union[str, None] = "f2a3b4c5d6e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Idempotent DDL so migration can run after create_all or when re-running
    op.execute(
        "ALTER TABLE billing_subscriptions ADD COLUMN IF NOT EXISTS external_id VARCHAR(255)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_billing_subscriptions_external_id "
        "ON billing_subscriptions (external_id)"
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS billing_mp_subscription_checkouts (
            id SERIAL PRIMARY KEY,
            invoice_id INTEGER NOT NULL REFERENCES billing_invoices(id),
            mp_plan_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
        """
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_billing_mp_subscription_checkouts_invoice_id "
        "ON billing_mp_subscription_checkouts (invoice_id)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_billing_mp_subscription_checkouts_mp_plan_id "
        "ON billing_mp_subscription_checkouts (mp_plan_id)"
    )


def downgrade() -> None:
    op.drop_index(
        "ix_billing_mp_subscription_checkouts_mp_plan_id",
        table_name="billing_mp_subscription_checkouts",
    )
    op.drop_index(
        "ix_billing_mp_subscription_checkouts_invoice_id",
        table_name="billing_mp_subscription_checkouts",
    )
    op.drop_table("billing_mp_subscription_checkouts")
    op.drop_index(
        "ix_billing_subscriptions_external_id",
        table_name="billing_subscriptions",
    )
    op.drop_column("billing_subscriptions", "external_id")
