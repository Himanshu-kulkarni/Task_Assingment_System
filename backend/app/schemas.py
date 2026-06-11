from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class DepartmentCreate(BaseModel):
    name: str
    description: str
    lead_id: int

class DepartmentCreate(BaseModel):
    name: str
    description: str
    lead_id: int