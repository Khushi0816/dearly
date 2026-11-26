from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MemoryPhotoUpdate(BaseModel):
    caption: str | None = None


class MemoryPhotoResponse(BaseModel):
    id: int
    caption: str | None
    original_name: str
    content_type: str
    file_size: int
    photo_url: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
