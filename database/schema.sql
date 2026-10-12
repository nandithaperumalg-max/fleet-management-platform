-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: fleet_management_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `table_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` bigint NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_values` text COLLATE utf8mb4_unicode_ci,
  `new_values` text COLLATE utf8mb4_unicode_ci,
  `performed_by_user_id` bigint DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_audit_user` (`performed_by_user_id`),
  KEY `idx_audit_table_record` (`table_name`,`record_id`),
  KEY `idx_audit_created` (`created_at`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`performed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `complaints`
--

DROP TABLE IF EXISTS `complaints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaints` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `resolution` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `submitted_at` datetime(6) DEFAULT NULL,
  `trip_id` bigint DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `vehicle_id` bigint DEFAULT NULL,
  `submitted_by_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKpkuvlcsxsw1nfu9ad2fk75n64` (`submitted_by_id`),
  CONSTRAINT `FKpkuvlcsxsw1nfu9ad2fk75n64` FOREIGN KEY (`submitted_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `license_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `license_class` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `license_expiry_date` date NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `emergency_contact` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employment_status` enum('ACTIVE','ON_LEAVE','SUSPENDED','TERMINATED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `license_number` (`license_number`),
  KEY `idx_drivers_status` (`employment_status`),
  KEY `idx_drivers_license_expiry` (`license_expiry_date`),
  CONSTRAINT `fk_drivers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fuel_logs`
--

DROP TABLE IF EXISTS `fuel_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fuel_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `vehicle_id` bigint NOT NULL,
  `driver_id` bigint NOT NULL,
  `trip_id` bigint DEFAULT NULL,
  `transaction_date` datetime NOT NULL,
  `fuel_quantity_liters` double NOT NULL,
  `unit_price` double NOT NULL,
  `total_cost` double NOT NULL,
  `odometer_at_refuel` double NOT NULL,
  `station_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receipt_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fuel_economy_kml` double DEFAULT NULL,
  `is_anomaly_flag` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_fuel_driver` (`driver_id`),
  KEY `fk_fuel_trip` (`trip_id`),
  KEY `idx_fuel_vehicle` (`vehicle_id`),
  KEY `idx_fuel_date` (`transaction_date`),
  KEY `idx_fuel_anomaly` (`is_anomaly_flag`),
  CONSTRAINT `fk_fuel_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_fuel_trip` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_fuel_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `maintenance_recommendations`
--

DROP TABLE IF EXISTS `maintenance_recommendations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_recommendations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `vehicle_id` bigint NOT NULL,
  `rule_id` bigint DEFAULT NULL,
  `recommendation_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` enum('CRITICAL','HIGH','INFO','LOW','MEDIUM','WARNING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `projected_due_date` date DEFAULT NULL,
  `projected_due_odometer` double DEFAULT NULL,
  `is_resolved` tinyint(1) NOT NULL DEFAULT '0',
  `resolved_work_order_id` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `current_metric_value` double DEFAULT NULL,
  `threshold_metric_value` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_rec_rule` (`rule_id`),
  KEY `fk_rec_wo` (`resolved_work_order_id`),
  KEY `idx_rec_vehicle_active` (`vehicle_id`,`is_resolved`),
  KEY `idx_rec_severity` (`severity`),
  CONSTRAINT `fk_rec_rule` FOREIGN KEY (`rule_id`) REFERENCES `maintenance_rules` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rec_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rec_wo` FOREIGN KEY (`resolved_work_order_id`) REFERENCES `maintenance_work_orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `maintenance_rules`
--

DROP TABLE IF EXISTS `maintenance_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_rules` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `service_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `interval_km` double NOT NULL,
  `interval_days` int NOT NULL DEFAULT '0',
  `is_critical` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `service_code` (`service_code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `maintenance_work_orders`
--

DROP TABLE IF EXISTS `maintenance_work_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_work_orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `work_order_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_id` bigint NOT NULL,
  `rule_id` bigint DEFAULT NULL,
  `service_type` enum('CORRECTIVE_REPAIR','EMERGENCY_BREAKDOWN','PREVENTIVE','ROUTINE_INSPECTION') COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('CRITICAL','HIGH','INFO','LOW','MEDIUM','WARNING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `scheduled_date` date NOT NULL,
  `start_time` datetime DEFAULT NULL,
  `completion_time` datetime DEFAULT NULL,
  `downtime_hours` double NOT NULL,
  `labor_hours` double NOT NULL,
  `labor_rate_per_hour` double NOT NULL,
  `labor_cost` double NOT NULL,
  `parts_cost` double NOT NULL,
  `total_cost` double NOT NULL,
  `assigned_mechanic_id` bigint DEFAULT NULL,
  `status` enum('CANCELLED','COMPLETED','IN_PROGRESS','SCHEDULED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by_user_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `work_order_no` (`work_order_no`),
  KEY `fk_wo_rule` (`rule_id`),
  KEY `fk_wo_mechanic` (`assigned_mechanic_id`),
  KEY `fk_wo_creator` (`created_by_user_id`),
  KEY `idx_wo_status` (`status`),
  KEY `idx_wo_vehicle_status` (`vehicle_id`,`status`),
  KEY `idx_wo_scheduled_date` (`scheduled_date`),
  CONSTRAINT `fk_wo_creator` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_wo_mechanic` FOREIGN KEY (`assigned_mechanic_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_wo_rule` FOREIGN KEY (`rule_id`) REFERENCES `maintenance_rules` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_wo_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `recipient_user_id` bigint DEFAULT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('CRITICAL','HIGH','INFO','LOW','MEDIUM','WARNING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `target_audience` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notif_user_read` (`recipient_user_id`,`is_read`),
  KEY `idx_notif_priority` (`priority`),
  KEY `idx_notif_created` (`created_at`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spare_parts`
--

DROP TABLE IF EXISTS `spare_parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spare_parts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `part_sku` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `part_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_cost` double NOT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `reorder_threshold` int NOT NULL DEFAULT '5',
  `supplier_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `part_sku` (`part_sku`),
  KEY `idx_parts_sku` (`part_sku`),
  KEY `idx_parts_category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trip_rejection_requests`
--

DROP TABLE IF EXISTS `trip_rejection_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trip_rejection_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_status` enum('APPROVED','PENDING','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `requested_at` datetime(6) NOT NULL,
  `review_notes` text COLLATE utf8mb4_unicode_ci,
  `reviewed_at` datetime(6) DEFAULT NULL,
  `driver_id` bigint NOT NULL,
  `reviewed_by` bigint DEFAULT NULL,
  `trip_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKcpdy8jxr4mie368f49f4c5cfj` (`driver_id`),
  KEY `FKrb12x5p6ciixqxck5et6j91u9` (`reviewed_by`),
  KEY `FKf44uux8trmrydxbcduwwxhg2u` (`trip_id`),
  CONSTRAINT `FKcpdy8jxr4mie368f49f4c5cfj` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`),
  CONSTRAINT `FKf44uux8trmrydxbcduwwxhg2u` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`),
  CONSTRAINT `FKrb12x5p6ciixqxck5et6j91u9` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trips`
--

DROP TABLE IF EXISTS `trips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trips` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `trip_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_id` bigint NOT NULL,
  `driver_id` bigint NOT NULL,
  `origin` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `destination` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scheduled_start` datetime NOT NULL,
  `scheduled_end` datetime NOT NULL,
  `actual_start` datetime DEFAULT NULL,
  `actual_end` datetime DEFAULT NULL,
  `start_odometer` double DEFAULT NULL,
  `end_odometer` double DEFAULT NULL,
  `distance_km` double DEFAULT NULL,
  `cargo_weight_kg` double DEFAULT NULL,
  `status` enum('ASSIGNED','CANCELLED','COMPLETED','DRAFT','IN_PROGRESS','IN_TRANSIT','PLANNED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by_user_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `trip_number` (`trip_number`),
  KEY `fk_trips_creator` (`created_by_user_id`),
  KEY `idx_trips_status` (`status`),
  KEY `idx_trips_vehicle` (`vehicle_id`),
  KEY `idx_trips_driver` (`driver_id`),
  KEY `idx_trips_dates` (`scheduled_start`,`scheduled_end`),
  CONSTRAINT `fk_trips_creator` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_trips_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_trips_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('ADMIN','AUDITOR','DISPATCHER','DRIVER','FLEET_MANAGER','MECHANIC','STAFF','SUPER_ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_categories`
--

DROP TABLE IF EXISTS `vehicle_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_code` (`category_code`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_category_code` (`category_code`),
  KEY `idx_category_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_maintenance_plans`
--

DROP TABLE IF EXISTS `vehicle_maintenance_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_maintenance_plans` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `vehicle_id` bigint NOT NULL,
  `rule_id` bigint NOT NULL,
  `last_service_odometer` double NOT NULL,
  `last_service_date` date NOT NULL,
  `next_due_odometer` double NOT NULL,
  `next_due_date` date NOT NULL,
  `maintenance_status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_vehicle_rule` (`vehicle_id`,`rule_id`),
  KEY `fk_vmp_rule` (`rule_id`),
  KEY `idx_vmp_status` (`maintenance_status`),
  KEY `idx_vmp_next_due_km` (`next_due_odometer`),
  KEY `idx_vmp_next_due_date` (`next_due_date`),
  CONSTRAINT `fk_vmp_rule` FOREIGN KEY (`rule_id`) REFERENCES `maintenance_rules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vmp_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint DEFAULT NULL,
  `vin` varchar(17) COLLATE utf8mb4_unicode_ci NOT NULL,
  `license_plate` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `make` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year_manufactured` int NOT NULL,
  `vehicle_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `capacity_kg` double DEFAULT NULL,
  `passenger_capacity` int NOT NULL DEFAULT '0',
  `fuel_type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_odometer` double DEFAULT NULL,
  `acquisition_date` date DEFAULT NULL,
  `acquisition_cost` double DEFAULT NULL,
  `status` enum('ASSIGNED','AVAILABLE','INACTIVE','INACTIVE_RETIRED','ON_TRIP','RETIRED','UNDER_MAINTENANCE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `license_plate` (`license_plate`),
  UNIQUE KEY `vin` (`vin`),
  KEY `idx_vehicles_status` (`status`),
  KEY `idx_vehicles_type` (`vehicle_type`),
  KEY `idx_vehicles_plate` (`license_plate`),
  KEY `fk_vehicles_category` (`category_id`),
  CONSTRAINT `fk_vehicles_category` FOREIGN KEY (`category_id`) REFERENCES `vehicle_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `vw_fleet_utilization_summary`
--

DROP TABLE IF EXISTS `vw_fleet_utilization_summary`;
/*!50001 DROP VIEW IF EXISTS `vw_fleet_utilization_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_fleet_utilization_summary` AS SELECT 
 1 AS `vehicle_id`,
 1 AS `license_plate`,
 1 AS `vehicle_type`,
 1 AS `total_trips_completed`,
 1 AS `total_distance_traveled_km`,
 1 AS `total_trip_hours`,
 1 AS `total_downtime_hours`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_fuel_efficiency_summary`
--

DROP TABLE IF EXISTS `vw_fuel_efficiency_summary`;
/*!50001 DROP VIEW IF EXISTS `vw_fuel_efficiency_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_fuel_efficiency_summary` AS SELECT 
 1 AS `vehicle_id`,
 1 AS `license_plate`,
 1 AS `make`,
 1 AS `model`,
 1 AS `total_refuels`,
 1 AS `total_fuel_liters`,
 1 AS `total_fuel_expense`,
 1 AS `avg_km_per_liter`,
 1 AS `total_maintenance_expense`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_upcoming_overdue_maintenance`
--

DROP TABLE IF EXISTS `vw_upcoming_overdue_maintenance`;
/*!50001 DROP VIEW IF EXISTS `vw_upcoming_overdue_maintenance`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_upcoming_overdue_maintenance` AS SELECT 
 1 AS `plan_id`,
 1 AS `vehicle_id`,
 1 AS `license_plate`,
 1 AS `model`,
 1 AS `current_odometer`,
 1 AS `service_code`,
 1 AS `service_name`,
 1 AS `is_critical`,
 1 AS `last_service_odometer`,
 1 AS `last_service_date`,
 1 AS `next_due_odometer`,
 1 AS `next_due_date`,
 1 AS `km_remaining_until_service`,
 1 AS `days_remaining_until_service`,
 1 AS `maintenance_status`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_vehicle_availability`
--

DROP TABLE IF EXISTS `vw_vehicle_availability`;
/*!50001 DROP VIEW IF EXISTS `vw_vehicle_availability`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_vehicle_availability` AS SELECT 
 1 AS `vehicle_id`,
 1 AS `license_plate`,
 1 AS `vin`,
 1 AS `make`,
 1 AS `model`,
 1 AS `category_code`,
 1 AS `category_name`,
 1 AS `vehicle_type`,
 1 AS `capacity_kg`,
 1 AS `current_odometer`,
 1 AS `vehicle_status`,
 1 AS `dispatch_eligibility`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `work_order_parts`
--

DROP TABLE IF EXISTS `work_order_parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_order_parts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `work_order_id` bigint NOT NULL,
  `part_id` bigint NOT NULL,
  `quantity_used` int NOT NULL DEFAULT '1',
  `unit_price` double NOT NULL,
  `total_price` double DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wop_wo` (`work_order_id`),
  KEY `idx_wop_part` (`part_id`),
  CONSTRAINT `fk_wop_part` FOREIGN KEY (`part_id`) REFERENCES `spare_parts` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_wop_wo` FOREIGN KEY (`work_order_id`) REFERENCES `maintenance_work_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `vw_fleet_utilization_summary`
--

/*!50001 DROP VIEW IF EXISTS `vw_fleet_utilization_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_fleet_utilization_summary` AS select `v`.`id` AS `vehicle_id`,`v`.`license_plate` AS `license_plate`,`v`.`vehicle_type` AS `vehicle_type`,count(`t`.`id`) AS `total_trips_completed`,coalesce(sum(`t`.`distance_km`),0) AS `total_distance_traveled_km`,coalesce(sum(timestampdiff(HOUR,`t`.`actual_start`,`t`.`actual_end`)),0) AS `total_trip_hours`,coalesce((select sum(`wo`.`downtime_hours`) from `maintenance_work_orders` `wo` where ((`wo`.`vehicle_id` = `v`.`id`) and (`wo`.`status` = 'COMPLETED'))),0) AS `total_downtime_hours` from (`vehicles` `v` left join `trips` `t` on(((`v`.`id` = `t`.`vehicle_id`) and (`t`.`status` = 'COMPLETED')))) where (`v`.`is_deleted` = false) group by `v`.`id`,`v`.`license_plate`,`v`.`vehicle_type` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_fuel_efficiency_summary`
--

/*!50001 DROP VIEW IF EXISTS `vw_fuel_efficiency_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_fuel_efficiency_summary` AS select `v`.`id` AS `vehicle_id`,`v`.`license_plate` AS `license_plate`,`v`.`make` AS `make`,`v`.`model` AS `model`,count(`fl`.`id`) AS `total_refuels`,coalesce(sum(`fl`.`fuel_quantity_liters`),0) AS `total_fuel_liters`,coalesce(sum(`fl`.`total_cost`),0) AS `total_fuel_expense`,coalesce(avg(`fl`.`fuel_economy_kml`),0) AS `avg_km_per_liter`,coalesce((select sum(`wo`.`total_cost`) from `maintenance_work_orders` `wo` where ((`wo`.`vehicle_id` = `v`.`id`) and (`wo`.`status` = 'COMPLETED'))),0) AS `total_maintenance_expense` from (`vehicles` `v` left join `fuel_logs` `fl` on((`v`.`id` = `fl`.`vehicle_id`))) where (`v`.`is_deleted` = false) group by `v`.`id`,`v`.`license_plate`,`v`.`make`,`v`.`model` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_upcoming_overdue_maintenance`
--

/*!50001 DROP VIEW IF EXISTS `vw_upcoming_overdue_maintenance`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_upcoming_overdue_maintenance` AS select `vmp`.`id` AS `plan_id`,`v`.`id` AS `vehicle_id`,`v`.`license_plate` AS `license_plate`,`v`.`model` AS `model`,`v`.`current_odometer` AS `current_odometer`,`mr`.`service_code` AS `service_code`,`mr`.`service_name` AS `service_name`,`mr`.`is_critical` AS `is_critical`,`vmp`.`last_service_odometer` AS `last_service_odometer`,`vmp`.`last_service_date` AS `last_service_date`,`vmp`.`next_due_odometer` AS `next_due_odometer`,`vmp`.`next_due_date` AS `next_due_date`,(`vmp`.`next_due_odometer` - `v`.`current_odometer`) AS `km_remaining_until_service`,(to_days(`vmp`.`next_due_date`) - to_days(curdate())) AS `days_remaining_until_service`,`vmp`.`maintenance_status` AS `maintenance_status` from ((`vehicle_maintenance_plans` `vmp` join `vehicles` `v` on((`vmp`.`vehicle_id` = `v`.`id`))) join `maintenance_rules` `mr` on((`vmp`.`rule_id` = `mr`.`id`))) where (`v`.`status` <> 'INACTIVE_RETIRED') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_vehicle_availability`
--

/*!50001 DROP VIEW IF EXISTS `vw_vehicle_availability`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_vehicle_availability` AS select `v`.`id` AS `vehicle_id`,`v`.`license_plate` AS `license_plate`,`v`.`vin` AS `vin`,`v`.`make` AS `make`,`v`.`model` AS `model`,`vc`.`category_code` AS `category_code`,`vc`.`name` AS `category_name`,`v`.`vehicle_type` AS `vehicle_type`,`v`.`capacity_kg` AS `capacity_kg`,`v`.`current_odometer` AS `current_odometer`,`v`.`status` AS `vehicle_status`,(case when (`v`.`status` <> 'AVAILABLE') then 'UNAVAILABLE_STATUS' when exists(select 1 from `maintenance_work_orders` `wo` where ((`wo`.`vehicle_id` = `v`.`id`) and (`wo`.`status` in ('SCHEDULED','IN_PROGRESS')))) then 'UNDER_ACTIVE_MAINTENANCE' when exists(select 1 from `vehicle_maintenance_plans` `vmp` where ((`vmp`.`vehicle_id` = `v`.`id`) and (`vmp`.`maintenance_status` = 'OVERDUE'))) then 'OVERDUE_MAINTENANCE_LOCKOUT' else 'DISPATCH_READY' end) AS `dispatch_eligibility` from (`vehicles` `v` left join `vehicle_categories` `vc` on((`v`.`category_id` = `vc`.`id`))) where (`v`.`is_deleted` = false) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-10 21:16:43
