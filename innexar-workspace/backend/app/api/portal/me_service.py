"""Portal me: profile, password, set-password. Uses CustomerRepository only."""

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.portal.schemas import ProfileRead, ProfileUpdate
from app.core.security import hash_password, verify_password
from app.models.customer_user import CustomerUser
from app.repositories.customer_repository import CustomerRepository


class PortalMeService:
    """Portal /me: profile get/update, change password, set initial password."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._customer = CustomerRepository(db)

    async def change_password(
        self, current_user: CustomerUser, current_password: str, new_password: str
    ) -> None:
        """Validate current password and set new one. Raises 400/401 if invalid."""
        if len(new_password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nova senha deve ter no mínimo 6 caracteres",
            )
        if not verify_password(current_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Senha atual incorreta",
            )
        await self._customer.update_customer_user_password(
            current_user.id, hash_password(new_password)
        )

    async def set_initial_password(
        self, current_user: CustomerUser, new_password: str
    ) -> None:
        """Set first password and clear requires_password_change. Raises 400 if already set or short."""
        if not current_user.requires_password_change:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O usuário já definiu uma senha permanente.",
            )
        if len(new_password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nova senha deve ter no mínimo 6 caracteres",
            )
        current_user.password_hash = hash_password(new_password)
        current_user.requires_password_change = False
        await self._customer.update_customer_user(current_user)

    async def get_profile(self, customer_id: int) -> ProfileRead:
        """Get customer profile (name, email, phone, address). Raises 404 if not found."""
        cust = await self._customer.get_by_id_with_users(customer_id)
        if not cust:
            raise HTTPException(status_code=404, detail="Customer not found")
        return ProfileRead(
            name=cust.name,
            email=cust.email,
            phone=cust.phone,
            address=cust.address,
        )

    async def update_profile(
        self, customer_id: int, body: ProfileUpdate
    ) -> ProfileRead:
        """Update customer profile (name, phone, address). Returns updated ProfileRead."""
        cust = await self._customer.get_by_id_with_users(customer_id)
        if not cust:
            raise HTTPException(status_code=404, detail="Customer not found")
        if body.name is not None:
            cust.name = body.name.strip()
        if body.phone is not None:
            cust.phone = body.phone.strip() or None
        if body.address is not None:
            cust.address = body.address if body.address else None
        await self._customer.update_customer(cust)
        return ProfileRead(
            name=cust.name,
            email=cust.email,
            phone=cust.phone,
            address=cust.address,
        )
