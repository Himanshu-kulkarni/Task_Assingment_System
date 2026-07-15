from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Department, Task, Club
from app.roles import UserRole
from app.schemas import DepartmentCreate, UserResponse, TaskResponse
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
    if not current_user.club_id:
        raise HTTPException(status_code=400, detail="You must belong to a club to create a department")
        
    lead_id = department.lead_id if department.lead_id and department.lead_id > 0 else None
    if lead_id:
        lead_user = db.query(User).filter(User.id == lead_id).first()
        if not lead_user:
            raise HTTPException(status_code=404, detail="Department Lead user not found")

    new_department = Department(
        name=department.name,
        description=department.description,
        lead_id=lead_id,
        club_id=current_user.club_id
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
    depts = []
    if current_user.role == UserRole.SUPER_ADMIN:
        depts = db.query(Department).all()
        
    elif current_user.role == UserRole.COLLEGE_REP:
        if current_user.college_id:
            depts = db.query(Department).join(Club, Department.club_id == Club.id).filter(Club.college_id == current_user.college_id).all()
        
    elif current_user.role in [UserRole.FACULTY_COORDINATOR, UserRole.PRESIDENT, UserRole.VICE_PRESIDENT, UserRole.DEPARTMENT_LEAD]:
        if current_user.club_id:
            depts = db.query(Department).filter(Department.club_id == current_user.club_id).all()
        
    elif current_user.role == UserRole.MEMBER:
        if current_user.club_id:
            depts = db.query(Department).filter(Department.club_id == current_user.club_id).all()
        elif current_user.college_id:
            depts = db.query(Department).join(Club, Department.club_id == Club.id).filter(Club.college_id == current_user.college_id).all()
            
    result = []
    for dept in depts:
        result.append({
            "id": dept.id,
            "name": dept.name,
            "description": dept.description,
            "lead_id": dept.lead_id,
            "club_id": dept.club_id
        })
    return result


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
    club_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["PRESIDENT", "VICE_PRESIDENT", "FACULTY_COORDINATOR", "COLLEGE_REP"])
    )
):
    if current_user.role == "COLLEGE_REP":
        if not club_id:
            raise HTTPException(status_code=400, detail="club_id query parameter is required for College Representative")
        # Check if club belongs to the College Rep's college
        club = db.query(Club).filter(Club.id == club_id).first()
        if not club or club.college_id != current_user.college_id:
            raise HTTPException(status_code=403, detail="You can only view club dashboards within your own college")
    else:
        club_id = current_user.club_id

    if not club_id:
        return {
            "total_departments": 0,
            "total_users": 0,
            "total_tasks": 0,
            "pending_tasks": 0,
            "in_progress_tasks": 0,
            "completed_tasks": 0,
            "departments": []
        }


    # Query users in the club
    club_users = db.query(User).filter(User.club_id == club_id).all()
    club_user_ids = [u.id for u in club_users]
    total_users = len(club_users)

    # Query departments in the club (joined with department leads belonging to the club)
    departments = db.query(Department).join(User, Department.lead_id == User.id).filter(User.club_id == club_id).all()
    total_departments = len(departments)

    # Query tasks assigned to users in this club
    tasks_query = db.query(Task).filter(Task.assigned_to.in_(club_user_ids)) if club_user_ids else db.query(Task).filter(False)
    total_tasks = tasks_query.count()
    pending_tasks = tasks_query.filter(Task.status == "PENDING").count()
    completed_tasks = tasks_query.filter(Task.status == "COMPLETED").count()
    in_progress_tasks = tasks_query.filter(Task.status == "IN_PROGRESS").count()

    department_stats = []

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


@router.get("/departments/my-members")
def get_my_department_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.department_id:
        raise HTTPException(
            status_code=400,
            detail="You are not assigned to any department"
        )
    
    members = db.query(User).filter(
        User.department_id == current_user.department_id
    ).all()
    
    return members

@router.get("/departments/my-dashboard")
def get_my_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.department_id:
        raise HTTPException(
            status_code=400,
            detail="You are not assigned to any department"
        )

    department = db.query(Department).filter(
        Department.id == current_user.department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Assigned department not found"
        )

    total_members = db.query(User).filter(
        User.department_id == current_user.department_id
    ).count()

    total_tasks = db.query(Task).filter(
        Task.department_id == current_user.department_id
    ).count()

    pending_tasks = db.query(Task).filter(
        Task.department_id == current_user.department_id,
        Task.status == "PENDING"
    ).count()

    completed_tasks = db.query(Task).filter(
        Task.department_id == current_user.department_id,
        Task.status == "COMPLETED"
    ).count()

    in_progress_tasks = db.query(Task).filter(
        Task.department_id == current_user.department_id,
        Task.status == "IN_PROGRESS"
    ).count()

    return {
        "department_name": department.name,
        "department_id": department.id,
        "members": total_members,
        "total_tasks": total_tasks,
        "pending_tasks": pending_tasks,
        "in_progress_tasks": in_progress_tasks,
        "completed_tasks": completed_tasks
    }

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
    current_user: User = Depends(require_role(["PRESIDENT", "VICE_PRESIDENT", "DEPARTMENT_LEAD", "FACULTY_COORDINATOR"])),
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
            "DEPARTMENT_LEAD",
            "FACULTY_COORDINATOR"
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

@router.get("/departments/{department_id}/tasks", response_model=list[TaskResponse])
def get_department_tasks(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role([
            "PRESIDENT",
            "VICE_PRESIDENT",
            "DEPARTMENT_LEAD",
            "FACULTY_COORDINATOR"
        ])
    )
):
    if (
        current_user.role == UserRole.DEPARTMENT_LEAD
        and current_user.department_id != department_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only view your own department tasks"
        )

    tasks = db.query(Task).filter(
        Task.department_id == department_id
    ).all()

    return tasks