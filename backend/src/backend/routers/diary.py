from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models import DiaryEntry, User
from backend.schemas.diary import DiaryCreate, DiaryUpdate, DiaryResponse
from backend.core.dependencies import get_current_user

router = APIRouter(prefix="/diary", tags=["Diary"])


@router.post("/", response_model=DiaryResponse, status_code=201)
def create_entry(
    data: DiaryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    entry = DiaryEntry(
        user_id=user.id,
        title=data.title,
        content=data.content,
        mood=data.mood,
        entry_date=data.entry_date
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/", response_model=list[DiaryResponse])
def get_entries(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(DiaryEntry).filter(
        DiaryEntry.user_id == user.id
    ).order_by(DiaryEntry.entry_date.desc()).all()


@router.get("/{entry_id}", response_model=DiaryResponse)
def get_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    entry = db.query(DiaryEntry).filter(
        DiaryEntry.id == entry_id,
        DiaryEntry.user_id == user.id
    ).first()

    if entry is None:
        raise HTTPException(404, "Diary entry not found")

    return entry


@router.patch("/{entry_id}", response_model=DiaryResponse)
def update_entry(
    entry_id: int,
    data: DiaryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    entry = db.query(DiaryEntry).filter(
        DiaryEntry.id == entry_id,
        DiaryEntry.user_id == user.id
    ).first()

    if entry is None:
        raise HTTPException(404, "Diary entry not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)

    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    entry = db.query(DiaryEntry).filter(
        DiaryEntry.id == entry_id,
        DiaryEntry.user_id == user.id
    ).first()

    if entry is None:
        raise HTTPException(404, "Diary entry not found")

    db.delete(entry)
    db.commit()
    return None
