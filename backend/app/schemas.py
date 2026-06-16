from pydantic import BaseModel, EmailStr
from datetime import datetime, UTC
from enum import Enum


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department_id: int | None

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
    description: str
    deadline: datetime
    assigned_to : int

class TaskResponse(BaseModel):
    id : int
    title : str
    description: str
    status: str
    created_at: datetime
    deadline: datetime
    assigned_to : int
    assigned_by : int
    department_id : int

    class config:
        from_attributes = True

class TaskStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"

class TaskStatusUpdate(BaseModel):
    status: TaskStatus