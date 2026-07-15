# TaskFlow

<p align="center">
  <img src="frontend/public/favicon.svg" alt="TaskFlow Logo" width="80" height="80" />
</p>

<p align="center">
  A secure, modern, multi-college organizational management and hierarchical task assignment platform.
</p>

<p align="center">
  <a href="https://github.com/Himanshu-kulkarni/Task_Assingment_System"><img src="https://img.shields.io/github/stars/Himanshu-kulkarni/Task_Assingment_System?style=for-the-badge" alt="Stars"></a>
  <a href="https://github.com/Himanshu-kulkarni/Task_Assingment_System/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Himanshu-kulkarni/Task_Assingment_System?style=for-the-badge" alt="License"></a>
  <img src="https://img.shields.io/badge/Python-3.11%2B-blue?style=for-the-badge" alt="Python">
  <img src="https://img.shields.io/badge/TypeScript-5.0%2B-blue?style=for-the-badge" alt="TypeScript">
</p>

---

## 📑 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Overview](#-api-overview)
- [Authentication Flow](#-authentication-flow)
- [User Roles & Permissions](#-user-roles--permissions)
- [Installation & Quick Start](#-installation--quick-start)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Troubleshooting & FAQ](#-troubleshooting--faq)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🚀 Features

### 🏢 Platform & Multi-College Administration
* **College Directory Management**: Super Admin controls registered institutions, codes, and representative profiles.
* **Auto-Provisioning**: Automated College Representative profile creation with securely generated temporary passwords.
* **Isolated College Rep Dashboards**: Metrics showing registered clubs, tasks, and completed vs. pending tasks inside their college.

### 👥 Hierarchical Applications & Promotion Matrix
* **Faculty Coordinator Applications**: Approved by College Representatives.
* **Executive Applications (President & VP)**: Approved by Faculty Coordinators.
* **Department Lead Applications**: Approved by Club Presidents and VPs.
* **Department Member Applications**: Approved by Department Leads.
* **Role Promotions**: Auto-update user role, club, and department references upon approval.

### 📋 Scoped Hierarchical Task Assignment
* **Strict Assignment Hierarchy**:
  - **Faculty Coordinator** assigns to President and VP.
  - **President / VP** assigns to Department Leads.
  - **Department Lead** assigns to Department Members.
* **Status Updates**: Members track, edit, and change status of assigned work (Pending, In Progress, Completed).

### 🔒 Enterprise Grade Security
* **JWT Claims Verification**: Verification of standard `sub`, `type` (access), and `iat` claims.
* **Bcrypt Password Cryptography**: Native hashing preventing plain-text storage.
* **Login Rate Limiter**: IP-based login throttling to prevent brute-force attacks (5 attempts/minute).

---

## 🛠️ Tech Stack

### Backend
* ![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?style=flat-square&logo=fastapi&logoColor=white) - High-performance web framework.
* ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0%2B-D71100?style=flat-square&logo=python&logoColor=white) - Database ORM mapping relations and checking integrity constraints.
* ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791?style=flat-square&logo=postgresql&logoColor=white) - Relational SQL database.
* ![Pydantic](https://img.shields.io/badge/Pydantic-2.0%2B-E91E63?style=flat-square&logo=pydantic&logoColor=white) - Type verification and validation layers.

### Frontend
* ![React](https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB) - UI Framework.
* ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-007ACC?style=flat-square&logo=typescript&logoColor=white) - Type safety and autocomplete support.
* ![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite&logoColor=white) - High-speed module bundling.
* ![Lucide-React](https://img.shields.io/badge/Lucide--React-1.0-FF4154?style=flat-square) - Clean interface icon libraries.
* ![Vanilla CSS](https://img.shields.io/badge/Vanilla_CSS-3-1572B6?style=flat-square&logo=css3&logoColor=white) - Responsive styling and theme variables.

---

## 📐 System Architecture

TaskFlow utilizes a modular, decoupled Architecture separating client presentation, REST routing, and database transactions:

```mermaid
graph TD
    subgraph Frontend [React SPA Client]
        UI[App.tsx Components] --> Fetch[Browser fetch API]
    end

    subgraph API [FastAPI REST Router]
        Fetch -- JWT Auth Header --> Middleware[CORS & Auth Verification]
        Middleware --> Router[Routes /auth, /colleges, /departments, /tasks]
    end

    subgraph Service [Data Access Layer]
        Router --> ORM[SQLAlchemy Session]
    end

    subgraph Database [Relational Database]
        ORM --> DB[(PostgreSQL Database)]
    end
```

---

## 📁 Project Structure

```text
Task_Assignment_System/
├── backend/
│   ├── app/
│   │   ├── routes/              # FastAPI Router endpoints
│   │   │   ├── auth.py          # Logins, registrations, and user directory
│   │   │   ├── colleges.py      # College CRUD operations
│   │   │   ├── clubs.py         # Club creation and deletion
│   │   │   ├── departments.py   # Department creation and scoping
│   │   │   ├── tasks.py         # Hierarchical task creation and updates
│   │   │   └── applications.py  # Enrollment applications validation
│   │   ├── database.py          # SQLAlchemy SessionLocal engine config
│   │   ├── dependencies.py      # User auth and role checker dependencies
│   │   ├── models.py            # PostgreSQL table schema declarations
│   │   ├── roles.py             # UserRole Enum definition
│   │   ├── schemas.py           # Pydantic schemas (UserCreate, etc.)
│   │   └── utils/
│   │       └── security.py      # JWT creation, validation and Bcrypt hashing
│   ├── main.py                  # Entrypoint, CORS setups, and DB initialization
│   ├── seed_db.py               # Database seeder script
│   └── requirements.py          # Backend pip requirements
├── frontend/
│   ├── src/
│   │   ├── assets/              # Icons and images
│   │   ├── index.css            # Dark mode theme styles and animations
│   │   ├── main.tsx             # React DOM entrypoint
│   │   └── App.tsx              # Single-page dashboard routing & view components
│   ├── package.json             # NPM dependencies
│   └── vite.config.ts           # Vite configurations
└── DEMO_ACCOUNTS.md             # List of pre-seeded test accounts
```

---

## 🗄️ Database Schema

The database utilizes explicit foreign key relations and data constraints to preserve referential integrity:

```mermaid
erDiagram
    COLLEGES ||--o| USERS : "representative_id"
    COLLEGES ||--o{ CLUBS : "has"
    CLUBS ||--o{ USERS : "members"
    CLUBS ||--o{ DEPARTMENTS : "contains"
    DEPARTMENTS ||--o| USERS : "lead_id"
    DEPARTMENTS ||--o{ USERS : "has"
    USERS ||--o{ TASKS : "assigned_to"
    USERS ||--o{ TASKS : "assigned_by"
    USERS ||--o{ APPLICATIONS : "applies"
    CLUBS ||--o{ APPLICATIONS : "receives"
    DEPARTMENTS ||--o{ APPLICATIONS : "receives"

    COLLEGES {
        int id PK
        string name UK
        string code
        string address
        string description
        int representative_id FK
    }

    CLUBS {
        int id PK
        string name
        string description
        int college_id FK
        int faculty_coordinator_id FK
    }

    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        string role
        int college_id FK
        int club_id FK
        int department_id FK
    }

    DEPARTMENTS {
        int id PK
        string name UK
        string description
        int club_id FK
        int lead_id FK
    }

    TASKS {
        int id PK
        string title
        string description
        string status
        datetime created_at
        datetime deadline
        int assigned_to FK
        int assigned_by FK
        int department_id FK
    }

    APPLICATIONS {
        int id PK
        int user_id FK
        int club_id FK
        string role
        int department_id FK
        string status
    }
```

---

## 🔌 API Overview

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Public | Registers a new user. |
| **POST** | `/login` | Public | Generates JWT and checks credentials (throttled). |
| **GET** | `/me` | Authenticated | Retrieves profile metadata. |
| **GET** | `/colleges/public` | Public | Returns simple college ID, name, code mapping. |
| **GET** | `/colleges` | `SUPER_ADMIN` | Returns detailed colleges catalog (outer-joined). |
| **POST** | `/colleges` | `SUPER_ADMIN` | Creates new college and provisions a Rep. |
| **POST** | `/clubs` | `COLLEGE_REP` | Creates a new club. |
| **POST** | `/departments` | `PRESIDENT`, `VICE_PRESIDENT` | Registers a new department scoped to club_id. |
| **POST** | `/tasks` | Leads / Admins | Creates tasks complying with role hierarchies. |
| **PATCH** | `/tasks/{id}/status`| Task Assignee | Updates status of assigned task. |
| **GET** | `/applications` | Authenticated | Returns applications filtered by role permissions. |
| **POST** | `/applications/{id}/approve` | Reviewing Lead | Approves application and triggers role updates. |

---

## 🔒 Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    Client->>API: POST /login {email, password}
    Note right of API: Throttles if >5 requests/min
    API->>DB: Query user by email
    API->>API: Verify Bcrypt password hash
    API->>API: Generate Access JWT (sub, type:access, exp, iat)
    API-->>Client: Return access_token & token_type
    Note over Client: Stores token in localStorage
    Client->>API: GET /me (Bearer Token)
    API->>API: Validate claims & expiry
    API-->>Client: Return User Profile & Role Metadata
```

---

## 👥 User Roles & Permissions

| Role | Scope | Tasks | Clubs / Departments | Application Approvals |
| :--- | :--- | :--- | :--- | :--- |
| **SUPER_ADMIN** | Platform | N/A | Manage colleges (CRUD) | N/A |
| **COLLEGE_REP** | College | Observes stats | Create / Delete Clubs | Approve Faculty Coordinators |
| **FACULTY_COORDINATOR** | Club | Assigns to President / VP | Read-only | Approve Presidents and VPs |
| **PRESIDENT / VP** | Club | Assigns to Department Leads | Create Departments | Approve Department Leads |
| **DEPARTMENT_LEAD** | Dept | Assigns to Dept Members | Read-only | Approve Department Members |
| **MEMBER** | Individual | Completes assigned tasks | Read-only | N/A |

---

## ⚙️ Installation & Quick Start

### Prerequisites
* Python 3.11 or higher
* Node.js 18 or higher
* PostgreSQL database

### 1. Setup Backend
1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `backend/.env` (see below).
5. Run DB Seeder (Recreates tables and inputs demo data):
   ```bash
   python seed_db.py
   ```
6. Start development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### 2. Setup Frontend
1. Navigate to frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Create `.env.local` or environment variables for API endpoints (see below).
4. Run development build:
   ```bash
   npm run dev
   ```

---

## 📝 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string. | `postgresql://user:pass@localhost:5432/taskflow` |
| `SECRET_KEY` | Hex token signing key (min 32 chars). | `9f2a7dbcc8039c3e387c2fb2d35817c76740ee3628ff3a89ee120d5885e3a890` |
| `ALGORITHM` | Encryption algorithm. | `HS256` |

### Frontend (Render Env / Local `.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE` | Web Service base endpoint URL. | `https://taskflow-backend.onrender.com` |

---

## 🖼️ Screenshots

* **Super Admin College Manager**
  *(Placeholder for Super Admin view)*
* **Department Lead Task Dashboard**
  *(Placeholder for Department Lead view)*
* **Member Task Update Panel**
  *(Placeholder for Member view)*

---

## 🗺️ Roadmap

- [x] Multi-college scaling database support.
- [x] Super Admin panel integration.
- [x] Dynamic, secure representative account creation.
- [x] Scoped in-memory login rate limiters.
- [ ] Websocket notifications for task updates.
- [ ] Drag-and-drop Kanban task board view.
- [ ] Calendar deadline visualizers.

---

## ❓ Troubleshooting & FAQ

### 1. I get a `psycopg2.OperationalError: could not translate host name` error on Render
On Render, make sure you configure your backend `DATABASE_URL` environment variable using your PostgreSQL database's **External Database URL**, as the Internal Database URL only works for services deployed in the exact same region and private network.

### 2. I get "Failed to fetch" on the login screen
Ensure your frontend `VITE_API_BASE` environment variable matches your backend deployment URL exactly (without double slashes or syntax issues).

---

## 🤝 Contributing

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## ✍️ Author

* **Himanshu Kulkarni** - [GitHub](https://github.com/Himanshu-kulkarni)
