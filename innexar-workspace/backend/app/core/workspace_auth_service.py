"""Workspace staff auth: login, forgot-password, reset-password, change-password. No DB in router."""

import secrets
from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_token_staff, hash_password, verify_password
from app.models.staff_password_reset import StaffPasswordResetToken
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import MessageResponse, StaffLoginResponse

if TYPE_CHECKING:
    from fastapi import BackgroundTasks


async def staff_login(
    db: AsyncSession, email: str, password: str
) -> StaffLoginResponse:
    """Validate credentials and return JWT. Raises ValueError if invalid."""
    email_lower = email.lower().strip()
    repo = UserRepository(db)
    user = await repo.get_by_email(email_lower)
    if user is None or not verify_password(password, user.password_hash):
        raise ValueError("Email ou senha incorretos")
    token = create_token_staff(user.id)
    return StaffLoginResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
    )


async def staff_forgot_password(
    db: AsyncSession,
    email: str,
    background_tasks: "BackgroundTasks",
) -> MessageResponse:
    """Create reset token and queue email if user exists. Always returns same message."""
    from app.core.config import settings
    from app.core.database import AsyncSessionLocal
    from app.providers.email.loader import get_email_provider

    email_lower = email.lower().strip()
    repo = UserRepository(db)
    user = await repo.get_by_email(email_lower)
    if user:
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now(UTC) + timedelta(hours=24)
        row = StaffPasswordResetToken(
            user_id=user.id,
            token=token,
            expires_at=expires_at,
        )
        repo.add_reset_token(row)
        await repo.flush()
        base_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip(
            "/"
        )
        reset_link = f"{base_url}/workspace/reset-password?token={token}"
        org_id = user.org_id or "innexar"

        async def _send(recipient: str, link: str, org: str) -> None:
            async with AsyncSessionLocal() as sess:
                provider = await get_email_provider(sess, org_id=org)
                if provider:
                    subject = "Redefinir senha do painel administrativo"
                    body = (
                        f"Você solicitou a redefinição de senha do painel.\n\n"
                        f"Acesse o link abaixo para definir uma nova senha (válido por 24 horas):\n\n"
                        f"{link}\n\n"
                        "Se você não solicitou isso, ignore este e-mail."
                    )
                    provider.send(recipient, subject, body, None)

        background_tasks.add_task(_send, email_lower, reset_link, org_id)
    return MessageResponse(
        message="If an account exists with this email, you will receive a reset link."
    )


async def staff_reset_password(
    db: AsyncSession, token: str, new_password: str
) -> MessageResponse:
    """Set new password from token. Invalidates token. Raises ValueError if invalid."""
    if not token.strip() or len(new_password) < 6:
        raise ValueError("Token e senha (mín. 6 caracteres) são obrigatórios")
    repo = UserRepository(db)
    row = await repo.get_valid_reset_token(token.strip())
    if not row:
        raise ValueError("Token inválido ou expirado")
    user = await repo.get_by_id(row.user_id)
    if not user:
        await repo.delete_reset_token_by_id(row.id)
        raise ValueError("Token inválido ou expirado")
    await repo.update_user_password(user, hash_password(new_password))
    await repo.delete_reset_tokens_for_user(user.id)
    return MessageResponse(message="Senha atualizada. Faça login novamente.")


async def staff_change_password(
    db: AsyncSession,
    user: User,
    current_password: str,
    new_password: str,
) -> MessageResponse:
    """Change password for staff. Raises ValueError if validation fails."""
    if len(new_password) < 6:
        raise ValueError("Nova senha deve ter no mínimo 6 caracteres")
    if not verify_password(current_password, user.password_hash):
        raise ValueError("Senha atual incorreta")
    repo = UserRepository(db)
    await repo.update_user_password(user, hash_password(new_password))
    return MessageResponse(message="Senha alterada com sucesso.")
