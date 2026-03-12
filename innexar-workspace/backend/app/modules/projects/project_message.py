"""Project messages model: communication between customer and staff."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.datetime_utils import utc_now

if TYPE_CHECKING:
    from app.modules.projects.models import Project


class ProjectMessage(Base):
    """Message in a project thread (customer <-> staff)."""

    __tablename__ = "project_messages"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True
    )
    sender_type: Mapped[str] = mapped_column(
        String(16), nullable=False, index=True
    )  # "customer" or "staff"
    sender_id: Mapped[int] = mapped_column(Integer, nullable=False)
    sender_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    attachment_key: Mapped[str | None] = mapped_column(
        String(512), nullable=True
    )  # MinIO path
    attachment_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )

    project: Mapped["Project"] = relationship("Project", backref="messages")
