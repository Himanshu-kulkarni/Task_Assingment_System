from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, UTC


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    password_hash = Column(String, nullable=False)

    role = Column(String, default="MEMBER")

    department_id = Column(Integer, nullable=True)

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, unique=True, nullable=False)

    description = Column(String)

    lead_id = Column(Integer)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key = True, index = True)

    title = Column(String, nullable = False)

    description = Column(String)

    status = Column(String, default = "PENDING")

    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    deadline = Column(DateTime)

    assigned_to = Column(Integer, nullable = False)

    assigned_by = Column(Integer, nullable = False)

    department_id = Column(Integer, nullable = False)