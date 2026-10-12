# FleetOps RBAC Verification & Testing Checklist

## Test Credentials
- **Admin**: `admin` / `admin123` (Role: `ADMIN`)
- **Manager**: `manager` / `admin123` (Role: `FLEET_MANAGER`)
- **Dispatcher**: `dispatcher1` / `admin123` (Role: `DISPATCHER`)
- **Driver**: `driver_raj` / `driver123` (Role: `DRIVER`)

---

## 1. Automated API Verification Results
- [x] **Audit Logs Isolation**: Only `ADMIN` obtains `200 OK`; `FLEET_MANAGER`, `DISPATCHER`, and `DRIVER` receive `403 Forbidden`.
- [x] **Vehicle Categories Isolation**: `ADMIN` and `FLEET_MANAGER` can mutate; `DISPATCHER` and `DRIVER` receive `403 Forbidden`.
- [x] **Fuel Transactions Isolation**: `ADMIN` and `FLEET_MANAGER` can record; `DISPATCHER` and `DRIVER` receive `403 Forbidden`.
- [x] **Driver Directory Isolation**: `ADMIN` and `FLEET_MANAGER` can onboard/update drivers; `DISPATCHER` receives `403 Forbidden`.
- [x] **Vehicle Status Control**: `ADMIN`, `FLEET_MANAGER`, and `DISPATCHER` can update vehicle lifecycle status; `DRIVER` receives `403 Forbidden`.
- [x] **Vehicle Deletion Restriction**: Only `ADMIN` can delete vehicles; `FLEET_MANAGER` and others receive `403 Forbidden`.

---

## 2. Frontend UI Verification Matrix
- [x] **Sidebar Visibility**: Dynamic navigation links rendered according to role whitelist.
- [x] **URL Direct Access Defense**: Manual browser URL navigation to unauthorized route invokes `<RoleBasedRoute>` $\rightarrow$ redirects to `/access-denied`.
- [x] **Access Denied Page**: Clean HTTP 403 page with "Go Back" and "Dashboard" links.
- [x] **Token Retention on 403**: Forbidden actions do not log the user out; 401 unauthenticated errors safely redirect to `/login`.
- [x] **Action Button Guarding**: "Register New Vehicle", "Onboard Driver", and "Delete" buttons hidden from unauthorized roles in the UI.
