"""Unit tests for security (hash, verify, token create/decode)."""

from app.core.security import (
    create_token_customer,
    create_token_staff,
    decode_token_customer,
    decode_token_staff,
    hash_password,
    verify_password,
)


def test_hash_password_returns_non_empty_string():
    result = hash_password("secret")
    assert isinstance(result, str)
    assert len(result) > 0


def test_verify_password_correct():
    hashed = hash_password("secret")
    assert verify_password("secret", hashed) is True


def test_verify_password_incorrect():
    hashed = hash_password("secret")
    assert verify_password("wrong", hashed) is False


def test_create_and_decode_token_staff():
    token = create_token_staff(1)
    assert isinstance(token, str)
    payload = decode_token_staff(token)
    assert payload is not None
    assert payload.get("sub") == "1"
    assert payload.get("type") == "staff"


def test_decode_token_staff_rejects_customer_token():
    token = create_token_customer(1)
    payload = decode_token_staff(token)
    assert payload is None


def test_create_and_decode_token_customer():
    token = create_token_customer(1)
    assert isinstance(token, str)
    payload = decode_token_customer(token)
    assert payload is not None
    assert payload.get("sub") == "1"
    assert payload.get("type") == "customer"


def test_decode_token_customer_rejects_staff_token():
    token = create_token_staff(1)
    payload = decode_token_customer(token)
    assert payload is None
