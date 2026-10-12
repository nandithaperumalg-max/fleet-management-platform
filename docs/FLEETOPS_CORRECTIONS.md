# FleetOps Target Corrections & Enhancements

This document summarizes the specific corrections, fixes, and enhancements implemented in the FleetOps project to meet the MCA evaluation requirements.

## 1. UI Branding Cleanup
- Removed all "MCA Project" and "MCA Viva Evaluation" development labels.
- Standardized product name to **FleetOps**.
- Subtitle established as **Enterprise Fleet Management Platform**.
- Cleaned up the login screen demo labels.

## 2. Initial Login Flow Fixed
- The application now requires explicit user sign-in instead of automatically bypassing to the admin dashboard.
- Frontend React Router guards (`RoleBasedRoute`, `ProtectedLayout`) ensure unauthenticated users are properly redirected to `/login`.
- Auto-fill has been removed for security and a proper professional feel.

## 3. Strict Role-Based Access Control (RBAC)
Enforced at both backend API (`@PreAuthorize`) and frontend UI levels for the four main roles:
- **ADMIN**: Full system access, users, settings, and audit logs.
- **MANAGER (FLEET_MANAGER)**: Oversee vehicles, trips, maintenance, and resolve complaints. Cannot delete users or manage security.
- **DISPATCHER**: Manage vehicle assignments, view availability, dispatch trips. Cannot edit vehicle master data or maintenance.
- **DRIVER**: Can only view their assigned vehicle, own trips, and notifications. Can reject assigned trips.

## 4. Trip Rejection Workflow
- **Drivers** can now reject an `ASSIGNED` trip with a required reason.
- Creates a `TripRejectionRequest` entity with `PENDING`, `APPROVED`, or `REJECTED` status.
- **Managers and Admins** review these requests in the Trips Dashboard ("View Rejections" button).
- Approving a rejection unassigns the driver and returns the trip to `PLANNED`. Denying a rejection keeps it `ASSIGNED`.

## 5. Formal Complaint System
- Created a dedicated `ComplaintsPage` for users to report issues.
- All roles can submit complaints categorizing them (Safety, Vehicle, Trip, General).
- **Managers and Admins** can review complaints, update their status (`OPEN`, `IN_REVIEW`, `RESOLVED`, `CLOSED`), and log resolution notes.

## 6. Role-Specific Notifications
- Enhanced the `Notification` entity to support a `targetAudience` attribute.
- Notifications can be targeted to specific roles (e.g., `DRIVER`, `DISPATCHER`) or `EVERYONE`.
- **Managers and Admins** can broadcast alerts directly from the UI, choosing category, priority, and audience.

## 7. Database Integrity & Backup
- Database export/import `.bat` scripts created to simplify backups.
- Schema dump (`schema.sql`) and data backups available in `database/backups/`.

## 8. Verified Test Accounts
All demo credentials verified and active for demonstration:
- **Admin:** `admin` / `admin123`
- **Manager:** `manager` / `admin123`
- **Dispatcher:** `dispatcher1` / `admin123`
- **Driver:** `driver_john` / `FleetDriver@101`

---
*All changes were implemented using the existing Spring Boot and React architectural patterns to ensure maximum stability without requiring major structural rewrites.*
