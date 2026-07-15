import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db, engine
from app.models import User, Department, Task, Club, College, Base

from app.roles import UserRole
from app.utils.security import hash_password
from sqlalchemy.orm import sessionmaker

# Setup test database session
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class TestRolePermissions(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Ensure tables exist
        Base.metadata.create_all(bind=engine)

    def setUp(self):
        self.client = TestClient(app)
        self.db = TestingSessionLocal()
        
        # Clean up and recreate tables to ensure columns match models
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        # Seed initial test data
        self.setup_users()

    def tearDown(self):
        self.db.close()

    def setup_users(self):
        # Create College
        self.college = College(name="Test College", description="Test College Desc", representative_id=None)
        self.db.add(self.college)
        self.db.commit()
        self.db.refresh(self.college)

        # Create Club
        self.club = Club(name="Test Club", description="Test Club Desc", college_id=self.college.id)
        self.db.add(self.club)
        self.db.commit()
        self.db.refresh(self.club)

        # Create Departments
        self.dept_a = Department(name="Department A", description="Dept A", lead_id=None)
        self.dept_b = Department(name="Department B", description="Dept B", lead_id=None)
        self.db.add(self.dept_a)
        self.db.add(self.dept_b)
        self.db.commit()
        self.db.refresh(self.dept_a)
        self.db.refresh(self.dept_b)

        # Hash passwords
        hp = hash_password("password123")

        # Create Representative
        self.rep = User(name="Rep", email="rep@test.com", password_hash=hp, role=UserRole.COLLEGE_REP, college_id=self.college.id)
        # Create Faculty Coordinator
        self.fc = User(name="FC", email="fc@test.com", password_hash=hp, role=UserRole.FACULTY_COORDINATOR, club_id=self.club.id)
        # Create President
        self.pres = User(name="President", email="pres@test.com", password_hash=hp, role=UserRole.PRESIDENT, club_id=self.club.id)
        # Create Department Leads
        self.lead_a = User(name="Lead A", email="leada@test.com", password_hash=hp, role=UserRole.DEPARTMENT_LEAD, club_id=self.club.id, department_id=self.dept_a.id)
        self.lead_b = User(name="Lead B", email="leadb@test.com", password_hash=hp, role=UserRole.DEPARTMENT_LEAD, club_id=self.club.id, department_id=self.dept_b.id)
        # Create Members
        self.member_a = User(name="Member A", email="membera@test.com", password_hash=hp, role=UserRole.MEMBER, club_id=self.club.id, department_id=self.dept_a.id)
        self.member_b = User(name="Member B", email="memberb@test.com", password_hash=hp, role=UserRole.MEMBER, club_id=self.club.id, department_id=self.dept_b.id)

        self.db.add_all([self.rep, self.fc, self.pres, self.lead_a, self.lead_b, self.member_a, self.member_b])
        self.db.commit()

        # Update Department Leads references
        self.dept_a.lead_id = self.lead_a.id
        self.dept_b.lead_id = self.lead_b.id
        self.db.commit()

    def get_token(self, email):
        res = self.client.post("/login", json={"email": email, "password": "password123"})
        return res.json()["access_token"]

    def test_college_rep_club_creation(self):
        token = self.get_token("rep@test.com")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Rep creates club
        res = self.client.post("/clubs", headers=headers, json={"name": "New Club", "description": "New Club Desc"})
        self.assertEqual(res.status_code, 200)
        
        # Member tries to create club -> 403 Access Denied
        member_token = self.get_token("membera@test.com")
        res2 = self.client.post("/clubs", headers={"Authorization": f"Bearer {member_token}"}, json={"name": "Fail Club", "description": "Fail"})
        self.assertEqual(res2.status_code, 403)

    def test_task_creation_constraints(self):
        # 1. Lead A cannot assign to Member B (different department)
        lead_a_token = self.get_token("leada@test.com")
        res = self.client.post("/tasks", headers={"Authorization": f"Bearer {lead_a_token}"}, json={
            "title": "Lead A Task",
            "description": "Desc",
            "deadline": "2026-07-25T18:00:00Z",
            "assigned_to": self.member_b.id
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("User does not belong to your department", res.json()["detail"])

        # 2. Lead A can assign to Member A (same department)
        res = self.client.post("/tasks", headers={"Authorization": f"Bearer {lead_a_token}"}, json={
            "title": "Lead A Success Task",
            "description": "Desc",
            "deadline": "2026-07-25T18:00:00Z",
            "assigned_to": self.member_a.id
        })
        self.assertEqual(res.status_code, 200)

        # 3. President can assign to Department Leads
        pres_token = self.get_token("pres@test.com")
        res = self.client.post("/tasks", headers={"Authorization": f"Bearer {pres_token}"}, json={
            "title": "President Task",
            "description": "Desc",
            "deadline": "2026-07-25T18:00:00Z",
            "assigned_to": self.lead_a.id
        })
        self.assertEqual(res.status_code, 200)

        # 4. President cannot assign to Member A directly
        res = self.client.post("/tasks", headers={"Authorization": f"Bearer {pres_token}"}, json={
            "title": "President Direct Task",
            "description": "Desc",
            "deadline": "2026-07-25T18:00:00Z",
            "assigned_to": self.member_a.id
        })
        self.assertEqual(res.status_code, 400)

    def test_task_deletion_constraints(self):
        # Lead A assigns a task to Member A
        lead_a_token = self.get_token("leada@test.com")
        res = self.client.post("/tasks", headers={"Authorization": f"Bearer {lead_a_token}"}, json={
            "title": "Task A",
            "description": "Desc",
            "deadline": "2026-07-25T18:00:00Z",
            "assigned_to": self.member_a.id
        })
        task_id = res.json()["id"]

        # Lead B tries to delete Task A -> 403
        lead_b_token = self.get_token("leadb@test.com")
        res_del = self.client.delete(f"/tasks/{task_id}", headers={"Authorization": f"Bearer {lead_b_token}"})
        self.assertEqual(res_del.status_code, 403)

        # Lead A deletes Task A -> 200
        res_del = self.client.delete(f"/tasks/{task_id}", headers={"Authorization": f"Bearer {lead_a_token}"})
        self.assertEqual(res_del.status_code, 200)

    def test_applications_flow(self):
        # Create a new user with no assignments
        hp = hash_password("password123")
        new_user = User(name="Applicant", email="applicant@test.com", password_hash=hp, role=UserRole.MEMBER, college_id=self.college.id)
        self.db.add(new_user)
        self.db.commit()

        # 1. Applicant submits coordinator application
        token = self.get_token("applicant@test.com")
        res = self.client.post("/applications", headers={"Authorization": f"Bearer {token}"}, json={"club_id": self.club.id, "role": "FACULTY_COORDINATOR"})
        self.assertEqual(res.status_code, 200)
        app_id = res.json()["application_id"]

        # 2. Get applications list for Representative
        rep_token = self.get_token("rep@test.com")
        res = self.client.get("/applications", headers={"Authorization": f"Bearer {rep_token}"})
        self.assertEqual(res.status_code, 200)
        apps = res.json()
        self.assertTrue(any(a["id"] == app_id for a in apps))

        # 3. Approve application as College Representative
        res = self.client.post(f"/applications/{app_id}/approve", headers={"Authorization": f"Bearer {rep_token}"})
        self.assertEqual(res.status_code, 200)

        # 4. Verify applicant is now coordinator
        self.db.expire_all()
        verified_user = self.db.query(User).filter(User.email == "applicant@test.com").first()
        self.assertEqual(verified_user.role, UserRole.FACULTY_COORDINATOR)
        self.assertEqual(verified_user.club_id, self.club.id)

if __name__ == "__main__":
    unittest.main()
