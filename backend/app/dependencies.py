from fastapi import Depends, HTTPException
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from app.utils.security import verify_token

from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Department

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = db.query(User).filter(
        User.id == payload["user_id"]
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


def require_role(required_roles: list):

    def role_checker(
        current_user: User = Depends(get_current_user)
    ):

        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )

        return current_user

    return role_checker

def require_department_lead():

    def lead_checker(
        department_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ):
        #Querry the department
        department = db.query(Department).filter(
            Department.id == department_id
        ).first()

        #check if department exists.
        if not department:
            raise HTTPException(
                status_code=404,
                detail="Department not found"
            )
        
        #check lead permissions
        if department.lead_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Only department lead can access this"
            )
        
        return current_user

    return lead_checker