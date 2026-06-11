from fastapi import FastAPI
from app.routes.auth import router as auth_router
from app.routes.departments import router as departments_router
from app.database import engine
from app.models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(
    auth_router
)

app.include_router(
    departments_router
)

@app.get("/")
def root():
    return {"message": "TaskFlow Backend Running"}