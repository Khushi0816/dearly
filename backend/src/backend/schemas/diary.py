from datetime import datetime, date

from pydantic import BaseModel, ConfigDict, Field


class DiaryCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    mood: str | None = None
    entry_date: date | None = None


class DiaryUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = Field(default=None, min_length=1)
    mood: str | None = None
    entry_date: date | None = None


class DiaryResponse(BaseModel):
    id: int
    title: str
    content: str
    mood: str | None
    entry_date: date
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
