from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from backend.database.connection import get_db
from backend.models.user import User
from backend.schemas.auth import (
    UserRegister, UserLogin, UserResponse, TokenResponse
)
from backend.core.security import (
    hash_password, verify_password, create_access_token
)
from backend.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    email = str(user_data.email).strip().lower()

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(409, "An account with this email already exists")

    user = User(
        name=user_data.name.strip(),
        email=email,
        hashed_password=hash_password(user_data.password)
    )

    db.add(user)

    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "An account with this email already exists")

    return user


@router.post("/login", response_model=TokenResponse)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    email = str(login_data.email).strip().lower()

    user = db.query(User).filter(User.email == email).first()

    if user is None or not verify_password(
        login_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(403, "This account is inactive")

    return TokenResponse(
        access_token=create_access_token(user.id),
        expires_in=30 * 60
    )


@router.get("/me", response_model=UserResponse)
def get_my_account(
    current_user: User = Depends(get_current_user)
):
    return current_user


