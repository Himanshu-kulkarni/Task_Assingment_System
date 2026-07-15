# TaskFlow Architectural Decisions

## ADR 1: Single-Page Role-Aware Dashboard Layout

*   **Status**: Accepted
*   **Context**: The application requires distinct experiences for Members, Department Leads, and Executives (Presidents & Vice Presidents). Historically, this is often implemented using different frontend router pathways (e.g. `/member/dashboard`, `/admin/dashboard`).
*   **Decision**: We choose to implement a single dashboard path (`/dashboard`) that houses conditional component blocks. The application will fetch the authenticated user profile (`GET /me`) on startup, check the `role` attribute, and inject role-specific widgets/modals directly into the unified dashboard shell.
*   **Consequences**: 
    *   Saves development time by preventing app shell duplication.
    *   Ensures a smooth, seamless transition if a user's role is promoted/changed.
    *   Enhances security since rendering switches are backed up by role-verification assertions on the API endpoints.

---

## ADR 2: FastAPI + SQLAlchemy Declarative Base (Backend Stack)

*   **Status**: Accepted
*   **Context**: Need a robust, simple, and high-performance backend layer that natively handles JSON validation, dependency injection, and ORM abstractions.
*   **Decision**: Standardized on FastAPI for the web API layer and SQLAlchemy for the database communication.
*   **Consequences**:
    *   Provides automatic interactive API documentation (`/docs` using Swagger).
    *   Ensures type safety using Pydantic validation schemas.
    *   Decoupled architecture makes it easy to switch underlying databases (e.g. from SQLite in local testing to PostgreSQL in staging/production) with minimal configuration changes.

---

## ADR 3: JWT Bearer-Token Authentication (Stateful Client, Stateless Server)

*   **Status**: Accepted
*   **Context**: The system must verify identities across all routes without managing server-side session stores, supporting high horizontal scalability.
*   **Decision**: Implement OAuth2 Bearer-token authentication utilizing JSON Web Tokens (JWT). The backend signs a token containing the `user_id` upon successful login, and the frontend client stores this token securely, transmitting it in the `Authorization` header of all subsequent API calls.
*   **Consequences**:
    *   Server remains completely stateless.
    *   Ensures secure API operations; if the JWT signature is invalid or has expired, requests are denied before hitting database operations.

---

## ADR 4: Hierarchical Role Restraints on Tasks

*   **Status**: Accepted
*   **Context**: Department Leads or Faculty Coordinators should not be able to assign or delete tasks outside their specific sphere of influence.
*   **Decision**: The backend enforces the following assignment chains:
    *   Faculty Coordinator -> President / Vice President only.
    *   President / Vice President -> Department Leads only.
    *   Department Lead -> Members in their own department only.
*   **Consequences**: Strict isolation of tasks between departments, maintaining clear lines of accountability.
