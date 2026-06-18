from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Department, Task
from app.roles import UserRole
from app.schemas import DepartmentCreate
from app.schemas import UserResponse
from app.dependencies import require_role
from app.dependencies import get_current_user
from app.dependencies import require_department_lead


router = APIRouter()

# Creates a new department in the club.
# Only PRESIDENT and VICE_PRESIDENT can create departments.
# Stores department name, description, and optional lead.

@router.post("/departments")
def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role([
            "PRESIDENT",
            "VICE_PRESIDENT"
        ])
    )
):
    new_department = Department(
        name=department.name,
        description=department.description,
        lead_id=department.lead_id
    )

    db.add(new_department)
    db.commit()
    db.refresh(new_department)

    return {
        "message": "Department Created Successfully"
    }

# Returns a list of all departments.
# Any authenticated user can view departments.

@router.get("/departments")
def get_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    departments = db.query(Department).all()

    return departments

# Assigns a user to a specific department.
# Only PRESIDENT and VICE_PRESIDENT can perform this action.
# Updates the user's department_id.

@router.post("/departments/{department_id}/assign-user/{user_id}")
def assign_user_to_department(
    department_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["PRESIDENT", "VICE_PRESIDENT"])
    )
):
    department = db.query(Department).filter(
        Department.id == department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )
    
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    user.department_id = department_id

    db.commit()
    db.refresh(user)

    return {
        "message": "User assigned successfully"
    }

# Returns all members belonging to a department.
# Validates that the department exists before fetching users.

@router.get(
    "/departments/{department_id}/members",
    response_model=list[UserResponse]
)
def get_department_members(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    department = db.query(Department).filter(
        Department.id == department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )
    
    members = db.query(User).filter(
        User.department_id == department_id
    ).all()

    return members

# Assigns a department lead.
# Only the PRESIDENT can promote a user as department lead.
# Updates the department's lead_id.

@router.post("/departments/{department_id}/assign-lead/{user_id}")
def assign_department_lead(
    department_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("PRESIDENT"))
):
    department = db.query(Department).filter(
        Department.id == department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )
    
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    department.lead_id = user.id

    db.commit()
    db.refresh(department)

    return {
        "message": "Department lead assigned successfully"
    }

# Department dashboard endpoint.
# PRESIDENT and VICE_PRESIDENT can access any department dashboard.
# DEPARTMENT_LEAD can access only their own department dashboard.
# Returns department statistics such as:
# - Total members
# - Total tasks
# - Pending tasks
# - In-progress tasks
# - Completed tasks

@router.get("/departments/{department_id}/dashboard")
def department_dashboard(
    department_id: int,
    current_user: User = Depends(require_role(["PRESIDENT", "VICE_PRESIDENT", "DEPARTMENT_LEAD"])),
    db: Session = Depends(get_db)
):
    if (
        current_user.role == UserRole.DEPARTMENT_LEAD
        and current_user.department_id != department_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only access your own department dashboard"
        )

    department = db.query(Department).filter(
        Department.id == department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )
    
    total_members = db.query(User).filter(
        User.department_id == department_id
    ).count()

    total_tasks = db.query(Task).filter(
        Task.department_id == department_id
    ).count()

    pending_tasks = db.query(Task).filter(
        Task.department_id == department_id,
        Task.status == "PENDING"
    ).count()

    completed_tasks = db.query(Task).filter(
        Task.department_id == department_id,
        Task.status == "COMPLETED"
    ).count()

    in_progress_tasks = db.query(Task).filter(
        Task.department_id == department_id,
        Task.status == "IN_PROGRESS"
    ).count()

    return {
        "department_id": department.id,
        "department_name": department.name,
        "lead_id": department.lead_id,

        "total_members": total_members,
        "total_tasks": total_tasks,

        "pending_tasks": pending_tasks,
        "in_progress_tasks": in_progress_tasks,
        "completed_tasks": completed_tasks
    }

# President dashboard endpoint.
# Accessible by PRESIDENT and VICE_PRESIDENT.
# Provides organization-wide statistics including:
# - Total departments
# - Total users
# - Total tasks
# - Task status breakdown
# - Per-department statistics

@router.get("/dashboard/president")
def president_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["PRESIDENT", "VICE_PRESIDENT"])
    )
):
    total_departments = db.query(Department).count()
    total_users = db.query(User).count()
    total_tasks = db.query(Task).count()

    pending_tasks = db.query(Task).filter(
        Task.status == "PENDING"
    ).count()

    completed_tasks = db.query(Task).filter(
        Task.status == "COMPLETED"
    ).count()

    in_progress_tasks = db.query(Task).filter(
        Task.status == "IN_PROGRESS"
    ).count()

    department_stats = []

    departments = db.query(Department).all()

    for department in departments:
        members = db.query(User).filter(
            User.department_id == department.id
        ).count()

        tasks = db.query(Task).filter(
            Task.department_id == department.id
        ).count()

        department_stats.append({
            "department_id": department.id,
            "department_name": department.name,
            "members": members,
            "tasks": tasks
        })

    return {
        "total_departments": total_departments,
        "total_users": total_users,
        "total_tasks": total_tasks,

        "pending_tasks": pending_tasks,
        "in_progress_tasks": in_progress_tasks,
        "completed_tasks": completed_tasks,
        "departments": department_stats
    }

# Returns members of a department.
# PRESIDENT and VICE_PRESIDENT can view any department.
# DEPARTMENT_LEAD can view only members of their own department.

@router.get("/departments/{department_id}/members", response_model=list[UserResponse])
def get_department_members(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role([
            "PRESIDENT",
            "VICE_PRESIDENT",
            "DEPARTMENT_LEAD"
        ])
    )
):
    if (
        current_user.role == UserRole.DEPARTMENT_LEAD
        and current_user.department_id != department_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only view your own department members"
        )
    
    members = db.query(User).filter(
        User.department_id == department_id
    ).all()

    return members