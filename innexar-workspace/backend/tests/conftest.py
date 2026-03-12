"""Pytest fixtures: app, client, db_session, override get_db."""

from __future__ import annotations

import asyncio
import os
import uuid
from collections.abc import AsyncGenerator, Generator
from typing import Any
from unittest.mock import patch

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient
from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

# Use SQLite in-memory for tests so each engine gets a fresh DB (set before importing app)
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("TESTING", "1")

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from app.models.feature_flag import FeatureFlag
from app.models.permission import Permission
from app.models.role import Role, role_permissions, user_roles
from app.models.user import User
from app.modules.billing.models import PricePlan
from app.modules.projects.models import Project

from tests.storage_fake import FakeStorageBackend

TEST_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///:memory:")


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create event loop for async tests."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


def _is_sqlite(url: str) -> bool:
    """True if URL is SQLite (aiosqlite)."""
    return "sqlite" in url


def _ensure_all_models_registered() -> None:
    """Import all ORM model modules so Base.metadata has every table before create_all."""
    from app.models import (  # noqa: F401
        AuditLog,
        Customer,
        CustomerUser,
        FeatureFlag,
        HestiaSettings,
        IntegrationConfig,
        Notification,
        Permission,
        ProjectRequest,
        Role,
        StaffPasswordResetToken,
        User,
    )
    from app.models.customer_password_reset import (
        CustomerPasswordResetToken,  # noqa: F401
    )
    from app.modules.billing.models import (  # noqa: F401
        Invoice,
        MPSubscriptionCheckout,
        PaymentAttempt,
        PricePlan,
        Product,
        ProvisioningJob,
        ProvisioningRecord,
        Subscription,
        WebhookEvent,
    )
    from app.modules.crm.models import Contact  # noqa: F401
    from app.modules.files.models import ProjectFile  # noqa: F401
    from app.modules.projects.models import Project  # noqa: F401
    from app.modules.projects.modification_request import (
        ModificationRequest,  # noqa: F401
    )
    from app.modules.projects.project_message import ProjectMessage  # noqa: F401
    from app.modules.support.models import Ticket, TicketMessage  # noqa: F401


@pytest_asyncio.fixture
async def engine_and_session() -> (
    AsyncGenerator[tuple[Any, async_sessionmaker[AsyncSession]], None]
):
    """Create test engine and session factory."""
    _ensure_all_models_registered()
    kwargs: dict[str, Any] = {"echo": False}
    if _is_sqlite(TEST_DATABASE_URL):
        kwargs["connect_args"] = {"check_same_thread": False}
        kwargs["poolclass"] = StaticPool
    engine = create_async_engine(TEST_DATABASE_URL, **kwargs)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session_maker = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    yield engine, async_session_maker
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(
    engine_and_session: tuple[Any, async_sessionmaker[AsyncSession]],
) -> AsyncGenerator[AsyncSession, None]:
    """Yield a test DB session (rollback after each test)."""
    _engine, async_session_maker = engine_and_session
    async with async_session_maker() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def override_get_db(
    db_session: AsyncSession,
) -> AsyncGenerator[AsyncSession, None]:
    """Override get_db to use test session."""

    async def _get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = _get_db
    yield db_session
    app.dependency_overrides.pop(get_db, None)


@pytest_asyncio.fixture
async def client(override_get_db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """HTTP client (httpx AsyncClient) for E2E tests."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


@pytest.fixture
def sync_client() -> Generator[TestClient, None, None]:
    """Synchronous test client (for unit tests that don't need async)."""
    with TestClient(app) as c:
        yield c


# ---- Data fixtures for E2E ----
RBAC_PERMISSION_SLUGS = [
    "billing:read",
    "billing:write",
    "crm:read",
    "crm:write",
    "projects:read",
    "projects:write",
    "support:read",
    "support:write",
    "config:read",
    "config:write",
    "dashboard:read",
]


@pytest_asyncio.fixture
async def staff_user(db_session: AsyncSession) -> User:
    """Create a staff user for tests with admin role (all permissions)."""
    suffix = uuid.uuid4().hex[:8]
    email = f"staff-{suffix}@test.innexar.com"
    user = User(
        email=email,
        password_hash=hash_password("staff-secret"),
        role="admin",
        org_id="innexar",
    )
    db_session.add(user)
    await db_session.flush()
    perms: list[Permission] = []
    for slug in RBAC_PERMISSION_SLUGS:
        r = await db_session.execute(
            select(Permission).where(Permission.slug == slug).limit(1)
        )
        p = r.scalar_one_or_none()
        if p is None:
            p = Permission(slug=slug, description=slug)
            db_session.add(p)
            await db_session.flush()
        perms.append(p)
    r = await db_session.execute(select(Role).where(Role.slug == "admin").limit(1))
    admin_role = r.scalar_one_or_none()
    if admin_role is None:
        admin_role = Role(org_id="innexar", name="Administrator", slug="admin")
        db_session.add(admin_role)
        await db_session.flush()
        for p in perms:
            await db_session.execute(
                insert(role_permissions).values(
                    role_id=admin_role.id, permission_id=p.id
                )
            )
        await db_session.execute(
            insert(user_roles).values(user_id=user.id, role_id=admin_role.id)
        )
    else:
        await db_session.execute(
            insert(user_roles).values(user_id=user.id, role_id=admin_role.id)
        )
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def customer_and_user(db_session: AsyncSession) -> tuple[Customer, CustomerUser]:
    """Create a customer and customer_user for portal login tests (unique email per test)."""
    suffix = uuid.uuid4().hex[:8]
    email = f"customer-{suffix}@test.innexar.com"
    customer = Customer(
        org_id="innexar",
        name="Test Customer",
        email=email,
    )
    db_session.add(customer)
    await db_session.flush()
    customer_user = CustomerUser(
        customer_id=customer.id,
        email=email,
        password_hash=hash_password("customer-secret"),
        email_verified=True,
    )
    db_session.add(customer_user)
    await db_session.commit()
    await db_session.refresh(customer)
    await db_session.refresh(customer_user)
    return customer, customer_user


@pytest_asyncio.fixture
async def billing_enabled(db_session: AsyncSession) -> None:
    """Enable billing feature flag for tests that need it (idempotent)."""
    r = await db_session.execute(
        select(FeatureFlag).where(FeatureFlag.key == "billing.enabled")
    )
    existing = r.scalar_one_or_none()
    if existing:
        if not existing.enabled:
            existing.enabled = True
            await db_session.commit()
        return
    flag = FeatureFlag(key="billing.enabled", enabled=True)
    db_session.add(flag)
    try:
        await db_session.commit()
    except Exception:  # e.g. UniqueViolation if another test/session already created it
        await db_session.rollback()
        r2 = await db_session.execute(
            select(FeatureFlag).where(FeatureFlag.key == "billing.enabled")
        )
        if r2.scalar_one_or_none() is None:
            raise


@pytest_asyncio.fixture
async def portal_projects_tickets_enabled(db_session: AsyncSession) -> None:
    """Enable portal.projects.enabled and portal.tickets.enabled for tests that need portal routes (idempotent)."""
    for key in ("portal.projects.enabled", "portal.tickets.enabled"):
        r = await db_session.execute(select(FeatureFlag).where(FeatureFlag.key == key))
        existing = r.scalar_one_or_none()
        if existing:
            if not existing.enabled:
                existing.enabled = True
                await db_session.commit()
        else:
            db_session.add(FeatureFlag(key=key, enabled=True))
            try:
                await db_session.commit()
            except Exception:
                await db_session.rollback()


@pytest_asyncio.fixture
async def portal_project(
    db_session: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
) -> Project:
    """Create a project owned by the customer for portal API tests."""
    customer, _ = customer_and_user
    project = Project(
        org_id="innexar",
        customer_id=customer.id,
        name="Test Project",
        status="em_producao",
    )
    db_session.add(project)
    await db_session.commit()
    await db_session.refresh(project)
    return project


@pytest_asyncio.fixture
async def portal_project_with_plan(
    db_session: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
) -> tuple[Project, PricePlan]:
    """Create project + product + price plan + subscription for modification-request limit tests."""
    from app.modules.billing.enums import SubscriptionStatus
    from app.modules.billing.models import Product, Subscription

    customer, _ = customer_and_user
    product = Product(org_id="innexar", name="Test Product")
    db_session.add(product)
    await db_session.flush()
    plan = PricePlan(
        product_id=product.id,
        name="Starter",
        interval="monthly",
        amount=99.0,
        currency="BRL",
        monthly_adjustments_limit=2,
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
    project = Project(
        org_id="innexar",
        customer_id=customer.id,
        name="Test Project",
        status="em_producao",
        subscription_id=sub.id,
    )
    db_session.add(project)
    await db_session.commit()
    await db_session.refresh(project)
    await db_session.refresh(plan)
    return project, plan


@pytest.fixture
def fake_storage() -> Generator[FakeStorageBackend, None, None]:
    """Provide in-memory storage and patch get_storage_backend so upload/download/delete work without MinIO."""
    from app.core.storage import loader as storage_loader

    fake = FakeStorageBackend()
    storage_loader.get_storage_backend.cache_clear()
    # Patch loader (portal_router imports inside handler) and files.service (imported at load)
    with (
        patch.object(storage_loader, "get_storage_backend", side_effect=lambda: fake),
        patch(
            "app.modules.files.service.get_storage_backend", side_effect=lambda: fake
        ),
    ):
        try:
            yield fake
        finally:
            storage_loader.get_storage_backend.cache_clear()
