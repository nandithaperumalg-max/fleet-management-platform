# FleetOps — Complaints Module Fix & Implementation Report

## 1. Root Cause Analysis

### Backend Authorization Mismatch (403 Forbidden)
- **Root Cause**: `ComplaintController.java` previously used `@PreAuthorize("hasAnyAuthority('ADMIN', 'FLEET_MANAGER', 'SUPER_ADMIN')")`.
- **Mechanism of Failure**: In Spring Security (`CustomUserDetailsService.java`), user roles are mapped with the standard prefix: `new SimpleGrantedAuthority("ROLE_" + user.getRole().name())`. Consequently, the granted authority for an Admin user is `ROLE_ADMIN`, not `ADMIN`.
- When `hasAnyAuthority('ADMIN', ...)` checked for an exact match against string `"ADMIN"`, Spring Security failed the check and issued an HTTP 403 Forbidden on `GET /api/v1/complaints` and `PUT /api/v1/complaints/{id}/status`.
- **UI Impact**: The frontend API handler received 403, and the complaints table remained empty with failed network requests.

### UI & Layout Deficiencies
- The previous Complaints UI lacked proper column count handling (`colSpan` mismatch for non-managers), responsive cards, search and filter controls, and detailed investigation views.
- Drivers had no way to view the full descriptions or management resolutions of their tickets.
- `StatusBadge` did not have color mappings for complaint statuses (`OPEN`, `IN_REVIEW`, `RESOLVED`, `CLOSED`), causing them to display with generic fallback styling.
- Submissions and status updates used disruptive native browser `alert()` popups instead of inline banners and notifications.

---

## 2. Files Modified

1. **`backend/src/main/java/com/fleetops/controller/ComplaintController.java`**
   - Corrected authorization annotations to `@PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")` on `getAllComplaints()` and `updateComplaintStatus(...)`.
   - Added user identity and role verification to `getComplaintById(...)` so drivers/dispatchers can only view their own tickets, while managers/admins have global access.
   - Added server-side validation for `subject`, `description`, and `category`, along with safe parsing for optional numeric `vehicleId` and `tripId`.

2. **`frontend/src/pages/ComplaintsPage.jsx`**
   - Redesigned with responsive layout, KPI metric overview cards, real-time client-side search, category filter, and status filter.
   - Built an interactive **"Report New Fleet Issue"** modal for all authenticated roles with input validation and clear feedback.
   - Added a **"View Details"** / **"Review & Resolve"** modal allowing drivers to read resolution notes and management (Admin/Manager) to update ticket status and submit corrective action notes.
   - Added proper loading spinners, dynamic table column spans, and empty state cards.

3. **`frontend/src/components/common/StatusBadge.jsx`**
   - Added badge styling for `OPEN`, `IN_REVIEW`, `RESOLVED`, and `CLOSED`.

---

## 3. Complaint Submission and Display Behavior

- **Submission**: Any authenticated user (Admin, Manager, Dispatcher, Driver) can report an issue with Category, Subject, Description, and optional Vehicle ID / Trip ID.
- **Display**:
  - **Admin & Fleet Manager**: View all submitted complaints across the fleet, search/filter, and update status and resolution notes.
  - **Driver & Dispatcher**: View their own tickets via `GET /api/v1/complaints/my`, review ticket progress, and inspect management resolution notes.
- **Status Progression**: `OPEN` &rarr; `IN_REVIEW` &rarr; `RESOLVED` &rarr; `CLOSED`.

---

## 4. Role Permissions & Security Verification

| Operation | Endpoint | ADMIN | FLEET_MANAGER | DISPATCHER | DRIVER |
|---|---|:---:|:---:|:---:|:---:|
| Submit Complaint | `POST /api/v1/complaints` | Allowed | Allowed | Allowed | Allowed |
| View Own Complaints | `GET /api/v1/complaints/my` | Allowed | Allowed | Allowed | Allowed |
| View All Complaints | `GET /api/v1/complaints` | Allowed | Allowed | **403 Forbidden** | **403 Forbidden** |
| View Specific Ticket | `GET /api/v1/complaints/{id}` | Allowed | Allowed | Own Only | Own Only |
| Update Status & Resolve | `PUT /api/v1/complaints/{id}/status` | Allowed | Allowed | **403 Forbidden** | **403 Forbidden** |
