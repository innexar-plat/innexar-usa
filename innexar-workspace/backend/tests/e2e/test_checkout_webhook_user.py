"""E2E Test: Frictionless checkout user creation (requires_password_change flag)."""

import pytest
from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from app.modules.billing.models import PricePlan, Product
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_frictionless_checkout_creates_user_with_password_change_flag(
    client: AsyncClient,
    db_session: AsyncSession,
) -> None:
    """POST /api/public/checkout/start creates a new CustomerUser with requires_password_change=True."""
    # 1. Ensure product and price plan exist
    product = Product(
        org_id="innexar",
        name="WaaS Professional",
        is_active=True,
        provisioning_type="site_delivery",
    )
    db_session.add(product)
    await db_session.flush()

    price_plan = PricePlan(
        product_id=product.id,
        name="Monthly",
        interval="monthly",
        amount=299.00,
        currency="BRL",
    )
    db_session.add(price_plan)
    await db_session.flush()
    await db_session.commit()

    # 2. Call the checkout endpoint for a new email
    test_email = "new.frictionless@test.innexar.com"

    # We ignore if payment_url generation fails due to missing provider in test env,
    # what matters is that the customer user was provisioned prior to that.
    try:
        await client.post(
            "/api/public/checkout/start",
            json={
                "product_id": product.id,
                "price_plan_id": price_plan.id,
                "customer_email": test_email,
                "customer_name": "Frictionless Tester",
                "success_url": "https://example.com/ok",
                "cancel_url": "https://example.com/cancel",
            },
        )
    except Exception as e:
        if "not configured" in str(e).lower() or "not installed" in str(e).lower():
            pass
        else:
            raise

    # 3. Assert the customer was created
    cust_r = await db_session.execute(
        select(Customer).where(Customer.email == test_email)
    )
    customer = cust_r.scalar_one_or_none()
    assert customer is not None, "Customer should have been created"

    # 4. Assert the user was created AND has the flag set to True
    cu_r = await db_session.execute(
        select(CustomerUser).where(CustomerUser.email == test_email)
    )
    customer_user = cu_r.scalar_one_or_none()
    assert customer_user is not None, "CustomerUser should have been created"

    # CRITICAL: Verify frictionless password flag
    assert (
        customer_user.requires_password_change is True
    ), "The requires_password_change flag must be True for new frictionless checkouts"
