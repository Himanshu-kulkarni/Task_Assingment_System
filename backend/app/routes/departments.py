from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Department
from app.schemas import DepartmentCreate
from app.dependencies import require_role
from app.dependencies import get_current_user


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
    