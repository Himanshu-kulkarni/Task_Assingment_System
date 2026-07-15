from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime, UTC
from enum import Enum
import re
from app.roles import UserRole

class ApplicationRole(str, Enum):
    FACULTY_COORDINATOR = "FACULTY_COORDINATOR"
    PRESIDENT = "PRESIDENT"
    VICE_PRESIDENT = "VICE_PRESIDENT"
    DEPARTMENT_LEAD = "DEPARTMENT_LEAD"
    MEMBER = "MEMBER"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    college_id: int

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if len(value) > 128:
            raise ValueError("Password must not exceed 128 characters")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", value):
            raise ValueError("Password must contain at least one digit")
        return value

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    college_id: int | None = None
    club_id: int | None = None
    department_id: int | None = None

    class Config:
        from_attributes = True


class DepartmentCreate(BaseModel):
    name: str
    description: str
    lead_id: int

class DepartmentResponse(BaseModel):
    id: int
    name: str
    description: str
    lead_id: int

    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    deadline: datetime
    assigned_to : int

class TaskResponse(BaseModel):
    id : int
    title : str
    description: str | None = None
    status: str
    created_at: datetime
    deadline: datetime
    assigned_to : int
    assigned_by : int
    department_id : int | None = None

    class Config:
        from_attributes = True

class TaskStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"

class TaskStatusUpdate(BaseModel):
    status: TaskStatus

class ClubCreate(BaseModel):
    name: str
    description: str | None = None

class UserUpdate(BaseModel):
    role: UserRole | None = None
    college_id: int | None = None
    club_id: int | None = None
    department_id: int | None = None

class ApplicationCreate(BaseModel):
    club_id: int
    role: ApplicationRole
    department_id: int | None = None


class CollegeCreate(BaseModel):
    name: str
    code: str | None = None
    address: str | None = None
    representative_name: str
    representative_email: EmailStr


class CollegeUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    address: str | None = None
    representative_id: int | None = None


class CollegeResponse(BaseModel):
    id: int
    name: str
    code: str | None = None
    address: str | None = None
    representative_id: int | None = None

    class Config:
        from_attributes = True

