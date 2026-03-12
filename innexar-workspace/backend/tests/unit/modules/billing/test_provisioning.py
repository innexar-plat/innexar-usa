"""Unit tests for billing provisioning: helpers and trigger_provisioning_if_needed."""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from app.models.customer import Customer
from app.modules.billing.enums import InvoiceStatus, SubscriptionStatus
from app.modules.billing.models import (
    Invoice,
    PricePlan,
    Product,
    ProvisioningJob,
    ProvisioningRecord,
    Subscription,
)
from app.modules.billing.provisioning import (
    _domain_from_line_items,
    _sanitize_hestia_user,
    trigger_provisioning_if_needed,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class TestSanitizeHestiaUser:
    """Tests for _sanitize_hestia_user."""

    def test_returns_alphanumeric_prefix_and_safe_domain(self) -> None:
        assert _sanitize_hestia_user(1, "example.com") == "cust1_examplecom"
        assert _sanitize_hestia_user(42, "sub.example.com") == "cust42_subexamplecom"

    def test_strips_non_alphanumeric_from_domain(self) -> None:
        assert _sanitize_hestia_user(1, "my-site.com") == "cust1_mysitecom"
        assert _sanitize_hestia_user(2, "a.b.c") == "cust2_abc"

    def test_truncates_to_32_chars(self) -> None:
        long_domain = "a" * 30
        out = _sanitize_hestia_user(1, long_domain)
        assert len(out) <= 32
        assert out.startswith("cust1_")

    def test_lowercase_domain(self) -> None:
        assert _sanitize_hestia_user(1, "EXAMPLE.COM") == "cust1_examplecom"


class TestDomainFromLineItems:
    """Tests for _domain_from_line_items."""

    def test_empty_none(self) -> None:
        assert _domain_from_line_items(None) is None
        assert _domain_from_line_items([]) is None

    def test_list_first_with_domain(self) -> None:
        items = [
            {"description": "Hosting", "amount": 99, "domain": "  site.com  "},
            {"domain": "other.com"},
        ]
        assert _domain_from_line_items(items) == "site.com"

    def test_list_no_domain_returns_none(self) -> None:
        items = [{"description": "Fee", "amount": 10}]
        assert _domain_from_line_items(items) is None

    def test_dict_with_domain(self) -> None:
        assert (
            _domain_from_line_items({"domain": "app.example.com"}) == "app.example.com"
        )

    def test_dict_without_domain_returns_none(self) -> None:
        assert _domain_from_line_items({"description": "x"}) is None


@pytest.mark.asyncio
async def test_trigger_provisioning_invoice_not_found(
    db_session: AsyncSession,
) -> None:
    """trigger_provisioning_if_needed with non-existent invoice does nothing."""
    await trigger_provisioning_if_needed(db_session, 999999)
    r = await db_session.execute(select(ProvisioningJob))
    assert r.scalars().all() == []


@pytest.mark.asyncio
async def test_trigger_provisioning_non_hestia_product(
    db_session: AsyncSession,
) -> None:
    """When product is not hestia_hosting, no job or record created."""
    customer = Customer(org_id="innexar", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    product = Product(
        org_id="innexar",
        name="Other",
        provisioning_type="other",
    )
    db_session.add(product)
    await db_session.flush()
    pp = PricePlan(
        product_id=product.id, name="M", interval="monthly", amount=99, currency="BRL"
    )
    db_session.add(pp)
    await db_session.flush()
    sub = Subscription(
        customer_id=customer.id,
        product_id=product.id,
        price_plan_id=pp.id,
        status=SubscriptionStatus.ACTIVE.value,
    )
    db_session.add(sub)
    await db_session.flush()
    inv = Invoice(
        customer_id=customer.id,
        subscription_id=sub.id,
        status=InvoiceStatus.PAID.value,
        total=99,
        currency="BRL",
        due_date=datetime.now(UTC),
    )
    db_session.add(inv)
    await db_session.flush()

    await trigger_provisioning_if_needed(db_session, inv.id)

    r = await db_session.execute(
        select(ProvisioningJob).where(ProvisioningJob.invoice_id == inv.id)
    )
    assert r.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_trigger_provisioning_no_domain_fails_job(
    db_session: AsyncSession,
) -> None:
    """When hestia_hosting but no domain in line_items, job and record created with failed status."""
    customer = Customer(org_id="innexar", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    product = Product(
        org_id="innexar",
        name="Hosting",
        provisioning_type="hestia_hosting",
    )
    db_session.add(product)
    await db_session.flush()
    pp = PricePlan(
        product_id=product.id, name="M", interval="monthly", amount=99, currency="BRL"
    )
    db_session.add(pp)
    await db_session.flush()
    sub = Subscription(
        customer_id=customer.id,
        product_id=product.id,
        price_plan_id=pp.id,
        status=SubscriptionStatus.ACTIVE.value,
    )
    db_session.add(sub)
    await db_session.flush()
    inv = Invoice(
        customer_id=customer.id,
        subscription_id=sub.id,
        status=InvoiceStatus.PAID.value,
        total=99,
        currency="BRL",
        due_date=datetime.now(UTC),
        line_items=[{"description": "Hosting", "amount": 99}],
    )
    db_session.add(inv)
    await db_session.flush()

    with patch(
        "app.modules.billing.provisioning.get_hestia_client",
        new_callable=AsyncMock,
        return_value=MagicMock(),
    ):
        await trigger_provisioning_if_needed(db_session, inv.id)

    r = await db_session.execute(
        select(ProvisioningJob).where(ProvisioningJob.invoice_id == inv.id)
    )
    job = r.scalar_one_or_none()
    assert job is not None
    assert job.status == "failed"
    assert (
        "no domain" in (job.last_error or "").lower()
        or "line_items" in (job.last_error or "").lower()
    )
    rec_r = await db_session.execute(
        select(ProvisioningRecord).where(ProvisioningRecord.invoice_id == inv.id)
    )
    rec = rec_r.scalar_one_or_none()
    assert rec is not None
    assert rec.status == "failed"


@pytest.mark.asyncio
async def test_trigger_provisioning_success_with_mock_client(
    db_session: AsyncSession,
) -> None:
    """When hestia_hosting with domain and mock client, job and record succeed."""
    customer = Customer(org_id="innexar", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    product = Product(
        org_id="innexar",
        name="Hosting",
        provisioning_type="hestia_hosting",
    )
    db_session.add(product)
    await db_session.flush()
    pp = PricePlan(
        product_id=product.id, name="M", interval="monthly", amount=99, currency="BRL"
    )
    db_session.add(pp)
    await db_session.flush()
    sub = Subscription(
        customer_id=customer.id,
        product_id=product.id,
        price_plan_id=pp.id,
        status=SubscriptionStatus.ACTIVE.value,
    )
    db_session.add(sub)
    await db_session.flush()
    inv = Invoice(
        customer_id=customer.id,
        subscription_id=sub.id,
        status=InvoiceStatus.PAID.value,
        total=99,
        currency="BRL",
        due_date=datetime.now(UTC),
        line_items=[{"description": "Hosting", "amount": 99, "domain": "example.com"}],
    )
    db_session.add(inv)
    await db_session.flush()

    mock_client = MagicMock()
    mock_client.create_user = MagicMock()
    mock_client.ensure_domain = MagicMock()
    mock_client.ensure_mail = MagicMock()
    mock_client.base_url = "https://hestia.example.com"
    with (
        patch(
            "app.modules.billing.provisioning.get_hestia_client",
            new_callable=AsyncMock,
            return_value=mock_client,
        ),
        patch(
            "app.modules.billing.provisioning.encrypt_value",
            return_value="encrypted_password",
        ),
    ):
        await trigger_provisioning_if_needed(db_session, inv.id)

    r = await db_session.execute(
        select(ProvisioningJob).where(ProvisioningJob.invoice_id == inv.id)
    )
    job = r.scalar_one_or_none()
    assert job is not None
    assert job.status == "success"
    rec_r = await db_session.execute(
        select(ProvisioningRecord).where(ProvisioningRecord.invoice_id == inv.id)
    )
    rec = rec_r.scalar_one_or_none()
    assert rec is not None
    assert rec.status == "provisioned"
    assert rec.external_user == "cust1_examplecom"
    mock_client.create_user.assert_called_once()
    mock_client.ensure_domain.assert_called_once()
    mock_client.ensure_mail.assert_called_once()
