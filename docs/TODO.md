# TaskFlow Implementation Roadmap (TODO)

This document maps out the specific implementation steps required to support the hierarchical assignment flow, multi-role dashboard pages, and multi-college system architecture.

---

## Phase 1: Database & Backend Enhancements

*   [x] **Update Database Schema** ([models.py](file:///d:/Himanshu%20ki%20Inventory/coding%20projects/Task_Assignment_System/backend/app/models.py))
    *   [x] Add `College` model (fields: `id`, `name`, `representative_id`).
    *   [x] Add `Club` model (fields: `id`, `name`, `description`, `college_id`, `faculty_coordinator_id`).
    *   [x] Expand `User` model to map roles: `COLLEGE_REP`, `FACULTY_COORDINATOR`, `PRESIDENT`, `VICE_PRESIDENT`, `DEPARTMENT_LEAD`, `MEMBER`.
*   [x] **Restore Public Registration**
    *   [x] Keep `/register` public using the `UserCreate` schema.
*   [x] **Implement Access Restrictions**
    *   [x] Ensure College Representatives can create/delete clubs but cannot assign tasks.
    *   [x] Ensure Faculty Coordinators can only assign tasks/interact with President/Vice President.
    *   [x] Restrict Department Leads to assigning/deleting tasks only for their department members.

---

## Phase 2: Frontend Layouts & Pages

*   [x] **Implement 3-Page Layouts per Role**
    *   [x] **Member Layout**:
        *   `Dashboard Page`: Personal task cards showing counts of pending/in-progress/completed, status update dropdown.
        *   `Department Page`: Lists info and members in their department.
        *   `Profile Page`.
    *   [x] **Department Lead Layout**:
        *   `Dashboard Page`: Tasks assigned to them by President/Vice President.
        *   `Department Page`: Member roster; clicking a member navigates to their personal dashboard layout and enables task assignment.
        *   `Profile Page`.
    *   [x] **President / Vice President Layout**:
        *   `Dashboard Page`: Roster of tasks they assigned to different department leads.
        *   `Departments Page`: Grid of departments; clicking a department opens the department lead's page where they can assign tasks.
        *   `Profile Page`.
    *   [x] **Faculty Coordinator Layout**:
        *   Same page paths as President/Vice President, but restricted to communication with President and Vice President.
    *   [x] **College Representative Layout**:
        *   `Dashboard Page`: College statistics (total clubs, total tasks, completed vs pending per club). Observational only.
        *   `Clubs Page`: Grid of clubs; clicking a club displays the President's dashboard view in read-only mode.
        *   `Profile Page`.

---

## Phase 3: Applications & Routing Matrix

*   [x] **Member Club & Department Enrollment**:
    *   [x] Click club cards on Member dashboard to expand and view departments.
    *   [x] Enforce "Apply Lead" and "Apply Member" routing rules (President/VP reviews Lead applicants, Lead reviews Member applicants).
*   [x] **Applications Access Control**:
    *   [x] Enabled Applications dashboard tab for Super Admin, Rep, Faculty Coordinator, President/VP, and Department Leads with appropriate role context filters.

---

## Phase 4: Multi-College Architecture & SUPER_ADMIN

*   [x] **Platform Administration Layer**:
    *   [x] Added `SUPER_ADMIN` role and seeded account (`admin@taskflow.com`).
    *   [x] Added college `code` and `address` fields in database.
    *   [x] Created CRUD endpoints for Colleges.
    *   [x] Configured auto-generated representative account provisioning upon college creation.
    *   [x] Added college directories panel and stats for `SUPER_ADMIN` on frontend.
