from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models import UserSettings, User
from backend.schemas.settings import SettingsUpdate, SettingsResponse
from backend.core.dependencies import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings"])


def get_or_create_settings(db: Session, user_id: int):
    settings = db.query(UserSettings).filter(
        UserSettings.user_id == user_id
    ).first()

    if settings is None:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


@router.get("/", response_model=SettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return get_or_create_settings(db, user.id)


@router.patch("/", response_model=SettingsResponse)
def update_settings(
    data: SettingsUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    settings = get_or_create_settings(db, user.id)

    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return settings
