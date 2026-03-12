"""Public billing routes: webhooks Stripe / Mercado Pago."""

from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, Request
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.billing.public_service import BillingPublicService

router = APIRouter(tags=["public-webhooks"])


def get_billing_public_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> BillingPublicService:
    return BillingPublicService(db)


@router.post("/webhooks/")
@router.post("/webhooks")
async def webhook_catchall(
    request: Request,
    background_tasks: BackgroundTasks,
    service: Annotated[BillingPublicService, Depends(get_billing_public_service)],
) -> Response:
    """Catch-all webhook: detect provider from headers and forward to Stripe or Mercado Pago handler."""
    if request.headers.get("stripe-signature"):
        status_code, content = await service.handle_stripe_webhook(
            await request.body(), dict(request.headers), background_tasks
        )
        return Response(content=content, status_code=status_code)
    status_code, content = await service.handle_mercadopago_webhook(
        request, await request.body(), background_tasks
    )
    return Response(content=content, status_code=status_code)


@router.post("/webhooks/stripe")
async def webhook_stripe(
    request: Request,
    background_tasks: BackgroundTasks,
    service: Annotated[BillingPublicService, Depends(get_billing_public_service)],
) -> Response:
    """Stripe webhook endpoint."""
    body = await request.body()
    status_code, content = await service.handle_stripe_webhook(
        body, dict(request.headers), background_tasks
    )
    return Response(content=content, status_code=status_code)


@router.post("/webhooks/mercadopago")
async def webhook_mercadopago(
    request: Request,
    background_tasks: BackgroundTasks,
    service: Annotated[BillingPublicService, Depends(get_billing_public_service)],
) -> Response:
    """Mercado Pago webhook endpoint (signature verified when MP_WEBHOOK_SECRET set)."""
    body = await request.body()
    status_code, content = await service.handle_mercadopago_webhook(
        request, body, background_tasks
    )
    return Response(content=content, status_code=status_code)
