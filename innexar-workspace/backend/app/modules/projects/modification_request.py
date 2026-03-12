"""Modification requests model: customer requests changes to their project."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.datetime_utils import utc_now

if TYPE_CHECKING:
    from app.models.customer import Customer
    from app.modules.projects.models import Project


class ModificationRequest(Base):
    """Customer request for a project modification/adjustment."""

    __tablename__ = "modification_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True
    )
    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    attachment_key: Mapped[str | None] = mapped_column(
        String(512), nullable=True
    )  # MinIO path
    attachment_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        String(32), default="pending", index=True
    )  # pending, approved, in_progress, completed, rejected
    staff_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    project: Mapped["Project"] = relationship(
        "Project", backref="modification_requests"
    )
    customer: Mapped["Customer"] = relationship(
        "Customer", backref="modification_requests"
    )
