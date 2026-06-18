# Task Assignment System

## 📋 Project Overview

**Task Assignment System** is a robust RESTful backend API built with FastAPI and PostgreSQL. It provides a comprehensive task management and assignment solution, enabling organizations to efficiently assign, track, and manage tasks across different departments with role-based access control. The system features a hierarchical organizational structure, JWT-based authentication, and secure task workflow management.

This is currently a **backend-only project** providing RESTful API endpoints. The frontend application will be built separately in a future phase.

---

## ✨ Features

### Core Features
- **User Authentication & Authorization**
  - Secure JWT-based authentication
  - Bcrypt password hashing
  - Role-based access control (RBAC)
  - Token expiration and refresh mechanisms

- **Task Management**
  - Create, read, update, and delete tasks
  - Assign tasks to team members
  - Track task status (Pending, In Progress, Completed)
  - Set task deadlines
  - View tasks by assignment or creator

- **Department Management**
  - Create and organize departments
  - Assign department leads
  - Manage department members
  - Department-specific task organization

- **Role-Based Permissions**
  - Multi-tier role hierarchy (President, Vice President, Department Lead, Member)
  - Fine-grained access control for task operations
  - Department-level authorization checks

- **User Management**
  - User registration and login
  - Department assignment
  - Role assignment
  - User profile retrieval

---

## 🏗️ System Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│            FastAPI Backend Application           │
│  ┌──────────────────────────────────────────┐   │
│  │      Authentication & Authorization      │   │
│  │  (JWT Verification, Role Checking)      │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │   Route Handlers                         │   │
│  │  • Auth Routes                           │   │
│  │  • Task Routes                           │   │
│  │  • Department Routes                     │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │   SQLAlchemy ORM Layer                   │   │
│  │  (Database Abstraction)                  │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │   Pydantic Schemas & Validation          │   │
│  └──────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────┘
                 │ Database Driver (psycopg2)
                 │ SQL Queries
┌────────────────▼────────────────────────────────┐
│         PostgreSQL Database                      │
│  • Users Table                                   │
│  • Departments Table                             │
│  • Tasks Table                                   │
└─────────────────────────────────────────────────┘
```

### Key Components

1. **Authentication Layer**: JWT token generation and verification
2. **Authorization Layer**: Role-based access control middleware
3. **API Routes**: RESTful endpoints for business operations
4. **ORM Layer**: SQLAlchemy models for database abstraction
5. **Database**: PostgreSQL for persistent data storage

---

## 📁 Folder Structure

```
Task_Assignment_System/
├── README.md                          # Project documentation
│
└── backend/                           # Backend API application
    ├── requirements.txt              # Python dependencies
    ├── Email.txt                     # Email configuration
    │
    └── app/                          # Main FastAPI application package
        ├── __init__.py               # Package initialization
        ├── main.py                   # FastAPI app setup & route registration
        ├── database.py               # PostgreSQL connection & session management
        ├── dependencies.py           # Dependency injection (auth, role validation)
        ├── models.py                 # SQLAlchemy ORM database models
        ├── schemas.py                # Pydantic request/response schemas
        ├── roles.py                  # User role and permission definitions
        ├── test_db.py                # Database testing utilities
        │
        ├── routes/                   # RESTful API endpoint handlers
        │   ├── auth.py              # Authentication endpoints (register, login, profile)
        │   ├── departments.py       # Department management endpoints
        │   └── tasks.py             # Task management endpoints
        │
        └── utils/                    # Utility functions and helpers
            └── security.py           # Password hashing & JWT token operations
```

---

## 🔌 API Features

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login and receive JWT token | Public |
| GET | `/me` | Get current user profile | Authenticated |

### Task Endpoints

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|----------------|
| POST | `/tasks` | Create a new task | President, VP, Dept Lead |
| GET | `/tasks/{task_id}` | Get task details | Task assignee/creator, President, VP |
| GET | `/tasks/my-tasks` | Get all assigned tasks | Authenticated |
| GET | `/tasks/created-by-me` | Get tasks created by user | Authenticated |
| PATCH | `/tasks/{task_id}/status` | Update task status | Task assignee |
| DELETE | `/tasks/{task_id}` | Delete a task | Creator, President, VP |

### Department Endpoints

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|----------------|
| POST | `/departments` | Create a department | President, VP |
| GET | `/departments` | List all departments | Authenticated |
| POST | `/departments/{id}/assign-user/{user_id}` | Assign user to department | President, VP |
| GET | `/departments/{id}/members` | Get department members | Authenticated |

---

## 🔐 Authentication Flow

### Overview

The system uses **JWT (JSON Web Tokens)** for stateless authentication combined with **HTTP Bearer tokens** for secure API access.

### Authentication Process Flow

```
1. User Registration
   │
   └─→ POST /register {name, email, password}
       └─→ Hash password with bcrypt
       └─→ Store user in database
       └─→ Return user_id

2. User Login
   │
   └─→ POST /login {email, password}
       └─→ Verify email exists
       └─→ Verify password with bcrypt
       └─→ Generate JWT token (expires in 1 hour)
       └─→ Return access_token & token_type

3. Authenticated Requests
   │
   └─→ Include header: Authorization: Bearer {access_token}
       └─→ Extract token from header
       └─→ Verify JWT signature
       └─→ Extract user_id from payload
       └─→ Load user from database
       └─→ Proceed with request

4. Token Expiration
   │
   └─→ If token expired → Return 401 Unauthorized
       └─→ User must login again
```

### Security Features

- **Password Hashing**: Bcrypt with salt for secure storage
- **JWT Signing**: HMAC-256 algorithm with SECRET_KEY
- **Token Expiration**: 1-hour validity period
- **HTTP Bearer**: Standard authorization scheme for token transport
- **CORS Configuration**: Restricted cross-origin requests

### JWT Token Structure

```json
{
  "user_id": 1,
  "exp": 1723456789,
  "iat": 1723453189
}
```

---

## 👥 Roles and Permissions

### Role Hierarchy

```
PRESIDENT
  │
  ├─→ Full system access
  ├─→ Can create/delete any task
  ├─→ Can create/manage departments
  └─→ Can assign roles

VICE_PRESIDENT
  │
  ├─→ Create tasks (any department)
  ├─→ Delete own created tasks
  ├─→ Manage departments
  └─→ View all tasks

DEPARTMENT_LEAD
  │
  ├─→ Create tasks (within department)
  ├─→ Manage department members
  ├─→ View department tasks
  └─→ Cannot delete tasks from other leads

MEMBER
  │
  ├─→ View assigned tasks
  ├─→ Update own task status
  └─→ No administrative privileges
```

### Permission Matrix

| Feature | President | VP | Dept Lead | Member |
|---------|-----------|----|-----------| -------|
| Register Users | ✅ | ✅ | ✅ | ✅ |
| Create Tasks | ✅ | ✅ | ✅ (own dept) | ❌ |
| Delete Tasks | ✅ | ✅ | ✅ (own) | ❌ |
| Update Task Status | ✅ | ✅ | ✅ | ✅ (own) |
| Create Departments | ✅ | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ✅ | ✅ (dept) | ❌ |
| View All Tasks | ✅ | ✅ | ✅ (dept) | ✅ (own) |

---

## 🚀 Installation Guide

### Prerequisites

Before installation, ensure you have:

- **Python 3.10+** installed
- **PostgreSQL 12+** database server
- **pip** package manager
- **Git** for version control
- **Postman** or **cURL** (for API testing)

### Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/Task_Assignment_System.git

# Navigate to project directory
cd Task_Assignment_System
```

---

## 🔧 Backend Setup

### 1. Create Python Virtual Environment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install required packages
pip install -r requirements.txt
```

### 3. Environment Configuration

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

### 4. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE task_assignment_db;

# Create user (optional, if not using default postgres)
CREATE USER task_user WITH PASSWORD 'secure_password';
ALTER ROLE task_user SET client_encoding TO 'utf8';
ALTER ROLE task_user SET default_transaction_isolation TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE task_assignment_db TO task_user;

# Exit psql
\q
```

### 5. Initialize Database

```bash
# Navigate back to app directory
cd app

# Run initialization script (if available)
python test_db.py

# Or manually create tables using FastAPI app startup
# Tables are auto-created when the app starts (see main.py)
```

### 6. Start Backend Server

```bash
# From backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at: `http://localhost:8000`

**API Documentation** (auto-generated Swagger UI): `http://localhost:8000/docs`

---

## ▶️ Running the Application

### Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Access the API

- **Backend API**: http://localhost:8000
- **Swagger UI Documentation**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **Root Endpoint**: http://localhost:8000/

### Testing the API

Using **cURL**:

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

Using **Postman**:

1. Import the API endpoints into Postman
2. Set up environment variables for `base_url` and `access_token`
3. Test each endpoint with appropriate headers and request bodies

---

## 🔮 Future Improvements

### Short Term (Phase 2)
- [ ] **Email Notifications**: Send email alerts for task assignments and deadline reminders
- [ ] **Task Attachments**: Allow users to upload files to tasks
- [ ] **Task Categories/Tags**: Organize tasks with categories and tags
- [ ] **Search & Filtering**: Advanced search and filtering capabilities for tasks
- [ ] **Task Comments**: Add comment functionality for task collaboration
- [ ] **Pagination**: Implement pagination for large task lists

### Medium Term (Phase 3)
- [ ] **Notifications Dashboard**: Real-time notification system
- [ ] **Task Templates**: Pre-defined task templates for recurring work
- [ ] **Progress Analytics**: Visual dashboards showing team productivity
- [ ] **Bulk Operations**: Batch task actions (assign multiple, bulk status updates)
- [ ] **Task Dependencies**: Set task dependencies and critical path analysis
- [ ] **Calendar View**: Calendar-based task visualization

### Long Term (Phase 4)
- [ ] **Mobile Application**: Native mobile apps (iOS/Android)
- [ ] **WebSocket Real-time Updates**: Live task updates without polling
- [ ] **Integration APIs**: Third-party integrations (Slack, Teams, Jira)
- [ ] **Advanced Reporting**: Custom reports and export to PDF/Excel
- [ ] **AI-Powered Suggestions**: Machine learning for task recommendations
- [ ] **Audit Logging**: Complete activity audit trail
- [ ] **Backup & Recovery**: Automated database backup systems
- [ ] **Multi-language Support**: Internationalization (i18n)
- [ ] **Dark Mode**: UI theme customization
- [ ] **Performance Optimization**: Caching and query optimization

---

## 💻 Tech Stack

### Backend
- **Framework**: FastAPI (Python web framework for building APIs)
- **Authentication**: JWT (JSON Web Tokens) with python-jose
- **Password Security**: Bcrypt via passlib
- **Database ORM**: SQLAlchemy (Python SQL toolkit)
- **Database**: PostgreSQL (Relational database)
- **Server**: Uvicorn (ASGI server)
- **Validation**: Pydantic (Data validation using Python type hints)
- **CORS**: fastapi.middleware.cors
- **Environment**: python-dotenv (Environment variable management)

### Frontend (Future Phase)
- **Framework**: React (to be implemented in future phases)
- **HTTP Client**: Axios or Fetch API
- **State Management**: React Context API or Redux
- **Styling**: CSS/SCSS or Tailwind CSS
- **UI Components**: Material-UI or similar

### DevOps & Deployment
- **Version Control**: Git/GitHub
- **Containerization**: Docker (optional)
- **Deployment**: AWS, Heroku, or DigitalOcean
- **Database Hosting**: AWS RDS, Heroku Postgres, or managed PostgreSQL

### Development Tools
- **IDE**: Visual Studio Code
- **API Testing**: Postman, Insomnia
- **Database GUI**: pgAdmin, DBeaver
- **Version Control**: Git, GitHub

---

## 📸 API Documentation

### Interactive API Documentation

Once the backend is running, access the interactive API documentation at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These tools provide:
- Interactive endpoint testing
- Request/response schema visualization
- Automatic parameter documentation
- Try-it-out functionality with live API calls

### Screenshots

*Frontend screenshots will be added after the React frontend is developed.*

---

## 👤 Author Section

### Project Created By

**Himanshu**
- GitHub: [@your-github-username](https://github.com/yourusername)
- Email: your.email@example.com
- LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile)

### Contributions

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Support

For support, email your.email@example.com or open an issue on GitHub.

### Acknowledgments

- FastAPI documentation and community
- SQLAlchemy documentation
- PostgreSQL documentation
- React documentation
- All contributors and users

---

## 📞 Contact & Support

- **Issues & Bug Reports**: [GitHub Issues](https://github.com/yourusername/Task_Assignment_System/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/Task_Assignment_System/discussions)
- **Email**: your.email@example.com
- **Documentation**: See this README

---

## 📄 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Guide](https://jwt.io/introduction)
- [React Documentation](https://react.dev/)

---

**Last Updated**: June 17, 2024  
**Version**: 1.0.0

---

<div align="center">

Made with ❤️ by [Your Name]

⭐ If you found this project helpful, please give it a star!

</div>
