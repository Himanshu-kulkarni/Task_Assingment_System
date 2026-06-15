from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Department
from app.schemas import DepartmentCreate
from app.schemas import UserResponse
from app.dependencies import require_role
from app.dependencies import get_current_user
from app.dependencies import require_department_lead


router = APIRouter()

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

@router.get("/departments")
def get_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    departments = db.query(Department).all()

    return departments


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

@router.get("/departments/{department_id}/dashboard")
def department_dashboard(
    department_id: int,
    current_user: User = Depends(require_department_lead())
):
    return {
        "message": "Welcome Department Lead"
    }