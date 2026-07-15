# TaskFlow Prompts Templates

These prompts can be utilized to generate frontend pages or test backend routes under the multi-tier invite-only club architecture.

---

## 1. Role UI Conditional Layout Generator

```text
Build a React dashboard shell with a layout that adapts dynamically based on the current user's role.
Roles to handle:
1. COLLEGE_REP:
   - Page 1: Observational dashboard showing list of clubs, total tasks, and completion metrics.
   - Page 2: Clubs List. Clicking a club displays the President's Dashboard in view-only mode.
   - Page 3: Profile view.
2. FACULTY_COORDINATOR:
   - Page 1: Dashboard tracking tasks assigned to President and Vice President.
   - Page 2: Club departments roster.
   - Page 3: Profile view.
3. PRESIDENT & VICE_PRESIDENT:
   - Page 1: Assigned tasks tracker to Department Leads.
   - Page 2: Department Roster. Clicking on a department opens its Department Lead dashboard to allow assigning tasks.
   - Page 3: Profile view.
4. DEPARTMENT_LEAD:
   - Page 1: Dashboard with tasks assigned to them by executives.
   - Page 2: Roster of department members. Clicking on a member shows their task completion breakdown and enables task assignment.
   - Page 3: Profile view.
5. MEMBER:
   - Page 1: Personal task card deck with status selectors (PENDING, IN_PROGRESS, COMPLETED).
   - Page 2: Roster of department members.
   - Page 3: Profile view.
```

---

## 2. Invite Route Validation

```text
Implement Python unit tests using pytest for the invite system in backend/app/routes/invites.py.
Verify that:
1. Only a College Representative can invite a Faculty Coordinator.
2. Only a Faculty Coordinator can invite a President or Vice President.
3. Only President/Vice President can invite a Department Lead.
4. Only a Department Lead can invite members to their specific department.
5. Accept route successfully accepts code and creates a User record with matching role and email.
```
# TaskFlow Prompt Library

This document stores all prompts used during the development of TaskFlow.

Every prompt that successfully generates code should be saved here.

---

# Project Rules

Before generating any code:

1. Read `docs/MASTER_CONTEXT.md`.
2. Follow `docs/DECISIONS.md`.
3. Follow `docs/API_CONTRACT.md`.
4. Update `docs/TODO.md` after completing a feature.
5. Do not change business rules unless explicitly instructed.

# Bug Fix Prompt

Review the existing codebase.

Fix only the reported issue.

Do not rewrite unrelated files.

Preserve the current project architecture.

Explain what caused the bug before applying the fix.

---

# Refactoring Prompt

Refactor the existing module without changing its behavior.

Goals:

- Improve readability.
- Reduce duplication.
- Keep APIs unchanged.
- Preserve database schema.
- Preserve business rules.

---

# New Module Prompt

Read:

- docs/MASTER_CONTEXT.md
- docs/DECISIONS.md
- docs/API_CONTRACT.md

Then implement the requested module.

Requirements:

- Follow the existing architecture.
- Reuse existing code where possible.
- Keep the implementation modular.
- Update TODO.md when finished.

---

# Code Review Prompt

Review the implementation.

Check for:

- Bugs
- Security issues
- Performance
- Code quality
- Naming consistency
- Architecture violations

Suggest improvements without changing business logic.

---

# Documentation Prompt

Update the project documentation after implementing a feature.

Update:

- README.md
- TODO.md
- API_CONTRACT.md (if APIs changed)
- DECISIONS.md (if business rules changed)

Do not leave documentation outdated.

---

# Deployment Prompt

Prepare the project for deployment.

Requirements:

- Production configuration
- Environment variables
- Build optimization
- Security review
- Deployment instructions

Do not change application behavior.

---

# Notes

- Prefer extending existing modules over creating new ones.
- Keep prompts focused on one feature at a time.
- Save successful prompts for future reuse.