"""Unit tests for encryption: encrypt_value, decrypt_value roundtrip; mask_value."""

import pytest
from app.core.encryption import decrypt_value, encrypt_value, mask_value


def test_encrypt_decrypt_roundtrip() -> None:
    """encrypt_value then decrypt_value returns original string."""
    plain = "secret-api-key-123"
    cipher = encrypt_value(plain)
    if cipher is None:
        pytest.skip(
            "Encryption not available (ENCRYPTION_KEY or SECRET_KEY_STAFF not set)"
        )
    assert cipher is not None
    dec = decrypt_value(cipher)
    assert dec == plain


def test_decrypt_invalid_returns_none() -> None:
    """decrypt_value with invalid ciphertext returns None."""
    result = decrypt_value("not-valid-base64-or-tampered")
    assert result is None


def test_decrypt_none_returns_none() -> None:
    """decrypt_value with None returns None."""
    assert decrypt_value(None) is None


def test_mask_value_short() -> None:
    """mask_value with short or empty string returns ***."""
    assert mask_value("") == "***"
    assert mask_value("ab") == "***"


def test_mask_value_long() -> None:
    """mask_value masks middle of string (first 4 + *** + last 4)."""
    result = mask_value("sk_live_abcdefghijklmnop")
    assert result == "sk_l***mnop"
    assert "***" in result
