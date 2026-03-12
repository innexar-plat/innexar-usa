"""Portal billing routes: list invoices, pay, download (print-friendly HTML)."""

from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_customer import get_current_customer
from app.core.database import get_db
from app.models.customer_user import CustomerUser
from app.modules.billing.dependencies import require_billing_enabled
from app.modules.billing.portal_service import BillingPortalService
from app.modules.billing.schemas import InvoiceResponse, PayRequest, PayResponse

router = APIRouter(tags=["portal-billing"])


async def _parse_pay_body(request: Request) -> PayRequest:
    """Parse optional body so POST with empty or missing body still works (avoids 422)."""
    try:
        raw = await request.body()
        if not raw or not raw.strip():
            return PayRequest()
        return PayRequest.model_validate_json(raw)
    except Exception:
        return PayRequest()


def get_billing_portal_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> BillingPortalService:
    return BillingPortalService(db)


@router.get("/invoices", response_model=list[InvoiceResponse])
async def list_my_invoices(
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    _: Annotated[None, Depends(require_billing_enabled)],
    service: Annotated[BillingPortalService, Depends(get_billing_portal_service)],
):
    """List invoices for the current customer."""
    return await service.list_my_invoices(current.customer_id)


@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def get_my_invoice(
    invoice_id: int,
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    _: Annotated[None, Depends(require_billing_enabled)],
    service: Annotated[BillingPortalService, Depends(get_billing_portal_service)],
):
    """Get a single invoice by id (customer-scoped)."""
    return await service.get_my_invoice(invoice_id, current.customer_id)


@router.post("/invoices/{invoice_id}/pay", response_model=PayResponse)
async def pay_invoice(
    invoice_id: int,
    payload: Annotated[PayRequest, Depends(_parse_pay_body)],
    background_tasks: BackgroundTasks,
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    _: Annotated[None, Depends(require_billing_enabled)],
    service: Annotated[BillingPortalService, Depends(get_billing_portal_service)],
) -> PayResponse:
    """Pay invoice: Bricks (token) or Checkout Pro (payment_url)."""
    return await service.pay_invoice(invoice_id, current, payload, background_tasks)


@router.get("/invoices/{invoice_id}/download", response_class=HTMLResponse)
async def download_invoice_html(
    invoice_id: int,
    current: Annotated[CustomerUser, Depends(get_current_customer)],
    _: Annotated[None, Depends(require_billing_enabled)],
    service: Annotated[BillingPortalService, Depends(get_billing_portal_service)],
) -> HTMLResponse:
    """Return print-friendly HTML for invoice (Ctrl+P -> Save as PDF)."""
    html = await service.get_invoice_download_html(invoice_id, current.customer_id)
    return HTMLResponse(content=html)
