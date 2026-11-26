from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models import Letter, User
from backend.schemas.letter import LetterCreate, LetterUpdate, LetterResponse
from backend.core.dependencies import get_current_user

router = APIRouter(prefix="/letters", tags=["Letters"])


@router.post("/", response_model=LetterResponse, status_code=201)
def create_letter(
    data: LetterCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    letter = Letter(
        user_id=user.id,
        title=data.title,
        content=data.content
    )
    db.add(letter)
    db.commit()
    db.refresh(letter)
    return letter


@router.get("/", response_model=list[LetterResponse])
def get_letters(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(Letter).filter(
        Letter.user_id == user.id
    ).order_by(Letter.created_at.desc()).all()


@router.get("/{letter_id}", response_model=LetterResponse)
def get_letter(
    letter_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    letter = db.query(Letter).filter(
        Letter.id == letter_id,
        Letter.user_id == user.id
    ).first()

    if letter is None:
        raise HTTPException(404, "Letter not found")

    return letter


@router.patch("/{letter_id}", response_model=LetterResponse)
def update_letter(
    letter_id: int,
    data: LetterUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    letter = db.query(Letter).filter(
        Letter.id == letter_id,
        Letter.user_id == user.id
    ).first()

    if letter is None:
        raise HTTPException(404, "Letter not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(letter, field, value)

    db.commit()
    db.refresh(letter)
    return letter


@router.delete("/{letter_id}", status_code=204)
def delete_letter(
    letter_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    letter = db.query(Letter).filter(
        Letter.id == letter_id,
        Letter.user_id == user.id
    ).first()

    if letter is None:
        raise HTTPException(404, "Letter not found")

    db.delete(letter)
    db.commit()
    return None
