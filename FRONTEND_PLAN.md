# Task Assignment System - Frontend Architecture Plan

---

## 1. Project Overview

**Task Assignment System** is a role-based task management and assignment platform designed for organizational hierarchies. The frontend will be a React-based single-page application (SPA) that provides a user-friendly interface for task creation, assignment, tracking, and departmental management.

### Key Objectives
- Provide intuitive interfaces for task management across different organizational roles
- Enforce role-based access control at the UI level
- Deliver real-time task status updates and notifications
- Enable seamless collaboration between departments and team members
- Maintain secure authentication with JWT tokens

### Target Users
- **President**: Full system oversight and administrative control
- **Vice President**: Organization-wide task management and department oversight
- **Department Lead**: Department-specific task and member management
- **Member**: Personal task assignment and status tracking

---

## 2. User Roles

### Role Definition & Access Levels

#### President
- **Hierarchy Level**: Top (Level 1)
- **Permissions**: Full system access
- **Key Actions**:
  - View all tasks across all departments
  - Create/delete/update any task
  - Create and manage departments
  - Assign roles to users
  - View all user profiles
  - Generate system reports
  - Access all administrative features

#### Vice President
- **Hierarchy Level**: Second (Level 2)
- **Permissions**: Organization-wide management, excluding role assignment
- **Key Actions**:
  - Create tasks for any department
  - Delete own created tasks
  - Create and manage departments
  - Assign users to departments
  - View all tasks and departments
  - Cannot assign roles to users
  - Limited administrative features

#### Department Lead
- **Hierarchy Level**: Third (Level 3)
- **Permissions**: Department-specific management
- **Key Actions**:
  - Create tasks within own department only
  - Delete own created tasks
  - Manage department members
  - View department-specific tasks
  - Assign tasks to department members
  - Update task status for own tasks
  - Cannot manage other departments
  - Cannot create departments

#### Member
- **Hierarchy Level**: Fourth (Level 4)
- **Permissions**: Limited personal access
- **Key Actions**:
  - View assigned tasks
  - Update own task status (Pending → In Progress → Completed)
  - View task details
  - View department information
  - Cannot create tasks
  - Cannot delete tasks
  - Cannot manage other users
  - Cannot access administrative features

---

## 3. Application Pages

### 3.1 Authentication Pages

#### Login Page
- **Purpose**: User authentication and JWT token generation
- **Route**: `/login`
- **Accessible Roles**: Public (unauthenticated)
- **Components Used**:
  - LoginForm
  - FormInput
  - FormButton
  - ErrorAlert
  - LinkButton
- **API Endpoints Required**:
  - `POST /login` - Authenticate user and receive JWT token

#### Register Page
- **Purpose**: New user account creation and initial department/role assignment
- **Route**: `/register`
- **Accessible Roles**: Public (unauthenticated)
- **Components Used**:
  - RegisterForm
  - FormInput
  - FormSelect (for role, department)
  - FormButton
  - ErrorAlert
  - LinkButton
- **API Endpoints Required**:
  - `POST /register` - Create new user account

#### Forgot Password Page (Future)
- **Purpose**: Password reset functionality
- **Route**: `/forgot-password`
- **Accessible Roles**: Public (unauthenticated)
- **Components Used**:
  - EmailForm
  - FormInput
  - FormButton
  - SuccessAlert
- **API Endpoints Required**:
  - `POST /forgot-password` - Initiate password reset

---

### 3.2 Core Application Pages

#### Dashboard/Home Page
- **Purpose**: Main landing page showing overview and quick statistics
- **Route**: `/dashboard`
- **Accessible Roles**: Authenticated (all roles)
- **Role-Specific Content**:
  - **President**: System-wide statistics, all tasks, all departments
  - **Vice President**: Organization statistics, all tasks overview
  - **Department Lead**: Department statistics, department tasks
  - **Member**: Personal task summary, assigned tasks count
- **Components Used**:
  - Navbar
  - Sidebar
  - DashboardStats
  - RecentTasksWidget
  - DepartmentWidget
  - TaskStatusChart
  - ActivityFeed
  - WelcomeBanner
- **API Endpoints Required**:
  - `GET /me` - Get current user profile
  - `GET /tasks/my-tasks` - Get assigned tasks
  - `GET /departments` - Get departments list
  - `GET /tasks` - Get all tasks (with filtering)

#### Tasks Page
- **Purpose**: Comprehensive task management interface with list and detail views
- **Route**: `/tasks`
- **Accessible Roles**: Authenticated (all roles)
- **Features**:
  - Task list with filtering and sorting
  - Search functionality
  - Status-based grouping
  - Pagination
  - Bulk actions (for President/VP)
- **Components Used**:
  - Navbar
  - Sidebar
  - TaskTable
  - TaskCard
  - TaskFilter
  - TaskSearch
  - TaskStatusBadge
  - PaginationControls
  - EmptyState
- **API Endpoints Required**:
  - `GET /tasks` - Get all tasks with filters
  - `GET /tasks/my-tasks` - Get assigned tasks
  - `GET /tasks/created-by-me` - Get created tasks

#### Task Detail Page
- **Purpose**: View complete task information and manage task lifecycle
- **Route**: `/tasks/:taskId`
- **Accessible Roles**: Authenticated (task assignee, creator, President, VP, Department Lead)
- **Features**:
  - View task details
  - Update task status
  - View task history
  - Add comments (future)
  - Reassign task (for authorized roles)
  - Edit task information
  - Delete task (for authorized roles)
- **Components Used**:
  - Navbar
  - Sidebar
  - TaskHeader
  - TaskDetailsPanel
  - TaskStatusUpdater
  - TaskAssigneeInfo
  - TaskMetadata
  - ActionButtons
  - CommentSection (future)
  - HistoryPanel
- **API Endpoints Required**:
  - `GET /tasks/{task_id}` - Get task details
  - `PATCH /tasks/{task_id}/status` - Update task status
  - `PUT /tasks/{task_id}` - Update task details (future)
  - `DELETE /tasks/{task_id}` - Delete task

#### Create Task Page
- **Purpose**: Task creation interface with assignment options
- **Route**: `/tasks/create`
- **Accessible Roles**: Authenticated (President, VP, Department Lead)
- **Features**:
  - Task form with validation
  - Department selection (if VP/President)
  - Assignee selection
  - Deadline setting
  - Priority setting (future)
  - Description editor
- **Components Used**:
  - Navbar
  - Sidebar
  - TaskCreateForm
  - FormInput
  - FormSelect
  - FormTextarea
  - DatePicker
  - UserSelector
  - FormButton
  - ErrorAlert
  - SuccessAlert
- **API Endpoints Required**:
  - `POST /tasks` - Create new task
  - `GET /departments/{id}/members` - Get assignee options

#### Departments Page
- **Purpose**: View and manage organizational departments
- **Route**: `/departments`
- **Accessible Roles**: Authenticated (all roles)
- **Role-Specific Features**:
  - **President/VP**: Create departments, manage members
  - **Department Lead**: View own department details, manage members
  - **Member**: View departments
- **Components Used**:
  - Navbar
  - Sidebar
  - DepartmentGrid
  - DepartmentCard
  - DepartmentTable
  - CreateDepartmentButton
  - EmptyState
- **API Endpoints Required**:
  - `GET /departments` - Get all departments
  - `GET /departments/{id}/members` - Get department members

#### Department Detail Page
- **Purpose**: Detailed view of department with member management
- **Route**: `/departments/:departmentId`
- **Accessible Roles**: Authenticated (members of that department, President, VP)
- **Features**:
  - View department information
  - View members list
  - Add/remove members (for authorized roles)
  - View department tasks
  - Manage department lead (for President/VP)
- **Components Used**:
  - Navbar
  - Sidebar
  - DepartmentHeader
  - DepartmentStats
  - MembersList
  - MemberCard
  - TaskListByDepartment
  - ActionButtons
  - MemberManagementModal
- **API Endpoints Required**:
  - `GET /departments/{id}/members` - Get department members
  - `POST /departments/{id}/assign-user/{user_id}` - Assign user to department
  - `GET /tasks` - Get department tasks (with filter)

#### User Profile Page
- **Purpose**: View and edit user profile information
- **Route**: `/profile`
- **Accessible Roles**: Authenticated (all roles)
- **Features**:
  - View profile information
  - Edit profile details (future)
  - View assigned tasks
  - View created tasks
  - Change password (future)
  - View role and permissions
- **Components Used**:
  - Navbar
  - Sidebar
  - ProfileHeader
  - ProfileInformation
  - ProfileStats
  - ProfileEditForm (future)
  - TaskHistory
- **API Endpoints Required**:
  - `GET /me` - Get current user profile
  - `GET /tasks/my-tasks` - Get assigned tasks
  - `GET /tasks/created-by-me` - Get created tasks

#### User Management Page (Admin)
- **Purpose**: Manage users and their roles (President/VP only)
- **Route**: `/admin/users`
- **Accessible Roles**: President, Vice President
- **Features**:
  - View all users
  - Filter users by role/department
  - Edit user details
  - Assign/change roles (President only)
  - Assign to departments
  - Deactivate users (future)
- **Components Used**:
  - Navbar
  - Sidebar
  - UserTable
  - UserCard
  - UserFilter
  - UserEditModal
  - RoleSelector
  - DepartmentSelector
- **API Endpoints Required**:
  - `GET /users` - Get all users (to be implemented in backend)
  - `PUT /users/{user_id}` - Update user details (to be implemented)

#### Settings Page
- **Purpose**: Application settings and preferences
- **Route**: `/settings`
- **Accessible Roles**: Authenticated (all roles)
- **Features**:
  - Personal preferences
  - Notification settings
  - Display settings
  - Account security
- **Components Used**:
  - Navbar
  - Sidebar
  - SettingsPanel
  - PreferenceGroup
  - ToggleSwitch
  - SelectOption
  - SaveButton
- **API Endpoints Required**:
  - `GET /me` - Get user settings
  - `PUT /me` - Update user settings (future)

---

## 4. Layout Structure

### 4.1 Authenticated Layout

#### Main Application Shell
```
┌─────────────────────────────────────────────────────┐
│  Navbar (header with branding, search, user menu)  │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ Sidebar  │         Main Content Area               │
│ (nav,    │         (page-specific content)         │
│  links)  │                                          │
│          │                                          │
│          │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

#### Navbar Components
- **Logo/Branding**: Application name and icon
- **Search Bar**: Global search for tasks
- **User Menu**: 
  - Profile link
  - Settings link
  - Logout button
- **Notifications Bell**: Notification count (future)
- **Breadcrumb**: Current page navigation path

#### Sidebar Components
- **Navigation Links**: 
  - Dashboard
  - Tasks (with submenu: My Tasks, Created by Me, All Tasks)
  - Departments
  - Profile
  - Admin Panel (President/VP only)
  - Settings
- **Logout Button**
- **Role Badge**: Display current user role
- **Collapse/Expand**: Toggle sidebar width
- **User Info Section**:
  - User avatar
  - User name
  - User role
  - Department (if applicable)

### 4.2 Authentication Layout

#### Login/Register Page Layout
```
┌─────────────────────────────────────────────────────┐
│           Logo & Branding (centered)                │
├─────────────────────────────────────────────────────┤
│                                                     │
│    ┌──────────────────────────────────┐            │
│    │   Authentication Form            │            │
│    │   (Login/Register/Password Reset) │            │
│    └──────────────────────────────────┘            │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ Footer (Links, Copyright)                   │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

#### Components
- **Logo Section**: Company branding, application name
- **Form Container**: Centered, responsive form
- **Form Fields**: Email/username, password, confirm password (register)
- **Submit Button**: Login/Register/Send Reset Link
- **Error Messages**: Alert display for validation errors
- **Links**: "Sign up", "Login", "Forgot password?" toggle
- **Footer**: Copyright, privacy policy links

### 4.3 Dashboard Layout

#### Role-Based Dashboard Variants

**President Dashboard**
```
┌─────────────────────────────────────────────────────┐
│ Welcome Banner                                      │
├─────────────────────────────────────────────────────┤
│ ┌────────────┬────────────┬────────────┐           │
│ │Total Tasks │Total Users │Departments │           │
│ └────────────┴────────────┴────────────┘           │
├─────────────────────────────────────────────────────┤
│ ┌──────────────────────┬──────────────────────┐    │
│ │ Task Status Chart    │ Department Overview  │    │
│ └──────────────────────┴──────────────────────┘    │
├─────────────────────────────────────────────────────┤
│ Recent System Activity / Tasks                     │
└─────────────────────────────────────────────────────┘
```

**Department Lead Dashboard**
```
┌─────────────────────────────────────────────────────┐
│ Welcome Banner (Department-specific)               │
├─────────────────────────────────────────────────────┤
│ ┌────────────┬────────────┬────────────┐           │
│ │My Tasks    │My Members  │Pending     │           │
│ └────────────┴────────────┴────────────┘           │
├─────────────────────────────────────────────────────┤
│ ┌──────────────────────┬──────────────────────┐    │
│ │ Department Tasks     │ Team Overview        │    │
│ └──────────────────────┴──────────────────────┘    │
├─────────────────────────────────────────────────────┤
│ Recent Department Activity                        │
└─────────────────────────────────────────────────────┘
```

**Member Dashboard**
```
┌─────────────────────────────────────────────────────┐
│ Welcome Banner (Personal)                           │
├─────────────────────────────────────────────────────┤
│ ┌────────────┬────────────┬────────────┐           │
│ │Assigned    │In Progress │Completed   │           │
│ │Tasks       │Tasks       │Tasks       │           │
│ └────────────┴────────────┴────────────┘           │
├─────────────────────────────────────────────────────┤
│ My Assigned Tasks (Quick View)                     │
├─────────────────────────────────────────────────────┤
│ Recent Updates                                      │
└─────────────────────────────────────────────────────┘
```

---

## 5. Components List

### 5.1 Authentication Components

- **LoginForm**: Form component for user login with email/password fields
- **RegisterForm**: Registration form with name, email, password, role, department selection
- **ForgotPasswordForm**: Form for password reset request (future)
- **ResetPasswordForm**: Form to set new password with token (future)
- **FormInput**: Reusable text input component with validation
- **FormPasswordInput**: Password input with show/hide toggle
- **FormSelect**: Dropdown selector for options
- **FormTextarea**: Multi-line text input component
- **FormButton**: Styled button component for form submission
- **ErrorAlert**: Component to display error messages
- **SuccessAlert**: Component to display success messages
- **LinkButton**: Button styled as link for navigation

### 5.2 Navigation Components

- **Navbar**: Top navigation bar with search, user menu, notifications
- **Sidebar**: Left sidebar with navigation links and user info
- **NavLink**: Individual navigation link with active state
- **UserMenu**: Dropdown menu with profile, settings, logout
- **Breadcrumb**: Navigation path display
- **MobileMenu**: Hamburger menu for mobile view (future)

### 5.3 Layout Components

- **AppLayout**: Main authenticated application layout wrapper
- **AuthLayout**: Layout for login/register pages
- **ProtectedRoute**: Route wrapper that enforces authentication and role-based access
- **RoleBasedRoute**: Route that checks user role before rendering
- **Container**: Responsive content container
- **PageHeader**: Page title and description display

### 5.4 Dashboard Components

- **DashboardStats**: Statistics card displaying key metrics
- **StatCard**: Individual stat card with icon and value
- **RecentTasksWidget**: Shows recent tasks assigned to user
- **DepartmentWidget**: Quick department information display
- **TaskStatusChart**: Chart showing task distribution by status
- **ActivityFeed**: Timeline of recent activities
- **WelcomeBanner**: Personalized welcome message

### 5.5 Task Components

- **TaskTable**: Tabular display of tasks with sorting and filtering
- **TaskCard**: Card-based task display with key information
- **TaskRow**: Individual row in task table
- **TaskList**: List of tasks with vertical layout
- **TaskFilter**: Filter controls for task list (status, department, assignee)
- **TaskSearch**: Search input component for tasks
- **TaskStatusBadge**: Badge showing task status (Pending, In Progress, Completed)
- **TaskPriority**: Component displaying task priority (future)
- **TaskDeadlineInfo**: Component showing deadline with warning states
- **TaskAssigneeAvatar**: Avatar and name of task assignee
- **TaskCreatorInfo**: Information about task creator
- **PaginationControls**: Pagination controls for lists

### 5.6 Task Detail Components

- **TaskHeader**: Task title, status, metadata header
- **TaskDetailsPanel**: Main task information display
- **TaskStatusUpdater**: Component to update task status
- **TaskAssigneeInfo**: Assignee details and change option
- **TaskMetadata**: Task creation date, deadline, department info
- **TaskHistoryPanel**: History of task changes
- **CommentSection**: Comments on task (future)
- **ActionButtons**: Edit, delete, reassign buttons (context-aware)

### 5.7 Task Management Components

- **TaskCreateForm**: Form for creating new tasks
- **TaskEditForm**: Form for editing existing tasks
- **TaskDeleteModal**: Confirmation modal for task deletion
- **DatePicker**: Date selection component for deadlines
- **TimePicker**: Time selection component (future)
- **UserSelector**: Component to select users for assignment
- **DepartmentSelector**: Component to select department for task

### 5.8 Department Components

- **DepartmentGrid**: Grid view of departments
- **DepartmentCard**: Card-based department display
- **DepartmentTable**: Table view of departments
- **DepartmentHeader**: Department name, description, lead info
- **DepartmentStats**: Department statistics display
- **MembersList**: List of department members
- **MemberCard**: Individual member display card
- **MemberManagementModal**: Modal to add/remove members
- **CreateDepartmentButton**: Button to create new department
- **DepartmentCreateForm**: Form to create new department

### 5.9 User Profile Components

- **ProfileHeader**: User name, avatar, role display
- **ProfileInformation**: User contact and profile details
- **ProfileStats**: User statistics (tasks created, completed, etc.)
- **ProfileEditForm**: Form to edit profile information (future)
- **ChangePasswordForm**: Form to change password (future)
- **PermissionsList**: Display user permissions based on role
- **RoleBadge**: Badge displaying user role

### 5.10 Admin Components

- **UserTable**: Table displaying all users
- **UserCard**: Card-based user display
- **UserFilter**: Filters for user list (role, department, status)
- **UserEditModal**: Modal to edit user details
- **RoleSelector**: Component to assign/change user role
- **DepartmentAssigner**: Component to assign user to department
- **BulkActionToolbar**: Toolbar for bulk operations on users

### 5.11 Utility Components

- **Loading**: Spinner/skeleton loader component
- **EmptyState**: Display when list/data is empty
- **Modal**: Modal dialog component
- **ConfirmationModal**: Modal for confirmations
- **Tooltip**: Tooltip component for help text
- **Badge**: Badge component for tags/status
- **Avatar**: User avatar component
- **Icon**: Icon component for SVG/icon display
- **Dropdown**: Dropdown menu component
- **Toast**: Toast notification component

---

## 6. State Management Plan

### 6.1 Authentication State

**State Structure**
```
auth: {
  user: {
    id: string | null
    name: string
    email: string
    role: 'PRESIDENT' | 'VICE_PRESIDENT' | 'DEPARTMENT_LEAD' | 'MEMBER'
    department_id: string | null
    avatar_url: string | null
  }
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  tokenExpiry: number | null
}
```

**Actions**
- `setAuthenticating()` - Set loading state
- `setUser(user)` - Store authenticated user
- `setToken(token, expiry)` - Store JWT token
- `setAuthError(error)` - Set authentication error
- `logout()` - Clear authentication state
- `refreshToken(newToken)` - Refresh JWT token
- `clearError()` - Clear error message

### 6.2 User State

**State Structure**
```
user: {
  currentUser: {
    id: string
    name: string
    email: string
    role: string
    department: {
      id: string
      name: string
    }
    createdAt: string
    lastLogin: string
  }
  allUsers: [] (loaded on demand)
  isLoading: boolean
  error: string | null
  lastUpdated: number
}
```

**Actions**
- `fetchCurrentUser()` - Get current user profile
- `fetchAllUsers(filters)` - Get user list for admin
- `updateUserProfile(updates)` - Update user information
- `setUserLoading(loading)` - Set loading state
- `setUserError(error)` - Set error message
- `clearUserError()` - Clear error

### 6.3 Department State

**State Structure**
```
departments: {
  list: [
    {
      id: string
      name: string
      description: string
      lead_id: string
      members_count: number
      tasks_count: number
      created_at: string
    }
  ]
  selectedDepartment: {
    id: string
    name: string
    description: string
    lead: { id, name, email }
    members: []
    tasks_count: number
  }
  isLoading: boolean
  error: string | null
  filters: {
    searchTerm: string
    sortBy: 'name' | 'members' | 'created'
  }
}
```

**Actions**
- `fetchDepartments(filters)` - Get departments list
- `fetchDepartmentDetails(id)` - Get specific department
- `fetchDepartmentMembers(id)` - Get department members
- `createDepartment(data)` - Create new department
- `updateDepartment(id, data)` - Update department
- `addMemberToDepartment(deptId, userId)` - Assign user to department
- `removeMemberFromDepartment(deptId, userId)` - Remove user from department
- `setDepartmentFilters(filters)` - Set search/sort filters
- `setDepartmentLoading(loading)` - Set loading state
- `setDepartmentError(error)` - Set error message

### 6.4 Task State

**State Structure**
```
tasks: {
  list: [
    {
      id: string
      title: string
      description: string
      status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
      assigned_to_id: string
      created_by_id: string
      department_id: string
      deadline: string
      priority: 'LOW' | 'MEDIUM' | 'HIGH' (future)
      created_at: string
      updated_at: string
    }
  ]
  selectedTask: {
    // Full task details
    id: string
    title: string
    description: string
    status: string
    assigned_to: { id, name, email, avatar }
    created_by: { id, name, email }
    department: { id, name }
    deadline: string
    created_at: string
    updated_at: string
    history: [] (future)
  }
  myTasks: [] // Tasks assigned to current user
  createdByMe: [] // Tasks created by current user
  isLoading: boolean
  error: string | null
  filters: {
    status: string[]
    department: string[]
    assignee: string[]
    searchTerm: string
    sortBy: 'deadline' | 'created' | 'status'
  }
  pagination: {
    currentPage: number
    pageSize: number
    total: number
  }
}
```

**Actions**
- `fetchAllTasks(filters, page)` - Get all tasks with filtering
- `fetchMyTasks(filters)` - Get current user's assigned tasks
- `fetchCreatedByMe(filters)` - Get tasks created by current user
- `fetchTaskDetails(id)` - Get specific task details
- `createTask(taskData)` - Create new task
- `updateTask(id, updates)` - Update task details
- `updateTaskStatus(id, newStatus)` - Change task status
- `deleteTask(id)` - Delete task
- `setTaskFilters(filters)` - Set search/filter/sort
- `setTaskPagination(page, pageSize)` - Set pagination
- `setTaskLoading(loading)` - Set loading state
- `setTaskError(error)` - Set error message
- `selectTask(id)` - Set selected task
- `clearSelectedTask()` - Clear task selection

### 6.5 Notification State (Future Enhancement)

**State Structure**
```
notifications: {
  list: [
    {
      id: string
      type: 'TASK_ASSIGNED' | 'TASK_COMPLETED' | 'TASK_OVERDUE'
      message: string
      read: boolean
      timestamp: number
      data: {} // Relevant data for notification
    }
  ]
  unreadCount: number
  isLoading: boolean
}
```

**Actions**
- `fetchNotifications()` - Get notifications
- `markAsRead(id)` - Mark notification as read
- `dismissNotification(id)` - Remove notification
- `addNotification(notification)` - Add new notification (from WebSocket)

### 6.6 UI/Settings State

**State Structure**
```
ui: {
  sidebar: {
    isOpen: boolean
    width: 'collapsed' | 'normal' | 'expanded'
  }
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  modal: {
    isOpen: boolean
    type: string
    data: {}
  }
  notifications: {
    enabled: boolean
    sound: boolean
    desktop: boolean
  }
}
```

**Actions**
- `toggleSidebar()` - Toggle sidebar visibility
- `setSidebarWidth(width)` - Set sidebar width
- `setTheme(theme)` - Set light/dark theme
- `openModal(type, data)` - Open modal
- `closeModal()` - Close modal
- `setNotificationSettings(settings)` - Update notification preferences

---

## 7. API Integration Plan

### 7.1 Authentication Endpoints

#### POST /register
- **Purpose**: Register new user account
- **Used In**: RegisterForm component, Registration page
- **Request Body**:
  ```
  {
    "name": string
    "email": string
    "password": string
  }
  ```
- **Response**: 
  ```
  {
    "user_id": string
    "name": string
    "email": string
    "message": string
  }
  ```
- **State Updates**: Clear form, show success message, redirect to login
- **Error Handling**: Display validation errors, email already exists

#### POST /login
- **Purpose**: Authenticate user and receive JWT token
- **Used In**: LoginForm component, Login page
- **Request Body**:
  ```
  {
    "email": string
    "password": string
  }
  ```
- **Response**:
  ```
  {
    "access_token": string
    "token_type": string
  }
  ```
- **State Updates**: Set auth token, set user, redirect to dashboard
- **Error Handling**: Invalid credentials, display error alert
- **Token Storage**: Store in localStorage/sessionStorage and auth state

#### GET /me
- **Purpose**: Get current authenticated user profile
- **Used In**: App initialization, ProfilePage, Navbar (user info)
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```
  {
    "user_id": string
    "name": string
    "email": string
    "role": string
    "department_id": string | null
  }
  ```
- **State Updates**: Update user state with profile info
- **Error Handling**: Redirect to login if unauthorized (401)
- **Called On**: App mount, page refresh, after role/department changes

---

### 7.2 Task Endpoints

#### POST /tasks
- **Purpose**: Create new task
- **Used In**: TaskCreateForm, Create Task page
- **Access**: President, VP, Department Lead
- **Request Body**:
  ```
  {
    "title": string
    "description": string
    "assigned_to_id": string
    "department_id": string
    "deadline": string (ISO 8601)
  }
  ```
- **Response**:
  ```
  {
    "task_id": string
    "title": string
    "description": string
    "status": string
    "assigned_to_id": string
    "created_by_id": string
    "department_id": string
    "deadline": string
    "created_at": string
  }
  ```
- **State Updates**: Add task to tasks list, show success message
- **Error Handling**: Validation errors, permission denied
- **Navigation**: Redirect to task details page or tasks list

#### GET /tasks/{task_id}
- **Purpose**: Get detailed task information
- **Used In**: TaskDetail page, Task modal expansion
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```
  {
    "task_id": string
    "title": string
    "description": string
    "status": string
    "assigned_to": { "user_id", "name", "email" }
    "created_by": { "user_id", "name", "email" }
    "department": { "department_id", "name" }
    "deadline": string
    "priority": string (future)
    "created_at": string
    "updated_at": string
    "comments": [] (future)
    "history": [] (future)
  }
  ```
- **State Updates**: Set selectedTask in state
- **Error Handling**: Task not found (404), permission denied (403)

#### GET /tasks/my-tasks
- **Purpose**: Get all tasks assigned to current user
- **Used In**: Dashboard, MyTasks page, TaskList filters
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  ```
  ?skip=0&limit=20&status=PENDING&department_id=null
  ```
- **Response**:
  ```
  {
    "tasks": [
      {
        "task_id": string
        "title": string
        "status": string
        "assigned_to_id": string
        "created_by": { "user_id", "name" }
        "deadline": string
        "created_at": string
      }
    ]
    "total": number
  }
  ```
- **State Updates**: Update myTasks in tasks state
- **Error Handling**: Unauthorized (401)

#### GET /tasks/created-by-me
- **Purpose**: Get all tasks created by current user
- **Used In**: CreatedByMe page, TaskList filters
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  ```
  ?skip=0&limit=20&status=null&department_id=null
  ```
- **Response**:
  ```
  {
    "tasks": [
      {
        "task_id": string
        "title": string
        "status": string
        "assigned_to": { "user_id", "name" }
        "department": { "department_id", "name" }
        "deadline": string
        "created_at": string
      }
    ]
    "total": number
  }
  ```
- **State Updates**: Update createdByMe in tasks state
- **Error Handling**: Unauthorized (401)

#### PATCH /tasks/{task_id}/status
- **Purpose**: Update task status (Pending → In Progress → Completed)
- **Used In**: TaskStatusUpdater component, Task card actions
- **Access**: Task assignee, task creator, President, VP
- **Request Body**:
  ```
  {
    "status": "PENDING" | "IN_PROGRESS" | "COMPLETED"
  }
  ```
- **Response**:
  ```
  {
    "task_id": string
    "status": string
    "updated_at": string
    "message": string
  }
  ```
- **State Updates**: Update task status in tasks list and selected task
- **Error Handling**: Invalid status, permission denied (403)
- **UI Update**: Immediately reflect status change

#### DELETE /tasks/{task_id}
- **Purpose**: Delete a task
- **Used In**: TaskDetail page, Task actions menu
- **Access**: Creator, President, VP
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```
  {
    "message": string
    "task_id": string
  }
  ```
- **State Updates**: Remove task from tasks list
- **Error Handling**: Task not found (404), permission denied (403)
- **Navigation**: Redirect to tasks list after deletion
- **Confirmation**: Show confirmation modal before deletion

---

### 7.3 Department Endpoints

#### POST /departments
- **Purpose**: Create new department
- **Used In**: DepartmentCreateForm, Department creation page
- **Access**: President, VP
- **Request Body**:
  ```
  {
    "name": string
    "description": string
  }
  ```
- **Response**:
  ```
  {
    "department_id": string
    "name": string
    "description": string
    "created_at": string
  }
  ```
- **State Updates**: Add department to departments list
- **Error Handling**: Validation errors, permission denied
- **Navigation**: Redirect to department details

#### GET /departments
- **Purpose**: Get all departments list
- **Used In**: Departments page, Department selector, Dashboard
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  ```
  ?skip=0&limit=50&search=null
  ```
- **Response**:
  ```
  {
    "departments": [
      {
        "department_id": string
        "name": string
        "description": string
        "lead_id": string
        "lead_name": string
        "members_count": number
        "created_at": string
      }
    ]
    "total": number
  }
  ```
- **State Updates**: Update departments list in state
- **Error Handling**: Unauthorized (401)
- **Caching**: Cache with reasonable TTL

#### GET /departments/{id}/members
- **Purpose**: Get department members
- **Used In**: DepartmentDetail page, Members list
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```
  {
    "department_id": string
    "members": [
      {
        "user_id": string
        "name": string
        "email": string
        "role": string
        "avatar": string (future)
      }
    ]
    "total": number
  }
  ```
- **State Updates**: Update members in selected department
- **Error Handling**: Department not found (404), unauthorized (401)

#### POST /departments/{id}/assign-user/{user_id}
- **Purpose**: Assign user to department
- **Used In**: MemberManagementModal, User assignment form
- **Access**: President, VP (for other users), Department Lead (for own department)
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```
  {
    "message": string
    "department_id": string
    "user_id": string
  }
  ```
- **State Updates**: Add user to department members, refresh department
- **Error Handling**: User not found, department not found, permission denied
- **Validation**: Prevent duplicate assignments

---

### 7.4 User Endpoints (Future Implementation)

#### GET /users (To be implemented)
- **Purpose**: Get all users list
- **Used In**: User management page (Admin)
- **Access**: President, VP

#### PUT /users/{user_id} (To be implemented)
- **Purpose**: Update user details
- **Used In**: User edit modal
- **Access**: User editing own profile, President

#### PUT /users/{user_id}/role (To be implemented)
- **Purpose**: Update user role (President only)
- **Used In**: User management, Role assignment
- **Access**: President

---

## 8. User Flows

### 8.1 Authentication Flows

#### Login Flow
```
User visits App
    ↓
Check if token exists in localStorage
    ↓
If token exists:
    → Validate token (call GET /me)
    → If valid: Redirect to Dashboard
    → If invalid/expired: Redirect to Login
    ↓
If no token:
    → Display Login Page
    ↓
User enters Email & Password
    ↓
Click Login Button
    ↓
POST /login (email, password)
    ↓
Receive access_token
    ↓
Store token in localStorage + auth state
    ↓
Call GET /me to fetch user profile
    ↓
Store user in state
    ↓
Redirect to Dashboard
    ↓
Display personalized greeting
```

#### Registration Flow
```
User clicks "Sign Up" link
    ↓
Display Registration Page
    ↓
User fills form (Name, Email, Password, Role, Department)
    ↓
Click Register Button
    ↓
Validate form (client-side)
    ↓
POST /register (name, email, password)
    ↓
Backend creates user account
    ↓
Display success message
    ↓
Redirect to Login Page
    ↓
User logs in with credentials
```

#### Logout Flow
```
User clicks Logout in user menu
    ↓
Show confirmation (optional)
    ↓
Clear auth token from localStorage
    ↓
Clear auth state
    ↓
Clear all cached data (tasks, departments, users)
    ↓
Redirect to Login Page
```

---

### 8.2 Task Management Flows

#### Create Task Flow
```
User clicks "Create Task" button
    ↓
Display TaskCreateForm
    ↓
Form layout depends on role:
    - President/VP: Can select department
    - Department Lead: Department pre-selected
    ↓
User fills:
    - Title (required)
    - Description (optional)
    - Department (if permitted)
    - Assign To (user selector)
    - Deadline (date picker)
    ↓
Click Create Button
    ↓
Validate form (client-side)
    ↓
Show loading state
    ↓
POST /tasks (title, description, assigned_to_id, dept_id, deadline)
    ↓
Success response
    ↓
Show success toast/alert
    ↓
Option to view task or create another
    ↓
Redirect to task details or tasks list
    ↓
Update tasks state with new task
```

#### Assign Task Flow
```
Administrator (Pres/VP/DeptLead) on Create Task page
    ↓
Select assignee from dropdown/modal
    ↓
Fetch assignable users based on:
    - If President/VP: All users
    - If Department Lead: Department members only
    ↓
GET /departments/{id}/members (for DL)
    ↓
Display user list with search
    ↓
User selects assignee
    ↓
Assignee displayed in form
    ↓
Submit task creation
    ↓
Task assigned in backend
    ↓
Assignee receives notification (future)
```

#### Update Task Status Flow
```
Task Assignee views task details
    ↓
Sees current status with options
    ↓
Valid transitions:
    - PENDING → IN_PROGRESS
    - IN_PROGRESS → COMPLETED
    - COMPLETED → IN_PROGRESS (if allowed)
    ↓
Click on status button/dropdown
    ↓
Select new status
    ↓
Show confirmation or direct update
    ↓
PATCH /tasks/{task_id}/status (new_status)
    ↓
Success response
    ↓
Update task status in UI immediately
    ↓
Show success toast
    ↓
Update task in state
    ↓
Task creator notified (future)
```

#### View Task Details Flow
```
User clicks on task in list/card
    ↓
Check permissions (can view?)
    ↓
GET /tasks/{task_id}
    ↓
Display TaskDetail page with:
    - Full task information
    - Assignee details
    - Creator information
    - Department
    - Deadline with status
    - Status update button (if authorized)
    - Delete button (if authorized)
    - Edit button (future, if authorized)
    ↓
User can:
    - View all details
    - Update status (if assignee)
    - Delete task (if creator/Pres/VP)
    - Reassign (future, if authorized)
    ↓
Navigation back to task list
```

#### Delete Task Flow
```
User on task details page
    ↓
Clicks delete button (if visible)
    ↓
Show confirmation modal
    ↓
Confirm: "Are you sure you want to delete?"
    ↓
User confirms
    ↓
Show loading state
    ↓
DELETE /tasks/{task_id}
    ↓
Success response
    ↓
Show success toast
    ↓
Remove task from state
    ↓
Redirect to tasks list
```

---

### 8.3 Department Management Flows

#### Create Department Flow
```
President or VP clicks "Create Department"
    ↓
Display DepartmentCreateForm
    ↓
User fills:
    - Department Name (required)
    - Description (optional)
    ↓
Click Create Button
    ↓
Validate form
    ↓
POST /departments (name, description)
    ↓
Success response
    ↓
Show success message
    ↓
Add department to state
    ↓
Redirect to department details
    ↓
Optional: Allow immediate assignment of members
```

#### Assign User to Department Flow
```
Manager views Department Details page
    ↓
Clicks "Add Member" button
    ↓
Show MemberManagementModal
    ↓
Display user selector/list
    ↓
Filter out already assigned members
    ↓
User searches for and selects user
    ↓
Click "Assign" button
    ↓
POST /departments/{dept_id}/assign-user/{user_id}
    ↓
Success response
    ↓
Add user to members list
    ↓
Update department members count
    ↓
Show success toast
    ↓
Update tasks and permissions for user
```

#### View Department Members Flow
```
User navigates to Department Details page
    ↓
GET /departments/{dept_id}/members
    ↓
Display members list with:
    - Member name
    - Role
    - Email
    - Avatar
    - Join date
    ↓
If authorized (Pres/VP/DeptLead):
    - Show remove/manage options
    ↓
Can click on member to view profile (future)
```

---

### 8.4 User Profile Flows

#### View Profile Flow
```
User clicks on profile icon/name in navbar
    ↓
Navigate to /profile
    ↓
GET /me (already cached, optional refresh)
    ↓
Display profile information:
    - Name, Email
    - Role, Department
    - Tasks statistics
    - Member since date
    ↓
Show sections:
    - Profile Information
    - Assigned Tasks
    - Created Tasks
    - Role & Permissions
    ↓
User can:
    - Edit profile (future)
    - Change password (future)
    - Logout
```

#### Edit Profile Flow (Future)
```
User on profile page clicks "Edit"
    ↓
Display ProfileEditForm
    ↓
Pre-populate with current data
    ↓
User updates information
    ↓
Click Save
    ↓
PUT /users/{user_id} (updates)
    ↓
Success response
    ↓
Update profile display
    ↓
Show success message
    ↓
Update auth state if name changed
```

---

## 9. Folder Structure

### 9.1 React Project Structure

```
task-assignment-system-frontend/
│
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
│
├── src/
│   ├── index.jsx                    # React root entry point
│   ├── App.jsx                      # Main app component
│   │
│   ├── assets/                      # Static assets
│   │   ├── images/
│   │   │   ├── logos/
│   │   │   ├── icons/
│   │   │   └── illustrations/
│   │   ├── styles/
│   │   │   ├── colors.css
│   │   │   ├── typography.css
│   │   │   ├── spacing.css
│   │   │   └── variables.css
│   │   └── fonts/
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.css
│   │   │   ├── Sidebar.css
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorAlert.jsx
│   │   │   ├── SuccessAlert.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── EmptyState.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── AppLayout.css
│   │   │   ├── AuthLayout.css
│   │   │   ├── PageHeader.jsx
│   │   │   ├── Container.jsx
│   │   │   └── Breadcrumb.jsx
│   │   │
│   │   ├── form/
│   │   │   ├── FormInput.jsx
│   │   │   ├── FormPasswordInput.jsx
│   │   │   ├── FormSelect.jsx
│   │   │   ├── FormTextarea.jsx
│   │   │   ├── FormButton.jsx
│   │   │   ├── DatePicker.jsx
│   │   │   ├── TimePicker.jsx
│   │   │   ├── UserSelector.jsx
│   │   │   ├── DepartmentSelector.jsx
│   │   │   ├── RoleSelector.jsx
│   │   │   ├── FormField.jsx
│   │   │   ├── Form.css
│   │   │   └── validators.js
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── ForgotPasswordForm.jsx
│   │   │   ├── ResetPasswordForm.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RoleBasedRoute.jsx
│   │   │   ├── LinkButton.jsx
│   │   │   └── AuthForms.css
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardStats.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── RecentTasksWidget.jsx
│   │   │   ├── DepartmentWidget.jsx
│   │   │   ├── TaskStatusChart.jsx
│   │   │   ├── ActivityFeed.jsx
│   │   │   ├── WelcomeBanner.jsx
│   │   │   └── Dashboard.css
│   │   │
│   │   ├── tasks/
│   │   │   ├── TaskTable.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskRow.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskFilter.jsx
│   │   │   ├── TaskSearch.jsx
│   │   │   ├── TaskStatusBadge.jsx
│   │   │   ├── TaskPriority.jsx
│   │   │   ├── TaskDeadlineInfo.jsx
│   │   │   ├── TaskAssigneeAvatar.jsx
│   │   │   ├── TaskCreatorInfo.jsx
│   │   │   ├── PaginationControls.jsx
│   │   │   ├── TaskCreateForm.jsx
│   │   │   ├── TaskEditForm.jsx
│   │   │   ├── TaskDeleteModal.jsx
│   │   │   ├── Tasks.css
│   │   │   ├── TaskDetail.css
│   │   │   └── taskHelpers.js
│   │   │
│   │   ├── taskDetail/
│   │   │   ├── TaskHeader.jsx
│   │   │   ├── TaskDetailsPanel.jsx
│   │   │   ├── TaskStatusUpdater.jsx
│   │   │   ├── TaskAssigneeInfo.jsx
│   │   │   ├── TaskMetadata.jsx
│   │   │   ├── TaskHistoryPanel.jsx
│   │   │   ├── CommentSection.jsx
│   │   │   ├── ActionButtons.jsx
│   │   │   └── TaskDetail.css
│   │   │
│   │   ├── departments/
│   │   │   ├── DepartmentGrid.jsx
│   │   │   ├── DepartmentCard.jsx
│   │   │   ├── DepartmentTable.jsx
│   │   │   ├── DepartmentHeader.jsx
│   │   │   ├── DepartmentStats.jsx
│   │   │   ├── MembersList.jsx
│   │   │   ├── MemberCard.jsx
│   │   │   ├── MemberManagementModal.jsx
│   │   │   ├── CreateDepartmentButton.jsx
│   │   │   ├── DepartmentCreateForm.jsx
│   │   │   ├── Departments.css
│   │   │   └── departmentHelpers.js
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfileHeader.jsx
│   │   │   ├── ProfileInformation.jsx
│   │   │   ├── ProfileStats.jsx
│   │   │   ├── ProfileEditForm.jsx
│   │   │   ├── ChangePasswordForm.jsx
│   │   │   ├── PermissionsList.jsx
│   │   │   ├── RoleBadge.jsx
│   │   │   ├── Profile.css
│   │   │   └── profileHelpers.js
│   │   │
│   │   └── admin/
│   │       ├── UserTable.jsx
│   │       ├── UserCard.jsx
│   │       ├── UserFilter.jsx
│   │       ├── UserEditModal.jsx
│   │       ├── RoleSelectorAdmin.jsx
│   │       ├── DepartmentAssigner.jsx
│   │       ├── BulkActionToolbar.jsx
│   │       ├── Admin.css
│   │       └── adminHelpers.js
│   │
│   ├── pages/                       # Page components
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   └── AuthPages.css
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── PresidentDashboard.jsx
│   │   │   ├── VPDashboard.jsx
│   │   │   ├── DepartmentLeadDashboard.jsx
│   │   │   ├── MemberDashboard.jsx
│   │   │   └── DashboardPage.css
│   │   │
│   │   ├── tasks/
│   │   │   ├── TasksPage.jsx
│   │   │   ├── MyTasksPage.jsx
│   │   │   ├── CreatedByMePage.jsx
│   │   │   ├── TaskDetailPage.jsx
│   │   │   ├── TaskCreatePage.jsx
│   │   │   ├── TaskEditPage.jsx
│   │   │   └── TasksPage.css
│   │   │
│   │   ├── departments/
│   │   │   ├── DepartmentsPage.jsx
│   │   │   ├── DepartmentDetailPage.jsx
│   │   │   ├── CreateDepartmentPage.jsx
│   │   │   └── DepartmentsPage.css
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfilePage.jsx
│   │   │   └── ProfilePage.css
│   │   │
│   │   ├── settings/
│   │   │   ├── SettingsPage.jsx
│   │   │   └── SettingsPage.css
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── UserManagementPage.jsx
│   │   │   ├── UserDetailPage.jsx
│   │   │   └── AdminPage.css
│   │   │
│   │   └── 404/
│   │       ├── NotFoundPage.jsx
│   │       └── NotFoundPage.css
│   │
│   ├── state/                       # State management
│   │   ├── store.js                # Redux store or Context setup
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── TaskContext.jsx
│   │   │   ├── DepartmentContext.jsx
│   │   │   ├── UserContext.jsx
│   │   │   └── UIContext.jsx
│   │   │
│   │   ├── slices/ (if using Redux)
│   │   │   ├── authSlice.js
│   │   │   ├── taskSlice.js
│   │   │   ├── departmentSlice.js
│   │   │   ├── userSlice.js
│   │   │   └── uiSlice.js
│   │   │
│   │   └── actions/ (if using Redux)
│   │       ├── authActions.js
│   │       ├── taskActions.js
│   │       ├── departmentActions.js
│   │       └── userActions.js
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useTasks.js
│   │   ├── useDepartments.js
│   │   ├── useUsers.js
│   │   ├── useNotifications.js
│   │   ├── useLocalStorage.js
│   │   ├── useFetch.js
│   │   ├── useForm.js
│   │   ├── useDebounce.js
│   │   ├── useRole.js
│   │   └── usePermissions.js
│   │
│   ├── services/                    # API services
│   │   ├── api.js                  # Axios config and interceptors
│   │   ├── authService.js
│   │   ├── taskService.js
│   │   ├── departmentService.js
│   │   ├── userService.js
│   │   └── notificationService.js
│   │
│   ├── utils/                       # Utility functions
│   │   ├── constants.js
│   │   ├── roles.js
│   │   ├── permissions.js
│   │   ├── dateUtils.js
│   │   ├── stringUtils.js
│   │   ├── validationUtils.js
│   │   ├── localStorage.js
│   │   ├── tokenUtils.js
│   │   └── errorHandler.js
│   │
│   ├── config/                      # Configuration files
│   │   ├── env.js
│   │   ├── theme.js
│   │   ├── routes.js
│   │   └── API_BASE_URL.js
│   │
│   ├── styles/                      # Global styles
│   │   ├── index.css
│   │   ├── global.css
│   │   ├── variables.css
│   │   ├── responsive.css
│   │   ├── animations.css
│   │   └── tailwind.config.js (if using Tailwind)
│   │
│   └── middleware/
│       ├── errorBoundary.js
│       ├── logger.js
│       └── authInterceptor.js
│
├── .env                             # Environment variables
├── .env.example                     # Example env file
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

### 9.2 Key Directories Explained

#### `/src/components/`
- **common/**: Reusable UI components (buttons, alerts, modals, etc.)
- **layout/**: Layout wrapper components (navbar, sidebar, app layout)
- **form/**: Form-related components (inputs, selectors, date pickers)
- **auth/**: Authentication-specific components
- **dashboard/**: Dashboard widget components
- **tasks/**: Task management components
- **taskDetail/**: Task detail view components
- **departments/**: Department management components
- **profile/**: User profile components
- **admin/**: Administrative panel components

#### `/src/pages/`
- Full page components that combine multiple components
- Organized by feature area (auth, dashboard, tasks, departments, etc.)
- Handles page-level logic and state management

#### `/src/state/`
- Centralized state management
- Use React Context API or Redux depending on complexity
- Separate concerns: auth, tasks, departments, users, UI state

#### `/src/services/`
- API communication layer
- Handles all HTTP requests
- Error handling and response transformation
- Token management and interceptors

#### `/src/hooks/`
- Custom React hooks for reusable logic
- Permission checking, authentication, form handling
- Data fetching and state management hooks

#### `/src/utils/`
- Pure utility functions
- Constants and helper functions
- No side effects

---

## Summary

This comprehensive Frontend Architecture Plan provides:

1. **Clear Project Structure**: Organized folder structure following React best practices
2. **Detailed Page Specifications**: Each page with purpose, routes, accessible roles, and required components
3. **Component Library**: Complete list of reusable components for consistent UI
4. **State Management Strategy**: Centralized state for auth, tasks, departments, and users
5. **API Integration Map**: Every backend endpoint and its usage in the frontend
6. **User Flows**: Step-by-step flows for common tasks and workflows
7. **Scalable Architecture**: Foundation for future enhancements (notifications, comments, attachments, etc.)

The frontend will be built as a React Single Page Application (SPA) with:
- Context API or Redux for state management
- Axios for API communication
- React Router for navigation
- Component-based architecture
- Role-based access control at UI level
- Responsive design for multiple devices

This plan serves as the source of truth for frontend development and should be referred to when implementing new features or components.
