from pydantic import BaseModel, EmailStr


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