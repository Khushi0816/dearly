from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


LetterStatus = Literal["draft", "completed"]


class LetterCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    status: LetterStatus = "completed"


class LetterUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = Field(default=None, min_length=1)
    status: LetterStatus | None = None


class LetterResponse(BaseModel):
    id: int
    title: str
    content: str
    status: LetterStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
