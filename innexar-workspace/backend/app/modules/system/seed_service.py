"""System seed service: bootstrap, seed, reset-admin-password, setup-wizard."""

import json
from datetime import UTC, datetime

from fastapi import HTTPException
from sqlalchemy import and_, insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.encryption import decrypt_value, encrypt_value
from app.models.feature_flag import FeatureFlag
from app.models.integration_config import IntegrationConfig
from app.models.role import role_permissions, user_roles
from app.models.user import User
from app.repositories.feature_flag_repository import FeatureFlagRepository
from app.repositories.integration_config_repository import (
    IntegrationConfigRepository,
)

from .schemas import SetupWizardRequest, SetupWizardResponse

RBAC_PERMISSIONS = [
    "billing:read", "billing:write", "crm:read", "crm:write",
    "projects:read", "projects:write", "support:read", "support:write",
    "config:read", "config:write", "dashboard:read",
]


class SystemSeedService:
    """Service for workspace seed, reset-admin-password, setup-wizard."""

    def __init__(
        self,
        db: AsyncSession,
        feature_flag_repo: FeatureFlagRepository,
        integration_repo: IntegrationConfigRepository,
    ) -> None:
        self._db = db
        self._ff = feature_flag_repo
        self._integration = integration_repo

    async def run_bootstrap(self) -> tuple[bool, list[str]]:
        """Create default admin, RBAC, default feature flags. Returns (admin_created, flags_created)."""
        from app.core.security import hash_password
        from app.models.permission import Permission
        from app.models.role import Role

        admin_created = False
        r = await self._db.execute(
            select(User).where(User.email == "admin@innexar.app").limit(1)
        )
        admin_user = r.scalar_one_or_none()
        if admin_user is None:
            admin_user = User(
                email="admin@innexar.app",
                password_hash=hash_password("change-me"),
                role="admin",
                org_id="innexar",
            )
            self._db.add(admin_user)
            await self._db.flush()
            admin_created = True

        perms: list[Permission] = []
        for slug in RBAC_PERMISSIONS:
            r = await self._db.execute(
                select(Permission).where(Permission.slug == slug).limit(1)
            )
            p = r.scalar_one_or_none()
            if p is None:
                p = Permission(slug=slug, description=slug)
                self._db.add(p)
                await self._db.flush()
            perms.append(p)

        r = await self._db.execute(
            select(Role).where(Role.slug == "admin").limit(1)
        )
        admin_role = r.scalar_one_or_none()
        if admin_role is None:
            admin_role = Role(
                org_id="innexar", name="Administrator", slug="admin"
            )
            self._db.add(admin_role)
            await self._db.flush()
            for p in perms:
                await self._db.execute(
                    insert(role_permissions).values(
                        role_id=admin_role.id, permission_id=p.id
                    )
                )
            await self._db.execute(
                insert(user_roles).values(
                    user_id=admin_user.id, role_id=admin_role.id
                )
            )
        else:
            r = await self._db.execute(
                select(user_roles).where(
                    and_(
                        user_roles.c.user_id == admin_user.id,
                        user_roles.c.role_id == admin_role.id,
                    )
                ).limit(1)
            )
            if r.first() is None:
                await self._db.execute(
                    insert(user_roles).values(
                        user_id=admin_user.id, role_id=admin_role.id
                    )
                )
        await self._db.flush()

        flags_created: list[str] = []
        for key, enabled in [
            ("billing.enabled", True),
            ("portal.invoices.enabled", True),
            ("portal.tickets.enabled", True),
            ("portal.projects.enabled", True),
        ]:
            flag = await self._ff.get_by_key(key)
            if flag is None:
                self._ff.add(FeatureFlag(key=key, enabled=enabled))
                flags_created.append(key)
        await self._db.flush()
        return admin_created, flags_created

    async def seed_allowed(self, token: str | None) -> None:
        """Raise 403 if seed is not allowed (token or first-run)."""
        if settings.SEED_TOKEN:
            if token != settings.SEED_TOKEN:
                raise HTTPException(
                    status_code=403, detail="Invalid seed token"
                )
        else:
            r = await self._db.execute(select(User).limit(1))
            if r.scalar_one_or_none() is not None:
                raise HTTPException(
                    status_code=403,
                    detail="Seed only allowed when no users exist or with SEED_TOKEN",
                )

    async def reset_admin_password(self, new_password: str, token: str | None) -> None:
        """Reset password for admin@innexar.app. Requires SEED_TOKEN."""
        if not settings.SEED_TOKEN:
            raise HTTPException(
                status_code=403,
                detail="Reset admin password requires SEED_TOKEN to be configured",
            )
        if token != settings.SEED_TOKEN:
            raise HTTPException(
                status_code=403, detail="Invalid seed token"
            )
        from app.core.security import hash_password

        r = await self._db.execute(
            select(User).where(User.email == "admin@innexar.app").limit(1)
        )
        admin_user = r.scalar_one_or_none()
        if admin_user is None:
            raise HTTPException(
                status_code=404,
                detail="Admin user not found; run seed first",
            )
        admin_user.password_hash = hash_password(new_password)
        await self._db.commit()

    async def setup_wizard_allowed(self, token: str | None) -> None:
        """Raise 403 if setup-wizard is not allowed."""
        if settings.SEED_TOKEN:
            if token != settings.SEED_TOKEN:
                raise HTTPException(
                    status_code=403, detail="Invalid seed token"
                )
        else:
            r = await self._db.execute(select(User).limit(1))
            if r.scalar_one_or_none() is not None:
                raise HTTPException(
                    status_code=403,
                    detail="Setup wizard only allowed when no users exist or with SEED_TOKEN",
                )

    async def run_setup_wizard(
        self, body: SetupWizardRequest, token: str | None
    ) -> SetupWizardResponse:
        """One-shot setup: bootstrap + optional IntegrationConfig (SMTP, Stripe, MP) and flags."""
        await self.setup_wizard_allowed(token)
        admin_created, flags_created = await self.run_bootstrap()
        org_id = "innexar"
        integrations_created: list[str] = []

        if body.smtp:
            val = json.dumps({
                "host": body.smtp.host,
                "port": body.smtp.port,
                "user": body.smtp.user,
                "password": body.smtp.password,
            })
            enc = encrypt_value(val)
            if enc:
                c = await self._integration.get_by_provider_key_org(
                    "smtp", "config", org_id
                )
                if c is None:
                    c = IntegrationConfig(
                        org_id=org_id,
                        scope="global",
                        provider="smtp",
                        key="config",
                        value_encrypted=enc,
                        mode="test",
                        enabled=True,
                    )
                    self._integration.add(c)
                    await self._integration.flush_and_refresh(c)
                    integrations_created.append("smtp")
                else:
                    c.value_encrypted = enc
                    await self._integration.flush_and_refresh(c)

        if body.stripe:
            enc = encrypt_value(body.stripe.secret_key)
            if enc:
                c = await self._integration.get_by_provider_key_org(
                    "stripe", "secret_key", org_id
                )
                if c is None:
                    c = IntegrationConfig(
                        org_id=org_id,
                        scope="global",
                        provider="stripe",
                        key="secret_key",
                        value_encrypted=enc,
                        mode="test",
                        enabled=True,
                    )
                    self._integration.add(c)
                    await self._integration.flush_and_refresh(c)
                    integrations_created.append("stripe")
                else:
                    c.value_encrypted = enc
                    await self._integration.flush_and_refresh(c)

        if body.mercadopago:
            enc = encrypt_value(body.mercadopago.access_token)
            if enc:
                c = await self._integration.get_by_provider_key_org(
                    "mercadopago", "access_token", org_id
                )
                if c is None:
                    c = IntegrationConfig(
                        org_id=org_id,
                        scope="global",
                        provider="mercadopago",
                        key="access_token",
                        value_encrypted=enc,
                        mode="test",
                        enabled=True,
                    )
                    self._integration.add(c)
                    await self._integration.flush_and_refresh(c)
                    integrations_created.append("mercadopago")
                else:
                    c.value_encrypted = enc
                    await self._integration.flush_and_refresh(c)

        if body.flags and body.flags.flags:
            for key, enabled in body.flags.flags.items():
                flag = await self._ff.get_by_key(key)
                if flag is None:
                    self._ff.add(FeatureFlag(key=key, enabled=enabled))
                    flags_created.append(key)
                else:
                    flag.enabled = enabled
            await self._db.flush()

        test_results: dict[str, str] | None = None
        if body.test_connection:
            test_results = {}
            c = await self._integration.get_first_by_provider_org(
                "stripe", org_id
            )
            if c and c.value_encrypted:
                try:
                    import stripe as stripe_lib
                    secret = decrypt_value(c.value_encrypted)
                    if secret:
                        stripe_lib.api_key = secret
                        stripe_lib.Balance.retrieve()
                        c.last_tested_at = datetime.now(UTC)
                        await self._integration.flush_and_refresh(c)
                        test_results["stripe"] = "ok"
                    else:
                        test_results["stripe"] = "error: no secret"
                except ImportError:
                    test_results["stripe"] = "skipped"
                except Exception as e:
                    test_results["stripe"] = f"error: {e!s}"
            if body.smtp:
                test_results["smtp"] = "skipped"

        return SetupWizardResponse(
            admin_created=admin_created,
            flags_created=flags_created,
            integrations_created=integrations_created,
            test_results=test_results,
        )