-- =====================================================================
-- FLEET MAINTENANCE & VEHICLE UTILIZATION MANAGEMENT PLATFORM
-- Schema Upgrade V2: Dynamic Vehicle Categories, Notifications & Expanded Fleet Data
-- Target Database: fleet_management_db (MySQL 8.0+)
-- =====================================================================

USE fleet_management_db;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. VEHICLE CATEGORIES TABLE (Dynamic Hierarchy)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_code (category_code),
    INDEX idx_category_active (is_active)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. NOTIFICATIONS TABLE (Event-Driven & Priority Escalation)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_user_id BIGINT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('INFO', 'LOW', 'MEDIUM', 'HIGH', 'WARNING', 'CRITICAL') NOT NULL DEFAULT 'INFO',
    event_category VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user_read (recipient_user_id, is_read),
    INDEX idx_notif_priority (priority),
    INDEX idx_notif_created (created_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. ENHANCE VEHICLES TABLE (Link to Dynamic Categories)
-- ---------------------------------------------------------------------
-- Add category_id if not present
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'fleet_management_db' 
  AND TABLE_NAME = 'vehicles' 
  AND COLUMN_NAME = 'category_id';

SET @alter_query = IF(@col_exists = 0, 
    'ALTER TABLE vehicles ADD COLUMN category_id BIGINT NULL AFTER id, ADD CONSTRAINT fk_vehicles_category FOREIGN KEY (category_id) REFERENCES vehicle_categories(id) ON DELETE SET NULL', 
    'SELECT 1');
PREPARE stmt FROM @alter_query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 4. SEED DYNAMIC CATEGORIES
-- ---------------------------------------------------------------------
INSERT INTO vehicle_categories (category_code, name, description, is_active) VALUES
('TRUCKS', 'Heavy & Medium Commercial Trucks', 'Long-haul freight, distribution, and inter-city bulk cargo carriers', TRUE),
('VANS', 'Cargo & Delivery Vans', 'Last-mile urban delivery and express parcel distribution vans', TRUE),
('SUVS', 'Sport Utility Vehicles (SUVs)', 'Field operations, site supervision, and premium executive transit', TRUE),
('CARS', 'Sedans & Compact Cars', 'Staff corporate mobility and administrative pool transport', TRUE),
('BUSES', 'Passenger & Shuttle Buses', 'Workforce transit, crew shuttles, and passenger coaches', TRUE),
('EVS', 'Electric Vehicles (EV Fleet)', 'Eco-friendly zero-emission electric cargo vans and urban commuters', TRUE),
('TWO_WHEELERS', 'Two Wheelers & Motorcycles', 'Rapid document dispatch, urban food logistics, and courier units', TRUE),
('SPECIAL_PURPOSE', 'Special Purpose Vehicles', 'Refrigerated cold-chain transport, breakdown recovery tow trucks, and mobile maintenance units', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

-- ---------------------------------------------------------------------
-- 5. POPULATE INITIAL CATEGORY MAPPINGS FOR EXISTING VEHICLES
-- ---------------------------------------------------------------------
UPDATE vehicles SET category_id = (SELECT id FROM vehicle_categories WHERE category_code = 'TRUCKS') 
WHERE vehicle_type IN ('HEAVY_TRUCK', 'LIGHT_TRUCK') AND category_id IS NULL;

UPDATE vehicles SET category_id = (SELECT id FROM vehicle_categories WHERE category_code = 'VANS') 
WHERE vehicle_type = 'CARGO_VAN' AND category_id IS NULL;

UPDATE vehicles SET category_id = (SELECT id FROM vehicle_categories WHERE category_code = 'BUSES') 
WHERE vehicle_type = 'BUS' AND category_id IS NULL;

UPDATE vehicles SET category_id = (SELECT id FROM vehicle_categories WHERE category_code = 'SUVS') 
WHERE vehicle_type = 'PASSENGER_SUV' AND category_id IS NULL;

-- ---------------------------------------------------------------------
-- 6. SEED EXTENDED REALISTIC FLEET (20 VEHICLES TOTAL ACROSS STATUSES)
-- ---------------------------------------------------------------------
INSERT INTO vehicles (vin, license_plate, make, model, year_manufactured, vehicle_type, category_id, capacity_kg, passenger_capacity, fuel_type, current_odometer, acquisition_date, acquisition_cost, status, is_deleted) VALUES
('1FTFW1ED8MFC10001', 'KA-01-EQ-9011', 'Tata Motors', 'Prima 4028.S', 2022, 'HEAVY_TRUCK', (SELECT id FROM vehicle_categories WHERE category_code = 'TRUCKS'), 28000.00, 2, 'DIESEL', 84500.00, '2022-04-15', 3800000.00, 'AVAILABLE', FALSE),
('1FTFW1ED8MFC10002', 'KA-01-EQ-9012', 'Tata Motors', 'Signa 4825.TK', 2023, 'HEAVY_TRUCK', (SELECT id FROM vehicle_categories WHERE category_code = 'TRUCKS'), 35000.00, 2, 'DIESEL', 49850.00, '2023-01-10', 4400000.00, 'UNDER_MAINTENANCE', FALSE),
('1FTFW1ED8MFC10003', 'KA-04-MA-1234', 'Ashok Leyland', 'Ecomet 1215', 2021, 'LIGHT_TRUCK', (SELECT id FROM vehicle_categories WHERE category_code = 'TRUCKS'), 11500.00, 3, 'DIESEL', 112400.00, '2021-06-20', 2100000.00, 'AVAILABLE', FALSE),
('1FTFW1ED8MFC10004', 'KA-04-MA-5678', 'Ashok Leyland', 'Boss 1415 HB', 2022, 'LIGHT_TRUCK', (SELECT id FROM vehicle_categories WHERE category_code = 'TRUCKS'), 14000.00, 3, 'DIESEL', 76200.00, '2022-09-12', 2450000.00, 'ASSIGNED', FALSE),
('1FTFW1ED8MFC10005', 'KA-05-NB-3344', 'Mahindra', 'Bolero Maxi Truck', 2022, 'LIGHT_TRUCK', (SELECT id FROM vehicle_categories WHERE category_code = 'TRUCKS'), 1700.00, 2, 'DIESEL', 63500.00, '2022-03-18', 780000.00, 'AVAILABLE', FALSE),
('1FTFW1ED8MFC10006', 'KA-05-NB-7788', 'Mahindra', 'Bolero Pik-Up', 2023, 'LIGHT_TRUCK', (SELECT id FROM vehicle_categories WHERE category_code = 'TRUCKS'), 2000.00, 2, 'DIESEL', 31200.00, '2023-08-05', 890000.00, 'AVAILABLE', FALSE),

('1FTFW1ED8MFC10007', 'KA-02-CV-4411', 'Tata Motors', 'Winger Cargo', 2022, 'CARGO_VAN', (SELECT id FROM vehicle_categories WHERE category_code = 'VANS'), 1680.00, 2, 'DIESEL', 54200.00, '2022-05-11', 1350000.00, 'AVAILABLE', FALSE),
('1FTFW1ED8MFC10008', 'KA-02-CV-4422', 'Force Motors', 'Urbania Delivery', 2023, 'CARGO_VAN', (SELECT id FROM vehicle_categories WHERE category_code = 'VANS'), 2200.00, 3, 'DIESEL', 42100.00, '2023-04-19', 2400000.00, 'ASSIGNED', FALSE),
('1FTFW1ED8MFC10009', 'KA-02-CV-4433', 'Tata Motors', 'Ace Gold EV', 2023, 'CARGO_VAN', (SELECT id FROM vehicle_categories WHERE category_code = 'EVS'), 1000.00, 2, 'ELECTRIC', 19800.00, '2023-11-25', 950000.00, 'AVAILABLE', FALSE),
('1FTFW1ED8MFC10010', 'KA-03-EV-1001', 'Euler Motors', 'HiLoad EV', 2024, 'CARGO_VAN', (SELECT id FROM vehicle_categories WHERE category_code = 'EVS'), 688.00, 1, 'ELECTRIC', 11400.00, '2024-02-14', 850000.00, 'AVAILABLE', FALSE),

('1FTFW1ED8MFC10011', 'KA-01-SP-2020', 'Toyota', 'Innova Crysta', 2021, 'PASSENGER_SUV', (SELECT id FROM vehicle_categories WHERE category_code = 'SUVS'), 850.00, 7, 'DIESEL', 96400.00, '2021-08-10', 2650000.00, 'AVAILABLE', FALSE),
('1FTFW1ED8MFC10012', 'KA-01-SP-2021', 'Mahindra', 'Scorpio-N', 2023, 'PASSENGER_SUV', (SELECT id FROM vehicle_categories WHERE category_code = 'SUVS'), 750.00, 7, 'DIESEL', 38900.00, '2023-06-22', 2100000.00, 'ASSIGNED', FALSE),
('1FTFW1ED8MFC10013', 'KA-01-CR-3001', 'Maruti Suzuki', 'Dzire Tour S', 2022, 'PASSENGER_SUV', (SELECT id FROM vehicle_categories WHERE category_code = 'CARS'), 450.00, 5, 'CNG', 78300.00, '2022-07-14', 750000.00, 'AVAILABLE', FALSE),
('1FTFW1ED8MFC10014', 'KA-01-CR-3002', 'Hyundai', 'Aura Prime', 2023, 'PASSENGER_SUV', (SELECT id FROM vehicle_categories WHERE category_code = 'CARS'), 450.00, 5, 'PETROL', 32400.00, '2023-05-30', 820000.00, 'AVAILABLE', FALSE),

('1FTFW1ED8MFC10015', 'KA-04-BS-6001', 'Volvo', '9600 Multi-Axle', 2020, 'BUS', (SELECT id FROM vehicle_categories WHERE category_code = 'BUSES'), 6000.00, 49, 'DIESEL', 210500.00, '2020-03-01', 11500000.00, 'UNDER_MAINTENANCE', FALSE),
('1FTFW1ED8MFC10016', 'KA-04-BS-6002', 'Tata Motors', 'Starbus Ultra', 2022, 'BUS', (SELECT id FROM vehicle_categories WHERE category_code = 'BUSES'), 4500.00, 36, 'DIESEL', 89400.00, '2022-02-15', 3800000.00, 'AVAILABLE', FALSE),

('1FTFW1ED8MFC10017', 'KA-05-TW-8001', 'Hero MotoCorp', 'Splendor Plus Super', 2022, 'LIGHT_TRUCK', (SELECT id FROM vehicle_categories WHERE category_code = 'TWO_WHEELERS'), 150.00, 2, 'PETROL', 34200.00, '2022-01-10', 85000.00, 'AVAILABLE', FALSE),
('1FTFW1ED8MFC10018', 'KA-05-TW-8002', 'Ather Energy', '450X Gen 3', 2023, 'LIGHT_TRUCK', (SELECT id FROM vehicle_categories WHERE category_code = 'TWO_WHEELERS'), 140.00, 2, 'ELECTRIC', 15800.00, '2023-09-01', 145000.00, 'AVAILABLE', FALSE),

('1FTFW1ED8MFC10019', 'KA-01-SP-9999', 'Ashok Leyland', 'Recovery Crane 1618', 2018, 'HEAVY_TRUCK', (SELECT id FROM vehicle_categories WHERE category_code = 'SPECIAL_PURPOSE'), 16000.00, 3, 'DIESEL', 178200.00, '2018-11-20', 4200000.00, 'INACTIVE_RETIRED', FALSE),
('1FTFW1ED8MFC10020', 'KA-01-SP-8888', 'Tata Motors', 'SFC 407 Reefer Cold', 2021, 'LIGHT_TRUCK', (SELECT id FROM vehicle_categories WHERE category_code = 'SPECIAL_PURPOSE'), 3500.00, 2, 'DIESEL', 104300.00, '2021-10-15', 1850000.00, 'AVAILABLE', FALSE)
ON DUPLICATE KEY UPDATE 
    model = VALUES(model), 
    category_id = VALUES(category_id), 
    current_odometer = VALUES(current_odometer),
    status = VALUES(status);

-- ---------------------------------------------------------------------
-- 7. SEED INITIAL NOTIFICATIONS
-- ---------------------------------------------------------------------
INSERT INTO notifications (recipient_user_id, title, message, priority, event_category, is_read) VALUES
(2, 'Preventive Maintenance Due Soon', 'Vehicle KA-01-EQ-9012 (Tata Signa 4825.TK) has reached 49,850 km and is due for Comprehensive Service at 50,000 km (150 km remaining).', 'HIGH', 'MAINTENANCE', FALSE),
(2, 'Spare Parts Below Reorder Level', 'Engine Oil 15W-40 (SKU: OIL-SYN-15W40) stock has fallen to 6 units (Threshold: 10 units). Please generate a procurement purchase order.', 'WARNING', 'INVENTORY', FALSE),
(2, 'Driver Commercial License Expiring', 'Driver Rajesh Kumar (License: DL-0420110023481) commercial license expires in 25 days (2026-10-24). Re-verification required before next month assignment.', 'WARNING', 'COMPLIANCE', FALSE),
(1, 'System Audit Alert', 'Super Administrator account accessed system configuration settings.', 'INFO', 'AUDIT', TRUE),
(2, 'Fuel Anomaly Flagged', 'Trip TRP-2026-003 refuel logged 62 liters with an abnormal efficiency drop of 24.5% below historical baseline.', 'CRITICAL', 'FUEL', FALSE);

-- ---------------------------------------------------------------------
-- 8. REBUILD/REFRESH VIEWS FOR COMPLETE INTEGRITY
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_vehicle_availability AS
SELECT 
    v.id AS vehicle_id,
    v.license_plate,
    v.vin,
    v.make,
    v.model,
    vc.category_code,
    vc.name AS category_name,
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
LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
WHERE v.is_deleted = FALSE;
