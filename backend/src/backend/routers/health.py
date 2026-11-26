
from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/")
def home():
    return {"message": "Welcome to Dearly 💌"}


@router.get("/health")
def health_check():
    return {"status": "healthy"}
