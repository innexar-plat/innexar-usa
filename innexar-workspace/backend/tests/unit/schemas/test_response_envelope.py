"""Tests for standard API response envelope."""

from app.schemas.response_envelope import ApiEnvelope, error_envelope, success_envelope


def test_success_envelope_with_data() -> None:
    data = {"id": 1, "name": "test"}
    out = success_envelope(data)
    assert out.success is True
    assert out.data == data
    assert out.error is None


def test_success_envelope_with_none_data() -> None:
    out = success_envelope(None)
    assert out.success is True
    assert out.data is None
    assert out.error is None


def test_error_envelope() -> None:
    msg = "Not found"
    out = error_envelope(msg)
    assert out.success is False
    assert out.data is None
    assert out.error == msg


def test_api_envelope_model() -> None:
    envelope = ApiEnvelope(success=True, data=[1, 2], error=None)
    assert envelope.success is True
    assert envelope.data == [1, 2]
    assert envelope.error is None
