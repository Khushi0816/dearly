from typing import Literal

from pydantic import BaseModel, ConfigDict


class SettingsUpdate(BaseModel):
    displayName: str | None = None
    theme: Literal["pink", "lavender", "peach", "mint"] | None = None
    confirmBeforeDelete: bool | None = None
    compactMode: bool | None = None


class SettingsResponse(BaseModel):
    id: int
    displayName: str
    theme: Literal["pink", "lavender", "peach", "mint"]
    confirmBeforeDelete: bool
    compactMode: bool

    model_config = ConfigDict(from_attributes=True)
