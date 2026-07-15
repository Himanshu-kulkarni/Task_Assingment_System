"""
Authentication Module

Responsibilities:
- User Registration
- User Login
- JWT Token Generation
- Current User Profile Retrieval

Security Features:
- Password Hashing
- Password Verification
- JWT Authentication
- Protected User Information

Endpoints:
- POST /register
- POST /login
- GET /me
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import time
from collections import defaultdict

from app.schemas import UserCreate, UserLogin, UserUpdate
from app.models import User, College, Club, Department
from app.roles import UserRole
from app.database import get_db
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token
)

from app.dependencies import get_current_user, require_role

router = APIRouter()

# In-memory IP rate limiter for logins
login_attempts = defaultdict(list)

def rate_limit_login(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    login_attempts[client_ip] = [t for t in login_attempts[client_ip] if now - t < 60]
    if len(login_attempts[client_ip]) >= 5:
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts. Please try again in a minute."
        )
    login_attempts[client_ip].append(now)


@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Never store plain-text passwords in the database.
    # Passwords are securely hashed before being saved.
    hashed_password = hash_password(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        college_id=user.college_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User Registered Successfully",
        "user_id": new_user.id
    }

@router.post("/login")
def login_user(
    user: UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    rate_limit_login(request)
    # Check if a user exists with the provided email.
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Compare the provided password with the stored password hash.
    is_valid = verify_password(
        user.password,
        existing_user.password_hash
    )

    if not is_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Generate a JWT token containing the user's ID.
    access_token = create_access_token(
        data={
            "user_id": existing_user.id
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "college_id": current_user.college_id,
        "club_id": current_user.club_id,
        "department_id": current_user.department_id
    }

@router.get("/users")
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(User)
    
    if current_user.role == UserRole.COLLEGE_REP:
        if current_user.college_id:
            query = query.filter(User.college_id == current_user.college_id)
        else:
            return []
    elif current_user.role in [UserRole.FACULTY_COORDINATOR, UserRole.PRESIDENT, UserRole.VICE_PRESIDENT]:
        if current_user.club_id:
            query = query.filter(User.club_id == current_user.club_id)
        else:
            return []
    elif current_user.role in [UserRole.DEPARTMENT_LEAD, UserRole.MEMBER]:
        if current_user.department_id:
            query = query.filter(User.department_id == current_user.department_id)
        else:
            return []
            
    users = query.all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "college_id": u.college_id,
            "club_id": u.club_id,
            "department_id": u.department_id
        }
        for u in users
    ]


@router.patch("/users/{user_id}")
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_update.role is not None:
        user.role = user_update.role
    if user_update.college_id is not None:
        user.college_id = user_update.college_id
    if user_update.club_id is not None:
        user.club_id = user_update.club_id
    if user_update.department_id is not None:
        user.department_id = user_update.department_id
        
    db.commit()
    db.refresh(user)
    return {
        "message": "User updated successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "college_id": user.college_id,
            "club_id": user.club_id,
            "department_id": user.department_id
        }
    }


