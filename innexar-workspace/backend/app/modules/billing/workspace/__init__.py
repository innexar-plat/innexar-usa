"""Workspace billing routes: products, price_plans, subscriptions, invoices (split for ≤300 lines each)."""

from fastapi import APIRouter

from app.modules.billing.workspace import invoices, price_plans, products, subscriptions

router = APIRouter(prefix="/billing", tags=["workspace-billing"])
router.include_router(products.router)
router.include_router(price_plans.router)
router.include_router(subscriptions.router)
router.include_router(invoices.router)
