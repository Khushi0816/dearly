from pydantic import BaseModel, ConfigDict


class AboutMeUpdate(BaseModel):
    name: str | None = None
    nickname: str | None = None
    bio: str | None = None
    location: str | None = None

    favouriteColor: str | None = None
    favouriteSong: str | None = None
    favouriteBook: str | None = None
    favouriteMovie: str | None = None
    favouriteFood: str | None = None
    favouriteHobby: str | None = None

    currentChapter: str | None = None
    currentGoal: str | None = None
    favouriteQuote: str | None = None
    quoteAuthor: str | None = None

    profileImage: str | None = None


class AboutMeResponse(BaseModel):
    id: int
    name: str
    nickname: str
    bio: str
    location: str

    favouriteColor: str
    favouriteSong: str
    favouriteBook: str
    favouriteMovie: str
    favouriteFood: str
    favouriteHobby: str

    currentChapter: str
    currentGoal: str
    favouriteQuote: str
    quoteAuthor: str

    profileImage: str

    model_config = ConfigDict(from_attributes=True)
