"""Unit tests for Mercado Pago provider (mocked HTTP)."""

from unittest.mock import MagicMock, patch

import pytest
from app.providers.payments.base import PaymentLinkResult
from app.providers.payments.mercadopago import MercadoPagoProvider


def test_create_payment_link_raises_without_token() -> None:
    with patch.dict("os.environ", {}, clear=False):
        # Ensure no env token
        for k in ("MP_ACCESS_TOKEN", "MERCADOPAGO_ACCESS_TOKEN"):
            import os

            os.environ.pop(k, None)
        provider = MercadoPagoProvider(access_token=None)
    with pytest.raises(ValueError, match="Mercado Pago not configured"):
        provider.create_payment_link(
            invoice_id=1,
            amount=99.99,
            currency="BRL",
            success_url="https://a.com/ok",
            cancel_url="https://a.com/cancel",
        )


def test_create_payment_link_returns_url_on_201() -> None:
    mock_resp = MagicMock()
    mock_resp.status_code = 201
    mock_resp.json.return_value = {
        "id": "pref_123",
        "init_point": "https://mp.com/checkout/123",
    }
    mock_resp.text = ""

    with patch("app.providers.payments.mercadopago.httpx.Client") as mock_client_class:
        mock_client_class.return_value.__enter__.return_value.post.return_value = (
            mock_resp
        )
        provider = MercadoPagoProvider(access_token="tk")
        result = provider.create_payment_link(
            invoice_id=42,
            amount=50.0,
            currency="BRL",
            success_url="https://a.com/ok",
            cancel_url="https://a.com/cancel",
            customer_email="u@x.com",
            description="Invoice 42",
        )
    assert isinstance(result, PaymentLinkResult)
    assert result.payment_url == "https://mp.com/checkout/123"
    assert result.external_id == "pref_123"
    call_args = mock_client_class.return_value.__enter__.return_value.post.call_args
    assert "checkout/preferences" in call_args[0][0]
    payload = call_args[1]["json"]
    assert payload["external_reference"] == "42"
    assert payload["items"][0]["unit_price"] == 50.0
    assert payload["payer"] == {"email": "u@x.com"}


def test_create_payment_link_raises_on_non_201() -> None:
    mock_resp = MagicMock()
    mock_resp.status_code = 400
    mock_resp.text = "Bad request"

    with patch("app.providers.payments.mercadopago.httpx.Client") as mock_client_class:
        mock_client_class.return_value.__enter__.return_value.post.return_value = (
            mock_resp
        )
        provider = MercadoPagoProvider(access_token="tk")
        with pytest.raises(ValueError, match="preference failed.*400"):
            provider.create_payment_link(
                invoice_id=1,
                amount=10,
                currency="BRL",
                success_url="https://a.com",
                cancel_url="https://a.com",
            )


def test_handle_webhook_not_configured_returns_not_processed() -> None:
    provider = MercadoPagoProvider(access_token="")
    result = provider.handle_webhook(b'{"type":"payment","data":{"id":"123"}}', {})
    assert result.processed is False
    assert "not configured" in (result.message or "").lower()


def test_handle_webhook_ignores_non_payment_topic() -> None:
    with patch("app.providers.payments.mercadopago.httpx.Client"):
        provider = MercadoPagoProvider(access_token="tk")
        result = provider.handle_webhook(
            b'{"type":"merchant_order","data":{"id":"1"}}', {}
        )
    assert result.processed is True
    assert "ignored" in (result.message or "").lower()


def test_handle_webhook_approved_returns_invoice_id() -> None:
    mock_get = MagicMock()
    mock_get.status_code = 200
    mock_get.json.return_value = {"status": "approved", "external_reference": "99"}

    with patch("app.providers.payments.mercadopago.httpx.Client") as mock_client_class:
        mock_client_class.return_value.__enter__.return_value.get.return_value = (
            mock_get
        )
        provider = MercadoPagoProvider(access_token="tk")
        result = provider.handle_webhook(
            b'{"type":"payment","data":{"id":"pay_123"}}',
            {},
        )
    assert result.processed is True
    assert result.invoice_id == 99
    assert result.message == "pay_123"


def test_handle_webhook_pending_processed_without_invoice_id() -> None:
    mock_get = MagicMock()
    mock_get.status_code = 200
    mock_get.json.return_value = {"status": "pending", "external_reference": "99"}

    with patch("app.providers.payments.mercadopago.httpx.Client") as mock_client_class:
        mock_client_class.return_value.__enter__.return_value.get.return_value = (
            mock_get
        )
        provider = MercadoPagoProvider(access_token="tk")
        result = provider.handle_webhook(
            b'{"type":"payment","data":{"id":"pay_456"}}',
            {},
        )
    assert result.processed is True
    assert result.invoice_id is None
    assert result.message == "pay_456"


def test_handle_webhook_invalid_json_returns_not_processed() -> None:
    provider = MercadoPagoProvider(access_token="tk")
    result = provider.handle_webhook(b"not json", {})
    assert result.processed is False
    assert "Invalid JSON" in (result.message or "")


def test_handle_webhook_subscription_preapproval_returns_plan_and_preapproval_ids() -> (
    None
):
    mock_get = MagicMock()
    mock_get.status_code = 200
    mock_get.json.return_value = {"id": "preapp_456", "preapproval_plan_id": "plan_789"}

    with patch("app.providers.payments.mercadopago.httpx.Client") as mock_client_class:
        mock_client_class.return_value.__enter__.return_value.get.return_value = (
            mock_get
        )
        provider = MercadoPagoProvider(access_token="tk")
        result = provider.handle_webhook(
            b'{"type":"subscription_preapproval","data":{"id":"preapp_456"}}',
            {},
        )
    assert result.processed is True
    assert result.mp_preapproval_id == "preapp_456"
    assert result.mp_plan_id == "plan_789"
    assert result.invoice_id is None


# ── Bricks: create_or_get_customer ────────────────────────────────


def test_create_or_get_customer_finds_existing() -> None:
    mock_search = MagicMock()
    mock_search.status_code = 200
    mock_search.json.return_value = {
        "results": [{"id": "cust_123", "email": "a@b.com"}]
    }

    with patch("app.providers.payments.mercadopago.httpx.Client") as mock_client_class:
        mock_client_class.return_value.__enter__.return_value.get.return_value = (
            mock_search
        )
        provider = MercadoPagoProvider(access_token="tk")
        result = provider.create_or_get_customer("a@b.com")
    assert result["id"] == "cust_123"


def test_create_or_get_customer_creates_new() -> None:
    mock_search = MagicMock()
    mock_search.status_code = 200
    mock_search.json.return_value = {"results": []}

    mock_create = MagicMock()
    mock_create.status_code = 201
    mock_create.json.return_value = {"id": "cust_new", "email": "x@y.com"}

    with patch("app.providers.payments.mercadopago.httpx.Client") as mock_client_class:
        instance = mock_client_class.return_value.__enter__.return_value
        instance.get.return_value = mock_search
        instance.post.return_value = mock_create
        provider = MercadoPagoProvider(access_token="tk")
        result = provider.create_or_get_customer("x@y.com", name="John Doe")
    assert result["id"] == "cust_new"
    call_args = instance.post.call_args
    payload = call_args[1]["json"]
    assert payload["first_name"] == "John"
    assert payload["last_name"] == "Doe"


# ── Bricks: save_card ─────────────────────────────────────────────


def test_save_card_success() -> None:
    mock_resp = MagicMock()
    mock_resp.status_code = 201
    mock_resp.json.return_value = {"id": "card_abc"}

    with patch("app.providers.payments.mercadopago.httpx.Client") as mock_client_class:
        mock_client_class.return_value.__enter__.return_value.post.return_value = (
            mock_resp
        )
        provider = MercadoPagoProvider(access_token="tk")
        result = provider.save_card("cust_123", "tok_xyz")
    assert result["id"] == "card_abc"


def test_save_card_failure_returns_empty_dict() -> None:
    mock_resp = MagicMock()
    mock_resp.status_code = 400
    mock_resp.text = "bad"

    with patch("app.providers.payments.mercadopago.httpx.Client") as mock_client_class:
        mock_client_class.return_value.__enter__.return_value.post.return_value = (
            mock_resp
        )
        provider = MercadoPagoProvider(access_token="tk")
        result = provider.save_card("cust_123", "tok_xyz")
    assert result == {}


# ── Bricks: create_card_payment ────────────────────────────────────


def test_create_card_payment_success() -> None:
    mock_resp = MagicMock()
    mock_resp.status_code = 201
    mock_resp.json.return_value = {"id": 12345, "status": "approved"}

    with patch("app.providers.payments.mercadopago.httpx.Client") as mock_client_class:
        mock_client_class.return_value.__enter__.return_value.post.return_value = (
            mock_resp
        )
        provider = MercadoPagoProvider(access_token="tk")
        result = provider.create_payment(
            token="tok_xxx",
            amount=197.0,
            installments=1,
            payment_method_id="visa",
            payer_email="a@b.com",
            description="Test",
            external_reference="42",
        )
    assert result["status"] == "approved"
    assert result["id"] == 12345


def test_create_card_payment_failure_raises() -> None:
    mock_resp = MagicMock()
    mock_resp.status_code = 400
    mock_resp.text = "bad request"

    with patch("app.providers.payments.mercadopago.httpx.Client") as mock_client_class:
        mock_client_class.return_value.__enter__.return_value.post.return_value = (
            mock_resp
        )
        provider = MercadoPagoProvider(access_token="tk")
        with pytest.raises(ValueError, match="MP payment failed"):
            provider.create_payment(
                token="tok_xxx",
                amount=100,
                installments=1,
                payment_method_id="visa",
                payer_email="a@b.com",
            )


def test_create_payment_401_raises_value_error_with_access_token_message() -> None:
    """When MP API returns 401, create_payment raises ValueError guiding use of Access Token (not public key)."""
    mock_resp = MagicMock()
    mock_resp.status_code = 401
    mock_resp.text = "Unauthorized"

    with patch("app.providers.payments.mercadopago.httpx.Client") as mock_client_class:
        mock_client_class.return_value.__enter__.return_value.post.return_value = (
            mock_resp
        )
        provider = MercadoPagoProvider(access_token="invalid-or-public-key")
        with pytest.raises(ValueError) as exc_info:
            provider.create_payment(
                token="tok_xxx",
                amount=100.0,
                installments=1,
                payment_method_id="pix",
                payer_email="a@b.com",
                description="Test",
                external_reference="1",
            )
    msg = str(exc_info.value)
    assert "Access Token" in msg
    assert "Chave Pública" in msg or "Chave pública" in msg


# ── Bricks: charge_saved_card ──────────────────────────────────────


def test_charge_saved_card_success() -> None:
    mock_card_get = MagicMock()
    mock_card_get.status_code = 200
    mock_card_get.json.return_value = {
        "id": "card_abc",
        "payment_method": {"id": "visa"},
        "issuer": {"id": 310},
    }
    mock_payment = MagicMock()
    mock_payment.status_code = 201
    mock_payment.json.return_value = {"id": 999, "status": "approved"}

    with patch("app.providers.payments.mercadopago.httpx.Client") as mock_client_class:
        instance = mock_client_class.return_value.__enter__.return_value
        instance.get.return_value = mock_card_get
        instance.post.return_value = mock_payment
        provider = MercadoPagoProvider(access_token="tk")
        result = provider.charge_saved_card(
            customer_id="cust_123",
            card_id="card_abc",
            amount=197.0,
            description="Site Essencial - Mensal",
            external_reference="55",
        )
    assert result["status"] == "approved"
