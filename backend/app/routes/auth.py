from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas import UserCreate
from app.models import User
from app.database import get_db
from app.utils.security import hash_password

router = APIRouter()

@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    
    hashed_password = hash_password(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return {
        "message": "User Registered Successfully",
        "user_id": new_user.id
    }