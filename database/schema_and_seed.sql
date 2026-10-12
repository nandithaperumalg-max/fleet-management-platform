-- =====================================================================
-- FLEET MAINTENANCE & VEHICLE UTILIZATION MANAGEMENT PLATFORM
-- Database: fleet_management_db (MySQL 8.0+ Compatible)
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =====================================================================

CREATE DATABASE IF NOT EXISTS fleet_management_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fleet_management_db;

-- Disable foreign key checks during schema creation/reset
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. DROP EXISTING TABLES & VIEWS
-- ---------------------------------------------------------------------
DROP VIEW IF EXISTS vw_vehicle_availability;
DROP VIEW IF EXISTS vw_upcoming_overdue_maintenance;
DROP VIEW IF EXISTS vw_fleet_utilization_summary;
DROP VIEW IF EXISTS vw_fuel_efficiency_summary;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS maintenance_recommendations;
DROP TABLE IF EXISTS fuel_logs;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS work_order_parts;
DROP TABLE IF EXISTS maintenance_work_orders;
DROP TABLE IF EXISTS spare_parts;
DROP TABLE IF EXISTS vehicle_maintenance_plans;
DROP TABLE IF EXISTS maintenance_rules;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 2. USERS & RBAC TABLE
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('SUPER_ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'MECHANIC', 'DRIVER', 'AUDITOR') NOT NULL DEFAULT 'DISPATCHER',
    phone VARCHAR(20) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. VEHICLES TABLE (Master Fleet Registry)
-- ---------------------------------------------------------------------
CREATE TABLE vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vin VARCHAR(17) NOT NULL UNIQUE,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year_manufactured INT NOT NULL,
    vehicle_type ENUM('HEAVY_TRUCK', 'LIGHT_TRUCK', 'CARGO_VAN', 'BUS', 'PASSENGER_SUV') NOT NULL,
    capacity_kg DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    passenger_capacity INT NOT NULL DEFAULT 0,
    fuel_type ENUM('DIESEL', 'PETROL', 'CNG', 'ELECTRIC', 'HYBRID') NOT NULL DEFAULT 'DIESEL',
    current_odometer DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    acquisition_date DATE NOT NULL,
    acquisition_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status ENUM('AVAILABLE', 'ASSIGNED', 'UNDER_MAINTENANCE', 'INACTIVE_RETIRED') NOT NULL DEFAULT 'AVAILABLE',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vehicles_status (status),
    INDEX idx_vehicles_type (vehicle_type),
    INDEX idx_vehicles_plate (license_plate)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. DRIVERS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE drivers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    license_class ENUM('HEAVY_COMMERCIAL', 'MEDIUM_VEHICLE', 'LIGHT_VEHICLE', 'HAZMAT') NOT NULL,
    license_expiry_date DATE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    emergency_contact VARCHAR(100) NULL,
    employment_status ENUM('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_drivers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_drivers_status (employment_status),
    INDEX idx_drivers_license_expiry (license_expiry_date)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. MAINTENANCE RULES (Service Definitions & Thresholds)
-- ---------------------------------------------------------------------
CREATE TABLE maintenance_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_code VARCHAR(30) NOT NULL UNIQUE,
    service_name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    interval_km DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    interval_days INT NOT NULL DEFAULT 0,
    is_critical BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. VEHICLE MAINTENANCE PLANS (Threshold Tracking per Vehicle)
-- ---------------------------------------------------------------------
CREATE TABLE vehicle_maintenance_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    rule_id BIGINT NOT NULL,
    last_service_odometer DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    last_service_date DATE NOT NULL,
    next_due_odometer DECIMAL(12, 2) NOT NULL,
    next_due_date DATE NOT NULL,
    maintenance_status ENUM('NORMAL', 'UPCOMING', 'OVERDUE') NOT NULL DEFAULT 'NORMAL',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vmp_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT fk_vmp_rule FOREIGN KEY (rule_id) REFERENCES maintenance_rules(id) ON DELETE CASCADE,
    UNIQUE KEY uq_vehicle_rule (vehicle_id, rule_id),
    INDEX idx_vmp_status (maintenance_status),
    INDEX idx_vmp_next_due_km (next_due_odometer),
    INDEX idx_vmp_next_due_date (next_due_date)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. SPARE PARTS INVENTORY TABLE
-- ---------------------------------------------------------------------
CREATE TABLE spare_parts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_sku VARCHAR(50) NOT NULL UNIQUE,
    part_name VARCHAR(100) NOT NULL,
    category ENUM('BRAKES', 'TIRES', 'ENGINE', 'ELECTRICAL', 'LUBRICANTS', 'SUSPENSION', 'FILTERS', 'COOLING') NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 0,
    reorder_threshold INT NOT NULL DEFAULT 5,
    supplier_name VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parts_sku (part_sku),
    INDEX idx_parts_category (category)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. MAINTENANCE & REPAIR WORK ORDERS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE maintenance_work_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_no VARCHAR(50) NOT NULL UNIQUE,
    vehicle_id BIGINT NOT NULL,
    rule_id BIGINT NULL,
    service_type ENUM('PREVENTIVE', 'CORRECTIVE_REPAIR', 'ROUTINE_INSPECTION', 'EMERGENCY_BREAKDOWN') NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    description TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time DATETIME NULL,
    completion_time DATETIME NULL,
    downtime_hours DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    labor_hours DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    labor_rate_per_hour DECIMAL(8, 2) NOT NULL DEFAULT 50.00,
    labor_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    parts_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    assigned_mechanic_id BIGINT NULL,
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    created_by_user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wo_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_wo_rule FOREIGN KEY (rule_id) REFERENCES maintenance_rules(id) ON DELETE SET NULL,
    CONSTRAINT fk_wo_mechanic FOREIGN KEY (assigned_mechanic_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_wo_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_wo_status (status),
    INDEX idx_wo_vehicle_status (vehicle_id, status),
    INDEX idx_wo_scheduled_date (scheduled_date)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. WORK ORDER SPARE PARTS CONSUMPTION (N:M Junction)
-- ---------------------------------------------------------------------
CREATE TABLE work_order_parts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    part_id BIGINT NOT NULL,
    quantity_used INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_used * unit_price) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wop_wo FOREIGN KEY (work_order_id) REFERENCES maintenance_work_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_wop_part FOREIGN KEY (part_id) REFERENCES spare_parts(id) ON DELETE RESTRICT,
    INDEX idx_wop_wo (work_order_id),
    INDEX idx_wop_part (part_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. TRIPS TABLE (Dispatch & Vehicle Utilization Tracking)
-- ---------------------------------------------------------------------
CREATE TABLE trips (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_number VARCHAR(50) NOT NULL UNIQUE,
    vehicle_id BIGINT NOT NULL,
    driver_id BIGINT NOT NULL,
    origin VARCHAR(150) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    scheduled_start DATETIME NOT NULL,
    scheduled_end DATETIME NOT NULL,
    actual_start DATETIME NULL,
    actual_end DATETIME NULL,
    start_odometer DECIMAL(12, 2) NOT NULL,
    end_odometer DECIMAL(12, 2) NULL,
    distance_km DECIMAL(10, 2) GENERATED ALWAYS AS (
        CASE WHEN end_odometer IS NOT NULL AND end_odometer >= start_odometer 
             THEN end_odometer - start_odometer 
             ELSE NULL END
    ) STORED,
    cargo_weight_kg DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('DRAFT', 'DISPATCHED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    notes TEXT NULL,
    created_by_user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_trips_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_trips_driver FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_trips_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_trips_status (status),
    INDEX idx_trips_vehicle (vehicle_id),
    INDEX idx_trips_driver (driver_id),
    INDEX idx_trips_dates (scheduled_start, scheduled_end)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 11. FUEL TRANSACTIONS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE fuel_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    driver_id BIGINT NOT NULL,
    trip_id BIGINT NULL,
    transaction_date DATETIME NOT NULL,
    fuel_quantity_liters DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(12, 2) NOT NULL,
    odometer_at_refuel DECIMAL(12, 2) NOT NULL,
    station_name VARCHAR(100) NOT NULL,
    receipt_number VARCHAR(50) NULL,
    fuel_economy_kml DECIMAL(8, 2) NULL,
    is_anomaly_flag BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fuel_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_fuel_driver FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_fuel_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
    INDEX idx_fuel_vehicle (vehicle_id),
    INDEX idx_fuel_date (transaction_date),
    INDEX idx_fuel_anomaly (is_anomaly_flag)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 12. MAINTENANCE RECOMMENDATION ENGINE TABLE
-- ---------------------------------------------------------------------
CREATE TABLE maintenance_recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    rule_id BIGINT NULL,
    recommendation_type ENUM('PREVENTIVE_THRESHOLD', 'HIGH_UTILIZATION_WEAR', 'FUEL_INEFFICIENCY_ALERT', 'OVERDUE_SERVICE') NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    title VARCHAR(150) NOT NULL,
    reason TEXT NOT NULL,
    projected_due_date DATE NULL,
    projected_due_odometer DECIMAL(12, 2) NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_work_order_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rec_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rec_rule FOREIGN KEY (rule_id) REFERENCES maintenance_rules(id) ON DELETE SET NULL,
    CONSTRAINT fk_rec_wo FOREIGN KEY (resolved_work_order_id) REFERENCES maintenance_work_orders(id) ON DELETE SET NULL,
    INDEX idx_rec_vehicle_active (vehicle_id, is_resolved),
    INDEX idx_rec_severity (severity)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 13. AUDIT LOGS TABLE (Immutable Traceability)
-- ---------------------------------------------------------------------
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id BIGINT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE', 'STATUS_TRANSITION') NOT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    performed_by_user_id BIGINT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (performed_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_table_record (table_name, record_id),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;

-- =====================================================================
-- 14. REAL-TIME REPORTING & BUSINESS VIEWS
-- =====================================================================

-- VIEW 1: Dispatch Availability View (Real-time Guardrail)
CREATE OR REPLACE VIEW vw_vehicle_availability AS
SELECT 
    v.id AS vehicle_id,
    v.license_plate,
    v.vin,
    v.make,
    v.model,
    v.vehicle_type,
    v.capacity_kg,
    v.current_odometer,
    v.status AS vehicle_status,
    CASE 
        WHEN v.status != 'AVAILABLE' THEN 'UNAVAILABLE_STATUS'
        WHEN EXISTS (
            SELECT 1 FROM maintenance_work_orders wo 
            WHERE wo.vehicle_id = v.id AND wo.status IN ('SCHEDULED', 'IN_PROGRESS')
        ) THEN 'UNDER_ACTIVE_MAINTENANCE'
        WHEN EXISTS (
            SELECT 1 FROM vehicle_maintenance_plans vmp
            WHERE vmp.vehicle_id = v.id AND vmp.maintenance_status = 'OVERDUE'
        ) THEN 'OVERDUE_MAINTENANCE_LOCKOUT'
        ELSE 'DISPATCH_READY'
    END AS dispatch_eligibility
FROM vehicles v
WHERE v.is_deleted = FALSE;

-- VIEW 2: Upcoming & Overdue Maintenance Monitor
CREATE OR REPLACE VIEW vw_upcoming_overdue_maintenance AS
SELECT 
    vmp.id AS plan_id,
    v.id AS vehicle_id,
    v.license_plate,
    v.model,
    v.current_odometer,
    mr.service_code,
    mr.service_name,
    mr.is_critical,
    vmp.last_service_odometer,
    vmp.last_service_date,
    vmp.next_due_odometer,
    vmp.next_due_date,
    (vmp.next_due_odometer - v.current_odometer) AS km_remaining_until_service,
    DATEDIFF(vmp.next_due_date, CURRENT_DATE()) AS days_remaining_until_service,
    vmp.maintenance_status
FROM vehicle_maintenance_plans vmp
JOIN vehicles v ON vmp.vehicle_id = v.id
JOIN maintenance_rules mr ON vmp.rule_id = mr.id
WHERE v.status != 'INACTIVE_RETIRED';

-- VIEW 3: Fleet Utilization Summary
CREATE OR REPLACE VIEW vw_fleet_utilization_summary AS
SELECT 
    v.id AS vehicle_id,
    v.license_plate,
    v.vehicle_type,
    COUNT(t.id) AS total_trips_completed,
    COALESCE(SUM(t.distance_km), 0) AS total_distance_traveled_km,
    COALESCE(SUM(TIMESTAMPDIFF(HOUR, t.actual_start, t.actual_end)), 0) AS total_trip_hours,
    COALESCE((
        SELECT SUM(wo.downtime_hours) 
        FROM maintenance_work_orders wo 
        WHERE wo.vehicle_id = v.id AND wo.status = 'COMPLETED'
    ), 0) AS total_downtime_hours
FROM vehicles v
LEFT JOIN trips t ON v.id = t.vehicle_id AND t.status = 'COMPLETED'
WHERE v.is_deleted = FALSE
GROUP BY v.id, v.license_plate, v.vehicle_type;

-- VIEW 4: Fuel Efficiency & Cost Per Kilometer
CREATE OR REPLACE VIEW vw_fuel_efficiency_summary AS
SELECT 
    v.id AS vehicle_id,
    v.license_plate,
    v.make,
    v.model,
    COUNT(fl.id) AS total_refuels,
    COALESCE(SUM(fl.fuel_quantity_liters), 0) AS total_fuel_liters,
    COALESCE(SUM(fl.total_cost), 0) AS total_fuel_expense,
    COALESCE(AVG(fl.fuel_economy_kml), 0) AS avg_km_per_liter,
    COALESCE((
        SELECT SUM(wo.total_cost) 
        FROM maintenance_work_orders wo 
        WHERE wo.vehicle_id = v.id AND wo.status = 'COMPLETED'
    ), 0) AS total_maintenance_expense
FROM vehicles v
LEFT JOIN fuel_logs fl ON v.id = fl.vehicle_id
WHERE v.is_deleted = FALSE
GROUP BY v.id, v.license_plate, v.make, v.model;

-- =====================================================================
-- 15. SEED DATA (Ready for Testing & Verification)
-- =====================================================================

-- 15.1 Users
INSERT INTO users (id, username, email, password_hash, full_name, role, phone) VALUES
(1, 'superadmin', 'admin@fleetmanager.com', '$2b$10$wEkgk5JqT3hE5xXN4zY/9.a/gMdfHlB7f8u.Tq4G7x5kQe8U8gG3G', 'Alex Mercer (Admin)', 'SUPER_ADMIN', '+1-555-0100'),
(2, 'dispatcher1', 'dispatch@fleetmanager.com', '$2b$10$wEkgk5JqT3hE5xXN4zY/9.a/gMdfHlB7f8u.Tq4G7x5kQe8U8gG3G', 'Sarah Connor (Dispatch)', 'DISPATCHER', '+1-555-0101'),
(3, 'mechanic_lead', 'workshop@fleetmanager.com', '$2b$10$wEkgk5JqT3hE5xXN4zY/9.a/gMdfHlB7f8u.Tq4G7x5kQe8U8gG3G', 'Marcus Vance (Lead Mechanic)', 'MECHANIC', '+1-555-0102'),
(4, 'driver_john', 'john.doe@fleetmanager.com', '$2b$10$wEkgk5JqT3hE5xXN4zY/9.a/gMdfHlB7f8u.Tq4G7x5kQe8U8gG3G', 'John Doe (Heavy Driver)', 'DRIVER', '+1-555-0103'),
(5, 'driver_jane', 'jane.smith@fleetmanager.com', '$2b$10$wEkgk5JqT3hE5xXN4zY/9.a/gMdfHlB7f8u.Tq4G7x5kQe8U8gG3G', 'Jane Smith (Van Driver)', 'DRIVER', '+1-555-0104'),
(6, 'driver_carlos', 'carlos.r@fleetmanager.com', '$2b$10$wEkgk5JqT3hE5xXN4zY/9.a/gMdfHlB7f8u.Tq4G7x5kQe8U8gG3G', 'Carlos Ray (Bus Driver)', 'DRIVER', '+1-555-0105');

-- 15.2 Drivers
INSERT INTO drivers (id, user_id, license_number, license_class, license_expiry_date, phone, emergency_contact, employment_status) VALUES
(1, 4, 'DL-NY-982341', 'HEAVY_COMMERCIAL', '2028-12-31', '+1-555-0103', 'Mary Doe (+1-555-0991)', 'ACTIVE'),
(2, 5, 'DL-IL-554210', 'MEDIUM_VEHICLE', '2027-08-15', '+1-555-0104', 'Robert Smith (+1-555-0992)', 'ACTIVE'),
(3, 6, 'DL-CA-119842', 'HEAVY_COMMERCIAL', '2026-11-20', '+1-555-0105', 'Elena Ray (+1-555-0993)', 'ACTIVE');

-- 15.3 Vehicles
INSERT INTO vehicles (id, vin, license_plate, make, model, year_manufactured, vehicle_type, capacity_kg, passenger_capacity, fuel_type, current_odometer, acquisition_date, acquisition_cost, status) VALUES
(1, '1HGCR2F83HA001001', 'FL-TRK-101', 'Freightliner', 'Cascadia 126', 2022, 'HEAVY_TRUCK', 24000.00, 2, 'DIESEL', 84500.00, '2022-03-15', 145000.00, 'AVAILABLE'),
(2, '1FT8W3BT4KE002002', 'FL-VAN-202', 'Ford', 'Transit 350 HD', 2023, 'CARGO_VAN', 2100.00, 3, 'DIESEL', 31200.00, '2023-01-20', 52000.00, 'ASSIGNED'),
(3, '3AKJHHDR5LS003003', 'FL-BUS-303', 'Volvo', '9700 Motorcoach', 2021, 'BUS', 5500.00, 56, 'DIESEL', 142000.00, '2021-06-10', 380000.00, 'UNDER_MAINTENANCE'),
(4, '2WKDA7E99MH004004', 'FL-TRK-104', 'Kenworth', 'T680 Next Gen', 2023, 'HEAVY_TRUCK', 25000.00, 2, 'DIESEL', 49800.00, '2023-05-11', 158000.00, 'AVAILABLE'),
(5, '4UZAA2BC1NC005005', 'FL-VAN-205', 'Mercedes-Benz', 'Sprinter 2500', 2020, 'CARGO_VAN', 1800.00, 2, 'DIESEL', 198500.00, '2020-02-14', 48000.00, 'INACTIVE_RETIRED');

-- 15.4 Maintenance Rules
INSERT INTO maintenance_rules (id, service_code, service_name, description, interval_km, interval_days, is_critical) VALUES
(1, 'PM-OIL-FILTER', 'Engine Oil & Filter Service', 'Complete synthetic oil replacement, oil filter, and lube chassis.', 10000.00, 90, TRUE),
(2, 'PM-BRAKE-INSP', 'Brake Lining & Pad Inspection', 'Comprehensive thickness inspection of front & rear friction surfaces and calipers.', 20000.00, 180, TRUE),
(3, 'PM-TIRE-ROT', 'Tire Rotation & Pressure Alignment', 'Cross-rotate drive and steer axle tires, laser alignment.', 15000.00, 120, FALSE),
(4, 'PM-COOLING-FLUSH', 'Cooling System Radiator Flush', 'Coolant drain, chemical flush, pressure test, refill with organic acid technology coolant.', 50000.00, 365, TRUE);

-- 15.5 Vehicle Maintenance Plans
INSERT INTO vehicle_maintenance_plans (id, vehicle_id, rule_id, last_service_odometer, last_service_date, next_due_odometer, next_due_date, maintenance_status) VALUES
(1, 1, 1, 80000.00, '2026-06-01', 90000.00, '2026-09-01', 'UPCOMING'),
(2, 1, 2, 70000.00, '2026-03-15', 90000.00, '2026-09-15', 'UPCOMING'),
(3, 2, 1, 30000.00, '2026-07-10', 40000.00, '2026-10-10', 'NORMAL'),
(4, 3, 2, 120000.00, '2026-01-10', 140000.00, '2026-07-10', 'OVERDUE'),
(5, 4, 1, 40000.00, '2026-05-18', 50000.00, '2026-08-18', 'OVERDUE');

-- 15.6 Spare Parts Inventory
INSERT INTO spare_parts (id, part_sku, part_name, category, unit_cost, stock_quantity, reorder_threshold, supplier_name) VALUES
(1, 'SKU-OIL-SYN15W40', 'Mobil Delvac 15W-40 Synthetic Oil (Gallon)', 'LUBRICANTS', 28.50, 48, 15, 'ExxonMobil Commercial'),
(2, 'SKU-FLT-OIL-HD', 'Heavy Duty Oil Filter Element', 'FILTERS', 18.25, 34, 10, 'Donaldson Filters'),
(3, 'SKU-BRK-PAD-TRK', 'Front Air Disc Brake Pad Kit', 'BRAKES', 145.00, 12, 6, 'Bendix Commercial'),
(4, 'SKU-TIRE-295-80', 'Michelin X Line Energy D 295/75R22.5', 'TIRES', 485.00, 8, 4, 'Michelin Fleet Direct'),
(5, 'SKU-COOL-5050', 'Peak Fleet Heavy Duty 50/50 Coolant (Gallon)', 'COOLING', 14.75, 26, 8, 'Peak Commercial Chem');

-- 15.7 Maintenance Work Orders
INSERT INTO maintenance_work_orders (id, work_order_no, vehicle_id, rule_id, service_type, priority, description, scheduled_date, start_time, completion_time, downtime_hours, labor_hours, labor_rate_per_hour, labor_cost, parts_cost, total_cost, assigned_mechanic_id, status, created_by_user_id) VALUES
(1, 'WO-2026-001', 3, 2, 'PREVENTIVE', 'HIGH', 'Brake pad replacement and hydraulic pressure calibration due to overdue alert.', '2026-09-16', '2026-09-17 08:30:00', NULL, 0.00, 3.5, 60.00, 210.00, 290.00, 500.00, 3, 'IN_PROGRESS', 1),
(2, 'WO-2026-002', 1, 1, 'PREVENTIVE', 'MEDIUM', 'Routine 80k km oil and filter change completed.', '2026-06-01', '2026-06-01 09:00:00', '2026-06-01 13:00:00', 4.00, 2.0, 50.00, 100.00, 103.75, 203.75, 3, 'COMPLETED', 1);

-- 15.8 Work Order Parts Consumption
INSERT INTO work_order_parts (id, work_order_id, part_id, quantity_used, unit_price) VALUES
(1, 1, 3, 2, 145.00), -- 2 Brake Pad Kits for Bus
(2, 2, 1, 3, 28.50),  -- 3 Gallons Oil
(3, 2, 2, 1, 18.25);  -- 1 HD Oil Filter

-- 15.9 Trips
INSERT INTO trips (id, trip_number, vehicle_id, driver_id, origin, destination, scheduled_start, scheduled_end, actual_start, actual_end, start_odometer, end_odometer, cargo_weight_kg, status, created_by_user_id) VALUES
(1, 'TRP-2026-8801', 1, 1, 'Chicago Central Logistics Hub', 'Detroit Distribution Depot', '2026-08-10 06:00:00', '2026-08-10 14:00:00', '2026-08-10 06:15:00', '2026-08-10 13:45:00', 84020.00, 84500.00, 18500.00, 'COMPLETED', 2),
(2, 'TRP-2026-8802', 2, 2, 'O\'Hare Air Cargo Bay 4', 'Milwaukee Fast Logistics', '2026-09-17 07:00:00', '2026-09-17 18:00:00', '2026-09-17 07:10:00', NULL, 31200.00, NULL, 1200.00, 'IN_TRANSIT', 2),
(3, 'TRP-2026-8803', 4, 1, 'Indianapolis Regional Dock', 'Columbus Gateway', '2026-09-18 08:00:00', '2026-09-18 16:00:00', NULL, NULL, 49800.00, NULL, 22000.00, 'DRAFT', 2);

-- 15.10 Fuel Logs
INSERT INTO fuel_logs (id, vehicle_id, driver_id, trip_id, transaction_date, fuel_quantity_liters, unit_price, total_cost, odometer_at_refuel, station_name, receipt_number, fuel_economy_kml, is_anomaly_flag) VALUES
(1, 1, 1, 1, '2026-08-10 13:30:00', 145.50, 1.25, 181.88, 84500.00, 'Pilot Flying J Travel Plaza #412', 'RCP-998124', 3.30, FALSE),
(2, 2, 2, NULL, '2026-09-15 11:15:00', 78.00, 1.30, 101.40, 31190.00, 'Love\'s Travel Stop #654', 'RCP-998210', 8.20, FALSE);

-- 15.11 Maintenance Recommendations
INSERT INTO maintenance_recommendations (id, vehicle_id, rule_id, recommendation_type, severity, title, reason, projected_due_date, projected_due_odometer, is_resolved) VALUES
(1, 4, 1, 'OVERDUE_SERVICE', 'CRITICAL', 'Engine Oil Service Overdue on FL-TRK-104', 'Vehicle has reached 49,800 km, surpassing the 90-day threshold since last service on May 18.', '2026-08-18', 50000.00, FALSE),
(2, 1, 2, 'PREVENTIVE_THRESHOLD', 'HIGH', 'Brake Lining Inspection Approaching for FL-TRK-101', 'Vehicle is at 84,500 km. Scheduled 90,000 km brake inspection is within 5,500 km.', '2026-09-15', 90000.00, FALSE);

-- 15.12 Audit Logs
INSERT INTO audit_logs (id, table_name, record_id, action, old_values, new_values, performed_by_user_id, ip_address) VALUES
(1, 'trips', 2, 'STATUS_TRANSITION', '{"status": "DISPATCHED"}', '{"status": "IN_TRANSIT"}', 2, '192.168.1.45'),
(2, 'vehicles', 2, 'STATUS_TRANSITION', '{"status": "AVAILABLE"}', '{"status": "ASSIGNED"}', 2, '192.168.1.45'),
(3, 'vehicles', 3, 'STATUS_TRANSITION', '{"status": "AVAILABLE"}', '{"status": "UNDER_MAINTENANCE"}', 3, '192.168.1.88'),
(4, 'maintenance_work_orders', 1, 'INSERT', NULL, '{"work_order_no": "WO-2026-001", "status": "IN_PROGRESS"}', 1, '192.168.1.10');

-- =====================================================================
-- END OF SCHEMA & SEED SCRIPT
-- =====================================================================
