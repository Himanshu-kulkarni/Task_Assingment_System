# TaskFlow Security Vulnerability Audit

Scanned all backend routes, models, schemas, security utilities, configuration, and frontend code. Below are the vulnerabilities found, each formatted so you can paste it as-is to get a fix.

---

## 1. CRITICAL — `PATCH /users/{user_id}` has no authorization check

**File**: [auth.py](file:///d:/Himanshu%20ki%20Inventory/coding%20projects/Task_Assignment_System/backend/app/routes/auth.py#L168-L201)

Any authenticated user can call `PATCH /users/{user_id}` and change **any user's** role, college_id, club_id, or department_id — including promoting themselves to `SUPER_ADMIN`. The endpoint has no role restriction and no ownership check.

```
Fix the PATCH /users/{user_id} endpoint in backend/app/routes/auth.py. Currently any authenticated user can change any other user's role, college_id, club_id, and department_id with zero authorization checks. Restrict this endpoint so that only SUPER_ADMIN can modify user roles, and only the owning college/club/department admin can modify association fields. If this endpoint is not needed by the frontend, remove it entirely.
```

---

## 2. CRITICAL — CORS allows all origins with credentials

**File**: [main.py](file:///d:/Himanshu%20ki%20Inventory/coding%20projects/Task_Assignment_System/backend/app/main.py#L17-L23)

`allow_origins=["*"]` combined with `allow_credentials=True` means any website on the internet can make authenticated API calls on behalf of a logged-in user's browser session. This is a textbook CSRF/credential-theft vector.

```
Fix the CORS configuration in backend/app/main.py. Currently it has allow_origins=["*"] with allow_credentials=True, which allows any website to make authenticated API calls. Change allow_origins to only allow the frontend origin (e.g., "http://localhost:5173" for dev). Keep allow_credentials=True.
```

---

## 3. CRITICAL — JWT SECRET_KEY is a weak hardcoded string

**File**: [.env](file:///d:/Himanshu%20ki%20Inventory/coding%20projects/Task_Assignment_System/backend/.env#L2)

The `SECRET_KEY` is `my_super_secret_key_12345` — trivially guessable. Anyone who guesses or discovers this can forge JWT tokens for any user, including SUPER_ADMIN.

```
Fix the SECRET_KEY in backend/.env. Currently it is set to the weak value "my_super_secret_key_12345". Replace it with a cryptographically random 64-character hex string. Also update security.py to crash on startup if SECRET_KEY is missing or too short (less than 32 characters), instead of silently using None.
```

---

## 4. HIGH — No password strength validation on registration

**File**: [schemas.py](file:///d:/Himanshu%20ki%20Inventory/coding%20projects/Task_Assignment_System/backend/app/schemas.py#L6-L10)

The `UserCreate` schema accepts any string as `password` — including empty strings and single characters. There is no minimum length, complexity, or max-length validation.

```
Fix the UserCreate schema in backend/app/schemas.py. Currently the password field accepts any string including empty strings. Add a Pydantic field_validator that enforces: minimum 8 characters, at least one uppercase letter, at least one lowercase letter, at least one digit, and maximum 128 characters.
```

---

## 5. HIGH — No rate limiting on login endpoint

**File**: [auth.py](file:///d:/Himanshu%20ki%20Inventory/coding%20projects/Task_Assignment_System/backend/app/routes/auth.py#L76-L114)

The `POST /login` endpoint has no rate limiting. An attacker can brute-force passwords at unlimited speed.

```
Add rate limiting to the POST /login endpoint in backend/app/routes/auth.py. Limit to 5 login attempts per IP address per minute. Use the slowapi library (FastAPI-compatible). Return HTTP 429 with a clear error message when the limit is exceeded. Also add the SlowAPI middleware to main.py.
```

---

## 6. HIGH — `GET /colleges` endpoint is fully unauthenticated

**File**: [colleges.py](file:///d:/Himanshu%20ki%20Inventory/coding%20projects/Task_Assignment_System/backend/app/routes/colleges.py#L56-L74)

The `GET /colleges` endpoint has no authentication at all and returns representative names, emails, and internal IDs to anyone on the internet. This leaks PII of college representatives.

```
Fix the GET /colleges endpoint in backend/app/routes/colleges.py. Currently it is unauthenticated and returns representative names, emails, and internal IDs. Split it into two endpoints: (1) a public GET /colleges/public that returns only college id, name, code for registration dropdown, and (2) keep the existing detailed GET /colleges restricted to SUPER_ADMIN only.
```

---

## 7. HIGH — JWT token has no `sub` claim and no token type field

**File**: [security.py](file:///d:/Himanshu%20ki%20Inventory/coding%20projects/Task_Assignment_System/backend/app/utils/security.py#L25-L41)

The JWT payload only contains `user_id` and `exp`. It lacks a standard `sub` (subject) claim and has no `type` field to distinguish access tokens from potential future refresh tokens. If refresh tokens are ever added, they could be used as access tokens.

```
Fix the create_access_token function in backend/app/utils/security.py. Add a "sub" claim (set to the string user_id), a "type" claim set to "access", and an "iat" (issued at) claim. Update verify_token to also validate that the "type" claim equals "access" and that "sub" is present, rejecting tokens that don't match.
```

---

## 8. HIGH — Application role field accepts arbitrary strings

**File**: [schemas.py](file:///d:/Himanshu%20ki%20Inventory/coding%20projects/Task_Assignment_System/backend/app/schemas.py#L81-L84)

The `ApplicationCreate` schema has `role: str` with no validation. A user can submit an application with `role = "SUPER_ADMIN"` or `role = "COLLEGE_REP"` or any garbage string. While the approval logic has some guards, the data pollution alone is a risk.

```
Fix the ApplicationCreate schema in backend/app/schemas.py. Currently the role field is an unvalidated string. Replace it with an Enum (or Literal) that only allows the valid application roles: "FACULTY_COORDINATOR", "PRESIDENT", "VICE_PRESIDENT", "DEPARTMENT_LEAD", "MEMBER". Reject any other values at the schema validation layer.
```

---

## 9. HIGH — UserUpdate schema role field accepts arbitrary strings

**File**: [schemas.py](file:///d:/Himanshu%20ki%20Inventory/coding%20projects/Task_Assignment_System/backend/app/schemas.py#L75-L79)

The `UserUpdate` schema has `role: str | None = None` with no validation. Combined with vulnerability #1, this lets anyone set any user's role to any arbitrary string.

```
Fix the UserUpdate schema in backend/app/schemas.py. Currently the role field is an unvalidated Optional[str]. Replace it with Optional[UserRole] using the UserRole enum from roles.py, so only valid roles are accepted. This prevents injection of arbitrary role strings.
```

---

## 10. MEDIUM — No foreign key constraints in database models

**File**: [models.py](file:///d:/Himanshu%20ki%20Inventory/coding%20projects/Task_Assignment_System/backend/app/models.py)

None of the integer reference columns (`college_id`, `club_id`, `department_id`, `lead_id`, `assigned_to`, `assigned_by`, `representative_id`, `user_id`) use SQLAlchemy `ForeignKey` constraints. This means the database will happily accept orphaned references (e.g., a task assigned to a deleted user, a club referencing a non-existent college). Data integrity is not enforced at the DB level.

```
Fix the database models in backend/app/models.py. Add proper SQLAlchemy ForeignKey constraints for all reference columns: User.college_id -> colleges.id, User.club_id -> clubs.id, User.department_id -> departments.id, Department.lead_id -> users.id, Task.assigned_to -> users.id, Task.assigned_by -> users.id, Task.department_id -> departments.id, Club.college_id -> colleges.id, Club.faculty_coordinator_id -> users.id, College.representative_id -> users.id, Application.user_id -> users.id, Application.club_id -> clubs.id, Application.department_id -> departments.id. After adding the constraints, drop and recreate the database, then re-seed.
```

---

## 11. MEDIUM — Departments not scoped to clubs (missing `club_id` column)

**File**: [models.py](file:///d:/Himanshu%20ki%20Inventory/coding%20projects/Task_Assignment_System/backend/app/models.py#L57-L66)

The `Department` model has no `club_id` column. Department ownership is inferred at runtime by joining through the lead user's `club_id`. This means if a lead is reassigned to another club, the department silently changes ownership. It also makes queries fragile — departments with no lead assigned (or a lead with no `club_id`) become invisible.

```
Fix the Department model in backend/app/models.py. Add a club_id column (Integer, ForeignKey to clubs.id, nullable=False) to the Department table so that club ownership is stored directly on the department rather than inferred through the lead's user record. Update the create_department endpoint in departments.py to set club_id from current_user.club_id. Update all queries that currently join Department->User to determine club association to use Department.club_id directly instead.
```

---

## 12. MEDIUM — Task status field accepts arbitrary strings at the DB level

**File**: [models.py](file:///d:/Himanshu%20ki%20Inventory/coding%20projects/Task_Assignment_System/backend/app/models.py#L78)

The `Task.status` column is a plain `String` with a default of `"PENDING"`. While the `TaskStatusUpdate` schema uses an enum, there is no DB-level check constraint. Direct DB access or an ORM bypass could write invalid status values.

```
Fix the Task model in backend/app/models.py. The status column is currently a plain String with no constraint. Add a CheckConstraint (or use SQLAlchemy's Enum type) to restrict the status column to only accept the values: "PENDING", "IN_PROGRESS", "COMPLETED" at the database level.
```

---

## 13. MEDIUM — Hardcoded representative password `WelcomeRep123!`

**File**: [colleges.py](file:///d:/Himanshu%20ki%20Inventory/coding%20projects/Task_Assignment_System/backend/app/routes/colleges.py#L110)

Every auto-created College Representative gets the same static password `WelcomeRep123!`. If anyone knows this convention, they can log in as any newly created representative before the actual person changes their password. There is also no mechanism forcing a password change on first login.

```
Fix the auto-created representative password in backend/app/routes/colleges.py. Currently every representative gets the same hardcoded password "WelcomeRep123!". Instead, generate a random secure password (e.g., 16 characters with mixed case, digits, and special characters) using Python's secrets module for each new representative. The generated password is already shown to the Super Admin in the credentials modal, so this change is transparent.
```

---

## 14. MEDIUM — JWT token stored in localStorage (XSS-vulnerable)

**File**: [App.tsx](file:///d:/Himanshu%20ki%20Inventory/coding%20projects/Task_Assignment_System/frontend/src/App.tsx#L60)

The JWT access token is stored in `localStorage`. If an XSS vulnerability is ever introduced (e.g., from a third-party dependency), the attacker can trivially steal the token with `localStorage.getItem('token')`. HttpOnly cookies are the more secure alternative.

```
This is a known trade-off in SPAs. For now, add a comment in App.tsx near the localStorage.setItem('token', ...) line documenting that this is an accepted risk for development, and that production should migrate to HttpOnly cookie-based token storage with the backend setting Set-Cookie headers. No code change needed right now, just add the documentation comment.
```

---

## 15. LOW — `GET /colleges` endpoint fetches representatives with N+1 query

**File**: [colleges.py](file:///d:/Himanshu%20ki%20Inventory/coding%20projects/Task_Assignment_System/backend/app/routes/colleges.py#L56-L74)

For each college, the endpoint runs an additional `db.query(User)` to fetch the representative. With 100 colleges, this becomes 101 queries. While not a security vulnerability per se, it creates a denial-of-service amplification vector — a single unauthenticated request triggers O(N) database queries.

```
Fix the N+1 query issue in the GET /colleges endpoint in backend/app/routes/colleges.py. Currently it loops through each college and runs a separate db.query(User) for each representative. Use a single query with a join (e.g., outerjoin College with User on College.representative_id == User.id) to fetch all data in one database round-trip.
```

---

## Summary Table

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| 1 | **CRITICAL** | `PATCH /users/{user_id}` | No authorization — any user can escalate to SUPER_ADMIN |
| 2 | **CRITICAL** | CORS config | `allow_origins=["*"]` with credentials enabled |
| 3 | **CRITICAL** | `.env` SECRET_KEY | Weak hardcoded JWT signing key |
| 4 | **HIGH** | UserCreate schema | No password strength validation |
| 5 | **HIGH** | `POST /login` | No rate limiting — brute-force possible |
| 6 | **HIGH** | `GET /colleges` | Unauthenticated endpoint leaking PII |
| 7 | **HIGH** | JWT creation | Missing `sub`, `type`, `iat` claims |
| 8 | **HIGH** | ApplicationCreate | Role field accepts arbitrary strings |
| 9 | **HIGH** | UserUpdate | Role field accepts arbitrary strings |
| 10 | **MEDIUM** | models.py | No ForeignKey constraints in DB |
| 11 | **MEDIUM** | Department model | No `club_id` column — ownership inferred |
| 12 | **MEDIUM** | Task model | Status not constrained at DB level |
| 13 | **MEDIUM** | College creation | Hardcoded representative password |
| 14 | **MEDIUM** | Frontend | JWT in localStorage (XSS risk) |
| 15 | **LOW** | `GET /colleges` | N+1 query amplification |
