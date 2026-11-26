from datetime import datetime, timezone, date

from sqlalchemy import String, Text, DateTime, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from backend.database.connection import Base


class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    mood: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    entry_date: Mapped[date] = mapped_column(
        Date,
        default=date.today,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )
