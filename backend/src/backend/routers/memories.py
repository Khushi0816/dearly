from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter, Depends, File, Form, HTTPException,
    UploadFile, status
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models import MemoryPhoto, User
from backend.schemas.memory import MemoryPhotoUpdate, MemoryPhotoResponse
from backend.core.dependencies import get_current_user

router = APIRouter(prefix="/memories", tags=["Memories"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif"
}


def format_photo(photo):
    return MemoryPhotoResponse(
        id=photo.id,
        caption=photo.caption,
        original_name=photo.original_name,
        content_type=photo.content_type,
        file_size=photo.file_size,
        photo_url=f"/memories/photos/{photo.id}/file",
        created_at=photo.created_at
    )


@router.post(
    "/photos",
    response_model=MemoryPhotoResponse,
    status_code=status.HTTP_201_CREATED
)
async def upload_photo(
    caption: str | None = Form(default=None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Unsupported image type")

    stored_name = f"{uuid4().hex}{ALLOWED_TYPES[file.content_type]}"
    file_path = UPLOAD_DIR / stored_name
    file_size = 0

    try:
        with file_path.open("wb") as destination:
            while chunk := await file.read(1024 * 1024):
                file_size += len(chunk)
                if file_size > MAX_FILE_SIZE:
                    raise HTTPException(413, "Image size cannot exceed 10 MB")
                destination.write(chunk)
    except Exception:
        file_path.unlink(missing_ok=True)
        raise
    finally:
        await file.close()

    photo = MemoryPhoto(
        user_id=user.id,
        caption=caption,
        original_name=(file.filename or "photo")[:255],
        stored_name=stored_name,
        content_type=file.content_type,
        file_size=file_size
    )

    try:
        db.add(photo)
        db.commit()
        db.refresh(photo)
    except Exception:
        db.rollback()
        file_path.unlink(missing_ok=True)
        raise

    return format_photo(photo)


@router.get("/photos", response_model=list[MemoryPhotoResponse])
def get_photos(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    photos = db.query(MemoryPhoto).filter(
        MemoryPhoto.user_id == user.id
    ).order_by(MemoryPhoto.created_at.desc()).all()

    return [format_photo(photo) for photo in photos]


@router.get("/photos/{photo_id}/file")
def get_photo_file(
    photo_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    photo = db.query(MemoryPhoto).filter(
        MemoryPhoto.id == photo_id,
        MemoryPhoto.user_id == user.id
    ).first()

    if photo is None:
        raise HTTPException(404, "Memory photo not found")

    file_path = UPLOAD_DIR / photo.stored_name
    if not file_path.is_file():
        raise HTTPException(404, "Photo file not found")

    return FileResponse(
        file_path,
        media_type=photo.content_type,
        filename=photo.original_name
    )


@router.get("/photos/{photo_id}", response_model=MemoryPhotoResponse)
def get_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    photo = db.query(MemoryPhoto).filter(
        MemoryPhoto.id == photo_id,
        MemoryPhoto.user_id == user.id
    ).first()

    if photo is None:
        raise HTTPException(404, "Memory photo not found")

    return format_photo(photo)


@router.patch("/photos/{photo_id}", response_model=MemoryPhotoResponse)
def update_photo(
    photo_id: int,
    data: MemoryPhotoUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    photo = db.query(MemoryPhoto).filter(
        MemoryPhoto.id == photo_id,
        MemoryPhoto.user_id == user.id
    ).first()

    if photo is None:
        raise HTTPException(404, "Memory photo not found")

    photo.caption = data.caption
    db.commit()
    db.refresh(photo)
    return format_photo(photo)


@router.delete("/photos/{photo_id}", status_code=204)
def delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    photo = db.query(MemoryPhoto).filter(
        MemoryPhoto.id == photo_id,
        MemoryPhoto.user_id == user.id
    ).first()

    if photo is None:
        raise HTTPException(404, "Memory photo not found")

    file_path = UPLOAD_DIR / photo.stored_name
    db.delete(photo)
    db.commit()
    file_path.unlink(missing_ok=True)
    return None
