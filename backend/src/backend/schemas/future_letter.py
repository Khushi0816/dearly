from datetime import datetime, date

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FutureLetterCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    unlock_date: date

    @field_validator("unlock_date")
    @classmethod
    def validate_unlock_date(cls, value):
        if value < date.today():
            raise ValueError("Unlock date cannot be in the past")
        return value


class FutureLetterUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = Field(default=None, min_length=1)
    unlock_date: date | None = None

    @field_validator("unlock_date")
    @classmethod
    def validate_unlock_date(cls, value):
        if value is not None and value < date.today():
            raise ValueError("Unlock date cannot be in the past")
        return value


class FutureLetterResponse(BaseModel):
    id: int
    title: str
    content: str | None
    unlock_date: date
    created_at: datetime
    updated_at: datetime
    is_unlocked: bool
    days_remaining: int

    model_config = ConfigDict(from_attributes=True)
