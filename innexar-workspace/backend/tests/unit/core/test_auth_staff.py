"""Unit tests for staff token create/validate (security layer)."""

from app.core.security import create_token_staff, decode_token_staff


def test_token_staff_contains_exp():
    token = create_token_staff(42)
    payload = decode_token_staff(token)
    assert payload is not None
    assert "exp" in payload


def test_token_staff_sub_is_string():
    token = create_token_staff(99)
    payload = decode_token_staff(token)
    assert payload is not None
    assert payload["sub"] == "99"
