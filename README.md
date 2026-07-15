# TaskFlow

## Product Requirements Document (PRD)

TaskFlow is a role-based internal management platform for clubs and organizations. It enables teams to create departments, assign department leads, assign work to members, and track progress through a modern dashboard experience.

This product is designed as a single-page, role-aware application. After authentication, the user enters one unified dashboard experience that changes completely based on their role.

The frontend must be built to consume the existing FastAPI backend and PostgreSQL-backed APIs. The backend already exists and should not be redesigned.

---

## 1. Product Introduction

TaskFlow is intended for internal organizational use where work is distributed across departments and must be visible to the right stakeholders. The system focuses on clarity, accountability, and lightweight workflow management without introducing unnecessary process overhead.

### Product Goal
Provide a clean, modern, role-based dashboard that helps:
- members view and update their assigned work,
- department leads manage work inside their department,
- presidents and vice presidents oversee the whole organization.

### Core Value Proposition
- One dashboard for all users
- Role-based experience with no confusing multi-page navigation
- Clear ownership of tasks
- Department-level and organization-level visibility
- Fast and professional interaction model for internal teams

### Primary Users
- Super Admin (Platform level)
- College Representative (College level)
- Faculty Coordinator (Club level)
- President (Club/Organization level)
- Vice President (Club/Organization level)
- Department Lead (Department level)
- Member (Individual level)

---

## 2. Product Vision

TaskFlow should feel like a polished internal SaaS product: modern, minimal, calm, and highly functional.

The experience should feel:
- professional and trustworthy,
- fast and lightweight,
- visually refined,
- responsive across desktop and tablet,
- suitable for real organizational operations.

### Design Direction
The UI should reflect a modern SaaS aesthetic inspired by:
- Linear
- Notion
- GitHub
- Vercel
- Clerk Dashboard

The styling should avoid a Bootstrap-like appearance and should favor:
- clean cards,
- modern tables and data grids,
- subtle shadows,
- rounded corners,
- soft spacing,
- blue/purple accents,
- dark mode support.

---

## 3. Core Product Behavior

### Authentication Flow
1. User lands on the login experience.
2. User authenticates using email and password.
3. JWT token is stored securely on the client.
4. User is redirected to the main dashboard experience.

### Navigation Model
There is only one page after login:
- the Dashboard

The layout and available modules change based on the logged-in user's role.

### User Experience Principle
Every user should feel that the application is tailored to their responsibilities. The same app shell is reused, but the content and actions change based on role.

---

## 4. User Roles and Permissions

| Role | Scope | Key Responsibilities |
| --- | --- | --- |
| Super Admin | Platform-wide | Manage colleges (CRUD), assign College Representatives |
| College Representative | College-wide | Manage clubs and oversee coordinator applications |
| Faculty Coordinator | Club-wide | Oversee club operations, approve President/VP applications |
| President / VP | Club-wide | Create departments, assign tasks to Leads, approve Lead applications |
| Department Lead | Department-wide | Assign tasks to department members, approve Member applications |
| Member | Individual | Complete tasks, view department details, apply to clubs/departments |

### Super Admin
Super Admins can:
- Perform CRUD operations on colleges.
- Automatically create/provision College Representative accounts.

### College Representative
College Representatives can:
- View dashboard statistics for their specific college.
- Register new clubs and delete existing clubs.
- Review and approve/reject applications for **Faculty Coordinator** positions in their college.

### Faculty Coordinator
Faculty Coordinators can:
- Oversee their specific club's user directory and dashboard.
- Assign tasks to the President and Vice President of their club.
- Review and approve/reject applications to become **President** and **Vice President** of their club.

### President / Vice President
Presidents and Vice Presidents can:
- Create departments within their club.
- Assign tasks to **Department Leads** within their club.
- Review and approve/reject applications to become **Department Lead** of departments within their club.

### Department Lead
Department Leads can:
- Assign tasks to **Members** of their own department.
- Review and approve/reject applications to become a **Member** of their department.

### Member
Members can:
- Browse clubs, expand club cards to view departments, and submit applications.
- Track tasks assigned to them and update their status (Pending, In Progress, Completed).
- Access a dedicated **"My Department"** page once assigned.

---

## 5. Dashboard Requirements

The application should be built as a single dashboard shell with a sidebar navigation and a main content area. Role-based modules are displayed inside this shell.

### Common Dashboard Shell
The following shell should appear for all authenticated users:
- Sidebar navigation
- Top bar / header with user info and role context
- Main content area for dashboard cards and data sections
- Responsive layout for desktop and tablet

### Member Dashboard
The member dashboard must include:
- Welcome Card
- My Tasks
- My Department
- Department Members Popup or Modal

### Department Lead Dashboard
The department lead dashboard must include:
- Welcome Card
- Tasks Assigned To Me
- Tasks Assigned By Me
- Department Members
- Assign Task Button
- Department Analytics

The Assign Task action should open a modal dialog.

### President / Vice President Dashboard
The executive dashboard must include:
- Welcome Card
- Tasks Assigned To Me
- Tasks Assigned By Me
- All Departments
- Create Department Button
- Organization Members
- Organization Analytics

The Create Department action should open a modal dialog.

---

## 6. Modal Requirements

### Assign Task Modal
Required fields:
- Title
- Description
- Assign To
- Deadline

Behavior:
- Should open from the department lead dashboard.
- Should submit a task creation request to the backend.
- Should validate required fields before submission.
- Should close after success and refresh task lists.

### Create Department Modal
Required fields:
- Department Name
- Description
- Department Lead

Behavior:
- Should open from the executive dashboard.
- Should submit a department creation request to the backend.
- Should refresh department lists after success.

---

## 7. Functional Requirements

### Authentication
- The app must provide login and registration flows.
- The app must store a JWT access token after login.
- The app must include the token in authenticated requests.
- The app must display the current user's profile and role after authentication.

### Dashboard Access
- After login, the user must land on the dashboard.
- The dashboard content must adapt based on the user's role.
- The UI must prevent unauthorized actions using role-aware rendering and API validation.

### Task Management
- Users must be able to view tasks assigned to them.
- Users must be able to update the status of tasks assigned to them.
- Department leads and executives must be able to create new tasks.
- Department leads must be restricted to assigning tasks only to users within their department.
- Users must be able to view tasks they created.
- Users must be able to delete tasks where permitted by the backend.

### Department Management
- Presidents and vice presidents must be able to create departments.
- Presidents and vice presidents must be able to assign users to departments.
- Presidents must be able to assign a department lead.
- Department leads must be able to view their own department members and analytics.
- Executives must be able to view all departments and organization members.

### Data Views
- The dashboard should display task lists in polished cards and tables.
- Department and organization analytics should be presented as summary cards and charts.
- Member and department details should be shown through clear, readable components.

---

## 8. Non-Functional Requirements

### Performance
- Dashboard content should load quickly and feel responsive.
- The UI should avoid unnecessary page refreshes.
- Data should be loaded progressively where appropriate.

### Reliability
- The frontend must handle API errors gracefully.
- Failed requests should show clear user feedback.
- The app must remain usable even when network issues occur.

### Security
- JWT tokens must be handled securely.
- Protected routes must require authentication.
- Role-based access should be enforced both in the UI and through API usage.

### Usability
- The interface must be intuitive for internal organizational users.
- Important states such as empty tasks, loading states, and errors must be clearly visible.
- The layout must feel polished and uncluttered.

### Accessibility
- Buttons, forms, and modals must be keyboard accessible.
- Color contrast should remain readable.
- Form labels and error states must be explicit.

### Responsiveness
- The UI must work well on desktop, tablet, and smaller screens.
- Sidebar navigation should collapse or adapt gracefully on smaller viewports.

---

## 9. UI and Interaction Specification

### Visual Style
- Minimal and modern SaaS aesthetic
- Soft backgrounds and subtle contrast
- Rounded corners and soft shadows
- Clear hierarchy across cards, headings, and tables
- Blue and purple emphasis
- Dark mode support

### Layout Pattern
- Sidebar for navigation and role context
- Main content area for dashboard modules
- Cards for metrics and summaries
- Tables or data grids for tasks and members
- Modals for task creation and department creation
- Charts for analytics

### Interaction Notes
- Buttons should feel clear and deliberate.
- Empty states should be designed thoughtfully.
- The dashboard should feel calm rather than cluttered.
- Status updates should be visible and immediate.

---

## 10. API Integration Notes

The frontend must consume the existing FastAPI backend. The backend should remain unchanged.

### Authentication Endpoints
- POST /register
- POST /login
- GET /me

### Task Endpoints
- POST /tasks
- GET /tasks/my-tasks
- GET /tasks/created-by-me
- GET /tasks/{task_id}
- PATCH /tasks/{task_id}/status
- DELETE /tasks/{task_id}

### Department Endpoints
- POST /departments
- GET /departments
- GET /dashboard/president
- GET /departments/my-members
- GET /departments/my-dashboard
- POST /departments/{department_id}/assign-user/{user_id}
- POST /departments/{department_id}/assign-lead/{user_id}
- GET /departments/{department_id}/dashboard
- GET /departments/{department_id}/members

### Authentication Strategy
- Use JWT bearer authentication.
- Attach the token to requests as an Authorization header.
- Store the token securely and include it in all protected requests.

### Frontend API Expectations
- Use environment configuration for the API base URL.
- Handle loading, success, and error states.
- Refresh relevant data after mutations such as task creation, status change, department creation, or department assignment.

---

## 11. Suggested Frontend Folder Structure

The frontend implementation should follow a clean, scalable structure such as:

```text
frontend/
  src/
    app/
      routes/
      layout/
      providers/
      store/
    components/
      ui/
      layout/
      dashboard/
      tasks/
      departments/
      modals/
    features/
      auth/
      dashboard/
      tasks/
      departments/
    hooks/
    lib/
      api/
      auth/
      utils/
    styles/
    types/
    constants/
  public/
  package.json
  vite.config.ts
```

### Suggested Page Structure
- Auth screen for login and registration
- Single dashboard route for all authenticated users
- Role-aware dashboard components rendered conditionally
- Shared modal system for task and department creation

---

## 12. Recommended UI Composition

### Authentication Experience
- Clean centered auth card
- Email and password form
- Role-agnostic entry point

### Dashboard Experience
- Sidebar navigation with role-relevant sections
- Header with organization context and user profile
- Summary cards and statistic widgets
- Task tables and department lists
- Charts for analytics
- Modals for actions

### Content Priority
1. Welcome and role context
2. Task visibility
3. Department visibility
4. Administrative actions
5. Analytics and summary information

---

## 13. Data Model Expectations

The UI should be built around the following concepts:
- User
- Department
- Task
- Role
- Dashboard analytics

### Task Object Expectations
- id
- title
- description
- status
- created_at
- deadline
- assigned_to
- assigned_by
- department_id

### Department Object Expectations
- id
- name
- description
- lead_id

### User Object Expectations
- id
- name
- email
- role
- department_id

---

## 14. Future Scope

The following enhancements may be added in later versions:
- notifications for task updates,
- calendar-based task views,
- drag-and-drop task boards,
- richer analytics and reporting,
- advanced filtering and search,
- audit logs for administrative changes,
- team settings and organization profile management,
- dark/light theme switching with stronger customization.

---

## 15. Implementation Notes for the Frontend Builder

The frontend should be implemented as a polished, single-page experience that:
- authenticates users,
- reads the current user's role from the backend,
- renders a role-specific dashboard,
- uses the existing API endpoints without changing the backend,
- supports task creation, updates, department creation, and member visibility,
- feels like a premium internal productivity product.

The frontend must not introduce extra pages for each user role. Instead, it should use one unified dashboard experience with conditional modules and actions.

---

## 16. Summary

TaskFlow is a modern internal organization platform for managing departments, users, and tasks through a highly role-aware dashboard experience. The product should be implemented as a clean, responsive, professional SaaS-style application that communicates trust, structure, and clarity.

The frontend should prioritize:
- clarity of responsibilities,
- role-based UI adaptation,
- modern visual polish,
- seamless interaction with the existing FastAPI backend.
