# FleetOps: Fleet Maintenance & Vehicle Utilization Management Platform
**MCA Final Year Major Project**

An enterprise-grade, centralized fleet operations platform built to manage the entire lifecycle of vehicles:
**Vehicle Registration → Category Allocation → Driver Eligibility Verification → Trip Conflict Guardrail Dispatch → Fuel Anomaly Detection → Preventive Maintenance Work Orders → Automated Inventory Deduction → Predictive Recommendations → Audit Trail**

---

## 🏗️ System Architecture

### Backend
- **Framework:** Spring Boot 3.3.4
- **Language:** Java 17 / Java 24 compatible
- **Security:** Spring Security 6 with JJWT (Stateless Bearer Tokens, Role-Based Access Control)
- **Persistence:** Spring Data JPA / Hibernate ORM with MySQL 8.0 Dialect
- **Database:** MySQL 8.0 (`fleet_management_db`)
- **Engines:**
  - `VehicleAvailabilityEngine` — Real-time lockouts for vehicles under maintenance or active trips
  - `DriverEligibilityEngine` — Checks license validity and prevents overlapping trip dispatches
  - `FuelAnomalyDetectionEngine` — Flags >25% fuel efficiency deviations vs fleet baseline
  - `MaintenanceRecommendationEngine` — Scheduled evaluation against threshold distance and elapsed days

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (Dark Enterprise Theme)
- **Charts:** Recharts (KPIs, Vehicle Allocation, Monthly Maintenance Spend)
- **Icons:** Lucide React
- **Routing:** React Router v6 with JWT Protected Route shell
- **API Client:** Axios with dynamic JWT interceptors and auto-refresh/redirect

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **MySQL Server 8.0+** running on `localhost:3306` with database `fleet_management_db` (user: `root`, password: `root@123`)
- **JDK 17 or higher**
- **Node.js 18+** & **npm**

---

### 2. Start the Spring Boot Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
The backend starts at **`http://localhost:8080`**.
- OpenAPI / Swagger UI: `http://localhost:8080/swagger-ui.html`
- API Base URL: `http://localhost:8080/api/v1`

---

### 3. Start the React Frontend

```powershell
cd frontend
npm install   # If not already installed
npm run dev
```
The frontend launches at **`http://localhost:5173`**.

---

## 🔑 Demo Credentials (For Examiner & Viva Evaluation)

| Role | Username | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `admin123` | Full access to all modules, audit logs, system-wide overrides |
| **Fleet Manager** | `manager` | `admin123` | Vehicles, Categories, Maintenance, Recommendations, Fuel, Trips |
| **Dispatcher** | `dispatcher1` | `admin123` | Trip scheduling, driver assignments, vehicle dispatches |
| **Driver** | `driver_rajesh` | `driver123` | View assigned trips, log odometer & fuel entries |

*(Quick-fill buttons for these credentials are built directly into the login screen).*

---

## 📦 Implemented Functional Modules

1. **Dashboard & Operational Intelligence:**
   - Real-time fleet health KPIs (Total Fleet, Active Trips, Under Maintenance, Low Stock Alerts)
   - Dynamic pie chart for vehicle status distribution
   - Monthly maintenance and fuel expenditure analytics
2. **Vehicle Registry:**
   - Detailed specification management (Make, Model, Year, VIN, Fuel Type, Initial/Current Odometer)
   - Category assignment and status transitions (`AVAILABLE`, `ON_TRIP`, `UNDER_MAINTENANCE`, `RETIRED`)
3. **Category Hierarchy:**
   - Dynamic fleet categorization with real-time vehicle allocation counts
4. **Driver Management & Eligibility Engine:**
   - Driver profile, contact details, license numbers, and validity monitoring
   - Automated expiration warnings and eligibility verification
5. **Trip Dispatch & Conflict Prevention Engine:**
   - Guardrails against double-booking vehicles or drivers
   - Full lifecycle management (`DRAFT` → `ASSIGNED` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`)
   - Auto-updating vehicle odometer readings on trip completion
6. **Fuel Management & Statistical Anomaly Detection:**
   - Fuel refill logging with volume, price per liter, total cost, and odometer
   - Dynamic consumption rate calculation (km/L)
   - Automatic flagging of excessive consumption and instant alert generation
7. **Preventive Maintenance & Work Orders:**
   - Multi-service scheduling (Routine inspections, periodic fluid flushes, mechanical repairs)
   - Automatic vehicle status change to `UNDER_MAINTENANCE` upon service initiation
   - Detailed labor and parts cost calculation with downtime tracking
8. **Spare Parts Inventory Control:**
   - Stock level tracking with SKU and minimum reorder thresholds
   - Automatic inventory deduction upon completing maintenance work orders
   - Real-time low-stock alerts
9. **Automated Diagnostic & Recommendation Engine:**
   - Hourly background scans and on-demand trigger to evaluate vehicle mileage against service rules
   - Proactive alert generation before critical mechanical breakdowns occur
10. **System Notifications:**
    - Live polling for real-time fleet alerts, fuel anomaly warnings, and inventory notifications
11. **Security & Immutable Audit Trail:**
    - Tamper-evident logging of all write operations, entity updates, and state transitions
    - User attribution and client IP capture for security compliance
