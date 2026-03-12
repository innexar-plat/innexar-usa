"""Workspace billing routes: products, price_plans, subscriptions, invoices (delegated to workspace package)."""

from app.modules.billing.workspace import router

__all__ = ["router"]
