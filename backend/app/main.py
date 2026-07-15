from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.departments import router as departments_router
from app.routes.tasks import router as tasks_router
from app.routes.clubs import router as clubs_router
from app.routes.colleges import router as colleges_router
from app.routes.applications import router as applications_router
from app.database import engine
from app.models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://task-manager-final-pxkz.onrender.com",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ──────────────────────────────────────────────────────────────────────────────

app.include_router(
    auth_router
)

app.include_router(
    departments_router
)

app.include_router(
    tasks_router
)

app.include_router(
    clubs_router
)

app.include_router(
    colleges_router
)

app.include_router(
    applications_router
)


@app.get("/")
def root():
    return {"message": "TaskFlow Backend Running"}