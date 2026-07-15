from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_role
from app.models import User, Club, Task, College
from app.roles import UserRole
from app.schemas import CollegeCreate, CollegeUpdate
from app.utils.security import hash_password
import secrets
import string

router = APIRouter()

def generate_secure_password() -> str:
    # Requires min 1 uppercase, 1 lowercase, 1 digit, 1 special character
    uppercase = secrets.choice(string.ascii_uppercase)
    lowercase = secrets.choice(string.ascii_lowercase)
    digit = secrets.choice(string.digits)
    special = secrets.choice("!@#$%^&*")
    remaining = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
    password = uppercase + lowercase + digit + special + remaining
    password_list = list(password)
    secrets.SystemRandom().shuffle(password_list)
    return "".join(password_list)

@router.get("/colleges/dashboard")
def get_college_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.COLLEGE_REP]))
):
    if not current_user.college_id:
        raise HTTPException(
            status_code=400,
            detail="College Representative is not assigned to any college"
        )
        
    # Get all clubs in the college
    clubs = db.query(Club).filter(Club.college_id == current_user.college_id).all()
    club_ids = [c.id for c in clubs]
    
    # Get all users belonging to these clubs
    users = db.query(User).filter(User.club_id.in_(club_ids)).all() if club_ids else []
    user_ids = [u.id for u in users]
    
    # Get tasks assigned to users in these clubs
    tasks = db.query(Task).filter(Task.assigned_to.in_(user_ids)).all() if user_ids else []
    
    total_clubs = len(clubs)
    total_tasks_assigned = len(tasks)
    total_tasks_completed = sum(1 for t in tasks if t.status == "COMPLETED")
    
    pending_tasks_per_club = []
    for club in clubs:
        club_user_ids = [u.id for u in users if u.club_id == club.id]
        pending_count = sum(1 for t in tasks if t.assigned_to in club_user_ids and t.status != "COMPLETED")
        pending_tasks_per_club.append({
            "club_id": club.id,
            "club_name": club.name,
            "pending_tasks": pending_count
        })
        
    return {
        "total_clubs": total_clubs,
        "total_tasks_assigned": total_tasks_assigned,
        "total_tasks_completed": total_tasks_completed,
        "pending_tasks_per_club": pending_tasks_per_club
    }


@router.get("/colleges/public")
def list_colleges_public(
    db: Session = Depends(get_db)
):
    colleges = db.query(College).all()
    return [{"id": c.id, "name": c.name, "code": c.code} for c in colleges]


@router.get("/colleges")
def list_colleges(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN]))
):
    # Outer join to prevent N+1 query issue
    query_results = db.query(College, User).outerjoin(User, College.representative_id == User.id).all()
    result = []
    for c, rep in query_results:
        result.append({
            "id": c.id,
            "name": c.name,
            "code": c.code,
            "address": c.address,
            "description": c.description,
            "representative_id": c.representative_id,
            "representative_name": rep.name if rep else None,
            "representative_email": rep.email if rep else None
        })
    return result


@router.post("/colleges")
def create_college(
    college_data: CollegeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN]))
):
    # Check if college name already exists
    existing_college = db.query(College).filter(College.name == college_data.name).first()
    if existing_college:
        raise HTTPException(status_code=400, detail="College name already exists")
        
    # Check if representative user already exists
    rep_user = db.query(User).filter(User.email == college_data.representative_email).first()
    password_created = None
    
    # 1. Create College (initially without representative_id)
    new_college = College(
        name=college_data.name,
        code=college_data.code,
        address=college_data.address,
        description=f"Campus of {college_data.name}"
    )
    db.add(new_college)
    db.commit()
    db.refresh(new_college)
    
    if rep_user:
        # Update user's role and college_id
        rep_user.role = UserRole.COLLEGE_REP
        rep_user.college_id = new_college.id
        db.commit()
    else:
        # Create new user for representative
        password_created = generate_secure_password()
        rep_user = User(
            name=college_data.representative_name,
            email=college_data.representative_email,
            password_hash=hash_password(password_created),
            role=UserRole.COLLEGE_REP,
            college_id=new_college.id
        )
        db.add(rep_user)
        db.commit()
        db.refresh(rep_user)
        
    # 2. Update College representative_id
    new_college.representative_id = rep_user.id
    db.commit()
    db.refresh(new_college)
    
    return {
        "message": "College created and Representative assigned successfully",
        "college": {
            "id": new_college.id,
            "name": new_college.name,
            "code": new_college.code,
            "address": new_college.address,
            "representative_id": new_college.representative_id,
            "representative_name": rep_user.name,
            "representative_email": rep_user.email
        },
        "credentials": {
            "email": rep_user.email,
            "password": password_created if password_created else "[Use existing account password]"
        }
    }


@router.put("/colleges/{college_id}")
def update_college(
    college_id: int,
    college_data: CollegeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN]))
):
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
        
    if college_data.name is not None:
        college.name = college_data.name
    if college_data.code is not None:
        college.code = college_data.code
    if college_data.address is not None:
        college.address = college_data.address
    if college_data.representative_id is not None:
        college.representative_id = college_data.representative_id
        # Also ensure that user's role is COLLEGE_REP and college_id is set
        rep_user = db.query(User).filter(User.id == college_data.representative_id).first()
        if rep_user:
            rep_user.role = UserRole.COLLEGE_REP
            rep_user.college_id = college_id
            
    db.commit()
    db.refresh(college)
    
    rep_user = db.query(User).filter(User.id == college.representative_id).first() if college.representative_id else None
    
    return {
        "message": "College updated successfully",
        "college": {
            "id": college.id,
            "name": college.name,
            "code": college.code,
            "address": college.address,
            "representative_id": college.representative_id,
            "representative_name": rep_user.name if rep_user else None,
            "representative_email": rep_user.email if rep_user else None
        }
    }


@router.delete("/colleges/{college_id}")
def delete_college(
    college_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN]))
):
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
        
    # Unassign representative's college
    if college.representative_id:
        rep_user = db.query(User).filter(User.id == college.representative_id).first()
        if rep_user:
            rep_user.college_id = None
            rep_user.role = UserRole.MEMBER
            
    db.delete(college)
    db.commit()
    return {"message": "College deleted successfully"}
