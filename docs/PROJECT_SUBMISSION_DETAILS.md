# FleetOps — Enterprise Fleet Management and Vehicle Utilization Platform

---

## 1. Project Title
**FleetOps — Enterprise Fleet Management and Vehicle Utilization Platform**

---

## 2. Abstract
Modern logistics and transportation enterprises face significant operational bottlenecks in fleet asset tracking, vehicle availability conflicts, fuel theft and anomaly management, reactive maintenance downtime, and inefficient driver assignment workflows. **FleetOps** is an enterprise-grade, full-stack digital transformation platform engineered to centralize, automate, and optimize fleet lifecycle operations. Built on a robust decoupled architecture leveraging **Spring Boot 3 (Java 17)** for backend microservices and **React 18 with Vite** for a modern, responsive web application, FleetOps enforces strict **Role-Based Access Control (RBAC)** via **Spring Security** and stateless **JSON Web Tokens (JWT)** across four discrete user personas: Administrator, Fleet Manager, Dispatcher, and Commercial Driver. The platform features an intelligent dispatch validation engine that enforces strict vehicle and driver eligibility guardrails, a proactive vehicle maintenance engine calculating dynamic wear thresholds, a fuel telemetry and anomaly detector, an end-to-end trip rejection and reassignment workflow, a multi-tier organizational complaint escalation system, and an immutable audit log. By transitioning from disconnected manual logs to real-time, data-driven telemetry, FleetOps minimizes asset downtime, enhances driver accountability, optimizes operational expenditures, and ensures continuous regulatory and safety compliance.

---

## 3. Detailed Technology Stack

### Backend Technologies
- **Language & Runtime**: Java 17 (LTS), OpenJDK
- **Core Framework**: Spring Boot 3.3.4 (Spring Framework 6.x)
- **Security & Authorization**: Spring Security 6, Stateless JWT (HMAC-SHA256, 256-bit encryption key), BCrypt Password Hashing (`$2a$` / `$2b$`), Method-Level Security (`@PreAuthorize`, `@EnableMethodSecurity`)
- **Persistence & ORM**: Spring Data JPA, Hibernate ORM 6.5.3, Jakarta Persistence API (JPA 3.1)
- **Database Connection Pool**: HikariCP (High-performance connection pooling)
- **REST Architecture**: RESTful API design adhering to standard HTTP verbs and status codes, centralized response envelope (`ApiResponse<T>`)
- **Data Validation**: Jakarta Bean Validation (`@Valid`, `@NotNull`, `@Size`)
- **API Documentation**: SpringDoc OpenAPI 3, Swagger UI (`/swagger-ui.html`)
- **Build & Dependency Management**: Apache Maven 3.9+ with embedded Maven Wrapper (`mvnw`)

### Frontend Technologies
- **Library & Framework**: React 18.3 (Single Page Application architecture)
- **Build Tooling & Bundler**: Vite 5.4 (Hot Module Replacement, ESBuild, Rollup production bundler)
- **Routing & Route Protection**: React Router DOM v6 (Declarative client-side routing, Protected Layout, Dynamic Role-Guarded Routes `RoleBasedRoute.jsx`, 403 Access Denied interceptors)
- **State & Context Management**: React Context API (`AuthContext` with session-scoped persistence via `sessionStorage`)
- **Styling & Design System**: Tailwind CSS 3.4, PostCSS, Autoprefixer (Modern dark-mode enterprise theme)
- **Data Visualization & Analytics**: Recharts (Responsive Pie charts for asset distribution, Bar charts for monthly operational expense trends)
- **Iconography**: Lucide React (High-fidelity vector icons)
- **HTTP Client**: Axios with custom interceptors (stateless JWT token attachment, HTTP 401 session expiration handling, HTTP 403 warning handling)

### Database & Infrastructure
- **Database Engine**: MySQL 8.0+ Relational Database Management System (InnoDB Engine)
- **Database Design**: Fully normalized relational schema with strict Foreign Key constraints, composite indexes, and enum mappings
- **Automation & Backup Scripts**: Windows Batch scripts (`run_backend.bat`, `run_frontend.bat`, `run_database_export.bat`, `export_database.bat`, `import_database.bat`) for turnkey evaluation and database snapshotting

---

## 4. Role & Module Breakdown

### ROLE 1: ADMIN (System Administrator)
- **Role Description**: Holds comprehensive administrative authority to govern system configuration, manage user roles, audit operational transactions, and oversee global fleet operations.
- **Modules Accessible by Admin**:
  1. **Dashboard & Command Center**: Central real-time executive cockpit displaying fleet availability distribution, active transit counts, financial telemetry, and system-wide KPI metrics.
  2. **Vehicle Master Registry**: Comprehensive asset ledger allowing creation, specification updates, dynamic category allocation, status transitions, and deactivation of vehicles.
  3. **Vehicle Categories**: Configuration of vehicle classification tiers, capacity standards, and utilization categories for dynamic asset assignment.
  4. **Driver Profiles**: Master directory managing driver onboarding, commercial license verification, employment status tracking, and emergency contact details.
  5. **Trips & Dispatch**: Central dispatch ledger to review, cancel, reassign, or monitor live and scheduled fleet transit itineraries.
  6. **Trip Rejections Management**: Administrative review portal to inspect, approve (unassign driver and replan), or deny driver trip rejection requests.
  7. **Fuel Management**: Detailed logging of fuel refills, volume tracking, cost analytics, and automated fuel theft/consumption anomaly detection.
  8. **Maintenance & Service**: Preventative and reactive maintenance tracker with scheduled odometer/date thresholds and repair work orders.
  9. **Spare Parts Inventory**: Inventory control system tracking replacement components, unit costs, stock quantities, and minimum reorder alerts.
  10. **Proactive Recommendations**: Automated business engine providing predictive maintenance alerts and utilization recommendations based on vehicle wear thresholds.
  11. **Notifications & Broadcast**: Alert center to view operational events and publish targeted broadcasts across the fleet or specific user roles.
  12. **Complaints & Issues Escalation**: Enterprise ticket desk to investigate complaints submitted across the organization, update ticket statuses, and log corrective resolutions.
  13. **Audit Trail**: Security event and transactional logging system tracking system modifications, user access operations, and historical record changes.

---

### ROLE 2: FLEET MANAGER (Operational Management)
- **Role Description**: Manages day-to-day logistics, asset health, vehicle servicing, driver assignments, and issue resolution without system security administration rights.
- **Modules Accessible by Fleet Manager**:
  1. **Dashboard & Command Center**: Operational intelligence dashboard tracking fleet availability, asset utilization percentages, and monthly expenditure trends.
  2. **Vehicle Master Registry**: Operational asset management to view, register, edit details, and modify vehicle service availability statuses.
  3. **Vehicle Categories**: Category view and allocation to align vehicle types with regional and client logistics requirements.
  4. **Driver Profiles**: Directory of registered commercial drivers, license expiration schedules, and active duty availability.
  5. **Trips & Dispatch**: Trip dispatching console to plan routes, assign eligible drivers and available vehicles, and cancel obsolete itineraries.
  6. **Trip Rejections Management**: Review console to evaluate driver reassignment requests, examine rejection rationales, and release assets for replanning.
  7. **Fuel Management**: Logging of fuel purchases, fuel efficiency tracking, and detection of excessive fuel consumption anomalies.
  8. **Maintenance & Service**: Service scheduler to issue repair work orders, record service costs, and monitor overdue maintenance tasks.
  9. **Spare Parts Inventory**: Stock management to track component quantities, record part consumption during servicing, and reorder critical spares.
  10. **Proactive Recommendations**: Engine-generated maintenance alerts and asset optimization tips to minimize downtime and prevent breakdowns.
  11. **Notifications & Broadcast**: Communication portal to review alerts and broadcast operational directives to drivers, dispatchers, or all staff.
  12. **Complaints & Issues Escalation**: Customer and operational issue tracker to review filed tickets, assign investigations, and record corrective actions.

---

### ROLE 3: DISPATCHER (Logistics & Coordination)
- **Role Description**: Coordinates real-time vehicle allocation, driver dispatching, route scheduling, and trip progress monitoring without asset or financial management rights.
- **Modules Accessible by Dispatcher**:
  1. **Dashboard (Operational View)**: Operational summary highlighting currently available vehicles and active transit routes ready for dispatch.
  2. **Vehicle Master Registry (Read & Availability)**: Catalog of fleet assets to verify real-time vehicle operational readiness and specifications before assignment.
  3. **Driver Directory (Read-Only)**: Operational view of active drivers to check availability, assigned routes, and duty qualifications.
  4. **Trips & Dispatch**: Primary operational module to plan new trips, assign available vehicles and eligible drivers, and monitor in-transit progress.
  5. **Proactive Recommendations**: Advisory feed alerting dispatchers to vehicles requiring inspection so they are not assigned to heavy transit.
  6. **Notifications**: Operational notification feed receiving dispatch updates, vehicle assignments, and trip event alerts.
  7. **Complaints & Issues**: Submission and tracking console allowing dispatchers to log dispatching roadblocks or report route discrepancies.

---

### ROLE 4: DRIVER (Field Operations & Transit)
- **Role Description**: Field operational personnel responsible for conducting vehicle inspections, executing assigned itineraries, and reporting on-road discrepancies.
- **Modules Accessible by Driver**:
  1. **Dashboard (Driver Portal)**: Personalized driver portal displaying assigned duties, active trip status, and critical operational updates.
  2. **Trips & Assignments**: Dedicated trip ledger allowing drivers to view assigned trips, verify cargo/route details, and initiate trip commencement.
  3. **Trip Rejection & Reassignment**: Formal dispute workflow enabling drivers to reject an assigned trip with mandatory justification for management review.
  4. **Notifications**: Personal notification inbox receiving direct trip assignments, broadcast alerts, and emergency notifications.
  5. **Complaints & Safety Reporting**: Direct reporting desk enabling drivers to log vehicle defects, roadside breakdowns, safety hazards, and grievances.

---

## 5. Verified Demo Authentication Credentials

| Role | Username | Password | Default Entry View | Key Permissions & Constraints |
|---|---|---|---|---|
| **Admin** | `admin` | `admin123` | Executive Command Center (`/`) | Full administrative access, audit logs, system configuration, all modules. |
| **Fleet Manager** | `manager` | `admin123` | Executive Command Center (`/`) | Fleet operations, maintenance, fuel, complaints resolution; no security config. |
| **Dispatcher** | `dispatcher1` | `admin123` | Trips & Dispatch (`/trips`) | Trip creation, vehicle/driver assignment; restricted from deleting assets. |
| **Driver** | `driver_john` | `FleetDriver@101` | My Trips (`/trips`) | Own trips, trip rejection, own complaints, notifications; strictly isolated. |
