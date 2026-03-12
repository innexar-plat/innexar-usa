"""Unit tests for customer auth (get_current_customer): valid, invalid, expired token."""

from datetime import timedelta

import pytest
from app.core.auth_customer import get_current_customer
from app.core.security import create_token_customer
from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_get_current_customer_valid_token_returns_customer_user(
    db_session: AsyncSession,
) -> None:
    """Valid Bearer token returns CustomerUser with customer loaded."""
    from app.core.security import hash_password

    customer = Customer(org_id="innexar", name="C", email="c@test.com")
    db_session.add(customer)
    await db_session.flush()
    customer_user = CustomerUser(
        customer_id=customer.id,
        email=customer.email,
        password_hash=hash_password("secret"),
        email_verified=True,
    )
    db_session.add(customer_user)
    await db_session.commit()
    await db_session.refresh(customer_user)

    token = create_token_customer(customer_user.id)
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    result = await get_current_customer(db=db_session, credentials=credentials)
    assert result is not None
    assert isinstance(result, CustomerUser)
    assert result.id == customer_user.id
    assert result.customer_id == customer.id
    assert result.customer is not None
    assert result.customer.id == customer.id


@pytest.mark.asyncio
async def test_get_current_customer_no_credentials_raises_401(
    db_session: AsyncSession,
) -> None:
    """Missing Authorization raises 401."""
    from fastapi import HTTPException

    with pytest.raises(HTTPException) as exc_info:
        await get_current_customer(db=db_session, credentials=None)
    assert exc_info.value.status_code == 401
    assert "não fornecido" in (exc_info.value.detail or "")


@pytest.mark.asyncio
async def test_get_current_customer_invalid_token_raises_401(
    db_session: AsyncSession,
) -> None:
    """Invalid or malformed token raises 401."""
    from fastapi import HTTPException

    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials="invalid-token",
    )
    with pytest.raises(HTTPException) as exc_info:
        await get_current_customer(db=db_session, credentials=credentials)
    assert exc_info.value.status_code == 401
    assert "inválido ou expirado" in (exc_info.value.detail or "")


@pytest.mark.asyncio
async def test_get_current_customer_expired_token_raises_401(
    db_session: AsyncSession,
) -> None:
    """Expired token raises 401."""
    from fastapi import HTTPException

    token = create_token_customer(99999, expires_delta=timedelta(seconds=-60))
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    with pytest.raises(HTTPException) as exc_info:
        await get_current_customer(db=db_session, credentials=credentials)
    assert exc_info.value.status_code == 401
    assert "inválido ou expirado" in (exc_info.value.detail or "")


@pytest.mark.asyncio
async def test_get_current_customer_valid_token_unknown_user_raises_401(
    db_session: AsyncSession,
) -> None:
    """Valid token but non-existent customer_user id raises 401 (usuário não encontrado)."""
    from fastapi import HTTPException

    token = create_token_customer(999999)
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    with pytest.raises(HTTPException) as exc_info:
        await get_current_customer(db=db_session, credentials=credentials)
    assert exc_info.value.status_code == 401
    assert "não encontrado" in (exc_info.value.detail or "")
