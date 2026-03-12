"""Unit tests for portal notifications: GET list, PATCH {id}/read."""

import pytest
from app.core.security import create_token_customer
from app.models.customer import Customer
from app.models.customer_user import CustomerUser
from app.models.notification import Notification
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


def _auth_headers(customer_user: CustomerUser) -> dict[str, str]:
    token = create_token_customer(customer_user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_portal_notifications_list_200(
    client: AsyncClient,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """GET /api/portal/notifications returns 200 and list."""
    _, customer_user = customer_and_user
    r = await client.get(
        "/api/portal/notifications",
        headers=_auth_headers(customer_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_portal_notifications_mark_read_204(
    client: AsyncClient,
    override_get_db: AsyncSession,
    customer_and_user: tuple[Customer, CustomerUser],
) -> None:
    """PATCH /api/portal/notifications/{id}/read returns 204."""
    _, customer_user = customer_and_user
    n = Notification(
        customer_user_id=customer_user.id,
        channel="in_app",
        title="Test",
        body="Body",
    )
    override_get_db.add(n)
    await override_get_db.flush()
    r = await client.patch(
        f"/api/portal/notifications/{n.id}/read",
        headers=_auth_headers(customer_user),
    )
    assert r.status_code == 204
