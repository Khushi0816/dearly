from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.core.config import settings
from backend.database.connection import Base, engine
from backend.database.migrations import migrate_user_ownership

from backend.models import (
    Letter,
    DiaryEntry,
    FutureLetter,
    MemoryPhoto,
    AboutMe,
    UserSettings,
    User
)

from backend.routers import (
    health,
    letters,
    diary,
    future_me,
    memories,
    about_me,
    settings as settings_router,
    auth
)


# Create missing tables first, then migrate existing tables.
Base.metadata.create_all(bind=engine)
migrate_user_ownership(engine)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(letters.router)
app.include_router(diary.router)
app.include_router(future_me.router)
app.include_router(memories.router)
app.include_router(about_me.router)
app.include_router(settings_router.router)
