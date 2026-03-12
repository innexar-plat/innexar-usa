"""Projects schemas."""

from datetime import datetime

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    """Create project."""

    customer_id: int
    name: str
    status: str = "active"
    subscription_id: int | None = None


class ProjectUpdate(BaseModel):
    """Update project (partial)."""

    name: str | None = None
    status: str | None = None
    expected_delivery_at: datetime | None = None
    delivery_info: dict[str, object] | None = None


class ProjectResponse(BaseModel):
    """Project response."""

    id: int
    org_id: str
    customer_id: int
    name: str
    status: str
    subscription_id: int | None
    expected_delivery_at: datetime | None
    delivery_info: dict[str, object] | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StaffSendMessageBody(BaseModel):
    """Body for staff sending a project message."""

    body: str


class ProjectMessageResponse(BaseModel):
    """Project message (workspace list/send)."""

    id: int
    sender_type: str
    sender_name: str | None
    body: str
    attachment_key: str | None
    attachment_name: str | None
    created_at: datetime | None

    model_config = {"from_attributes": True}


class ModificationRequestListItem(BaseModel):
    """Modification request list item."""

    id: int
    title: str
    description: str
    status: str
    staff_notes: str | None
    attachment_name: str | None
    created_at: datetime | None

    model_config = {"from_attributes": True}


class ModificationRequestUpdateBody(BaseModel):
    """Body for staff updating a modification request (partial)."""

    status: str | None = None
    staff_notes: str | None = None


class ModificationRequestUpdateResponse(BaseModel):
    """Modification request after update (partial)."""

    id: int
    title: str
    status: str
    staff_notes: str | None

    model_config = {"from_attributes": True}
