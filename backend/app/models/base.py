from sqlalchemy import Column, DateTime
from datetime import datetime, timezone


def _now():
    return datetime.now(timezone.utc)


class TimestampMixin:
    __abstract__ = True
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now, nullable=False)
