from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_role
from app.models import User, Club
from app.schemas import ClubCreate
from app.roles import UserRole

router = APIRouter()

@router.post("/clubs")
def create_club(
    club: ClubCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.COLLEGE_REP]))
):
    if not current_user.college_id:
        raise HTTPException(
            status_code=400,
            detail="College Representative is not assigned to any college"
        )
    
    new_club = Club(
        name=club.name,
        description=club.description,
        college_id=current_user.college_id
    )
    db.add(new_club)
    db.commit()
    db.refresh(new_club)
    
    return {
        "message": "Club Created Successfully",
        "club_id": new_club.id
    }

@router.delete("/clubs/{club_id}")
def delete_club(
    club_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.COLLEGE_REP]))
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
        
    if club.college_id != current_user.college_id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete clubs in your own college"
        )
        
    db.delete(club)
    db.commit()
    return {"message": "Club deleted successfully"}

@router.get("/clubs")
def get_clubs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.COLLEGE_REP, UserRole.FACULTY_COORDINATOR, UserRole.PRESIDENT, UserRole.VICE_PRESIDENT, UserRole.DEPARTMENT_LEAD, UserRole.MEMBER]))
):
    if current_user.role == "COLLEGE_REP":
        if not current_user.college_id:
            return []
        return db.query(Club).filter(Club.college_id == current_user.college_id).all()
    elif current_user.role == "MEMBER" and not current_user.club_id:
        if not current_user.college_id:
            return []
        return db.query(Club).filter(Club.college_id == current_user.college_id).all()
    else:
        # Others belong to a specific club
        if not current_user.club_id:
            return []
        return db.query(Club).filter(Club.id == current_user.club_id).all()

