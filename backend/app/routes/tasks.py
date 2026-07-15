"""
Task Management Module

Responsibilities:
- Create tasks
- Assign tasks to users
- View task details
- Track personal tasks
- Track created tasks
- Update task progress
- Delete tasks

Role Permissions:

PRESIDENT
- Create tasks
- View all tasks
- Delete any task

VICE_PRESIDENT
- Create tasks
- View all tasks
- Delete any task

DEPARTMENT_LEAD
- Create tasks within their department
- View assigned/created tasks
- Delete tasks they created

MEMBER
- View assigned tasks
- Update task status
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_role, get_current_user
from app.models import User, Task
from app.schemas import TaskCreate, TaskResponse, TaskStatusUpdate
from app.roles import UserRole

router = APIRouter()

# Creates a new task and assigns it to a user.
# Accessible by:
# - PRESIDENT
# - VICE_PRESIDENT
# - DEPARTMENT_LEAD
#
# Business Rules:
# - Assigned user must exist.
# - Department leads can only assign tasks within their own department.
# - The creator is automatically stored in assigned_by.
# - The task inherits the creator's department.

@router.post("/tasks", response_model=TaskResponse)
def create_task(
    task: TaskCreate,
    db : Session = Depends(get_db),
    current_user: User = Depends(
        require_role([
            UserRole.FACULTY_COORDINATOR,
            UserRole.PRESIDENT,
            UserRole.VICE_PRESIDENT,
            UserRole.DEPARTMENT_LEAD
        ])
    )
):
    assigned_user = db.query(User).filter(
        User.id == task.assigned_to
    ).first()
    if not assigned_user:
        raise HTTPException(status_code=404, detail="Assigned user not found")
    
    # 1. Faculty Coordinator constraints
    if current_user.role == UserRole.FACULTY_COORDINATOR:
        if assigned_user.role not in [UserRole.PRESIDENT, UserRole.VICE_PRESIDENT]:
            raise HTTPException(
                status_code=400,
                detail="Faculty Coordinators can only assign tasks to the President or Vice President"
            )
        if assigned_user.club_id != current_user.club_id:
            raise HTTPException(
                status_code=400,
                detail="Assigned user does not belong to your club"
            )
            
    # 2. President & Vice President constraints
    elif current_user.role in [UserRole.PRESIDENT, UserRole.VICE_PRESIDENT]:
        if assigned_user.role != UserRole.DEPARTMENT_LEAD:
            raise HTTPException(
                status_code=400,
                detail="Executives can only assign tasks to Department Leads"
            )
        if assigned_user.club_id != current_user.club_id:
            raise HTTPException(
                status_code=400,
                detail="Assigned user does not belong to your club"
            )
            
    # 3. Department Lead constraints
    elif current_user.role == UserRole.DEPARTMENT_LEAD:
        if assigned_user.role != UserRole.MEMBER:
            raise HTTPException(
                status_code=400,
                detail="Department Leads can only assign tasks to Members"
            )
        if assigned_user.department_id != current_user.department_id:
            raise HTTPException(
                status_code=400,
                detail="User does not belong to your department"
            )
    
    new_task = Task(
        title = task.title,
        description = task.description,
        assigned_to = task.assigned_to,
        deadline = task.deadline,
        assigned_by = current_user.id,
        department_id = assigned_user.department_id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

# Returns all tasks assigned to the currently logged-in user.
#
# Used by members and department leads to view
# their personal task list and workload.

@router.get("/tasks/my-tasks", response_model = list[TaskResponse])
def get_my_tasks(
    db : Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = db.query(Task).filter(Task.assigned_to == current_user.id).all()
    return tasks

# Returns all tasks created by the currently logged-in user.
#
# Useful for:
# - PRESIDENT
# - VICE_PRESIDENT
# - DEPARTMENT_LEAD
#
# Allows task creators to track tasks they have assigned.

@router.get(
    "/tasks/created-by-me",
    response_model=list[TaskResponse]
)
def get_tasks_created_by_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = db.query(Task).filter(Task.assigned_by == current_user.id).all()
    return tasks

# Updates the status of a task.
#
# Access Rules:
# - Only the user assigned to the task can update it.
#
# Supported statuses:
# - PENDING
# - IN_PROGRESS
# - COMPLETED
#
# Prevents other users from modifying task progress.

# Returns details of a specific task.
#
# Access Rules:
# - PRESIDENT and VICE_PRESIDENT can view any task.
# - Task creator can view the task.
# - Assigned user can view the task.
#
# Prevents unauthorized users from viewing task information.

@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db : Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if (
        current_user.role not in [
            UserRole.PRESIDENT,
            UserRole.VICE_PRESIDENT
        ]
        and task.assigned_to != current_user.id
        and task.assigned_by != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view this task"
        )
    
    return task

@router.patch("/tasks/{task_id}/status", response_model = TaskResponse)
def update_task_status(
    task_id: int,
    status_update: TaskStatusUpdate,
    db : Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")
    
    task.status = status_update.status
    db.commit()
    db.refresh(task)
    return task

# Deletes a task from the system.
#
# Access Rules:
# - PRESIDENT can delete any task.
# - VICE_PRESIDENT can delete any task.
# - DEPARTMENT_LEAD can delete only tasks they created.
#
# Prevents unauthorized deletion of tasks.

@router.delete(
    "/tasks/{task_id}"
)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role([
            UserRole.FACULTY_COORDINATOR,
            UserRole.PRESIDENT,
            UserRole.VICE_PRESIDENT,
            UserRole.DEPARTMENT_LEAD
        ])
    )
):
    
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # If it's a department lead, ensure they created the task AND the assignee belongs to their department
    if current_user.role == UserRole.DEPARTMENT_LEAD:
        if task.assigned_by != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to delete this task"
            )
        assignee = db.query(User).filter(User.id == task.assigned_to).first()
        if not assignee or assignee.department_id != current_user.department_id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to delete tasks of other department members"
            )
            
    # If it's a Faculty Coordinator or Executive, ensure they assigned the task
    elif current_user.role in [UserRole.FACULTY_COORDINATOR, UserRole.PRESIDENT, UserRole.VICE_PRESIDENT]:
        if task.assigned_by != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to delete this task"
            )

    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}