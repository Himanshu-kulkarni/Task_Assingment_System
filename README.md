<a id="top"></a>
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:667eea,100:764ba2&height=220&section=header&text=Task%20Assignment%20System&fontSize=46&fontColor=ffffff&animation=fadeIn&fontAlignY=36&desc=Role-Based%20Task%20%26%20Department%20Management%20API&descAlignY=58&descSize=19" width="100%"/>

<img src="https://readme-typing-svg.demolab.com/?font=Fira+Code&size=20&pause=1000&color=667EEA&center=true&vCenter=true&width=620&lines=FastAPI+%2B+PostgreSQL+Backend;JWT+Authentication+%26+RBAC;Built+for+Organizations+%26+Teams" alt="Typing SVG" />

<br/>

<p>
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/status-active%20development-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/scope-backend--only-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge" />
</p>

</div>

<br/>

## 📑 Table of Contents

<details open>
<summary>Click to expand / collapse</summary>

- [Project Overview](#-project-overview)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Folder Structure](#-folder-structure)
- [API Reference](#-api-reference)
- [Authentication Flow](#-authentication-flow)
- [Roles & Permissions](#-roles--permissions)
- [Installation Guide](#-installation-guide)
- [Running the Application](#-running-the-application)
- [Roadmap](#-roadmap)
- [Tech Stack](#-tech-stack)
- [Author & Contributing](#-author--contributing)
- [Contact & Support](#-contact--support)

</details>

<br/>

## 📋 Project Overview

> **Task Assignment System** is a robust RESTful backend API built with **FastAPI** and **PostgreSQL**. It provides a comprehensive task management and assignment solution, enabling organizations to efficiently assign, track, and manage tasks across different departments with role-based access control. The system features a hierarchical organizational structure, JWT-based authentication, and secure task workflow management.

🛠️ This is currently a **backend-only project** providing RESTful API endpoints. The frontend application will be built separately in a future phase.

<p align="right">(<a href="#top">back to top ↑</a>)</p>

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🔐 Authentication & Authorization
- Secure JWT-based authentication
- Bcrypt password hashing
- Role-based access control (RBAC)
- Token expiration & refresh mechanisms

### ✅ Task Management
- Create, read, update, and delete tasks
- Assign tasks to team members
- Track task status (`Pending` → `In Progress` → `Completed`)
- Set task deadlines
- View tasks by assignment or creator

</td>
<td width="50%" valign="top">

### 🏢 Department Management
- Create and organize departments
- Assign department leads
- Manage department members
- Department-specific task organization

### 👥 User Management
- User registration and login
- Department assignment
- Role assignment
- User profile retrieval

</td>
</tr>
</table>

<p align="right">(<a href="#top">back to top ↑</a>)</p>

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph API["🚀 FastAPI Backend Application"]
        direction TB
        AUTH["🔐 Authentication & Authorization<br/><sub>JWT Verification • Role Checking</sub>"]
        ROUTES["🛣️ Route Handlers<br/><sub>Auth • Tasks • Departments</sub>"]
        ORM["🗄️ SQLAlchemy ORM Layer<br/><sub>Database Abstraction</sub>"]
        SCHEMA["📐 Pydantic Schemas<br/><sub>Request / Response Validation</sub>"]
        AUTH --> ROUTES --> ORM --> SCHEMA
    end
    DB[("🐘 PostgreSQL Database<br/><sub>Users • Departments • Tasks</sub>")]
    API -->|"psycopg2 driver<br/>SQL Queries"| DB

    style API fill:#667eea,stroke:#4c51bf,color:#ffffff
    style DB fill:#336791,stroke:#1a365d,color:#ffffff
```

### Key Components

| # | Layer | Responsibility |
|---|-------|-----------------|
| 1 | 🔐 **Authentication Layer** | JWT token generation and verification |
| 2 | 🛡️ **Authorization Layer** | Role-based access control middleware |
| 3 | 🛣️ **API Routes** | RESTful endpoints for business operations |
| 4 | 🗄️ **ORM Layer** | SQLAlchemy models for database abstraction |
| 5 | 🐘 **Database** | PostgreSQL for persistent data storage |

<p align="right">(<a href="#top">back to top ↑</a>)</p>

---

## 📁 Folder Structure

<details>
<summary><strong>Click to view the full project tree</strong> 🌳</summary>

```
Task_Assignment_System/
├── README.md                          # Project documentation
│
└── backend/                           # Backend API application
    ├── requirements.txt                # Python dependencies
    ├── Email.txt                       # Email configuration
    │
    └── app/                            # Main FastAPI application package
        ├── __init__.py                  # Package initialization
        ├── main.py                      # FastAPI app setup & route registration
        ├── database.py                  # PostgreSQL connection & session management
        ├── dependencies.py              # Dependency injection (auth, role validation)
        ├── models.py                    # SQLAlchemy ORM database models
        ├── schemas.py                   # Pydantic request/response schemas
        ├── roles.py                     # User role and permission definitions
        ├── test_db.py                   # Database testing utilities
        │
        ├── routes/                      # RESTful API endpoint handlers
        │   ├── auth.py                  # Authentication endpoints
        │   ├── departments.py           # Department management endpoints
        │   └── tasks.py                 # Task management endpoints
        │
        └── utils/                       # Utility functions and helpers
            └── security.py              # Password hashing & JWT token operations
```

</details>

<p align="right">(<a href="#top">back to top ↑</a>)</p>

---

## 🔌 API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|:------:|----------|-------------|:------:|
| `POST` | `/register` | Register a new user | 🌐 Public |
| `POST` | `/login` | Login and receive JWT token | 🌐 Public |
| `GET` | `/me` | Get current user profile | 🔒 Authenticated |

### Task Endpoints

| Method | Endpoint | Description | Required Role |
|:------:|----------|-------------|----------------|
| `POST` | `/tasks` | Create a new task | President, VP, Dept Lead |
| `GET` | `/tasks/{task_id}` | Get task details | Assignee/Creator, President, VP |
| `GET` | `/tasks/my-tasks` | Get all assigned tasks | 🔒 Authenticated |
| `GET` | `/tasks/created-by-me` | Get tasks created by user | 🔒 Authenticated |
| `PATCH` | `/tasks/{task_id}/status` | Update task status | Task Assignee |
| `DELETE` | `/tasks/{task_id}` | Delete a task | Creator, President, VP |

### Department Endpoints

| Method | Endpoint | Description | Required Role |
|:------:|----------|-------------|----------------|
| `POST` | `/departments` | Create a department | President, VP |
| `GET` | `/departments` | List all departments | 🔒 Authenticated |
| `POST` | `/departments/{id}/assign-user/{user_id}` | Assign user to department | President, VP |
| `GET` | `/departments/{id}/members` | Get department members | 🔒 Authenticated |

<p align="right">(<a href="#top">back to top ↑</a>)</p>

---

## 🔐 Authentication Flow

The system uses **JWT (JSON Web Tokens)** for stateless authentication combined with **HTTP Bearer tokens** for secure API access.

```mermaid
sequenceDiagram
    actor U as 🧑 User
    participant API as 🚀 FastAPI
    participant DB as 🐘 PostgreSQL

    rect rgb(102, 126, 234)
    Note over U,DB: 1️⃣ Registration
    end
    U->>API: POST /register
    API->>API: Hash password (bcrypt)
    API->>DB: Store new user
    DB-->>API: user_id
    API-->>U: 201 Created

    rect rgb(118, 75, 162)
    Note over U,DB: 2️⃣ Login
    end
    U->>API: POST /login
    API->>DB: Verify email & password
    DB-->>API: User verified
    API->>API: Generate JWT (expires 1h)
    API-->>U: access_token

    rect rgb(72, 187, 120)
    Note over U,DB: 3️⃣ Authenticated Request
    end
    U->>API: Request + Authorization: Bearer token
    API->>API: Verify JWT signature
    API->>DB: Load user by user_id
    DB-->>API: User data
    API-->>U: 200 OK + Response

    rect rgb(245, 101, 101)
    Note over U,DB: 4️⃣ Token Expired
    end
    U->>API: Request with expired token
    API-->>U: 401 Unauthorized
```

### Security Features

| Feature | Detail |
|---------|--------|
| 🔑 **Password Hashing** | Bcrypt with salt for secure storage |
| ✍️ **JWT Signing** | HMAC-256 algorithm with `SECRET_KEY` |
| ⏱️ **Token Expiration** | 1-hour validity period |
| 🪪 **HTTP Bearer** | Standard authorization scheme for token transport |
| 🌐 **CORS Configuration** | Restricted cross-origin requests |

<details>
<summary><strong>JWT Token Structure</strong></summary>

```json
{
  "user_id": 1,
  "exp": 1723456789,
  "iat": 1723453189
}
```

</details>

<p align="right">(<a href="#top">back to top ↑</a>)</p>

---

## 👥 Roles & Permissions

```mermaid
graph TD
    P["👑 PRESIDENT<br/><sub>Full system access</sub>"]
    VP["🎖️ VICE PRESIDENT<br/><sub>Cross-department management</sub>"]
    DL["🏅 DEPARTMENT LEAD<br/><sub>Department-level control</sub>"]
    M["👤 MEMBER<br/><sub>Task execution</sub>"]

    P --> VP --> DL --> M

    style P fill:#f56565,stroke:#9b2c2c,color:#ffffff
    style VP fill:#ed8936,stroke:#9c4221,color:#ffffff
    style DL fill:#ecc94b,stroke:#975a16,color:#000000
    style M fill:#48bb78,stroke:#22543d,color:#ffffff
```

### Permission Matrix

| Feature | President | VP | Dept Lead | Member |
|---------|:---------:|:--:|:---------:|:------:|
| Register Users | ✅ | ✅ | ✅ | ✅ |
| Create Tasks | ✅ | ✅ | ✅ (own dept) | ❌ |
| Delete Tasks | ✅ | ✅ | ✅ (own) | ❌ |
| Update Task Status | ✅ | ✅ | ✅ | ✅ (own) |
| Create Departments | ✅ | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ✅ | ✅ (dept) | ❌ |
| View All Tasks | ✅ | ✅ | ✅ (dept) | ✅ (own) |

<p align="right">(<a href="#top">back to top ↑</a>)</p>

---

## 🚀 Installation Guide

### Prerequisites

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-316192?logo=postgresql&logoColor=white)
![pip](https://img.shields.io/badge/pip-package%20manager-yellow)
![Git](https://img.shields.io/badge/Git-required-F05032?logo=git&logoColor=white)

Also recommended: **Postman** or **cURL** for API testing.

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/Task_Assignment_System.git
cd Task_Assignment_System
```

<details>
<summary><strong>2️⃣ Create Python Virtual Environment</strong></summary>

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

</details>

<details>
<summary><strong>3️⃣ Install Dependencies</strong></summary>

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

</details>

<details>
<summary><strong>4️⃣ Environment Configuration</strong></summary>

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/task_assignment_db

# JWT Configuration
SECRET_KEY=your-secret-key-here-use-strong-random-string
ALGORITHM=HS256

# Database Setup
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_assignment_db
```

</details>

<details>
<summary><strong>5️⃣ Create PostgreSQL Database</strong></summary>

```bash
psql -U postgres

CREATE DATABASE task_assignment_db;

# Optional: create a dedicated user
CREATE USER task_user WITH PASSWORD 'secure_password';
ALTER ROLE task_user SET client_encoding TO 'utf8';
ALTER ROLE task_user SET default_transaction_isolation TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE task_assignment_db TO task_user;

\q
```

</details>

<details>
<summary><strong>6️⃣ Initialize Database</strong></summary>

```bash
cd app
python test_db.py

# Tables are also auto-created on app startup (see main.py)
```

</details>

<details open>
<summary><strong>7️⃣ Start the Backend Server</strong></summary>

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

🎉 The API will be live at `http://localhost:8000`, with auto-generated docs at `http://localhost:8000/docs`.

</details>

<p align="right">(<a href="#top">back to top ↑</a>)</p>

---

## ▶ Running the Application

```bash
cd backend

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

| Resource | URL |
|----------|-----|
| 🌐 Backend API | `http://localhost:8000` |
| 📘 Swagger UI | `http://localhost:8000/docs` |
| 📗 ReDoc | `http://localhost:8000/redoc` |
| 🏠 Root Endpoint | `http://localhost:8000/` |

<details>
<summary><strong>🧪 Testing with cURL</strong></summary>

```bash
# Register a new user
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "securepass123"}'

# Login
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "securepass123"}'

# Get current user (requires token)
curl -X GET http://localhost:8000/me \
  -H "Authorization: Bearer {your_access_token}"
```

</details>

<details>
<summary><strong>📮 Testing with Postman</strong></summary>

1. Import the API endpoints into Postman
2. Set up environment variables for `base_url` and `access_token`
3. Test each endpoint with appropriate headers and request bodies

</details>

<p align="right">(<a href="#top">back to top ↑</a>)</p>

---

## 🔮 Roadmap

<details>
<summary><strong>🟢 Phase 2 — Short Term</strong></summary>

- [ ] **Email Notifications** — alerts for task assignments and deadline reminders
- [ ] **Task Attachments** — file uploads on tasks
- [ ] **Task Categories/Tags** — better task organization
- [ ] **Search & Filtering** — advanced task search
- [ ] **Task Comments** — collaboration on tasks
- [ ] **Pagination** — handle large task lists efficiently

</details>

<details>
<summary><strong>🟡 Phase 3 — Medium Term</strong></summary>

- [ ] **Notifications Dashboard** — real-time notification system
- [ ] **Task Templates** — pre-defined templates for recurring work
- [ ] **Progress Analytics** — visual team-productivity dashboards
- [ ] **Bulk Operations** — batch assign / bulk status updates
- [ ] **Task Dependencies** — critical path analysis
- [ ] **Calendar View** — calendar-based task visualization

</details>

<details>
<summary><strong>🔵 Phase 4 — Long Term</strong></summary>

- [ ] **Mobile Application** — native iOS/Android apps
- [ ] **WebSocket Real-time Updates** — live updates without polling
- [ ] **Integration APIs** — Slack, Teams, Jira
- [ ] **Advanced Reporting** — exports to PDF/Excel
- [ ] **AI-Powered Suggestions** — ML-based task recommendations
- [ ] **Audit Logging** — complete activity trail
- [ ] **Backup & Recovery** — automated database backups
- [ ] **Multi-language Support** — i18n
- [ ] **Dark Mode** — theme customization
- [ ] **Performance Optimization** — caching & query tuning

</details>

<p align="right">(<a href="#top">back to top ↑</a>)</p>

---

## 💻 Tech Stack

<table>
<tr>
<td valign="top" width="34%">

**Backend**
- FastAPI
- JWT (`python-jose`)
- Bcrypt (`passlib`)
- SQLAlchemy
- PostgreSQL
- Uvicorn
- Pydantic
- `python-dotenv`

</td>
<td valign="top" width="33%">

**Frontend** *(future phase)*
- React
- Axios / Fetch API
- Context API / Redux
- Tailwind CSS / SCSS
- Material-UI

</td>
<td valign="top" width="33%">

**DevOps & Tools**
- Git / GitHub
- Docker *(optional)*
- AWS / Heroku / DigitalOcean
- VS Code
- Postman / Insomnia
- pgAdmin / DBeaver

</td>
</tr>
</table>

### 📸 Interactive API Documentation

Once the backend is running:

- **Swagger UI** → `http://localhost:8000/docs` — interactive endpoint testing with try-it-out
- **ReDoc** → `http://localhost:8000/redoc` — clean schema visualization

> *Frontend screenshots will be added after the React frontend is developed.*

<p align="right">(<a href="#top">back to top ↑</a>)</p>

---

## 👤 Author & Contributing

<div align="center">

### Created by **Himanshu**

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/yourprofile)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:your.email@example.com)

</div>

### 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/AmazingFeature`
3. Commit your changes — `git commit -m 'Add some AmazingFeature'`
4. Push to the branch — `git push origin feature/AmazingFeature`
5. Open a Pull Request

### 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

### 🙏 Acknowledgments

FastAPI documentation & community • SQLAlchemy documentation • PostgreSQL documentation • React documentation • all contributors and users

<p align="right">(<a href="#top">back to top ↑</a>)</p>

---

## 📞 Contact & Support

| Channel | Link |
|---------|------|
| 🐛 Issues & Bug Reports | [GitHub Issues](https://github.com/yourusername/Task_Assignment_System/issues) |
| 💡 Feature Requests | [GitHub Discussions](https://github.com/yourusername/Task_Assignment_System/discussions) |
| 📧 Email | your.email@example.com |
| 📚 Documentation | This README |

### 📄 Additional Resources

[FastAPI Docs](https://fastapi.tiangolo.com/) · [SQLAlchemy Docs](https://docs.sqlalchemy.org/) · [PostgreSQL Docs](https://www.postgresql.org/docs/) · [JWT Guide](https://jwt.io/introduction) · [React Docs](https://react.dev/)

<p align="right">(<a href="#top">back to top ↑</a>)</p>

---

<div align="center">

**Last Updated**: June 17, 2024 &nbsp;|&nbsp; **Version**: 1.0.0

Made by **Himanshu**

⭐ **If you found this project helpful, please give it a star!** ⭐

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:764ba2,100:667eea&height=120&section=footer" width="100%"/>

</div>
