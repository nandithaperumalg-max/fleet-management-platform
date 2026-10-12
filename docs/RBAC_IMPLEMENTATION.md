# FleetOps Role-Based Access Control (RBAC) Architecture

## Overview
FleetOps implements end-to-end multi-tiered Role-Based Access Control (RBAC) across both the Spring Boot backend REST API and the React frontend Single Page Application (SPA).

---

## 1. Roles Defined
| Role Code | Display Name | Access Scope |
|---|---|---|
| `ADMIN` / `SUPER_ADMIN` | System Administrator | Full access across all modules, configuration, and audit logs |
| `FLEET_MANAGER` | Fleet Operations Manager | Full operations access; no audit log visibility or user deletion |
| `DISPATCHER` | Dispatch & Operations Specialist | Trip scheduling, asset assignment, vehicle status changes; read-only on vehicles & drivers |
| `DRIVER` | Commercial Driver | Limited self-service portal: dashboard KPIs, trips, and notifications |

---

## 2. Backend Enforcement Mechanism
- **Annotation:** `@PreAuthorize` powered by Spring Security Method Security (`@EnableMethodSecurity`).
- **Authorities:** Granted as `ROLE_<ENUM>` via `CustomUserDetailsService`.
- **JWT Provider:** Embeds user role and identity in the bearer token claims.
- **Stateless Verification:** Validated on every HTTP request by `JwtAuthenticationFilter`.

---

## 3. Frontend Enforcement Mechanism
- **Route Guarding:** `<RoleBasedRoute allowedRoles={[...]}>` component wraps protected sub-routes.
- **403 Interception:** Interceptor distinguishes 401 (token expired $\rightarrow$ redirect to `/login`) from 403 (unauthorized action $\rightarrow$ non-destructive error handling without logout).
- **Navigation Adaptation:** Dynamic sidebar filtering displays only authorized navigation targets per user role.
- **In-Page Action Guarding:** Write buttons (e.g., Register Vehicle, Onboard Driver, Soft-Delete) conditionally render only when the user possesses the requisite role.
