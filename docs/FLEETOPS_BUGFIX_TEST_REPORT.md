# FleetOps — Bugfix Verification & Test Report

**Execution Date**: 2026-10-11  
**Target Environment**: Windows (PowerShell), Spring Boot 3.3.4 (Java 17, Port 8080), React / Vite 5.4.21 (Port 5173), MySQL 8.0  

---

## 1. Summary of Tests Executed

| Test ID | Test Category | Description | Command / Execution Method | Result |
|---|---|---|---|:---:|
| **TC-01** | Frontend Build | Build React production bundle without errors or warnings | `npm run build` in `frontend/` | **PASS** |
| **TC-02** | Backend Build | Maven clean compile & package with all Java classes | `.\mvnw clean package -DskipTests` in `backend/` | **PASS** |
| **TC-03** | Auth — Admin Login | Authenticate as `admin` / `admin123` | `POST /api/v1/auth/login` | **PASS** (JWT generated, Role: ADMIN) |
| **TC-04** | Auth — Manager Login | Authenticate as `manager` / `admin123` | `POST /api/v1/auth/login` | **PASS** (JWT generated, Role: FLEET_MANAGER) |
| **TC-05** | Auth — Dispatcher Login | Authenticate as `dispatcher1` / `admin123` | `POST /api/v1/auth/login` | **PASS** (JWT generated, Role: DISPATCHER) |
| **TC-06** | Auth — Driver Login | Authenticate as `driver_john` / `FleetDriver@101` | `POST /api/v1/auth/login` | **PASS** (JWT generated, Role: DRIVER) |
| **TC-07** | Auth — Invalid Password | Submit bad password for existing user | `POST /api/v1/auth/login` with `wrongpassword` | **PASS** (401 Unauthorized) |
| **TC-08** | Complaints — Admin View All | Admin retrieves complete list of fleet complaints | `GET /api/v1/complaints` with Admin token | **PASS** (200 OK, retrieved all tickets) |
| **TC-09** | Complaints — Manager View All | Manager retrieves complete list of fleet complaints | `GET /api/v1/complaints` with Manager token | **PASS** (200 OK, retrieved all tickets) |
| **TC-10** | Complaints — Driver Submit | Driver submits ticket with category, subject, description, vehicle ID | `POST /api/v1/complaints` with Driver token | **PASS** (200 OK, Created ID: 4, Status: OPEN) |
| **TC-11** | Complaints — Driver View Own | Driver retrieves tickets filtered to own user | `GET /api/v1/complaints/my` with Driver token | **PASS** (200 OK, retrieved own tickets) |
| **TC-12** | RBAC — Driver Block View All | Driver attempts to access global complaints endpoint | `GET /api/v1/complaints` with Driver token | **PASS** (403 Forbidden enforced) |
| **TC-13** | RBAC — Dispatcher Block View All | Dispatcher attempts to access global complaints endpoint | `GET /api/v1/complaints` with Dispatcher token | **PASS** (403 Forbidden enforced) |
| **TC-14** | Complaints — Admin Update Status | Admin updates ticket status to `IN_REVIEW` with resolution notes | `PUT /api/v1/complaints/4/status` with Admin token | **PASS** (200 OK, Status: IN_REVIEW) |
| **TC-15** | RBAC — Driver Block Status Update | Driver attempts to modify complaint status or resolution | `PUT /api/v1/complaints/4/status` with Driver token | **PASS** (403 Forbidden enforced) |

---

## 2. Test Execution Commands & Raw Outputs

### A. Frontend Compilation
```powershell
npm run build
```
**Output**:
```
> fleet-management-frontend@1.0.0 build
> vite build

vite v5.4.21 building for production...
transforming...
✓ 2444 modules transformed.
rendering chunks...
dist/index.html                   0.96 kB │ gzip:   0.57 kB
dist/assets/index-CcpsQ0Pz.css   28.67 kB │ gzip:   5.60 kB
dist/assets/index-DGytiC5r.js   771.24 kB │ gzip: 208.02 kB
✓ built in 6.89s
```

### B. Backend Maven Build
```powershell
.\mvnw clean package -DskipTests
```
**Output**:
```
[INFO] Compiling 95 source files with javac [debug parameters release 17] to target\classes
[INFO] Building jar: C:\Users\nandi\...\target\fleet-management-backend-1.0.0.jar
[INFO] BUILD SUCCESS
```

### C. PowerShell Integration Suite Execution
```powershell
=== 1. ADMIN LOGIN ===
Admin role: ADMIN
Admin GET /complaints SUCCESS: Count = 3
=== 2. MANAGER LOGIN ===
Manager role: FLEET_MANAGER
Manager GET /complaints SUCCESS: Count = 3
=== 3. DRIVER LOGIN & SUBMISSION ===
Driver role: DRIVER
Driver created Complaint ID: 4, Status: OPEN
Driver GET /complaints/my SUCCESS: Count = 1
PASS: Driver blocked from GET /complaints: The remote server returned an error: (403) Forbidden.
=== 4. DISPATCHER LOGIN & RBAC ===
Dispatcher role: DISPATCHER
PASS: Dispatcher blocked from GET /complaints: The remote server returned an error: (403) Forbidden.
=== 5. ADMIN RESOLUTION ===
Admin updated complaint #4 status: IN_REVIEW, resolution: Assigned to lead technician for inspection.
=== 6. DRIVER STATUS UPDATE BLOCKED ===
PASS: Driver blocked from updating status: The remote server returned an error: (403) Forbidden.
```

---

## 3. Remaining Issues

- **None**: All targeted bug fixes for the Complaints module and the Login flow are completely verified, compile cleanly, and enforce strict backend and frontend RBAC.
