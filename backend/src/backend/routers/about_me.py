from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models import AboutMe, User
from backend.schemas.about_me import AboutMeUpdate, AboutMeResponse
from backend.core.dependencies import get_current_user

router = APIRouter(prefix="/about-me", tags=["About Me"])


def get_or_create_profile(db: Session, user_id: int):
    profile = db.query(AboutMe).filter(
        AboutMe.user_id == user_id
    ).first()

    if profile is None:
        profile = AboutMe(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


@router.get("/", response_model=AboutMeResponse)
def get_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return get_or_create_profile(db, user.id)


@router.patch("/", response_model=AboutMeResponse)
def update_profile(
    data: AboutMeUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    profile = get_or_create_profile(db, user.id)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value if value is not None else "")

    db.commit()
    db.refresh(profile)
    return profile
