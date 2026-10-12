# Software Requirements Specification (SRS)
## Fleet Maintenance & Vehicle Utilization Management Platform
**Document Version:** 1.0.0  
**SDLC Phase:** Phase 1 - Requirement Analysis & Specification  
**Industry Domain:** Transportation & Logistics  

---

### 1. Executive Summary & System Objectives
The **Fleet Maintenance & Vehicle Utilization Management Platform** is an enterprise solution designed to centralize and automate the lifecycle management of commercial vehicle fleets. The system combines operational trip information with maintenance and fuel records to calculate vehicle utilization and identify vehicles requiring preventive maintenance based on configurable time, distance, or usage thresholds.

### 2. Stakeholders & User Roles
1. **Fleet Manager**: Fleet capacity planning, operational cost monitoring, procurement & retirement decisions.
2. **Dispatcher / Operations Officer**: Creating trips, assigning eligible drivers and available vehicles, monitoring trip execution.
3. **Maintenance Supervisor / Mechanic**: Creating service schedules, logging repair orders, requisitioning spare parts, updating job completion status.
4. **Safety & Compliance Auditor**: Verifying regulatory adherence, vehicle roadworthiness, driver certifications, and operational history.
5. **System Administrator**: User management, role-based access control (RBAC), system threshold configurations.

### 3. Functional Modules & Requirements Specification
- **FR-01: Vehicle Registration & Lifecycle Management**: Onboarding, VIN, Plate #, Model, Capacity, Fuel Type, Odometer, Status (`AVAILABLE`, `ASSIGNED`, `UNDER_MAINTENANCE`, `INACTIVE_RETIRED`).
- **FR-02: Driver Management & Eligibility Enforcement**: License validity, expiration checks, assignment eligibility.
- **FR-03: Vehicle Assignment & Guardrails**: Prevents assignment when vehicle is under maintenance or already allocated. Concurrency-safe allocation.
- **FR-04: Trip Management & Utilization Ingestion**: Source, destination, distance, start/end odometer, automated calculation of distance and vehicle utilization.
- **FR-05: Fuel Management & Anomaly Detection**: Refuel transaction logs, odometer checks, consumption rate (km/L), fuel economy anomaly detection.
- **FR-06: Maintenance Scheduling & Threshold Rules**: Multi-dimensional triggers (Mileage, Days/Time, Engine Hours), upcoming and overdue alerts.
- **FR-07: Maintenance & Repair Work Order Management**: Work order tracking, repair types, downtime tracking, labor and parts costs.
- **FR-08: Spare Parts Inventory & Cost Tracking**: Warehouse inventory, unit costs, stock deductions linked to work orders.
- **FR-09: Vehicle Availability & State Machine**: State transition governance, mutual exclusivity enforcement.
- **FR-10: Predictive Maintenance Recommendation Engine**: Algorithms evaluating average usage and projecting maintenance needs before critical failure.
- **FR-11: Fleet Analytics & Reporting Engine**: Utilization %, Availability %, Cost per km (CPK), downtime hours, fuel efficiency.
- **FR-12: Security, Audit Trail & Historical Accountability**: Tamper-evident logging of all state transitions, user tracking, and timestamps.
