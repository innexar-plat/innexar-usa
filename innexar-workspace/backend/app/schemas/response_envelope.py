"""Standard API response envelope: { success, data, error }.

Use for new endpoints or gradual adoption. Existing endpoints keep direct body
until frontend is updated to read response.data.
"""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class ApiEnvelope(BaseModel, Generic[T]):
    """Standard envelope: success, data, error (null on success)."""

    success: bool = Field(description="True if request succeeded.")
    data: T | None = Field(default=None, description="Payload on success.")
    error: str | None = Field(default=None, description="Error message on failure.")


def success_envelope(data: Any) -> ApiEnvelope[Any]:
    """Build envelope for successful response."""
    return ApiEnvelope(success=True, data=data, error=None)


def error_envelope(message: str) -> ApiEnvelope[None]:
    """Build envelope for error response."""
    return ApiEnvelope(success=False, data=None, error=message)
