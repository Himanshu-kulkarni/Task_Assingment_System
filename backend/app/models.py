from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, CheckConstraint
from datetime import datetime, UTC


class Base(DeclarativeBase):
    pass

class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, nullable=True)
    address = Column(String, nullable=True)
    description = Column(String)
    representative_id = Column(Integer, ForeignKey("users.id", use_alter=True, name="fk_college_representative_id"), nullable=True)

class Club(Base):
    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    faculty_coordinator_id = Column(Integer, ForeignKey("users.id", use_alter=True, name="fk_club_faculty_coordinator_id"), nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="MEMBER")
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=True)
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id", use_alter=True, name="fk_user_department_id"), nullable=True)


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=False)
    lead_id = Column(Integer, ForeignKey("users.id", use_alter=True, name="fk_department_lead_id"), nullable=True)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key = True, index = True)
    title = Column(String, nullable = False)
    description = Column(String)
    status = Column(String, default = "PENDING")
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    deadline = Column(DateTime)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable = False)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable = False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable = True)

    __table_args__ = (
        CheckConstraint("status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')", name="check_task_status"),
    )


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=False)
    role = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    status = Column(String, default="PENDING")