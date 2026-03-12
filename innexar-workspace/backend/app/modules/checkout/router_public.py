"""Public checkout: start checkout (create customer/subscription/invoice, process payment)."""

from typing import Annotated

from app.core.database import get_db
from app.modules.checkout.checkout_service import CheckoutService
from app.modules.checkout.schemas import CheckoutStartRequest, CheckoutStartResponse
from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/checkout", tags=["public-checkout"])


def get_checkout_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CheckoutService:
    return CheckoutService(db)


@router.post("/start", response_model=CheckoutStartResponse)
async def checkout_start(
    body: CheckoutStartRequest,
    background_tasks: BackgroundTasks,
    service: Annotated[CheckoutService, Depends(get_checkout_service)],
) -> CheckoutStartResponse:
    """Start checkout: find/create Customer, create Subscription+Invoice, process payment via Bricks or Checkout Pro.
    Accepts either (product_id, price_plan_id) or plan_slug (starter, business, pro) for WaaS USA.
    """
    return await service.start_checkout(body, background_tasks)
