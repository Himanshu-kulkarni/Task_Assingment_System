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

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas import UserCreate, UserLogin
from app.models import User
from app.database import get_db
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token
)

from fastapi import HTTPException
from app.dependencies import get_current_user

from app.dependencies import require_role

router = APIRouter()

# Registers a new user in the system.
#
# Business Rules:
# - Email must be unique.
# - Password is hashed before storage.
# - Creates a new user record in the database.
#
# Returns:
# - Success message
# - Newly created user ID

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
        password_hash=hashed_password
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return {
        "message": "User Registered Successfully",
        "user_id": new_user.id
    }

# Authenticates a user and generates a JWT access token.
#
# Authentication Flow:
# 1. Verify email exists.
# 2. Verify password matches stored hash.
# 3. Generate JWT token.
# 4. Return access token to client.
#
# Returns:
# - JWT access token
# - Token type

@router.post("/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):
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
    # This token will be used for future authenticated requests.
    access_token = create_access_token(
    data={
        "user_id": existing_user.id
    }
)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

# Returns the profile information of the currently authenticated user.
#
# Requires a valid JWT token.
#
# Used by the frontend to:
# - Display user information
# - Determine user role
# - Manage role-based access

@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }
