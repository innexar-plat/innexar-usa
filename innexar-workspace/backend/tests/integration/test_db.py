"""Integration tests: create User, Customer, CustomerUser and read back."""

import uuid

import pytest
import pytest_asyncio
from app.core.security import hash_password
from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from app.models.user import User
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


@pytest_asyncio.fixture
async def sample_staff_user(db_session: AsyncSession) -> User:
    """Create one staff user (unique email per test)."""
    suffix = uuid.uuid4().hex[:8]
    email = f"admin-{suffix}@test.innexar.com"
    user = User(
        email=email,
        password_hash=hash_password("admin-secret"),
        role="admin",
        org_id="innexar",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def sample_customer_and_user(
    db_session: AsyncSession,
) -> tuple[Customer, CustomerUser]:
    """Create one customer and one customer_user (unique email per test)."""
    suffix = uuid.uuid4().hex[:8]
    email = f"acme-{suffix}@test.innexar.com"
    customer = Customer(
        org_id="innexar",
        name="Acme Corp",
        email=email,
    )
    db_session.add(customer)
    await db_session.flush()
    customer_user = CustomerUser(
        customer_id=customer.id,
        email=email,
        password_hash=hash_password("acme-secret"),
        email_verified=True,
    )
    db_session.add(customer_user)
    await db_session.commit()
    await db_session.refresh(customer)
    await db_session.refresh(customer_user)
    return customer, customer_user


@pytest.mark.asyncio
async def test_create_and_read_user(
    db_session: AsyncSession,
    sample_staff_user: User,
) -> None:
    """Create User and read back."""
    result = await db_session.execute(
        select(User).where(User.email == sample_staff_user.email)
    )
    found = result.scalar_one_or_none()
    assert found is not None
    assert found.id == sample_staff_user.id
    assert found.email == sample_staff_user.email
    assert found.role == "admin"


@pytest.mark.asyncio
async def test_create_and_read_customer_and_user(
    db_session: AsyncSession,
    sample_customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """Create Customer and CustomerUser and read back."""
    customer, customer_user = sample_customer_and_user
    result = await db_session.execute(
        select(Customer).where(Customer.id == customer.id)
    )
    found_customer = result.scalar_one_or_none()
    assert found_customer is not None
    assert found_customer.name == "Acme Corp"

    result2 = await db_session.execute(
        select(CustomerUser).where(CustomerUser.customer_id == customer.id)
    )
    found_user = result2.scalar_one_or_none()
    assert found_user is not None
    assert found_user.email == customer_user.email
    assert found_user.customer_id == customer.id
