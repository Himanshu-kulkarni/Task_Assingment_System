from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models import User, Club, Application, Department
from app.schemas import ApplicationCreate
from app.roles import UserRole

router = APIRouter()

@router.post("/applications")
def create_application(
    app_data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if club exists
    club = db.query(Club).filter(Club.id == app_data.club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
        
    # Check if department exists if specified
    if app_data.department_id:
        dept = db.query(Department).filter(Department.id == app_data.department_id).first()
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found")
            
    # Check if application already exists for this same role and department
    existing_app = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.club_id == app_data.club_id,
        Application.role == app_data.role,
        Application.department_id == app_data.department_id,
        Application.status == "PENDING"
    ).first()
    
    if existing_app:
        raise HTTPException(status_code=400, detail="You already have a pending application for this specific position")
        
    new_app = Application(
        user_id=current_user.id,
        club_id=app_data.club_id,
        role=app_data.role,
        department_id=app_data.department_id,
        status="PENDING"
    )
    
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    
    return {
        "message": "Application submitted successfully",
        "application_id": new_app.id
    }

@router.get("/applications")
def get_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "COLLEGE_REP":
        # Get applications for FACULTY_COORDINATOR in their college
        apps = db.query(Application).join(Club, Application.club_id == Club.id).filter(
            Club.college_id == current_user.college_id,
            Application.role == "FACULTY_COORDINATOR"
        ).all()
    elif current_user.role == "FACULTY_COORDINATOR":
        # Get applications for PRESIDENT / VICE_PRESIDENT in their club
        apps = db.query(Application).filter(
            Application.club_id == current_user.club_id,
            Application.role.in_(["PRESIDENT", "VICE_PRESIDENT"])
        ).all()
    elif current_user.role in ["PRESIDENT", "VICE_PRESIDENT"]:
        # Get applications for DEPARTMENT_LEAD in their club
        apps = db.query(Application).filter(
            Application.club_id == current_user.club_id,
            Application.role == "DEPARTMENT_LEAD"
        ).all()
    elif current_user.role == "DEPARTMENT_LEAD":
        # Get applications for MEMBER in their department
        apps = db.query(Application).filter(
            Application.department_id == current_user.department_id,
            Application.role == "MEMBER"
        ).all()
    else:
        # User gets their own applications
        apps = db.query(Application).filter(Application.user_id == current_user.id).all()
        
    result = []
    for a in apps:
        user_obj = db.query(User).filter(User.id == a.user_id).first()
        club_obj = db.query(Club).filter(Club.id == a.club_id).first()
        dept_obj = db.query(Department).filter(Department.id == a.department_id).first() if a.department_id else None
        result.append({
            "id": a.id,
            "user_id": a.user_id,
            "user_name": user_obj.name if user_obj else "Unknown User",
            "user_email": user_obj.email if user_obj else "Unknown Email",
            "club_id": a.club_id,
            "club_name": club_obj.name if club_obj else "Unknown Club",
            "role": a.role,
            "department_id": a.department_id,
            "department_name": dept_obj.name if dept_obj else None,
            "status": a.status
        })
        
    return result

@router.post("/applications/{app_id}/approve")
def approve_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["COLLEGE_REP", "FACULTY_COORDINATOR", "PRESIDENT", "VICE_PRESIDENT", "DEPARTMENT_LEAD"]))
):
    app_obj = db.query(Application).filter(Application.id == app_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if app_obj.status != "PENDING":
        raise HTTPException(status_code=400, detail="Application has already been processed")
        
    # Check permissions
    if current_user.role == "COLLEGE_REP":
        if app_obj.role != "FACULTY_COORDINATOR":
            raise HTTPException(status_code=403, detail="Not authorized to approve this role type")
        club = db.query(Club).filter(Club.id == app_obj.club_id).first()
        if not club or club.college_id != current_user.college_id:
            raise HTTPException(status_code=403, detail="Not authorized to approve for this club")
    elif current_user.role == "FACULTY_COORDINATOR":
        if app_obj.role not in ["PRESIDENT", "VICE_PRESIDENT"]:
            raise HTTPException(status_code=403, detail="Not authorized to approve this role type")
        if app_obj.club_id != current_user.club_id:
            raise HTTPException(status_code=403, detail="Not authorized to approve for this club")
    elif current_user.role in ["PRESIDENT", "VICE_PRESIDENT"]:
        if app_obj.role != "DEPARTMENT_LEAD":
            raise HTTPException(status_code=403, detail="Not authorized to approve this role type")
        if app_obj.club_id != current_user.club_id:
            raise HTTPException(status_code=403, detail="Not authorized to approve for this club")
    elif current_user.role == "DEPARTMENT_LEAD":
        if app_obj.role != "MEMBER":
            raise HTTPException(status_code=403, detail="Not authorized to approve this role type")
        if app_obj.department_id != current_user.department_id:
            raise HTTPException(status_code=403, detail="Not authorized to approve for this department")
            
    # Update application status
    app_obj.status = "APPROVED"
    
    # Promote applicant to the target role
    applicant = db.query(User).filter(User.id == app_obj.user_id).first()
    club = db.query(Club).filter(Club.id == app_obj.club_id).first()
    if applicant:
        applicant.role = app_obj.role
        applicant.club_id = app_obj.club_id
        applicant.department_id = app_obj.department_id
        
    # Assign coordinator if applicable
    if app_obj.role == "FACULTY_COORDINATOR" and club:
        club.faculty_coordinator_id = app_obj.user_id
    # Assign lead to department if applicable
    elif app_obj.role == "DEPARTMENT_LEAD" and app_obj.department_id:
        dept = db.query(Department).filter(Department.id == app_obj.department_id).first()
        if dept:
            dept.lead_id = app_obj.user_id
            
    # Reject other pending applications for the same role in this club/department
    other_apps_query = db.query(Application).filter(
        Application.club_id == app_obj.club_id,
        Application.role == app_obj.role,
        Application.id != app_id,
        Application.status == "PENDING"
    )
    if app_obj.department_id:
        other_apps_query = other_apps_query.filter(Application.department_id == app_obj.department_id)
        
    for o in other_apps_query.all():
        o.status = "REJECTED"
        
    db.commit()
    return {"message": "Application approved and role promoted successfully"}

@router.post("/applications/{app_id}/reject")
def reject_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["COLLEGE_REP", "FACULTY_COORDINATOR", "PRESIDENT", "VICE_PRESIDENT", "DEPARTMENT_LEAD"]))
):
    app_obj = db.query(Application).filter(Application.id == app_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if app_obj.status != "PENDING":
        raise HTTPException(status_code=400, detail="Application has already been processed")
        
    # Check permissions
    if current_user.role == "COLLEGE_REP":
        if app_obj.role != "FACULTY_COORDINATOR":
            raise HTTPException(status_code=403, detail="Not authorized to reject this role type")
        club = db.query(Club).filter(Club.id == app_obj.club_id).first()
        if not club or club.college_id != current_user.college_id:
            raise HTTPException(status_code=403, detail="Not authorized to reject for this club")
    elif current_user.role == "FACULTY_COORDINATOR":
        if app_obj.role not in ["PRESIDENT", "VICE_PRESIDENT"]:
            raise HTTPException(status_code=403, detail="Not authorized to reject this role type")
        if app_obj.club_id != current_user.club_id:
            raise HTTPException(status_code=403, detail="Not authorized to reject for this club")
    elif current_user.role in ["PRESIDENT", "VICE_PRESIDENT"]:
        if app_obj.role != "DEPARTMENT_LEAD":
            raise HTTPException(status_code=403, detail="Not authorized to reject this role type")
        if app_obj.club_id != current_user.club_id:
            raise HTTPException(status_code=403, detail="Not authorized to reject for this club")
    elif current_user.role == "DEPARTMENT_LEAD":
        if app_obj.role != "MEMBER":
            raise HTTPException(status_code=403, detail="Not authorized to reject this role type")
        if app_obj.department_id != current_user.department_id:
            raise HTTPException(status_code=403, detail="Not authorized to reject for this department")
            
    app_obj.status = "REJECTED"
    db.commit()
    return {"message": "Application rejected successfully"}
