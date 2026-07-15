from app.database import engine, SessionLocal
from app.models import Base, User, Department, Club, College
from app.roles import UserRole
from app.utils.security import hash_password

def seed_database():
    db = SessionLocal()
    
    print("Clearing existing data...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    hp = hash_password("password123")
    
    # Create Super Admin
    super_admin = User(
        name="Super Admin",
        email="kulhimanshu2407@gmail.com",
        password_hash=hash_password("myself@2407"),
        role=UserRole.SUPER_ADMIN,
        college_id=None
    )
    db.add(super_admin)
    db.commit()
    db.refresh(super_admin)
    
    # 1. Create College
    college = College(
        name="TaskFlow University",
        description="Global Institute of Technology",
        representative_id=None
    )
    db.add(college)
    db.commit()
    db.refresh(college)
    
    # 2. Create College Representative
    college_rep = User(
        name="College Rep",
        email="rep@taskflow.com",
        password_hash=hp,
        role=UserRole.COLLEGE_REP,
        college_id=college.id
    )
    db.add(college_rep)
    db.commit()
    db.refresh(college_rep)
    
    # Update College representative reference
    college.representative_id = college_rep.id
    db.commit()
    
    # 3. Create 2 Clubs
    clubs_data = [
        ("Robotics Club", "Building hardware and software robots"),
        ("Coding Club", "Solving algorithmic problems and software engineering")
    ]
    
    clubs = []
    for name, desc in clubs_data:
        club = Club(
            name=name,
            description=desc,
            college_id=college.id,
            faculty_coordinator_id=None
        )
        db.add(club)
        db.commit()
        db.refresh(club)
        clubs.append(club)
        
    # 4. Create Leaders for each club (Faculty Coordinator, President, Vice President)
    for club_idx, club in enumerate(clubs, 1):
        # Faculty Coordinator
        fc = User(
            name=f"FC Club {club_idx}",
            email=f"fc{club_idx}@taskflow.com",
            password_hash=hp,
            role=UserRole.FACULTY_COORDINATOR,
            college_id=college.id,
            club_id=club.id
        )
        # President
        pres = User(
            name=f"President Club {club_idx}",
            email=f"president{club_idx}@taskflow.com",
            password_hash=hp,
            role=UserRole.PRESIDENT,
            college_id=college.id,
            club_id=club.id
        )
        # Vice President
        vp = User(
            name=f"VP Club {club_idx}",
            email=f"vp{club_idx}@taskflow.com",
            password_hash=hp,
            role=UserRole.VICE_PRESIDENT,
            college_id=college.id,
            club_id=club.id
        )
        
        db.add_all([fc, pres, vp])
        db.commit()
        db.refresh(fc)
        db.refresh(pres)
        db.refresh(vp)
        
        club.faculty_coordinator_id = fc.id
        db.commit()
        
    # 5. Create 3 Departments per Club (Total 6)
    # Club 1 departments
    c1_depts = [
        ("Hardware Department", "Electronics and microcontrollers"),
        ("Software Department", "Embedded C++ and ROS development"),
        ("Design Department", "CAD design and 3D modeling")
    ]
    # Club 2 departments
    c2_depts = [
        ("Algorithms Department", "Competitive Programming and DSA"),
        ("Web Development", "Frontend and Backend web systems"),
        ("Mobile Development", "iOS and Android apps")
    ]
    
    all_depts = []
    
    # Seed Club 1 Departments & Leads
    for idx, (name, desc) in enumerate(c1_depts, 1):
        lead = User(
            name=f"Lead Dept {idx}",
            email=f"lead{idx}@taskflow.com",
            password_hash=hp,
            role=UserRole.DEPARTMENT_LEAD,
            college_id=college.id,
            club_id=clubs[0].id
        )
        db.add(lead)
        db.commit()
        db.refresh(lead)
        
        dept = Department(name=name, description=desc, lead_id=lead.id, club_id=clubs[0].id)
        db.add(dept)
        db.commit()
        db.refresh(dept)
        
        lead.department_id = dept.id
        db.commit()
        all_depts.append(dept)
        
    # Seed Club 2 Departments & Leads
    for idx, (name, desc) in enumerate(c2_depts, 4):
        lead = User(
            name=f"Lead Dept {idx}",
            email=f"lead{idx}@taskflow.com",
            password_hash=hp,
            role=UserRole.DEPARTMENT_LEAD,
            college_id=college.id,
            club_id=clubs[1].id
        )
        db.add(lead)
        db.commit()
        db.refresh(lead)
        
        dept = Department(name=name, description=desc, lead_id=lead.id, club_id=clubs[1].id)
        db.add(dept)
        db.commit()
        db.refresh(dept)
        
        lead.department_id = dept.id
        db.commit()
        all_depts.append(dept)
        
    # 6. Create 1 Member for EVERY department (Total 6 members, 2 people per dept including lead)
    for dept_idx, dept in enumerate(all_depts, 1):
        club_id = clubs[0].id if dept_idx <= 3 else clubs[1].id
        for m_idx in range(1, 2):
            member = User(
                name=f"Member {m_idx} Dept {dept_idx}",
                email=f"member{m_idx}_d{dept_idx}@taskflow.com",
                password_hash=hp,
                role=UserRole.MEMBER,
                college_id=college.id,
                club_id=club_id,
                department_id=dept.id
            )
            db.add(member)
            
    db.commit()
    print("Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
