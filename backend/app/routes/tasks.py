from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_role, get_current_user
from app.models import User, Task
from app.schemas import TaskCreate, TaskResponse, TaskStatusUpdate
from app.roles import UserRole

router = APIRouter()

@router.post("/tasks", response_model=TaskResponse)
def create_task(
    task: TaskCreate,
    db : Session = Depends(get_db),
    current_user: User = Depends(
        require_role([
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
    
    if (
        current_user.role == UserRole.DEPARTMENT_LEAD
        and assigned_user.department_id != current_user.department_id
    ):
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
        department_id = current_user.department_id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

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

@router.get("/tasks/my-tasks", response_model = list[TaskResponse])
def get_my_tasks(
    db : Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = db.query(Task).filter(Task.assigned_to == current_user.id).all()
    return tasks

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

@router.delete(
    "/tasks/{task_id}"
)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role([
            "PRESIDENT",
            "VICE_PRESIDENT",
            "DEPARTMENT_LEAD"
        ])
    )
):
    
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if (
        current_user.role not in [
            UserRole.PRESIDENT,
            UserRole.VICE_PRESIDENT
        ]
        and task.assigned_by != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete this task"
        )

    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}