# Task Assignment System - API Contract Documentation

Frontend-Backend Integration Specification

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication APIs](#authentication-apis)
3. [Task APIs](#task-apis)
4. [Department APIs](#department-apis)
5. [Dashboard APIs](#dashboard-apis)
6. [Axios Service Layer](#axios-service-layer)
7. [Frontend Data Types](#frontend-data-types)
8. [Token Handling Strategy](#token-handling-strategy)
9. [Protected Route Strategy](#protected-route-strategy)
10. [Error Handling](#error-handling)

---

## Overview

### API Base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://api.taskassignment.com` (to be configured)

### API Documentation
- **Swagger UI**: `/docs`
- **ReDoc**: `/redoc`

### General Conventions
- All endpoints return JSON
- Authentication uses JWT Bearer tokens
- All timestamps are ISO 8601 format
- All IDs are strings (UUIDs)
- Request/response content-type: `application/json`

### Authentication Header Format
```
Authorization: Bearer {access_token}
```

---

## Authentication APIs

### 1. User Registration

#### Endpoint
```
POST /register
```

#### Authentication Required
No (Public endpoint)

#### Request Body
```json
{
  "name": "string (required, 2-100 characters)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 characters)"
}
```

#### Response Body (201 Created)
```json
{
  "user_id": "string (UUID)",
  "name": "string",
  "email": "string",
  "message": "User registered successfully"
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "detail": "Email already registered"
}
```

**422 Unprocessable Entity**
```json
{
  "detail": [
    {
      "loc": ["body", "name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

#### Frontend Usage
- Register page form submission
- Called before login
- Display success message and redirect to login

#### Notes
- Email must be unique in system
- Password requirements: min 8 chars (enforced by backend)
- User created in MEMBER role by default
- User not assigned to department until role assignment

---

### 2. User Login

#### Endpoint
```
POST /login
```

#### Authentication Required
No (Public endpoint)

#### Request Body
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

#### Response Body (200 OK)
```json
{
  "access_token": "string (JWT token)",
  "token_type": "string (always 'bearer')"
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "detail": "Incorrect email or password"
}
```

**422 Unprocessable Entity**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

#### Frontend Usage
- Called when user submits login form
- Token stored in localStorage and state
- Redirect to dashboard on success
- Display error alert on failure

#### Token Details
- **Expiration**: 1 hour (3600 seconds)
- **Algorithm**: HS256
- **Payload Contains**: user_id, exp, iat

#### Notes
- Email is case-insensitive
- Password is bcrypt hashed
- Failed login attempts should not reveal if email exists

---

### 3. Get Current User Profile

#### Endpoint
```
GET /me
```

#### Authentication Required
Yes (Bearer token required)

#### Request Body
None

#### Response Body (200 OK)
```json
{
  "user_id": "string (UUID)",
  "name": "string",
  "email": "string",
  "role": "string (PRESIDENT|VICE_PRESIDENT|DEPARTMENT_LEAD|MEMBER)",
  "department_id": "string (UUID) | null"
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden**
```json
{
  "detail": "Invalid or expired token"
}
```

#### Frontend Usage
- Called on app initialization to verify authentication
- Called after login to fetch user profile
- Called after logout to check if still authenticated (redirect if 401)
- Used to populate user state
- Used to determine which dashboard to show

#### Token Requirements
- Must include Authorization header
- Token must not be expired
- Token signature must be valid

#### Notes
- If department_id is null, user not yet assigned to department
- Role determines what actions are available
- Called frequently, consider caching with TTL

---

### 4. Logout (Frontend Only)

#### Endpoint
N/A (Frontend operation)

#### Implementation
```
1. Remove token from localStorage
2. Clear auth state (user, token, isAuthenticated)
3. Clear all cached data (tasks, departments, users)
4. Redirect to login page
```

#### Notes
- No backend endpoint needed
- Token becomes invalid after 1 hour automatically
- User can logout before token expiration
- Clear all sensitive data before logout redirect

---

## Task APIs

### 1. Create Task

#### Endpoint
```
POST /tasks
```

#### Authentication Required
Yes (Bearer token required)

#### Authorization
- PRESIDENT: Can create for any department
- VICE_PRESIDENT: Can create for any department
- DEPARTMENT_LEAD: Can create for own department only
- MEMBER: No permission (403 Forbidden)

#### Request Body
```json
{
  "title": "string (required, 1-255 characters)",
  "description": "string (optional, max 5000 characters)",
  "assigned_to_id": "string (required, UUID of existing user)",
  "department_id": "string (required, UUID of existing department)",
  "deadline": "string (required, ISO 8601 datetime, future date)"
}
```

#### Response Body (201 Created)
```json
{
  "task_id": "string (UUID)",
  "title": "string",
  "description": "string | null",
  "status": "string (PENDING)",
  "assigned_to_id": "string (UUID)",
  "assigned_to": {
    "user_id": "string",
    "name": "string",
    "email": "string"
  },
  "created_by_id": "string (UUID)",
  "created_by": {
    "user_id": "string",
    "name": "string",
    "email": "string"
  },
  "department_id": "string (UUID)",
  "department": {
    "department_id": "string",
    "name": "string"
  },
  "deadline": "string (ISO 8601)",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "detail": "Deadline must be in the future"
}
```

**403 Forbidden - Permission Denied**
```json
{
  "detail": "You do not have permission to create tasks in this department"
}
```

**404 Not Found**
```json
{
  "detail": "User not found" | "Department not found"
}
```

**422 Unprocessable Entity**
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

#### Frontend Usage
- Task create form submission
- Used in TaskCreatePage
- Called after form validation
- On success: show toast, update tasks state, redirect or show task details
- On error: display error alert

#### Notes
- assigned_to_id must be a member of the department
- Department Lead can only create in their own department
- Status always starts as PENDING
- created_by_id is automatically set from current user

---

### 2. Get Task Details

#### Endpoint
```
GET /tasks/{task_id}
```

#### Authentication Required
Yes (Bearer token required)

#### Authorization
- PRESIDENT: Can view any task
- VICE_PRESIDENT: Can view any task
- DEPARTMENT_LEAD: Can view tasks in their department
- MEMBER: Can view own assigned tasks and tasks created by self

#### URL Parameters
```
task_id: string (UUID of task)
```

#### Request Body
None

#### Response Body (200 OK)
```json
{
  "task_id": "string (UUID)",
  "title": "string",
  "description": "string | null",
  "status": "string (PENDING|IN_PROGRESS|COMPLETED)",
  "assigned_to_id": "string (UUID)",
  "assigned_to": {
    "user_id": "string",
    "name": "string",
    "email": "string"
  },
  "created_by_id": "string (UUID)",
  "created_by": {
    "user_id": "string",
    "name": "string",
    "email": "string"
  },
  "department_id": "string (UUID)",
  "department": {
    "department_id": "string",
    "name": "string"
  },
  "deadline": "string (ISO 8601)",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden - Permission Denied**
```json
{
  "detail": "You do not have permission to view this task"
}
```

**404 Not Found**
```json
{
  "detail": "Task not found"
}
```

#### Frontend Usage
- TaskDetailPage component
- Called when viewing task details
- Used to populate task detail panel
- Used to show assignee and creator info
- Used to enable/disable edit/delete buttons based on permissions

#### Caching Strategy
- Cache with 30-60 second TTL
- Invalidate cache when task status updated
- Invalidate cache when task deleted

---

### 3. Get All Tasks (with Filtering)

#### Endpoint
```
GET /tasks
```

#### Authentication Required
Yes (Bearer token required)

#### Authorization
- PRESIDENT: Can view all tasks
- VICE_PRESIDENT: Can view all tasks
- DEPARTMENT_LEAD: Can view tasks in their department
- MEMBER: Cannot use this endpoint (403 Forbidden)

#### Query Parameters
```
skip: integer (optional, default 0, number of records to skip)
limit: integer (optional, default 20, max 100)
status: string (optional, PENDING|IN_PROGRESS|COMPLETED, comma-separated)
department_id: string (optional, UUID)
assigned_to_id: string (optional, UUID)
created_by_id: string (optional, UUID)
search: string (optional, search in title and description)
sort_by: string (optional, created_at|deadline|status, default created_at)
sort_order: string (optional, asc|desc, default desc)
```

#### Request Body
None

#### Response Body (200 OK)
```json
{
  "tasks": [
    {
      "task_id": "string (UUID)",
      "title": "string",
      "description": "string | null",
      "status": "string",
      "assigned_to_id": "string",
      "assigned_to": {
        "user_id": "string",
        "name": "string",
        "email": "string"
      },
      "created_by": {
        "user_id": "string",
        "name": "string"
      },
      "department": {
        "department_id": "string",
        "name": "string"
      },
      "deadline": "string (ISO 8601)",
      "created_at": "string (ISO 8601)",
      "updated_at": "string (ISO 8601)"
    }
  ],
  "total": "integer (total records matching filters)",
  "skip": "integer",
  "limit": "integer"
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden - Permission Denied**
```json
{
  "detail": "You do not have permission to view all tasks"
}
```

**422 Unprocessable Entity**
```json
{
  "detail": "Invalid query parameters"
}
```

#### Frontend Usage
- TasksPage component (All Tasks view)
- TaskTable for pagination and filtering
- Dashboard widgets for task overview
- Called with various filters for different views

#### Example Queries
```
GET /tasks?status=PENDING&limit=10
GET /tasks?department_id={id}&status=IN_PROGRESS&sort_by=deadline
GET /tasks?search=urgent&limit=20&skip=20
```

#### Notes
- Members cannot use this endpoint; use /tasks/my-tasks instead
- Results automatically filtered by role and permissions
- Default sort is by created_at descending

---

### 4. Get My Tasks (Assigned to Current User)

#### Endpoint
```
GET /tasks/my-tasks
```

#### Authentication Required
Yes (Bearer token required)

#### Authorization
- All authenticated users can access own tasks
- Returns only tasks assigned to current user

#### Query Parameters
```
skip: integer (optional, default 0)
limit: integer (optional, default 20, max 100)
status: string (optional, PENDING|IN_PROGRESS|COMPLETED)
sort_by: string (optional, deadline|created_at|status)
sort_order: string (optional, asc|desc)
```

#### Request Body
None

#### Response Body (200 OK)
```json
{
  "tasks": [
    {
      "task_id": "string (UUID)",
      "title": "string",
      "description": "string | null",
      "status": "string",
      "created_by": {
        "user_id": "string",
        "name": "string"
      },
      "department": {
        "department_id": "string",
        "name": "string"
      },
      "deadline": "string (ISO 8601)",
      "created_at": "string (ISO 8601)",
      "updated_at": "string (ISO 8601)"
    }
  ],
  "total": "integer",
  "skip": "integer",
  "limit": "integer"
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "detail": "Not authenticated"
}
```

#### Frontend Usage
- MyTasksPage component
- Dashboard assigned tasks widget
- Profile page tasks section
- Called frequently to show user's workload
- Used by all roles

#### Caching Strategy
- Cache with 1 minute TTL
- Refresh when task status updated
- Refresh when new task assigned
- User can manually refresh

#### Example Queries
```
GET /tasks/my-tasks?status=PENDING
GET /tasks/my-tasks?limit=5&sort_by=deadline
GET /tasks/my-tasks?status=IN_PROGRESS,PENDING
```

---

### 5. Get Tasks Created By Me

#### Endpoint
```
GET /tasks/created-by-me
```

#### Authentication Required
Yes (Bearer token required)

#### Authorization
- All authenticated users can access own created tasks
- Returns only tasks created by current user

#### Query Parameters
```
skip: integer (optional, default 0)
limit: integer (optional, default 20)
status: string (optional, PENDING|IN_PROGRESS|COMPLETED)
department_id: string (optional, UUID)
sort_by: string (optional, deadline|created_at|status)
sort_order: string (optional, asc|desc)
```

#### Request Body
None

#### Response Body (200 OK)
```json
{
  "tasks": [
    {
      "task_id": "string (UUID)",
      "title": "string",
      "description": "string | null",
      "status": "string",
      "assigned_to": {
        "user_id": "string",
        "name": "string"
      },
      "department": {
        "department_id": "string",
        "name": "string"
      },
      "deadline": "string (ISO 8601)",
      "created_at": "string (ISO 8601)",
      "updated_at": "string (ISO 8601)"
    }
  ],
  "total": "integer",
  "skip": "integer",
  "limit": "integer"
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "detail": "Not authenticated"
}
```

#### Frontend Usage
- CreatedByMePage component
- Profile page created tasks section
- Task management overview
- Called by President, VP, Department Lead

#### Example Queries
```
GET /tasks/created-by-me?status=PENDING
GET /tasks/created-by-me?department_id={id}&limit=10
```

---

### 6. Update Task Status

#### Endpoint
```
PATCH /tasks/{task_id}/status
```

#### Authentication Required
Yes (Bearer token required)

#### Authorization
- PRESIDENT: Can update any task
- VICE_PRESIDENT: Can update any task
- DEPARTMENT_LEAD: Can update tasks in their department
- MEMBER: Can update only own assigned tasks

#### URL Parameters
```
task_id: string (UUID of task)
```

#### Request Body
```json
{
  "status": "string (required, PENDING|IN_PROGRESS|COMPLETED)"
}
```

#### Response Body (200 OK)
```json
{
  "task_id": "string (UUID)",
  "status": "string (new status)",
  "updated_at": "string (ISO 8601)",
  "message": "Task status updated successfully"
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "detail": "Invalid status value"
}
```

**403 Forbidden - Permission Denied**
```json
{
  "detail": "You do not have permission to update this task status"
}
```

**404 Not Found**
```json
{
  "detail": "Task not found"
}
```

**422 Unprocessable Entity**
```json
{
  "detail": [
    {
      "loc": ["body", "status"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

#### Frontend Usage
- TaskStatusUpdater component
- Task detail page status dropdown
- Task card quick action
- Called when user changes task status

#### Valid Status Transitions
```
PENDING → IN_PROGRESS
IN_PROGRESS → COMPLETED
COMPLETED → IN_PROGRESS (if allowed by rules)
```

#### Notes
- Status change triggers notification to task creator (future feature)
- Update is optimistic (update UI immediately, then API call)
- On failure, revert UI change and show error

---

### 7. Delete Task

#### Endpoint
```
DELETE /tasks/{task_id}
```

#### Authentication Required
Yes (Bearer token required)

#### Authorization
- PRESIDENT: Can delete any task
- VICE_PRESIDENT: Can delete own created tasks
- DEPARTMENT_LEAD: Can delete own created tasks
- MEMBER: Cannot delete tasks (403 Forbidden)

#### URL Parameters
```
task_id: string (UUID of task)
```

#### Request Body
None

#### Response Body (200 OK)
```json
{
  "message": "Task deleted successfully",
  "task_id": "string (UUID)"
}
```

#### Error Responses

**403 Forbidden - Permission Denied**
```json
{
  "detail": "You do not have permission to delete this task"
}
```

**404 Not Found**
```json
{
  "detail": "Task not found"
}
```

#### Frontend Usage
- TaskDetail page delete button
- Task actions menu delete option
- Confirmation modal before deletion
- Called after user confirms deletion

#### Notes
- Requires confirmation from user
- On success: show toast, remove from state, redirect to tasks list
- Soft delete (future enhancement): mark as deleted instead of removing
- Cannot recover deleted task (no trash/recovery feature yet)

---

## Department APIs

### 1. Create Department

#### Endpoint
```
POST /departments
```

#### Authentication Required
Yes (Bearer token required)

#### Authorization
- PRESIDENT: Can create departments
- VICE_PRESIDENT: Can create departments
- DEPARTMENT_LEAD: Cannot create departments (403 Forbidden)
- MEMBER: Cannot create departments (403 Forbidden)

#### Request Body
```json
{
  "name": "string (required, 1-100 characters, unique)",
  "description": "string (optional, max 500 characters)"
}
```

#### Response Body (201 Created)
```json
{
  "department_id": "string (UUID)",
  "name": "string",
  "description": "string | null",
  "created_at": "string (ISO 8601)"
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "detail": "Department name already exists"
}
```

**403 Forbidden - Permission Denied**
```json
{
  "detail": "You do not have permission to create departments"
}
```

**422 Unprocessable Entity**
```json
{
  "detail": [
    {
      "loc": ["body", "name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

#### Frontend Usage
- CreateDepartmentPage component
- DepartmentCreateForm submission
- Called by President/VP only

#### Notes
- Department names must be unique
- New department has no members initially
- No department lead assigned automatically
- Can be assigned after creation

---

### 2. Get All Departments

#### Endpoint
```
GET /departments
```

#### Authentication Required
Yes (Bearer token required)

#### Authorization
- All authenticated users can view departments list
- Full list for all users

#### Query Parameters
```
skip: integer (optional, default 0)
limit: integer (optional, default 50)
search: string (optional, search in name)
```

#### Request Body
None

#### Response Body (200 OK)
```json
{
  "departments": [
    {
      "department_id": "string (UUID)",
      "name": "string",
      "description": "string | null",
      "lead_id": "string (UUID) | null",
      "lead_name": "string | null",
      "members_count": "integer",
      "tasks_count": "integer",
      "created_at": "string (ISO 8601)"
    }
  ],
  "total": "integer",
  "skip": "integer",
  "limit": "integer"
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "detail": "Not authenticated"
}
```

#### Frontend Usage
- DepartmentsPage component
- Department selector dropdown
- Department widget on dashboard
- UserAssignmentModal member selector
- Called frequently for reference data

#### Caching Strategy
- Cache with 5 minute TTL
- Invalidate on department creation
- Invalidate on department update

#### Example Queries
```
GET /departments?limit=100
GET /departments?search=engineering
GET /departments?skip=20&limit=10
```

---

### 3. Get Department Members

#### Endpoint
```
GET /departments/{department_id}/members
```

#### Authentication Required
Yes (Bearer token required)

#### Authorization
- PRESIDENT: Can view all department members
- VICE_PRESIDENT: Can view all department members
- DEPARTMENT_LEAD: Can view own department members
- MEMBER: Can view own department members

#### URL Parameters
```
department_id: string (UUID of department)
```

#### Query Parameters
```
skip: integer (optional, default 0)
limit: integer (optional, default 50)
search: string (optional, search in name/email)
```

#### Request Body
None

#### Response Body (200 OK)
```json
{
  "department_id": "string (UUID)",
  "department_name": "string",
  "members": [
    {
      "user_id": "string (UUID)",
      "name": "string",
      "email": "string",
      "role": "string (PRESIDENT|VICE_PRESIDENT|DEPARTMENT_LEAD|MEMBER)",
      "joined_at": "string (ISO 8601)"
    }
  ],
  "total": "integer",
  "skip": "integer",
  "limit": "integer"
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden - Permission Denied**
```json
{
  "detail": "You do not have permission to view this department's members"
}
```

**404 Not Found**
```json
{
  "detail": "Department not found"
}
```

#### Frontend Usage
- DepartmentDetailPage members section
- MembersList component
- UserSelector for task assignment
- MemberManagementModal
- Called when viewing department details

#### Notes
- Results filtered by user permissions
- Search is on name and email fields

---

### 4. Assign User to Department

#### Endpoint
```
POST /departments/{department_id}/assign-user/{user_id}
```

#### Authentication Required
Yes (Bearer token required)

#### Authorization
- PRESIDENT: Can assign to any department
- VICE_PRESIDENT: Can assign to any department
- DEPARTMENT_LEAD: Can assign to own department only
- MEMBER: Cannot assign users (403 Forbidden)

#### URL Parameters
```
department_id: string (UUID of department)
user_id: string (UUID of user to assign)
```

#### Request Body
None (IDs in URL)

#### Response Body (200 OK)
```json
{
  "message": "User assigned to department successfully",
  "department_id": "string (UUID)",
  "user_id": "string (UUID)",
  "user_name": "string",
  "department_name": "string"
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "detail": "User is already assigned to this department"
}
```

**403 Forbidden - Permission Denied**
```json
{
  "detail": "You do not have permission to assign users to this department"
}
```

**404 Not Found**
```json
{
  "detail": "User not found" | "Department not found"
}
```

#### Frontend Usage
- MemberManagementModal add user action
- Called after user selects assignee
- Used by managers to build teams
- Called in user management pages

#### Notes
- User can be assigned to multiple departments (future: single department per user?)
- Duplicate assignment prevented (409 error)
- On success: refresh members list, show toast
- Check membership before allowing assignment

---

## Dashboard APIs

Dashboard does not have dedicated endpoints. Instead, it combines data from multiple endpoints:

### Dashboard Data Collection

#### President Dashboard
```
Calls:
1. GET /me → User profile and role
2. GET /tasks?limit=5&sort_by=created_at → Recent tasks overview
3. GET /departments?limit=10 → Department overview
4. GET /tasks/created-by-me?status=PENDING → Created tasks pending
5. GET /tasks?status=IN_PROGRESS → In-progress tasks overview
6. GET /tasks?status=COMPLETED → Completed tasks count
```

**Cache Strategy**: Cache each with 1-2 minute TTL, aggregate on frontend

#### Vice President Dashboard
```
Same as President (full system visibility)
```

#### Department Lead Dashboard
```
Calls:
1. GET /me → User profile
2. GET /tasks/my-tasks?limit=5 → Own assigned tasks
3. GET /tasks/created-by-me?limit=5 → Own created tasks
4. GET /departments/{user.department_id}/members → Team members count
5. GET /tasks/my-tasks?status=PENDING → Pending count
6. GET /tasks/my-tasks?status=IN_PROGRESS → In progress count
```

#### Member Dashboard
```
Calls:
1. GET /me → User profile
2. GET /tasks/my-tasks → All assigned tasks
3. GET /tasks/my-tasks?status=PENDING → Pending count
4. GET /tasks/my-tasks?status=IN_PROGRESS → In progress count
5. GET /tasks/my-tasks?status=COMPLETED → Completed count
```

### Dashboard Components Data Requirements

#### Statistics Cards
- Total tasks (GET /tasks or /tasks/my-tasks)
- Pending tasks (filter by status=PENDING)
- In-progress tasks (filter by status=IN_PROGRESS)
- Completed tasks (filter by status=COMPLETED)
- Total departments (GET /departments)
- Team members (GET /departments/{id}/members)

#### Recent Tasks Widget
- GET /tasks/my-tasks?limit=5&sort_by=created_at

#### Task Status Chart
- GET /tasks (all status) OR /tasks/my-tasks with status aggregation

#### Activity Feed
- Built from recent tasks from above calls
- Timestamp-based ordering

---

## Axios Service Layer

### 1. Axios Instance Configuration

**File**: `src/services/api.js`

```javascript
// Service Configuration (Pseudo-code for documentation)

// Initialize Axios with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor: Add token to all requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Response Interceptor: Handle 401 and refresh token
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear auth state
      // Redirect to login
      // Clear token
    }
    return Promise.reject(error)
  }
)

export default api
```

### 2. Authentication Service

**File**: `src/services/authService.js`

```
Service Functions:

register(name, email, password)
  → POST /register
  → Returns: { user_id, name, email, message }
  → Errors: 400, 422

login(email, password)
  → POST /login
  → Returns: { access_token, token_type }
  → Stores token in localStorage
  → Errors: 401, 422

getCurrentUser()
  → GET /me
  → Returns: { user_id, name, email, role, department_id }
  → Requires: Authorization header
  → Errors: 401, 403

logout()
  → Frontend only
  → Clears token from localStorage
  → Clears auth state
```

### 3. Task Service

**File**: `src/services/taskService.js`

```
Service Functions:

createTask(taskData)
  → POST /tasks
  → Input: { title, description, assigned_to_id, department_id, deadline }
  → Returns: Full task object
  → Errors: 400, 403, 404, 422

getTaskDetails(taskId)
  → GET /tasks/{taskId}
  → Returns: Full task object with creator and assignee details
  → Errors: 401, 403, 404

getAllTasks(filters = {})
  → GET /tasks?skip={skip}&limit={limit}&status={status}&...
  → Input: { skip, limit, status, department_id, assigned_to_id, search, sort_by }
  → Returns: { tasks: [], total, skip, limit }
  → Errors: 401, 403, 422

getMyTasks(filters = {})
  → GET /tasks/my-tasks?status={status}&...
  → Input: { skip, limit, status, sort_by }
  → Returns: { tasks: [], total, skip, limit }
  → Errors: 401

getCreatedByMe(filters = {})
  → GET /tasks/created-by-me?status={status}&...
  → Input: { skip, limit, status, department_id, sort_by }
  → Returns: { tasks: [], total, skip, limit }
  → Errors: 401

updateTaskStatus(taskId, newStatus)
  → PATCH /tasks/{taskId}/status
  → Input: { status: 'PENDING'|'IN_PROGRESS'|'COMPLETED' }
  → Returns: { task_id, status, updated_at, message }
  → Errors: 400, 403, 404

deleteTask(taskId)
  → DELETE /tasks/{taskId}
  → Returns: { message, task_id }
  → Errors: 403, 404
```

### 4. Department Service

**File**: `src/services/departmentService.js`

```
Service Functions:

createDepartment(departmentData)
  → POST /departments
  → Input: { name, description }
  → Returns: { department_id, name, description, created_at }
  → Errors: 400, 403, 422

getAllDepartments(filters = {})
  → GET /departments?search={search}&limit={limit}&skip={skip}
  → Input: { search, limit, skip }
  → Returns: { departments: [], total, skip, limit }
  → Errors: 401

getDepartmentMembers(departmentId, filters = {})
  → GET /departments/{departmentId}/members?search={search}&...
  → Input: { departmentId, search, limit, skip }
  → Returns: { department_id, department_name, members: [], total, skip, limit }
  → Errors: 401, 403, 404

assignUserToDepartment(departmentId, userId)
  → POST /departments/{departmentId}/assign-user/{userId}
  → Returns: { message, department_id, user_id, user_name, department_name }
  → Errors: 400, 403, 404
```

---

## Frontend Data Types

### TypeScript Interfaces (Reference Implementation)

#### Authentication Types
```typescript
interface User {
  user_id: string
  name: string
  email: string
  role: 'PRESIDENT' | 'VICE_PRESIDENT' | 'DEPARTMENT_LEAD' | 'MEMBER'
  department_id: string | null
}

interface AuthToken {
  access_token: string
  token_type: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  tokenExpiry: number | null
}
```

#### Task Types
```typescript
interface TaskUser {
  user_id: string
  name: string
  email: string
}

interface TaskDepartment {
  department_id: string
  name: string
}

interface Task {
  task_id: string
  title: string
  description: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  assigned_to_id: string
  assigned_to: TaskUser
  created_by_id: string
  created_by: TaskUser
  department_id: string
  department: TaskDepartment
  deadline: string // ISO 8601
  created_at: string // ISO 8601
  updated_at: string // ISO 8601
}

interface TasksResponse {
  tasks: Task[]
  total: number
  skip: number
  limit: number
}

interface TaskCreateRequest {
  title: string
  description?: string
  assigned_to_id: string
  department_id: string
  deadline: string
}

interface TaskStatusUpdateRequest {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
}
```

#### Department Types
```typescript
interface Department {
  department_id: string
  name: string
  description: string | null
  lead_id: string | null
  lead_name: string | null
  members_count: number
  tasks_count: number
  created_at: string
}

interface DepartmentsResponse {
  departments: Department[]
  total: number
  skip: number
  limit: number
}

interface DepartmentMember {
  user_id: string
  name: string
  email: string
  role: string
  joined_at: string
}

interface DepartmentMembersResponse {
  department_id: string
  department_name: string
  members: DepartmentMember[]
  total: number
  skip: number
  limit: number
}

interface DepartmentCreateRequest {
  name: string
  description?: string
}
```

#### API Response Types
```typescript
interface ApiError {
  detail: string | ApiValidationError[]
}

interface ApiValidationError {
  loc: (string | number)[]
  msg: string
  type: string
}

interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}
```

---

## Token Handling Strategy

### Token Storage
```
Location: localStorage
Key: 'access_token'
Type: String (JWT)
Format: Bearer {token}
```

### Token Storage Implementation
```
// Store token after login
localStorage.setItem('access_token', response.access_token)

// Retrieve token for API calls
const token = localStorage.getItem('access_token')

// Clear token on logout
localStorage.removeItem('access_token')

// Also store in auth state for immediate access
authState.token = response.access_token
```

### Token Expiration Handling
```
Token Lifetime: 1 hour (3600 seconds)
Expiration Check: Decode JWT and check 'exp' claim

Strategy:
1. On app initialization, check if token exists
2. If exists, decode JWT and check expiration
3. If expired, redirect to login
4. If valid, call GET /me to verify token is still active
5. Store token expiry time in state for warnings (future feature)
```

### Token Refresh Strategy (Future Enhancement)
```
When to implement:
- User on long page, token about to expire
- Automatic refresh endpoint created

Implementation:
1. Set up refresh timer (expire time - 5 minutes)
2. Call refresh endpoint when timer triggers
3. Update token in localStorage and state
4. Reset timer
```

### Token in API Requests
```
Every authenticated request must include:
Header: Authorization: Bearer {token}

Axios interceptor adds this automatically:
request.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`
```

### Token Validation on 401 Response
```
When API returns 401:
1. Clear token from localStorage
2. Clear auth state
3. Redirect to /login
4. Show "Session expired, please login again"

Axios interceptor handles this:
if (error.response?.status === 401) {
  localStorage.removeItem('access_token')
  dispatch(logout())
  navigate('/login')
}
```

### Token Decode Utility (Frontend)
```
Import library: jwt-decode

Usage:
import jwt_decode from 'jwt-decode'

const decoded = jwt_decode(token)
const isExpired = decoded.exp * 1000 < Date.now()
```

---

## Protected Route Strategy

### Route Protection Implementation

#### ProtectedRoute Component
```
Location: src/components/auth/ProtectedRoute.jsx

Purpose: Wrapper component that checks authentication before rendering

Implementation:
1. Check if user is authenticated (token exists and valid)
2. Check if user has required role (if specified)
3. If authenticated: render component
4. If not authenticated: redirect to /login
5. If authenticated but wrong role: redirect to 403 Forbidden page (future)

Usage:
<ProtectedRoute
  component={TaskDetailPage}
  requiredRoles={['PRESIDENT', 'VICE_PRESIDENT']}
/>
```

#### RoleBasedRoute Component
```
Location: src/components/auth/RoleBasedRoute.jsx

Purpose: Route protection with role-based access control

Implementation:
1. Check authentication (same as ProtectedRoute)
2. Check user role against allowedRoles
3. If authorized: render component
4. If not authorized: render 403 Forbidden page

Usage:
<RoleBasedRoute
  component={AdminDashboard}
  allowedRoles={['PRESIDENT', 'VICE_PRESIDENT']}
/>
```

### Route Configuration

#### Public Routes (No Authentication Required)
```
/login
/register
/forgot-password
/reset-password/:token
```

#### Protected Routes (Authentication Required)
```
/dashboard - All authenticated users
/tasks - All authenticated users
/tasks/:taskId - All authenticated users (permission checked at API)
/tasks/create - President, VP, Department Lead
/tasks/my-tasks - All authenticated users
/tasks/created-by-me - All authenticated users
/departments - All authenticated users
/departments/:departmentId - All authenticated users
/profile - All authenticated users
/settings - All authenticated users
```

#### Admin Routes (Role-Based)
```
/admin/users - President, Vice President
/admin/dashboard - President, Vice President
```

#### Forbidden Routes (403)
```
Rendered when:
- User has wrong role for page
- User doesn't have department assignment (future)
- User doesn't have permission for resource
```

### Authentication Check Flow

#### On App Load
```
1. App component mounts
2. Check if token exists in localStorage
3. If exists:
   a. Attempt to decode token
   b. Check if expired
   c. If valid: Call GET /me to verify with backend
   d. Store user in auth state
   e. Allow navigation to current route or dashboard
   f. If invalid: Clear token, redirect to login
4. If no token:
   a. Check current route
   b. If public route: allow
   c. If protected route: redirect to login
```

#### On Route Navigation
```
1. Before route renders
2. ProtectedRoute checks authentication
3. If authenticated: proceed to component
4. If not: redirect to login with return URL (optional)
5. Component-level authorization:
   a. API calls include token
   b. API returns 403 if not authorized
   c. Frontend handles 403 error
```

### Login State Persistence
```
User Behavior: Close browser/tab and reopen

Expected Flow:
1. App loads with no user in state
2. Check localStorage for token
3. If token found and valid:
   a. Decode to verify not expired
   b. Call GET /me to verify backend still recognizes it
   c. Restore user state
   d. Allow access without re-login
4. If token expired:
   a. Clear token from localStorage
   b. Redirect to login
   c. Show "Session expired" message
```

### Logout Flow
```
1. User clicks logout
2. Clear localStorage token
3. Clear auth state
4. Redirect to /login
5. API calls will fail with 401 (token missing)
6. If user manually sets old token: call GET /me → 401 → redirects to login
```

### Error Handling for Unauthorized Access

#### 401 - Not Authenticated
```
Trigger: Token missing, invalid, or expired
Response: Redirect to login page
UI: Show "Your session has expired. Please login again."
```

#### 403 - Not Authorized (Wrong Role)
```
Trigger: User role doesn't have permission for action
Response: Show 403 Forbidden page
UI: "You don't have permission to access this resource"
```

#### Navigation Prevention
```
If ProtectedRoute detects no auth:
- Prevent component render
- Replace history (not push) to /login
- Clear state to prevent stale data display
```

---

## Error Handling

### Standard Error Response Format

#### Validation Error (422)
```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "error message",
      "type": "error_type"
    }
  ]
}
```

#### Business Logic Error (400)
```json
{
  "detail": "Human readable error message"
}
```

#### Authentication Error (401)
```json
{
  "detail": "Not authenticated"
}
```

#### Authorization Error (403)
```json
{
  "detail": "You do not have permission to perform this action"
}
```

#### Not Found Error (404)
```json
{
  "detail": "Resource not found"
}
```

#### Server Error (500)
```json
{
  "detail": "Internal server error"
}
```

### Frontend Error Handling Strategy

#### Error Types and Handling
```
401 Unauthorized:
  → Clear auth token
  → Redirect to login
  → Show: "Your session has expired"

403 Forbidden:
  → Show error message: detail from response
  → Keep user on page or redirect to 403 page
  → Show: "You don't have permission"

404 Not Found:
  → Show error message
  → Redirect to list page or 404 page
  → Show: "Resource not found"

400/422 Bad Request:
  → Extract errors from response
  → Display on form (for form submission)
  → Show toast alert (for non-form requests)
  → Highlight invalid fields

5xx Server Error:
  → Show generic error message
  → Retry option
  → Show: "Something went wrong, please try again"
  → Log error for debugging
```

#### Error Display Components
```
1. Form Errors (for form submissions):
   - Show field-specific errors below each field
   - Highlight field with red border
   - Show first error message for each field

2. Page-Level Errors:
   - Show ErrorAlert component at top of page
   - Message: error.detail or friendly message
   - Show dismiss button

3. Toast Notifications:
   - For API operations (delete, update, create)
   - Auto-dismiss after 5 seconds
   - Error toast is red/alert color
```

#### Network Error Handling
```
Timeout (>10 seconds):
  → Show: "Request took too long, please try again"
  → Offer retry button
  → Don't retry automatically (avoid duplicate actions)

No Internet:
  → Show: "No internet connection"
  → Retry when connection restored
  → Disable submit buttons

Other Network Errors:
  → Show: "Network error, please try again"
  → Offer retry option
```

### Error Logging Strategy
```
Log to console (development):
  → All API errors with request/response details
  → Authentication errors
  → Authorization errors

Send to logging service (production):
  → Server errors (5xx)
  → Repeated user errors (pattern detection)
  → Critical business logic errors
  → Performance metrics
```

---

## Summary

This API Contract document provides:

1. **Complete Endpoint Documentation**: Every API endpoint with request/response formats
2. **Error Handling**: Comprehensive error responses for all scenarios
3. **Frontend Integration**: Axios service layer functions and data types
4. **Security**: Token handling and protected route implementation
5. **Developer Guidelines**: How to implement API calls and error handling

### Quick Reference Table

| Endpoint | Method | Auth | Public |
|----------|--------|------|--------|
| `/register` | POST | No | Yes |
| `/login` | POST | No | Yes |
| `/me` | GET | Yes | No |
| `/tasks` | POST | Yes | No |
| `/tasks` | GET | Yes | No |
| `/tasks/{id}` | GET | Yes | No |
| `/tasks/my-tasks` | GET | Yes | No |
| `/tasks/created-by-me` | GET | Yes | No |
| `/tasks/{id}/status` | PATCH | Yes | No |
| `/tasks/{id}` | DELETE | Yes | No |
| `/departments` | POST | Yes | No |
| `/departments` | GET | Yes | No |
| `/departments/{id}/members` | GET | Yes | No |
| `/departments/{id}/assign-user/{uid}` | POST | Yes | No |

### Token Management Checklist

- [x] Store token in localStorage after login
- [x] Add token to Authorization header in all requests
- [x] Check token expiration on app load
- [x] Handle 401 responses by redirecting to login
- [x] Clear token on logout
- [x] Validate token with backend on app initialization
- [x] Implement token refresh strategy (future enhancement)

### Protected Route Checklist

- [x] Implement ProtectedRoute wrapper component
- [x] Check authentication before rendering protected pages
- [x] Check authorization (role-based) for admin pages
- [x] Handle redirect to login for unauthenticated users
- [x] Handle redirect to 403 for unauthorized access
- [x] Restore user state from token on page refresh
- [x] Clear sensitive data on logout
