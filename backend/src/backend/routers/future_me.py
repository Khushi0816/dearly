from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.database.connection import get_db
from backend.models import FutureLetter, User
from backend.schemas.future_letter import (
    FutureLetterCreate,
    FutureLetterUpdate,
    FutureLetterResponse
)
from backend.core.dependencies import get_current_user

router = APIRouter(prefix="/future-me", tags=["Future Me"])


def format_future_letter(letter):
    unlocked = letter.unlock_date <= date.today()
    return FutureLetterResponse(
        id=letter.id,
        title=letter.title,
        content=letter.content if unlocked else None,
        unlock_date=letter.unlock_date,
        created_at=letter.created_at,
        updated_at=letter.updated_at,
        is_unlocked=unlocked,
        days_remaining=max(0, (letter.unlock_date - date.today()).days)
    )


@router.post("/", response_model=FutureLetterResponse, status_code=201)
def create_future_letter(
    data: FutureLetterCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    letter = FutureLetter(
        user_id=user.id,
        title=data.title,
        content=data.content,
        unlock_date=data.unlock_date
    )
    db.add(letter)
    db.commit()
    db.refresh(letter)
    return format_future_letter(letter)


@router.get("/", response_model=list[FutureLetterResponse])
def get_future_letters(
    status_filter: str = Query(
        default="all",
        alias="status",
        pattern="^(all|locked|unlocked)$"
    ),
    sort: str = Query(
        default="newest",
        pattern="^(newest|oldest)$"
    ),
    search: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    today = date.today()

    query = db.query(FutureLetter).filter(
        FutureLetter.user_id == user.id
    )

    if status_filter == "locked":
        query = query.filter(FutureLetter.unlock_date > today)
    elif status_filter == "unlocked":
        query = query.filter(FutureLetter.unlock_date <= today)

    if search:
        term = f"%{search}%"
        query = query.filter(or_(
            FutureLetter.title.ilike(term),
            (
                (FutureLetter.unlock_date <= today)
                & FutureLetter.content.ilike(term)
            )
        ))

    if sort == "newest":
        query = query.order_by(FutureLetter.created_at.desc())
    else:
        query = query.order_by(FutureLetter.created_at.asc())

    return [format_future_letter(item) for item in query.all()]


@router.get("/{letter_id}", response_model=FutureLetterResponse)
def get_future_letter(
    letter_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    letter = db.query(FutureLetter).filter(
        FutureLetter.id == letter_id,
        FutureLetter.user_id == user.id
    ).first()

    if letter is None:
        raise HTTPException(404, "Future letter not found")

    if letter.unlock_date > date.today():
        raise HTTPException(423, "This letter is still locked")

    return format_future_letter(letter)


@router.patch("/{letter_id}", response_model=FutureLetterResponse)
def update_future_letter(
    letter_id: int,
    data: FutureLetterUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    letter = db.query(FutureLetter).filter(
        FutureLetter.id == letter_id,
        FutureLetter.user_id == user.id
    ).first()

    if letter is None:
        raise HTTPException(404, "Future letter not found")

    updates = data.model_dump(exclude_unset=True)
    new_date = updates.get("unlock_date", letter.unlock_date)

    if new_date is not None and new_date < date.today():
        raise HTTPException(422, "Unlock date cannot be in the past")

    for field, value in updates.items():
        setattr(letter, field, value)

    db.commit()
    db.refresh(letter)
    return format_future_letter(letter)


@router.delete("/{letter_id}", status_code=204)
def delete_future_letter(
    letter_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    letter = db.query(FutureLetter).filter(
        FutureLetter.id == letter_id,
        FutureLetter.user_id == user.id
    ).first()

    if letter is None:
        raise HTTPException(404, "Future letter not found")

    db.delete(letter)
    db.commit()
    return None
