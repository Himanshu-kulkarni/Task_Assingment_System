# TaskFlow API Contract (Updated)

All requests must contain:
`Content-Type: application/json`

For authenticated routes, include:
`Authorization: Bearer <token>`

---

## 1. Authentication Endpoints

### Register User
*   **Route**: `POST /register`
*   **Authentication**: None
*   **Request Body (`UserCreate`)**:
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "password": "securepassword123"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "message": "User Registered Successfully",
      "user_id": 1
    }
    ```
*   **Error Response (400 Bad Request)**:
    ```json
    {
      "detail": "Email already registered"
    }
    ```

### Login User
*   **Route**: `POST /login`
*   **Authentication**: None
*   **Request Body (`UserLogin`)**:
    ```json
    {
      "email": "jane@example.com",
      "password": "securepassword123"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "access_token": "eyJhbGciOi...",
      "token_type": "bearer"
    }
    ```
*   **Error Response (401 Unauthorized)**:
    ```json
    {
      "detail": "Invalid email or password"
    }
    ```

### Retrieve Profile Context
*   **Route**: `GET /me`
*   **Authentication**: Required (JWT Bearer)
*   **Success Response (200 OK)**:
    ```json
    {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "MEMBER",
      "college_id": null,
      "club_id": null,
      "department_id": null
    }
    ```

---

## 2. College & Club Endpoints

### Create Club
*   **Route**: `POST /clubs`
*   **Authentication**: Required (`COLLEGE_REP` only)
*   **Request Body**:
    ```json
    {
      "name": "Robotics Club",
      "description": "Building hardware and software robots"
    }
    ```
*   **Response**: Success message and `club_id`.

### Delete Club
*   **Route**: `DELETE /clubs/{club_id}`
*   **Authentication**: Required (`COLLEGE_REP` only)

### College Rep Observational Dashboard
*   **Route**: `GET /colleges/dashboard`
*   **Authentication**: Required (`COLLEGE_REP` only)
*   **Response**:
    ```json
    {
      "total_clubs": 10,
      "total_tasks_assigned": 150,
      "total_tasks_completed": 80,
      "pending_tasks_per_club": [
        {
          "club_id": 1,
          "club_name": "Robotics Club",
          "pending_tasks": 12
        }
      ]
    }
    ```

---

## 3. Tasks & Department Endpoints

### Create Task
*   **Route**: `POST /tasks`
*   **Authentication**: Required (`FACULTY_COORDINATOR`, `PRESIDENT`, `VICE_PRESIDENT`, or `DEPARTMENT_LEAD`)
*   **Rules**:
    *   `FACULTY_COORDINATOR` can only assign to President/Vice President.
    *   `PRESIDENT`/`VICE_PRESIDENT` can only assign to Department Leads.
    *   `DEPARTMENT_LEAD` can only assign to members of their own department.
*   **Request Body**:
    ```json
    {
      "title": "Complete Design Draft",
      "description": "Draft UI mockup layout",
      "deadline": "2026-07-25T18:00:00Z",
      "assigned_to": 12
    }
    ```

### Update Task Status
*   **Route**: `PATCH /tasks/{task_id}/status`
*   **Authentication**: Required (Only assigned user)
*   **Request Body**:
    ```json
    {
      "status": "IN_PROGRESS"
    }
    ```
