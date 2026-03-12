"""Unit tests for workspace system router: integrations, Hestia settings, seed."""

from unittest.mock import patch

import pytest
from app.core.security import create_token_staff
from app.models.user import User
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


def _staff_headers(user: User) -> dict[str, str]:
    token = create_token_staff(user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_list_integrations_200_empty(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """GET /api/workspace/config/integrations returns 200 and list (empty)."""
    r = await client.get(
        "/api/workspace/config/integrations",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_get_hestia_settings_200_creates_default(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """GET /api/workspace/config/hestia/settings returns 200 and default values."""
    r = await client.get(
        "/api/workspace/config/hestia/settings",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert "grace_period_days" in data
    assert "default_hestia_package" in data
    assert "auto_suspend_enabled" in data


@pytest.mark.asyncio
async def test_update_hestia_settings_200(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """PUT /api/workspace/config/hestia/settings updates and returns 200."""
    r = await client.put(
        "/api/workspace/config/hestia/settings",
        headers=_staff_headers(staff_user),
        json={
            "grace_period_days": 14,
            "default_hestia_package": "default",
            "auto_suspend_enabled": True,
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert data.get("grace_period_days") == 14
    assert data.get("auto_suspend_enabled") is True


@pytest.mark.asyncio
async def test_create_integration_201(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """POST /api/workspace/config/integrations creates config and returns 201."""
    with patch(
        "app.modules.system.integration_service.encrypt_value",
        return_value="encrypted_value",
    ):
        r = await client.post(
            "/api/workspace/config/integrations",
            headers=_staff_headers(staff_user),
            json={
                "scope": "global",
                "provider": "smtp",
                "key": "config",
                "value": '{"host":"smtp.example.com"}',
                "mode": "test",
                "enabled": True,
            },
        )
    assert r.status_code == 201
    data = r.json()
    assert data.get("provider") == "smtp"
    assert data.get("key") == "config"
    assert "value_masked" in data


@pytest.mark.asyncio
async def test_create_integration_500_when_encryption_unavailable(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """POST create integration when encrypt_value returns None returns 500."""
    with patch(
        "app.modules.system.integration_service.encrypt_value",
        return_value=None,
    ):
        r = await client.post(
            "/api/workspace/config/integrations",
            headers=_staff_headers(staff_user),
            json={
                "scope": "global",
                "provider": "smtp",
                "key": "config",
                "value": "secret",
                "mode": "test",
                "enabled": True,
            },
        )
    assert r.status_code == 500
    assert (
        "encryption" in r.json().get("detail", "").lower()
        or "not available" in r.json().get("detail", "").lower()
    )


@pytest.mark.asyncio
async def test_test_integration_404(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """POST /api/workspace/config/integrations/99999/test returns 404."""
    r = await client.post(
        "/api/workspace/config/integrations/99999/test",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_update_integration_200(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """PATCH /api/workspace/config/integrations/{id} updates and returns 200."""
    with patch(
        "app.modules.system.integration_service.encrypt_value",
        return_value="encrypted_value",
    ):
        create_r = await client.post(
            "/api/workspace/config/integrations",
            headers=_staff_headers(staff_user),
            json={
                "scope": "global",
                "provider": "smtp",
                "key": "config",
                "value": "old",
                "mode": "test",
                "enabled": True,
            },
        )
    assert create_r.status_code == 201
    config_id = create_r.json()["id"]
    with patch(
        "app.modules.system.integration_service.encrypt_value",
        return_value="encrypted_new",
    ):
        r = await client.patch(
            f"/api/workspace/config/integrations/{config_id}",
            headers=_staff_headers(staff_user),
            json={"enabled": False},
        )
    assert r.status_code == 200
    assert r.json().get("enabled") is False


@pytest.mark.asyncio
async def test_update_integration_404(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """PATCH /api/workspace/config/integrations/99999 returns 404."""
    r = await client.patch(
        "/api/workspace/config/integrations/99999",
        headers=_staff_headers(staff_user),
        json={"enabled": False},
    )
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_test_integration_stripe_no_key(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """POST test integration with stripe provider and no secret returns ok=False."""
    with (
        patch(
            "app.modules.system.integration_service.encrypt_value",
            return_value="enc",
        ),
        patch(
            "app.modules.system.integration_service.decrypt_value",
            return_value=None,
        ),
    ):
        create_r = await client.post(
            "/api/workspace/config/integrations",
            headers=_staff_headers(staff_user),
            json={
                "scope": "global",
                "provider": "stripe",
                "key": "secret_key",
                "value": "sk_test",
                "mode": "test",
                "enabled": True,
            },
        )
    assert create_r.status_code == 201
    config_id = create_r.json()["id"]
    with patch(
        "app.modules.system.integration_service.decrypt_value",
        return_value=None,
    ):
        r = await client.post(
            f"/api/workspace/config/integrations/{config_id}/test",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is False
    assert (
        "secret" in data.get("error", "").lower()
        or "no " in data.get("error", "").lower()
    )


@pytest.mark.asyncio
async def test_test_integration_mercadopago_not_implemented(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """POST test integration with mercadopago returns not implemented."""
    with (
        patch(
            "app.modules.system.integration_service.encrypt_value",
            return_value="enc",
        ),
        patch(
            "app.modules.system.integration_service.decrypt_value",
            return_value="token",
        ),
    ):
        create_r = await client.post(
            "/api/workspace/config/integrations",
            headers=_staff_headers(staff_user),
            json={
                "scope": "global",
                "provider": "mercadopago",
                "key": "access_token",
                "value": "token",
                "mode": "test",
                "enabled": True,
            },
        )
    assert create_r.status_code == 201
    config_id = create_r.json()["id"]
    r = await client.post(
        f"/api/workspace/config/integrations/{config_id}/test",
        headers=_staff_headers(staff_user),
    )
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is False
    assert (
        "not implemented" in data.get("error", "").lower()
        or "mercado" in data.get("error", "").lower()
    )


@pytest.mark.asyncio
async def test_test_integration_hestia_missing_keys(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """POST test integration hestia with missing base_url returns ok=False."""
    with (
        patch(
            "app.modules.system.integration_service.encrypt_value",
            return_value="enc",
        ),
        patch(
            "app.modules.system.integration_service.decrypt_value",
            return_value='{"base_url":"","access_key":"a","secret_key":"b"}',
        ),
    ):
        create_r = await client.post(
            "/api/workspace/config/integrations",
            headers=_staff_headers(staff_user),
            json={
                "scope": "global",
                "provider": "hestia",
                "key": "config",
                "value": "{}",
                "mode": "test",
                "enabled": True,
            },
        )
    assert create_r.status_code == 201
    config_id = create_r.json()["id"]
    with patch(
        "app.modules.system.integration_service.decrypt_value",
        return_value='{"base_url":"","access_key":"a","secret_key":"b"}',
    ):
        r = await client.post(
            f"/api/workspace/config/integrations/{config_id}/test",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is False
    assert (
        "missing" in data.get("error", "").lower()
        or "base_url" in data.get("error", "").lower()
    )


@pytest.mark.asyncio
async def test_test_integration_hestia_ok_mocked(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """POST test integration hestia with valid config and mocked client returns ok=True."""
    with (
        patch(
            "app.modules.system.integration_service.encrypt_value",
            return_value="enc",
        ),
        patch(
            "app.modules.system.integration_service.decrypt_value",
            return_value='{"base_url":"https://hestia.local","access_key":"ak","secret_key":"sk"}',
        ),
    ):
        create_r = await client.post(
            "/api/workspace/config/integrations",
            headers=_staff_headers(staff_user),
            json={
                "scope": "global",
                "provider": "hestia",
                "key": "config",
                "value": "{}",
                "mode": "test",
                "enabled": True,
            },
        )
    assert create_r.status_code == 201
    config_id = create_r.json()["id"]
    with (
        patch(
            "app.modules.system.integration_service.decrypt_value",
            return_value='{"base_url":"https://hestia.local","access_key":"ak","secret_key":"sk"}',
        ),
        patch(
            "app.providers.hestia.client.HestiaClient",
        ) as mock_hestia,
    ):
        mock_hestia.return_value.request.return_value = None
        r = await client.post(
            f"/api/workspace/config/integrations/{config_id}/test",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is True
    assert (
        "hestia" in data.get("message", "").lower()
        or "ok" in data.get("message", "").lower()
    )


@pytest.mark.asyncio
async def test_seed_403_invalid_token(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """POST /api/workspace/system/seed with wrong token returns 403 when SEED_TOKEN set."""
    with patch(
        "app.modules.system.seed_service.settings",
    ) as mock_settings:
        mock_settings.SEED_TOKEN = "correct-token"
        r = await client.post(
            "/api/workspace/system/seed",
            params={"token": "wrong-token"},
        )
    assert r.status_code == 403
    assert "invalid" in r.json().get("detail", "").lower()


@pytest.mark.asyncio
async def test_seed_204_with_token(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """POST /api/workspace/system/seed with valid token returns 204."""
    with patch(
        "app.modules.system.seed_service.settings",
    ) as mock_settings:
        mock_settings.SEED_TOKEN = "seed-secret"
        r = await client.post(
            "/api/workspace/system/seed",
            params={"token": "seed-secret"},
        )
    assert r.status_code == 204


@pytest.mark.asyncio
async def test_reset_admin_password_403_no_seed_token(
    client: AsyncClient,
) -> None:
    """POST reset-admin-password without SEED_TOKEN returns 403."""
    with patch(
        "app.modules.system.seed_service.settings",
    ) as mock_settings:
        mock_settings.SEED_TOKEN = None
        r = await client.post(
            "/api/workspace/system/reset-admin-password",
            params={"token": "any"},
            json={"new_password": "new-secret"},
        )
    assert r.status_code == 403
    assert "SEED_TOKEN" in r.json().get("detail", "")


@pytest.mark.asyncio
async def test_reset_admin_password_403_invalid_token(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """POST reset-admin-password with wrong token returns 403."""
    with patch(
        "app.modules.system.seed_service.settings",
    ) as mock_settings:
        mock_settings.SEED_TOKEN = "correct"
        r = await client.post(
            "/api/workspace/system/reset-admin-password",
            params={"token": "wrong"},
            json={"new_password": "new-secret"},
        )
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_reset_admin_password_204(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """POST reset-admin-password with valid token and existing admin returns 204."""
    from app.core.security import hash_password

    admin = User(
        email="admin@innexar.app",
        password_hash=hash_password("old"),
        role="admin",
        org_id="innexar",
    )
    override_get_db.add(admin)
    await override_get_db.commit()
    with patch(
        "app.modules.system.seed_service.settings",
    ) as mock_settings:
        mock_settings.SEED_TOKEN = "t"
        r = await client.post(
            "/api/workspace/system/reset-admin-password",
            params={"token": "t"},
            json={"new_password": "new-secret"},
        )
    assert r.status_code == 204


@pytest.mark.asyncio
async def test_setup_wizard_403_when_users_exist_without_token(
    client: AsyncClient,
    staff_user: User,
) -> None:
    """POST setup-wizard when users exist and no valid token returns 403."""
    with patch(
        "app.modules.system.seed_service.settings",
    ) as mock_settings:
        mock_settings.SEED_TOKEN = None
        r = await client.post(
            "/api/workspace/system/setup-wizard",
            json={},
        )
    assert r.status_code == 403
    assert (
        "only allowed" in r.json().get("detail", "").lower()
        or "wizard" in r.json().get("detail", "").lower()
    )


@pytest.mark.asyncio
async def test_setup_wizard_200_with_token(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """POST setup-wizard with valid token returns 200 and response schema."""
    with patch(
        "app.modules.system.seed_service.settings",
    ) as mock_settings:
        mock_settings.SEED_TOKEN = "wizard-token"
        r = await client.post(
            "/api/workspace/system/setup-wizard",
            params={"token": "wizard-token"},
            json={},
        )
    assert r.status_code == 200
    data = r.json()
    assert "admin_created" in data
    assert "flags_created" in data
    assert "integrations_created" in data


# ---------- test_integration: Stripe and SMTP (mocked) ----------


@pytest.mark.asyncio
async def test_test_integration_stripe_ok_mocked(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """POST test integration with stripe provider and mocked Balance.retrieve returns ok=True."""
    with (
        patch(
            "app.modules.system.integration_service.encrypt_value",
            return_value="enc",
        ),
        patch(
            "app.modules.system.integration_service.decrypt_value",
            return_value="sk_test_xyz",
        ),
    ):
        create_r = await client.post(
            "/api/workspace/config/integrations",
            headers=_staff_headers(staff_user),
            json={
                "scope": "global",
                "provider": "stripe",
                "key": "secret_key",
                "value": "sk_test_xyz",
                "mode": "test",
                "enabled": True,
            },
        )
    assert create_r.status_code == 201
    config_id = create_r.json()["id"]
    with (
        patch(
            "app.modules.system.integration_service.decrypt_value",
            return_value="sk_test_xyz",
        ),
        patch("stripe.Balance.retrieve") as mock_balance,
    ):
        mock_balance.return_value = None
        r = await client.post(
            f"/api/workspace/config/integrations/{config_id}/test",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is True
    assert (
        "stripe" in data.get("message", "").lower()
        or "ok" in data.get("message", "").lower()
    )


@pytest.mark.asyncio
async def test_test_integration_stripe_import_error(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """POST test integration stripe when stripe import raises returns ok=False."""
    with (
        patch(
            "app.modules.system.integration_service.encrypt_value",
            return_value="enc",
        ),
        patch(
            "app.modules.system.integration_service.decrypt_value",
            return_value="sk_test",
        ),
    ):
        create_r = await client.post(
            "/api/workspace/config/integrations",
            headers=_staff_headers(staff_user),
            json={
                "scope": "global",
                "provider": "stripe",
                "key": "secret_key",
                "value": "sk_test",
                "mode": "test",
                "enabled": True,
            },
        )
    assert create_r.status_code == 201
    config_id = create_r.json()["id"]
    import builtins

    real_import = builtins.__import__

    def import_mock(name, *args, **kwargs):
        if name == "stripe":
            raise ImportError("No module named 'stripe'")
        return real_import(name, *args, **kwargs)

    with (
        patch(
            "app.modules.system.integration_service.decrypt_value",
            return_value="sk_test",
        ),
        patch("builtins.__import__", side_effect=import_mock),
    ):
        r = await client.post(
            f"/api/workspace/config/integrations/{config_id}/test",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is False
    assert (
        "stripe" in data.get("error", "").lower()
        or "not installed" in data.get("error", "").lower()
    )


@pytest.mark.asyncio
async def test_test_integration_smtp_ok_mocked(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """POST test integration smtp with valid JSON and mocked SMTP returns ok=True."""
    smtp_json = '{"host":"smtp.example.com","port":587,"user":"u","password":"p"}'
    with (
        patch(
            "app.modules.system.integration_service.encrypt_value",
            return_value="enc",
        ),
        patch(
            "app.modules.system.integration_service.decrypt_value",
            return_value=smtp_json,
        ),
    ):
        create_r = await client.post(
            "/api/workspace/config/integrations",
            headers=_staff_headers(staff_user),
            json={
                "scope": "global",
                "provider": "smtp",
                "key": "config",
                "value": smtp_json,
                "mode": "test",
                "enabled": True,
            },
        )
    assert create_r.status_code == 201
    config_id = create_r.json()["id"]
    with (
        patch(
            "app.modules.system.integration_service.decrypt_value",
            return_value=smtp_json,
        ),
        patch("smtplib.SMTP") as mock_smtp,
    ):
        mock_conn = mock_smtp.return_value.__enter__.return_value
        mock_conn.starttls.return_value = None
        mock_conn.login.return_value = None
        r = await client.post(
            f"/api/workspace/config/integrations/{config_id}/test",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is True
    assert (
        "smtp" in data.get("message", "").lower()
        or "ok" in data.get("message", "").lower()
    )


@pytest.mark.asyncio
async def test_test_integration_smtp_invalid_json(
    client: AsyncClient,
    staff_user: User,
    override_get_db: AsyncSession,
) -> None:
    """POST test integration smtp with invalid JSON returns ok=False."""
    with (
        patch(
            "app.modules.system.integration_service.encrypt_value",
            return_value="enc",
        ),
        patch(
            "app.modules.system.integration_service.decrypt_value",
            return_value="not-valid-json",
        ),
    ):
        create_r = await client.post(
            "/api/workspace/config/integrations",
            headers=_staff_headers(staff_user),
            json={
                "scope": "global",
                "provider": "smtp",
                "key": "config",
                "value": "x",
                "mode": "test",
                "enabled": True,
            },
        )
    assert create_r.status_code == 201
    config_id = create_r.json()["id"]
    with patch(
        "app.modules.system.integration_service.decrypt_value",
        return_value="not-valid-json",
    ):
        r = await client.post(
            f"/api/workspace/config/integrations/{config_id}/test",
            headers=_staff_headers(staff_user),
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is False
    assert (
        "invalid" in data.get("error", "").lower()
        or "json" in data.get("error", "").lower()
    )


# ---------- setup_wizard: SMTP/Stripe/MP body, test_connection ----------


@pytest.mark.asyncio
async def test_setup_wizard_200_with_smtp_stripe_mp_and_flags(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """POST setup-wizard with smtp, stripe, mercadopago and flags creates integrations."""
    with (
        patch("app.modules.system.seed_service.settings") as mock_settings,
        patch("app.modules.system.seed_service.encrypt_value") as mock_enc,
    ):
        mock_settings.SEED_TOKEN = "wizard-token"
        mock_enc.return_value = "encrypted_value"
        r = await client.post(
            "/api/workspace/system/setup-wizard",
            params={"token": "wizard-token"},
            json={
                "smtp": {
                    "host": "smtp.example.com",
                    "port": 587,
                    "user": "u",
                    "password": "p",
                },
                "stripe": {"secret_key": "sk_test_xyz"},
                "mercadopago": {"access_token": "mp_token"},
                "flags": {"flags": {"billing.enabled": True}},
            },
        )
    assert r.status_code == 200
    data = r.json()
    assert "smtp" in data.get("integrations_created", [])
    assert "stripe" in data.get("integrations_created", [])
    assert "mercadopago" in data.get("integrations_created", [])


@pytest.mark.asyncio
async def test_setup_wizard_200_with_test_connection_mocked(
    client: AsyncClient,
    override_get_db: AsyncSession,
) -> None:
    """POST setup-wizard with test_connection=True returns test_results; Stripe call mocked so result is ok."""
    with (
        patch("app.modules.system.seed_service.settings") as mock_settings,
        patch("app.modules.system.seed_service.encrypt_value") as mock_enc,
        patch("app.modules.system.seed_service.decrypt_value") as mock_dec,
        patch("stripe.Balance.retrieve") as mock_balance,
    ):
        mock_settings.SEED_TOKEN = "wizard-token"
        mock_enc.return_value = "enc"
        mock_dec.return_value = "sk_test_xyz"
        mock_balance.return_value = None
        r = await client.post(
            "/api/workspace/system/setup-wizard",
            params={"token": "wizard-token"},
            json={
                "stripe": {"secret_key": "sk_test_xyz"},
                "test_connection": True,
            },
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("test_results") is not None
    assert "stripe" in data["test_results"]
    assert data["test_results"]["stripe"] == "ok"
