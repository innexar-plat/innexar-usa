"""Shared datetime helpers. Use for DB defaults to avoid deprecated datetime.utcnow."""

from datetime import datetime, timezone


def utc_now() -> datetime:
    """Return current UTC time (timezone-aware). Use as default=utc_now in SQLAlchemy columns."""
    return datetime.now(timezone.utc)  # noqa: UP017 — timezone.utc for compatibility
