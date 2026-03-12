"""Unit tests for billing service (mocked provider)."""

import os
from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from app.models.customer import Customer
from app.models.integration_config import IntegrationConfig
from app.modules.billing.enums import InvoiceStatus, SubscriptionStatus
from app.modules.billing.models import (
    Invoice,
    MPSubscriptionCheckout,
    PaymentAttempt,
    PricePlan,
    Product,
    Subscription,
    WebhookEvent,
)
from app.modules.billing.service import (
    _get_payment_provider,
    create_manual_invoice,
    create_payment_attempt,
    create_subscription_checkout,
    generate_recurring_invoices,
    mark_invoice_paid,
    process_webhook,
)
from app.providers.payments.base import PaymentLinkResult, WebhookResult
from app.providers.payments.mercadopago import MercadoPagoProvider
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_create_payment_attempt_with_mock_provider(
    db_session: AsyncSession,
) -> None:
    """create_payment_attempt uses provider and persists PaymentAttempt and updates Invoice."""
    customer = Customer(org_id="test", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    inv = await create_manual_invoice(
        db_session,
        customer_id=customer.id,
        due_date=datetime.now(UTC),
        total=100.0,
        currency="USD",
    )
    await db_session.flush()
    mock_result = PaymentLinkResult(
        payment_url="https://checkout.mock/pay", external_id="ch_mock_1"
    )
    mock_provider = MagicMock()
    mock_provider.create_payment_link.return_value = mock_result

    with patch(
        "app.modules.billing.invoice_ops.get_payment_provider",
        new_callable=AsyncMock,
        return_value=mock_provider,
    ):
        res = await create_payment_attempt(
            db_session,
            invoice_id=inv.id,
            success_url="https://example.com/ok",
            cancel_url="https://example.com/cancel",
            customer_email="c@test.com",
        )
    assert res.payment_url == "https://checkout.mock/pay"
    mock_provider.create_payment_link.assert_called_once()
    r = await db_session.execute(
        select(PaymentAttempt).where(PaymentAttempt.invoice_id == inv.id)
    )
    attempt = r.scalar_one_or_none()
    assert attempt is not None
    assert attempt.payment_url == "https://checkout.mock/pay"
    assert attempt.provider in ("stripe", "mercadopago")
    await db_session.refresh(inv)
    assert inv.status == InvoiceStatus.PENDING.value


@pytest.mark.asyncio
async def test_process_webhook_idempotent(db_session: AsyncSession) -> None:
    """Processing same Stripe event_id twice returns ok then already_processed without re-updating."""
    customer = Customer(org_id="test", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    inv = Invoice(
        customer_id=customer.id,
        status=InvoiceStatus.PENDING.value,
        due_date=datetime.now(UTC),
        total=50.0,
        currency="USD",
    )
    db_session.add(inv)
    await db_session.flush()
    event_id = "ev_abc123"
    body = b'{"id":"' + event_id.encode() + b'"}'
    headers = {"stripe-signature": "mock"}

    mock_result = MagicMock()
    mock_result.processed = True
    mock_result.invoice_id = inv.id
    mock_result.message = event_id

    with patch("app.modules.billing.webhook_ops.StripeProvider") as mock_stripe_class:
        mock_stripe_class.return_value.handle_webhook.return_value = mock_result
        ok1, msg1, _ = await process_webhook(db_session, "stripe", body, headers)
    assert ok1 is True
    assert msg1 == "ok"
    await db_session.refresh(inv)
    assert inv.status == InvoiceStatus.PAID.value
    assert inv.paid_at is not None

    # Second call: idempotent
    with patch("app.modules.billing.webhook_ops.StripeProvider") as mock_stripe_class:
        mock_stripe_class.return_value.handle_webhook.return_value = mock_result
        ok2, msg2, _ = await process_webhook(db_session, "stripe", body, headers)
    assert ok2 is True
    assert msg2 == "already_processed"
    r = await db_session.execute(
        select(WebhookEvent).where(WebhookEvent.event_id == event_id)
    )
    events = list(r.scalars().all())
    assert len(events) == 1


@pytest.mark.asyncio
async def test_process_webhook_mercadopago_marks_invoice_paid(
    db_session: AsyncSession,
) -> None:
    """Processing Mercado Pago webhook with approved payment marks invoice PAID and is idempotent."""
    customer = Customer(org_id="test", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    inv = Invoice(
        customer_id=customer.id,
        status=InvoiceStatus.PENDING.value,
        due_date=datetime.now(UTC),
        total=50.0,
        currency="BRL",
    )
    db_session.add(inv)
    await db_session.flush()
    payment_id = "pay_mp_123"
    body = b'{"type":"payment","data":{"id":"' + payment_id.encode() + b'"}}'
    headers: dict[str, str] = {}

    mock_result = WebhookResult(
        processed=True,
        invoice_id=inv.id,
        message=payment_id,
    )

    with patch("app.modules.billing.webhook_ops.MercadoPagoProvider") as mock_mp_class:
        mock_mp_class.return_value.handle_webhook.return_value = mock_result
        ok1, msg1, paid_id = await process_webhook(
            db_session, "mercadopago", body, headers
        )
    assert ok1 is True
    assert msg1 == "ok"
    assert paid_id == inv.id
    await db_session.refresh(inv)
    assert inv.status == InvoiceStatus.PAID.value
    assert inv.paid_at is not None

    with patch("app.modules.billing.webhook_ops.MercadoPagoProvider") as mock_mp_class:
        mock_mp_class.return_value.handle_webhook.return_value = mock_result
        ok2, msg2, _ = await process_webhook(db_session, "mercadopago", body, headers)
    assert ok2 is True
    assert msg2 == "already_processed"


@pytest.mark.asyncio
async def test_get_payment_provider_prefers_mp_access_token_env(
    db_session: AsyncSession,
) -> None:
    """With MP_ACCESS_TOKEN set, _get_payment_provider returns MercadoPagoProvider with that token (not IntegrationConfig)."""
    customer = Customer(org_id="innexar", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    with patch.dict(os.environ, {"MP_ACCESS_TOKEN": "env-token-mp"}, clear=False):
        provider = await _get_payment_provider(
            db_session,
            customer_id=customer.id,
            org_id="innexar",
            currency="BRL",
            mode="test",
        )
    assert isinstance(provider, MercadoPagoProvider)
    assert provider._access_token == "env-token-mp"


@pytest.mark.asyncio
async def test_get_payment_provider_fallback_to_integration_config_when_no_env(
    db_session: AsyncSession,
) -> None:
    """Without MP_ACCESS_TOKEN, with IntegrationConfig global mercadopago/access_token, returns provider with token from config."""
    customer = Customer(org_id="innexar", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    cfg = IntegrationConfig(
        scope="global",
        org_id="innexar",
        customer_id=None,
        provider="mercadopago",
        key="access_token",
        value_encrypted="encrypted_placeholder",
        enabled=True,
        mode="test",
    )
    db_session.add(cfg)
    await db_session.commit()

    with (
        patch.dict(
            os.environ,
            {"MP_ACCESS_TOKEN": "", "MERCADOPAGO_ACCESS_TOKEN": ""},
            clear=False,
        ),
        patch(
            "app.modules.billing._provider.decrypt_value", return_value="config-token"
        ),
    ):
        provider = await _get_payment_provider(
            db_session,
            customer_id=customer.id,
            org_id="innexar",
            currency="BRL",
            mode="test",
        )
    assert isinstance(provider, MercadoPagoProvider)
    assert provider._access_token == "config-token"


@pytest.mark.asyncio
async def test_create_manual_invoice(db_session: AsyncSession) -> None:
    """create_manual_invoice creates draft invoice without subscription."""
    customer = Customer(org_id="test", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    due = datetime.now(UTC) + timedelta(days=7)
    inv = await create_manual_invoice(
        db_session,
        customer_id=customer.id,
        due_date=due,
        total=200.0,
        currency="BRL",
        line_items=[{"description": "Item", "amount": 200.0}],
    )
    await db_session.flush()
    assert inv.id is not None
    assert inv.customer_id == customer.id
    assert inv.subscription_id is None
    assert inv.status == InvoiceStatus.DRAFT.value
    assert float(inv.total) == 200.0
    assert inv.currency == "BRL"


@pytest.mark.asyncio
async def test_create_payment_attempt_invoice_not_found(
    db_session: AsyncSession,
) -> None:
    """create_payment_attempt raises ValueError when invoice does not exist."""
    with pytest.raises(ValueError, match="not found"):
        await create_payment_attempt(
            db_session,
            invoice_id=99999,
            success_url="https://example.com/ok",
            cancel_url="https://example.com/cancel",
        )


@pytest.mark.asyncio
async def test_create_payment_attempt_invoice_already_paid(
    db_session: AsyncSession,
) -> None:
    """create_payment_attempt raises ValueError when invoice is already paid."""
    customer = Customer(org_id="test", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    inv = await create_manual_invoice(
        db_session,
        customer_id=customer.id,
        due_date=datetime.now(UTC),
        total=50.0,
        currency="BRL",
    )
    await db_session.flush()
    inv.status = InvoiceStatus.PAID.value
    await db_session.flush()
    with pytest.raises(ValueError, match="already paid"):
        await create_payment_attempt(
            db_session,
            invoice_id=inv.id,
            success_url="https://example.com/ok",
            cancel_url="https://example.com/cancel",
        )


@pytest.mark.asyncio
async def test_create_subscription_checkout_invoice_not_found(
    db_session: AsyncSession,
) -> None:
    """create_subscription_checkout raises ValueError when invoice does not exist."""
    with pytest.raises(ValueError, match="not found"):
        await create_subscription_checkout(
            db_session, invoice_id=99999, back_url="https://example.com/back"
        )


@pytest.mark.asyncio
async def test_create_subscription_checkout_invoice_no_subscription(
    db_session: AsyncSession,
) -> None:
    """create_subscription_checkout raises ValueError when invoice has no subscription_id."""
    customer = Customer(org_id="test", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    inv = await create_manual_invoice(
        db_session,
        customer_id=customer.id,
        due_date=datetime.now(UTC),
        total=50.0,
        currency="BRL",
    )
    await db_session.flush()
    assert inv.subscription_id is None
    with pytest.raises(ValueError, match="no subscription"):
        await create_subscription_checkout(
            db_session, invoice_id=inv.id, back_url="https://example.com/back"
        )


@pytest.mark.asyncio
async def test_mark_invoice_paid_not_found(db_session: AsyncSession) -> None:
    """mark_invoice_paid returns None when invoice does not exist."""
    result = await mark_invoice_paid(db_session, 99999)
    assert result is None


@pytest.mark.asyncio
async def test_mark_invoice_paid_already_paid(db_session: AsyncSession) -> None:
    """mark_invoice_paid returns None when invoice is already paid."""
    customer = Customer(org_id="test", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    inv = await create_manual_invoice(
        db_session,
        customer_id=customer.id,
        due_date=datetime.now(UTC),
        total=50.0,
        currency="BRL",
    )
    await db_session.flush()
    inv.status = InvoiceStatus.PAID.value
    await db_session.flush()
    with patch("app.modules.billing.invoice_ops.log_audit", new_callable=AsyncMock):
        result = await mark_invoice_paid(db_session, inv.id)
    assert result is None


@pytest.mark.asyncio
async def test_mark_invoice_paid_success_with_subscription(
    db_session: AsyncSession,
) -> None:
    """mark_invoice_paid marks invoice paid and activates subscription."""
    customer = Customer(org_id="test", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    product = Product(org_id="test", name="Prod")
    db_session.add(product)
    await db_session.flush()
    plan = PricePlan(
        product_id=product.id,
        name="Monthly",
        interval="monthly",
        amount=99.0,
        currency="BRL",
    )
    db_session.add(plan)
    await db_session.flush()
    sub = Subscription(
        customer_id=customer.id,
        product_id=product.id,
        price_plan_id=plan.id,
        status=SubscriptionStatus.OVERDUE.value,
    )
    db_session.add(sub)
    await db_session.flush()
    inv = Invoice(
        customer_id=customer.id,
        subscription_id=sub.id,
        status=InvoiceStatus.PENDING.value,
        due_date=datetime.now(UTC),
        total=99.0,
        currency="BRL",
    )
    db_session.add(inv)
    await db_session.flush()
    with (
        patch("app.modules.billing.invoice_ops.log_audit", new_callable=AsyncMock),
        patch(
            "app.modules.billing.invoice_ops.reactivate_subscription_after_payment",
            new_callable=AsyncMock,
        ),
    ):
        result = await mark_invoice_paid(db_session, inv.id)
    assert result == inv.id
    await db_session.refresh(inv)
    await db_session.refresh(sub)
    assert inv.status == InvoiceStatus.PAID.value
    assert sub.status == SubscriptionStatus.ACTIVE.value


@pytest.mark.asyncio
async def test_process_webhook_stripe_not_processed(db_session: AsyncSession) -> None:
    """process_webhook returns (False, message, None) when Stripe handler does not process."""
    mock_result = WebhookResult(processed=False, message="invalid signature")
    with patch("app.modules.billing.webhook_ops.StripeProvider") as mock_stripe:
        mock_stripe.return_value.handle_webhook.return_value = mock_result
        ok, msg, paid_id = await process_webhook(
            db_session, "stripe", b"{}", {"stripe-signature": "x"}
        )
    assert ok is False
    assert "invalid" in msg or msg == "invalid signature"
    assert paid_id is None


@pytest.mark.asyncio
async def test_process_webhook_mercadopago_subscription_flow(
    db_session: AsyncSession,
) -> None:
    """process_webhook Mercado Pago with mp_plan_id/mp_preapproval_id marks subscription invoice paid."""
    customer = Customer(org_id="test", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    product = Product(org_id="test", name="Prod")
    db_session.add(product)
    await db_session.flush()
    plan = PricePlan(
        product_id=product.id,
        name="Monthly",
        interval="monthly",
        amount=99.0,
        currency="BRL",
    )
    db_session.add(plan)
    await db_session.flush()
    sub = Subscription(
        customer_id=customer.id,
        product_id=product.id,
        price_plan_id=plan.id,
        status=SubscriptionStatus.OVERDUE.value,
    )
    db_session.add(sub)
    await db_session.flush()
    inv = Invoice(
        customer_id=customer.id,
        subscription_id=sub.id,
        status=InvoiceStatus.PENDING.value,
        due_date=datetime.now(UTC),
        total=99.0,
        currency="BRL",
    )
    db_session.add(inv)
    await db_session.flush()
    link = MPSubscriptionCheckout(invoice_id=inv.id, mp_plan_id="mp_plan_123")
    db_session.add(link)
    await db_session.flush()
    body = b'{"type":"subscription_preapproval"}'
    mock_result = WebhookResult(
        processed=True,
        message="ev_mp_123",
        mp_plan_id="mp_plan_123",
        mp_preapproval_id="preapproval_456",
    )
    with patch("app.modules.billing.webhook_ops.MercadoPagoProvider") as mock_mp:
        mock_mp.return_value.handle_webhook.return_value = mock_result
        with patch(
            "app.modules.billing.webhook_ops.reactivate_subscription_after_payment",
            new_callable=AsyncMock,
        ):
            ok, msg, paid_id = await process_webhook(
                db_session, "mercadopago", body, {}
            )
    assert ok is True
    assert msg == "ok"
    assert paid_id == inv.id
    await db_session.refresh(inv)
    await db_session.refresh(sub)
    assert inv.status == InvoiceStatus.PAID.value
    assert sub.external_id == "preapproval_456"


@pytest.mark.asyncio
async def test_process_webhook_unknown_provider(db_session: AsyncSession) -> None:
    """process_webhook returns (False, 'unknown provider', None) for unknown provider."""
    ok, msg, paid_id = await process_webhook(db_session, "unknown", b"{}", {})
    assert ok is False
    assert "unknown" in msg
    assert paid_id is None


@pytest.mark.asyncio
async def test_generate_recurring_invoices_creates_invoices(
    db_session: AsyncSession,
) -> None:
    """generate_recurring_invoices creates invoice for active sub with next_due_date in range."""
    customer = Customer(org_id="test", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    product = Product(org_id="test", name="Prod")
    db_session.add(product)
    await db_session.flush()
    plan = PricePlan(
        product_id=product.id,
        name="Monthly",
        interval="monthly",
        amount=50.0,
        currency="BRL",
    )
    db_session.add(plan)
    await db_session.flush()
    now = datetime.now(UTC)
    due_in_past = now - timedelta(days=5)
    sub = Subscription(
        customer_id=customer.id,
        product_id=product.id,
        price_plan_id=plan.id,
        status=SubscriptionStatus.ACTIVE.value,
        next_due_date=due_in_past,
    )
    db_session.add(sub)
    await db_session.flush()
    count = await generate_recurring_invoices(db_session, now=now, days_before_due=0)
    assert count == 1
    r = await db_session.execute(
        select(Invoice).where(Invoice.subscription_id == sub.id)
    )
    invoices = list(r.scalars().all())
    assert len(invoices) == 1
    assert invoices[0].status == InvoiceStatus.PENDING.value
    assert float(invoices[0].total) == 50.0


@pytest.mark.asyncio
async def test_get_payment_provider_stripe_from_integration_config(
    db_session: AsyncSession,
) -> None:
    """With IntegrationConfig global stripe/secret_key, _get_payment_provider returns StripeProvider."""
    from app.providers.payments.stripe import StripeProvider

    customer = Customer(org_id="innexar", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    cfg = IntegrationConfig(
        scope="global",
        org_id="innexar",
        customer_id=None,
        provider="stripe",
        key="secret_key",
        value_encrypted="encrypted_sk",
        enabled=True,
        mode="test",
    )
    db_session.add(cfg)
    await db_session.commit()
    with patch(
        "app.modules.billing._provider.decrypt_value", return_value="sk_test_xyz"
    ):
        provider = await _get_payment_provider(
            db_session,
            customer_id=customer.id,
            org_id="innexar",
            currency="USD",
            mode="test",
        )
    assert isinstance(provider, StripeProvider)


@pytest.mark.asyncio
async def test_send_invoice_reminders_count(
    db_session: AsyncSession,
) -> None:
    """send_invoice_reminders finds PENDING invoices due in window and returns count (mocked notifications)."""
    from app.models.customer_user import CustomerUser
    from app.modules.billing.service import send_invoice_reminders

    customer = Customer(org_id="innexar", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    cu = CustomerUser(
        customer_id=customer.id,
        email="c@test.com",
        password_hash="hash",
        email_verified=True,
    )
    db_session.add(cu)
    await db_session.flush()
    now = datetime.now(UTC)
    due_soon = now + timedelta(days=1)
    inv = Invoice(
        customer_id=customer.id,
        status=InvoiceStatus.PENDING.value,
        due_date=due_soon,
        total=100.0,
        currency="BRL",
    )
    db_session.add(inv)
    await db_session.flush()
    mock_tasks = MagicMock()
    with patch(
        "app.modules.notifications.service.create_notification_and_maybe_send_email",
        new_callable=AsyncMock,
    ):
        count = await send_invoice_reminders(
            db_session,
            mock_tasks,
            org_id="innexar",
            days_ahead=2,
            now=now,
        )
    assert count == 1
    await db_session.refresh(inv)
    assert inv.reminder_sent_at is not None


@pytest.mark.asyncio
async def test_generate_recurring_invoices_no_subs(
    db_session: AsyncSession,
) -> None:
    """generate_recurring_invoices with no active subs due returns 0."""
    count = await generate_recurring_invoices(
        db_session, org_id="innexar", now=datetime.now(UTC), days_before_due=0
    )
    assert count == 0


@pytest.mark.asyncio
async def test_create_payment_attempt_stripe_branch(
    db_session: AsyncSession,
) -> None:
    """create_payment_attempt with USD uses Stripe branch (else branch) and returns payment_url."""
    from app.providers.payments.stripe import StripeProvider

    customer = Customer(org_id="innexar", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    inv = await create_manual_invoice(
        db_session,
        customer_id=customer.id,
        due_date=datetime.now(UTC),
        total=25.0,
        currency="USD",
    )
    await db_session.flush()
    mock_result = PaymentLinkResult(
        payment_url="https://checkout.stripe.com/pay_xyz",
        external_id="cs_stripe_1",
    )
    mock_stripe = MagicMock(spec=StripeProvider)
    mock_stripe.create_payment_link.return_value = mock_result
    with patch(
        "app.modules.billing.invoice_ops.get_payment_provider",
        new_callable=AsyncMock,
        return_value=mock_stripe,
    ):
        res = await create_payment_attempt(
            db_session,
            invoice_id=inv.id,
            success_url="https://example.com/ok",
            cancel_url="https://example.com/cancel",
            customer_email="c@test.com",
        )
    assert res.payment_url == "https://checkout.stripe.com/pay_xyz"
    mock_stripe.create_payment_link.assert_called_once()
    await db_session.refresh(inv)
    assert inv.status == InvoiceStatus.PENDING.value


@pytest.mark.asyncio
async def test_process_webhook_stripe_with_invoice_and_subscription(
    db_session: AsyncSession,
) -> None:
    """process_webhook Stripe with result.invoice_id and inv.subscription_id updates sub and next_due."""
    customer = Customer(org_id="test", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    product = Product(org_id="test", name="Prod")
    db_session.add(product)
    await db_session.flush()
    plan = PricePlan(
        product_id=product.id,
        name="Monthly",
        interval="monthly",
        amount=99.0,
        currency="BRL",
    )
    db_session.add(plan)
    await db_session.flush()
    sub = Subscription(
        customer_id=customer.id,
        product_id=product.id,
        price_plan_id=plan.id,
        status=SubscriptionStatus.INACTIVE.value,
    )
    db_session.add(sub)
    await db_session.flush()
    inv = Invoice(
        customer_id=customer.id,
        subscription_id=sub.id,
        status=InvoiceStatus.PENDING.value,
        due_date=datetime.now(UTC),
        total=99.0,
        currency="BRL",
    )
    db_session.add(inv)
    await db_session.flush()
    event_id = "ev_stripe_123"
    mock_result = WebhookResult(
        processed=True,
        invoice_id=inv.id,
        message=event_id,
    )
    with (
        patch("app.modules.billing.webhook_ops.StripeProvider") as mock_stripe_class,
        patch(
            "app.modules.billing.webhook_ops.reactivate_subscription_after_payment",
            new_callable=AsyncMock,
        ),
    ):
        mock_stripe_class.return_value.handle_webhook.return_value = mock_result
        ok, msg, paid_id = await process_webhook(
            db_session,
            "stripe",
            b'{"id":"' + event_id.encode() + b'"}',
            {"stripe-signature": "x"},
        )
    assert ok is True
    assert msg == "ok"
    assert paid_id == inv.id
    await db_session.refresh(inv)
    await db_session.refresh(sub)
    assert inv.status == InvoiceStatus.PAID.value
    assert sub.status == SubscriptionStatus.ACTIVE.value


@pytest.mark.asyncio
async def test_charge_recurring_invoices_approved(
    db_session: AsyncSession,
) -> None:
    """charge_recurring_invoices charges one invoice with mocked httpx and provider; returns (1, 0)."""
    from app.modules.billing.service import charge_recurring_invoices

    customer = Customer(
        org_id="innexar", name="C", email="c@test.com", mp_customer_id="mp_cust_1"
    )
    db_session.add(customer)
    await db_session.flush()
    product = Product(org_id="innexar", name="P")
    db_session.add(product)
    await db_session.flush()
    plan = PricePlan(
        product_id=product.id,
        name="Monthly",
        interval="monthly",
        amount=50.0,
        currency="BRL",
    )
    db_session.add(plan)
    await db_session.flush()
    sub = Subscription(
        customer_id=customer.id,
        product_id=product.id,
        price_plan_id=plan.id,
        status=SubscriptionStatus.ACTIVE.value,
    )
    db_session.add(sub)
    await db_session.flush()
    inv = Invoice(
        customer_id=customer.id,
        subscription_id=sub.id,
        status=InvoiceStatus.PENDING.value,
        due_date=datetime.now(UTC),
        total=50.0,
        currency="BRL",
    )
    db_session.add(inv)
    await db_session.flush()
    mock_provider = MagicMock(spec=MercadoPagoProvider)
    mock_provider._access_token = "tok"
    mock_provider.charge_saved_card.return_value = {
        "status": "approved",
        "id": "pay_recur_1",
    }
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = [{"id": "card_1"}]
    mock_http = MagicMock()
    mock_http.__enter__.return_value.get.return_value = mock_response
    mock_http.__exit__.return_value = None
    with (
        patch(
            "app.modules.billing.recurring_ops.get_payment_provider",
            new_callable=AsyncMock,
            return_value=mock_provider,
        ),
        patch(
            "app.modules.billing.recurring_ops.reactivate_subscription_after_payment",
            new_callable=AsyncMock,
        ),
        patch("httpx.Client", return_value=mock_http),
    ):
        charged, failed = await charge_recurring_invoices(db_session, org_id="innexar")
    assert charged == 1
    assert failed == 0
    await db_session.refresh(inv)
    assert inv.status == InvoiceStatus.PAID.value
    assert inv.external_id == "pay_recur_1"
