from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from backend.database.connection import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
        index=True
    )

    displayName: Mapped[str] = mapped_column(String(255), default="")
    theme: Mapped[str] = mapped_column(String(50), default="pink")
    confirmBeforeDelete: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )
    compactMode: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )
