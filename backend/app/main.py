from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.departments import router as departments_router
from app.routes.tasks import router as tasks_router
from app.database import engine
from app.models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.get("/")
def root():
    return {"message": "TaskFlow Backend Running"}