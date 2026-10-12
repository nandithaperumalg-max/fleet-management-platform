# FleetOps — Initial Login Flow Fix & Implementation Report

## 1. Root Cause Analysis

### Stale LocalStorage Session Restoration
- **Root Cause**: `AuthContext.jsx` restored `localStorage.getItem('fleet_user')` and `localStorage.getItem('fleet_token')` upon mounting without checking whether the JWT was expired or whether the browser session was fresh.
- **Mechanism of Failure**: Whenever an Admin user had previously logged in during testing or development, the browser retained `fleet_user` permanently in `localStorage`.
- When a user or evaluator reopened the application at `http://localhost:5173/`, `ProtectedLayout` checked `isAuthenticated` (`!!user`), saw the restored user object, and bypassed the login screen directly into the Admin dashboard (`/`).
- Even when the JWT expired after 24 hours, `user` in React state was still populated with the Admin profile until an API call failed.

---

## 2. Routing & Authentication Changes

1. **`frontend/src/context/AuthContext.jsx`**
   - Added `isTokenExpired(token)` helper to decode the JWT base64 payload and inspect the `exp` claim against `Date.now()`.
   - Adopted session-scoped storage (`sessionStorage`) with synchronized fallback:
     - On a fresh browser window/session, `sessionStorage` is empty, ensuring the application always routes unauthenticated users directly to `/login`.
     - Stale or expired tokens in storage are automatically cleared on startup, preventing unintended auto-logins.
     - On explicit `logout()`, tokens and user profiles are completely cleared from both `sessionStorage` and `localStorage`.

2. **`frontend/src/services/api.js`**
   - Updated request interceptors to pull the active token strictly from `sessionStorage`.
   - On HTTP 401 Unauthorized, automatically clears session and storage and redirects the browser to `/login`.

3. **`frontend/src/App.jsx`**
   - Introduced `AppRoutes` wrapper to cleanly separate authenticated from unauthenticated routing states.
   - Configured root route `/`: When unauthenticated, immediately displays `LoginPage` without requiring a redirect step.
   - Protected all operational routes (`/*`) behind authentication checks, ensuring unauthenticated visits to protected paths are redirected to `/login`.
   - If an authenticated user visits `/login`, automatically redirects them to their role's dashboard.

4. **`frontend/src/pages/LoginPage.jsx`**
   - Added role-based intelligent post-login redirection:
     - Drivers are routed directly to `/trips` (their active vehicle assignments and dispatch records).
     - Dispatchers are routed to `/trips` (the dispatch control center).
     - Admins and Managers are routed to `/` (the executive operations command center).
   - Ensured demo account switcher buttons use explicit `type="button"` attributes and only populate username and password fields; authentication requires explicit clicking of "Sign In".
   - Added visual active selection highlights for demo account buttons.

---

## 3. Verified Demo Accounts

| Role | Username | Password | Post-Login Target | Permissions Summary |
|---|---|---|---|---|
| **Admin** | `admin` | `admin123` | `/` (Command Center) | Full system administration, audit, users |
| **Fleet Manager** | `manager` | `admin123` | `/` (Command Center) | Fleet operations, maintenance, fuel, complaints |
| **Dispatcher** | `dispatcher1` | `admin123` | `/trips` (Trips & Dispatch) | Trip planning, vehicle/driver assignment |
| **Driver** | `driver_john` | `FleetDriver@101` | `/trips` (My Trips) | Own trips, assigned vehicle, own complaints |
