from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from backend.database.connection import Base


class AboutMe(Base):
    __tablename__ = "about_me"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
        index=True
    )

    name: Mapped[str] = mapped_column(String(255), default="")
    nickname: Mapped[str] = mapped_column(String(255), default="")
    bio: Mapped[str] = mapped_column(Text, default="")
    location: Mapped[str] = mapped_column(String(255), default="")

    favouriteColor: Mapped[str] = mapped_column(String(255), default="")
    favouriteSong: Mapped[str] = mapped_column(String(255), default="")
    favouriteBook: Mapped[str] = mapped_column(String(255), default="")
    favouriteMovie: Mapped[str] = mapped_column(String(255), default="")
    favouriteFood: Mapped[str] = mapped_column(String(255), default="")
    favouriteHobby: Mapped[str] = mapped_column(String(255), default="")

    currentChapter: Mapped[str] = mapped_column(Text, default="")
    currentGoal: Mapped[str] = mapped_column(Text, default="")
    favouriteQuote: Mapped[str] = mapped_column(Text, default="")
    quoteAuthor: Mapped[str] = mapped_column(String(255), default="")

    profileImage: Mapped[str] = mapped_column(Text, default="")
