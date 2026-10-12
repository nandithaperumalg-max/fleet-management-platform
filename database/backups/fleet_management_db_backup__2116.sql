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
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'trips',2,'STATUS_TRANSITION','{\"status\": \"DISPATCHED\"}','{\"status\": \"IN_TRANSIT\"}',2,'192.168.1.45','2026-09-21 16:07:14'),(2,'vehicles',2,'STATUS_TRANSITION','{\"status\": \"AVAILABLE\"}','{\"status\": \"ASSIGNED\"}',2,'192.168.1.45','2026-09-21 16:07:14'),(3,'vehicles',3,'STATUS_TRANSITION','{\"status\": \"AVAILABLE\"}','{\"status\": \"UNDER_MAINTENANCE\"}',3,'192.168.1.88','2026-09-21 16:07:14'),(4,'maintenance_work_orders',1,'INSERT',NULL,'{\"status\": \"IN_PROGRESS\", \"work_order_no\": \"WO-2026-001\"}',1,'192.168.1.10','2026-09-21 16:07:14'),(5,'vehicles',51,'INSERT',NULL,'Registered KA-03-AK-1993',7,NULL,'2026-10-06 22:49:23'),(6,'vehicles',51,'STATUS_TRANSITION','Status: AVAILABLE','Status: UNDER_MAINTENANCE',7,NULL,'2026-10-06 22:49:39'),(7,'vehicles',51,'CATEGORY_CHANGE','Category: Heavy & Medium Commercial Trucks','Category: Cargo & Delivery Vans',7,NULL,'2026-10-06 22:49:39'),(8,'vehicles',51,'STATUS_TRANSITION','Status: UNDER_MAINTENANCE','Status: AVAILABLE',7,NULL,'2026-10-06 22:49:39'),(9,'vehicles',52,'INSERT',NULL,'Registered KA-03-AK-1922',7,NULL,'2026-10-07 01:54:57'),(10,'vehicles',52,'STATUS_TRANSITION','Status: AVAILABLE','Status: UNDER_MAINTENANCE',7,NULL,'2026-10-07 02:00:01'),(11,'vehicles',52,'STATUS_TRANSITION','Status: UNDER_MAINTENANCE','Status: AVAILABLE',7,NULL,'2026-10-07 02:00:01'),(12,'vehicles',53,'INSERT',NULL,'Registered DL-09-ZZ-7777',2,NULL,'2026-10-07 02:02:39'),(13,'vehicles',54,'INSERT',NULL,'Registered TEST-99-XX-0001',7,NULL,'2026-10-07 02:42:24'),(14,'vehicles',55,'INSERT',NULL,'Registered KA-04-TK-1234',9,NULL,'2026-10-07 02:45:37'),(15,'spare_parts',6,'INSERT',NULL,'Added part tires (wheel)',7,NULL,'2026-10-07 10:37:42'),(16,'spare_parts',7,'INSERT',NULL,'Added part Clutch Plate (TEST-PART-8804)',7,NULL,'2026-10-07 11:12:06'),(17,'vehicles',56,'INSERT',NULL,'Registered KA-01-TEST-684',7,NULL,'2026-10-07 11:12:06'),(18,'fuel_logs',3,'INSERT',NULL,'Logged refill of 50.0L for FL-TRK-101',7,NULL,'2026-10-07 11:12:06'),(19,'spare_parts',8,'INSERT',NULL,'Added part Clutch Plate (TEST-PART-8247)',2,NULL,'2026-10-07 11:12:06'),(20,'vehicles',57,'INSERT',NULL,'Registered KA-01-TEST-492',2,NULL,'2026-10-07 11:12:06'),(21,'fuel_logs',4,'INSERT',NULL,'Logged refill of 50.0L for FL-TRK-101',2,NULL,'2026-10-07 11:12:06'),(22,'spare_parts',9,'INSERT',NULL,'Added part Clutch Plate (TEST-PART-8825)',9,NULL,'2026-10-07 11:12:07'),(23,'vehicles',58,'INSERT',NULL,'Registered KA-01-TEST-751',9,NULL,'2026-10-07 11:12:07'),(24,'fuel_logs',5,'INSERT',NULL,'Logged refill of 50.0L for FL-TRK-101',9,NULL,'2026-10-07 11:12:07'),(25,'trips',4,'DISPATCH',NULL,'Dispatched TRP-755995 with Vehicle FL-TRK-101',2,NULL,'2026-10-07 11:14:36'),(26,'vehicles',59,'INSERT',NULL,'Registered KA-01-MH-4582',7,NULL,'2026-10-07 11:48:49'),(27,'vehicles',59,'STATUS_TRANSITION','Status: AVAILABLE','Status: ASSIGNED',7,NULL,'2026-10-07 12:36:24'),(28,'vehicles',59,'STATUS_TRANSITION','Status: ASSIGNED','Status: AVAILABLE',7,NULL,'2026-10-07 12:37:00'),(29,'vehicles',59,'CATEGORY_CHANGE','Category: Heavy & Medium Commercial Trucks','Category: Heavy & Medium Commercial Trucks',7,NULL,'2026-10-07 12:37:08'),(30,'vehicles',59,'STATUS_TRANSITION','Status: AVAILABLE','Status: AVAILABLE',7,NULL,'2026-10-07 12:38:32'),(31,'vehicles',59,'STATUS_TRANSITION','Status: AVAILABLE','Status: ASSIGNED',7,NULL,'2026-10-07 12:38:41'),(32,'vehicles',59,'CATEGORY_CHANGE','Category: Heavy & Medium Commercial Trucks','Category: Heavy & Medium Commercial Trucks',7,NULL,'2026-10-07 12:38:47'),(33,'vehicles',59,'STATUS_TRANSITION','Status: ASSIGNED','Status: UNDER_MAINTENANCE',7,NULL,'2026-10-07 12:39:29'),(34,'vehicles',59,'STATUS_TRANSITION','Status: UNDER_MAINTENANCE','Status: INACTIVE',7,NULL,'2026-10-07 12:40:09'),(35,'vehicles',59,'CATEGORY_CHANGE','Category: Heavy & Medium Commercial Trucks','Category: Heavy & Medium Commercial Trucks',7,NULL,'2026-10-07 12:40:15'),(36,'vehicles',59,'STATUS_TRANSITION','Status: INACTIVE','Status: RETIRED',7,NULL,'2026-10-07 12:40:24'),(37,'vehicles',59,'CATEGORY_CHANGE','Category: Heavy & Medium Commercial Trucks','Category: Passenger & Shuttle Buses',7,NULL,'2026-10-07 12:40:33'),(38,'vehicles',59,'CATEGORY_CHANGE','Category: Passenger & Shuttle Buses','Category: Heavy & Medium Commercial Trucks',7,NULL,'2026-10-07 12:40:59'),(39,'vehicles',58,'STATUS_TRANSITION','Status: AVAILABLE','Status: ASSIGNED',7,NULL,'2026-10-07 21:28:07'),(40,'vehicles',57,'STATUS_TRANSITION','Status: AVAILABLE','Status: ON_TRIP',7,NULL,'2026-10-07 21:28:16'),(41,'vehicles',55,'STATUS_TRANSITION','Status: AVAILABLE','Status: UNDER_MAINTENANCE',7,NULL,'2026-10-07 21:28:27'),(42,'vehicles',54,'STATUS_TRANSITION','Status: AVAILABLE','Status: INACTIVE',7,NULL,'2026-10-07 21:28:44'),(43,'drivers',4,'ONBOARD',NULL,'Onboarded driver DL-1234567891234',7,NULL,'2026-10-07 21:32:32'),(44,'trips',5,'DISPATCH',NULL,'Dispatched TRP-571788 with Vehicle KA-05-NB-7788',7,NULL,'2026-10-07 21:33:17'),(45,'fuel_logs',6,'INSERT',NULL,'Logged refill of 60.0L for KA-01-MH-4582',7,NULL,'2026-10-07 21:34:08'),(46,'maintenance_work_orders',3,'CREATE',NULL,'Created work order WO-1791428703173 for KA-03-EV-1001',7,NULL,'2026-10-07 21:35:03'),(47,'spare_parts',1,'RESTOCK','Stock: 48','Stock: 73',7,NULL,'2026-10-07 21:35:32'),(48,'spare_parts',2,'RESTOCK','Stock: 34','Stock: 52',7,NULL,'2026-10-07 21:35:52'),(49,'spare_parts',5,'RESTOCK','Stock: 26','Stock: 41',7,NULL,'2026-10-07 21:36:04'),(50,'spare_parts',8,'RESTOCK','Stock: 15','Stock: 33',7,NULL,'2026-10-07 21:36:13'),(51,'vehicles',58,'STATUS_TRANSITION','Status: ASSIGNED','Status: AVAILABLE',7,NULL,'2026-10-09 00:01:35');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `complaints`
--

LOCK TABLES `complaints` WRITE;
/*!40000 ALTER TABLE `complaints` DISABLE KEYS */;
/*!40000 ALTER TABLE `complaints` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
INSERT INTO `drivers` VALUES (1,4,'DL-NY-982341','HEAVY_COMMERCIAL','2028-12-31','+1-555-0103','Mary Doe (+1-555-0991)','ACTIVE','2026-09-21 16:07:14','2026-09-21 16:07:14'),(2,5,'DL-IL-554210','MEDIUM_VEHICLE','2027-08-15','+1-555-0104','Robert Smith (+1-555-0992)','ACTIVE','2026-09-21 16:07:14','2026-09-21 16:07:14'),(3,6,'DL-CA-119842','HEAVY_COMMERCIAL','2026-11-20','+1-555-0105','Elena Ray (+1-555-0993)','ACTIVE','2026-09-21 16:07:14','2026-09-21 16:07:14'),(4,10,'DL-1234567891234','HEAVY_COMMERCIAL','2027-06-30','9880011223','Abhi-1231231231','ACTIVE','2026-10-07 21:32:32','2026-10-07 21:32:32');
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `fuel_logs`
--

LOCK TABLES `fuel_logs` WRITE;
/*!40000 ALTER TABLE `fuel_logs` DISABLE KEYS */;
INSERT INTO `fuel_logs` VALUES (1,1,1,1,'2026-08-10 13:30:00',145.5,1.25,181.88,84500,'Pilot Flying J Travel Plaza #412','RCP-998124',3.3,0,'2026-09-21 16:07:14'),(2,2,2,NULL,'2026-09-15 11:15:00',78,1.3,101.4,31190,'Love\'s Travel Stop #654','RCP-998210',8.2,0,'2026-09-21 16:07:14'),(3,1,1,NULL,'2026-10-07 16:42:06',50,95,4750,85000,'Indian Oil Depot',NULL,10,1,'2026-10-07 11:12:06'),(4,1,1,NULL,'2026-10-07 16:42:06',50,95,4750,85000,'Indian Oil Depot',NULL,NULL,1,'2026-10-07 11:12:06'),(5,1,1,NULL,'2026-10-07 16:42:07',50,95,4750,85000,'Indian Oil Depot',NULL,NULL,1,'2026-10-07 11:12:07'),(6,59,4,NULL,'2026-10-08 03:04:08',60,94.5,5670,12500,'Indian Oil Depot #12','RCP-06945',NULL,0,'2026-10-07 21:34:08');
/*!40000 ALTER TABLE `fuel_logs` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `maintenance_recommendations`
--

LOCK TABLES `maintenance_recommendations` WRITE;
/*!40000 ALTER TABLE `maintenance_recommendations` DISABLE KEYS */;
INSERT INTO `maintenance_recommendations` VALUES (1,4,1,'OVERDUE_SERVICE','CRITICAL','Engine Oil Service Overdue on FL-TRK-104','Vehicle has reached 49,800 km, surpassing the 90-day threshold since last service on May 18.','2026-08-18',50000,0,NULL,'2026-09-21 16:07:14','2026-09-21 16:07:14',NULL,NULL),(2,1,2,'PREVENTIVE_THRESHOLD','HIGH','Brake Lining Inspection Approaching for FL-TRK-101','Vehicle is at 84,500 km. Scheduled 90,000 km brake inspection is within 5,500 km.','2026-09-15',90000,0,NULL,'2026-09-21 16:07:14','2026-09-21 16:07:14',NULL,NULL),(3,1,1,'OVERDUE_SERVICE','CRITICAL','Critical Service Overdue','Vehicle has exceeded maintenance threshold by 5500.0 km or 27 days. Immediate workshop intake required.','2026-09-01',90000,0,NULL,'2026-09-28 06:00:00','2026-09-28 06:00:00',84500,90000),(4,2,1,'PREVENTIVE_THRESHOLD','HIGH','Preventive Service Due Soon','Vehicle is within service threshold (8800.0 km remaining or 12 days remaining). Please schedule preventive maintenance.','2026-10-10',40000,0,NULL,'2026-09-28 06:00:00','2026-09-28 06:00:00',31200,40000),(5,3,2,'OVERDUE_SERVICE','CRITICAL','Critical Service Overdue','Vehicle has exceeded maintenance threshold by 2000.0 km or 80 days. Immediate workshop intake required.','2026-07-10',140000,0,NULL,'2026-09-28 06:00:00','2026-09-28 06:00:00',142000,140000);
/*!40000 ALTER TABLE `maintenance_recommendations` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `maintenance_rules`
--

LOCK TABLES `maintenance_rules` WRITE;
/*!40000 ALTER TABLE `maintenance_rules` DISABLE KEYS */;
INSERT INTO `maintenance_rules` VALUES (1,'PM-OIL-FILTER','Engine Oil & Filter Service','Complete synthetic oil replacement, oil filter, and lube chassis.',10000,90,1,'2026-09-21 16:07:14','2026-09-21 16:07:14'),(2,'PM-BRAKE-INSP','Brake Lining & Pad Inspection','Comprehensive thickness inspection of front & rear friction surfaces and calipers.',20000,180,1,'2026-09-21 16:07:14','2026-09-21 16:07:14'),(3,'PM-TIRE-ROT','Tire Rotation & Pressure Alignment','Cross-rotate drive and steer axle tires, laser alignment.',15000,120,0,'2026-09-21 16:07:14','2026-09-21 16:07:14'),(4,'PM-COOLING-FLUSH','Cooling System Radiator Flush','Coolant drain, chemical flush, pressure test, refill with organic acid technology coolant.',50000,365,1,'2026-09-21 16:07:14','2026-09-21 16:07:14');
/*!40000 ALTER TABLE `maintenance_rules` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `maintenance_work_orders`
--

LOCK TABLES `maintenance_work_orders` WRITE;
/*!40000 ALTER TABLE `maintenance_work_orders` DISABLE KEYS */;
INSERT INTO `maintenance_work_orders` VALUES (1,'WO-2026-001',3,2,'PREVENTIVE','HIGH','Brake pad replacement and hydraulic pressure calibration due to overdue alert.','2026-09-16','2026-09-17 08:30:00',NULL,0,3.5,60,210,290,500,3,'IN_PROGRESS',1,'2026-09-21 16:07:14','2026-09-21 16:07:14'),(2,'WO-2026-002',1,1,'PREVENTIVE','MEDIUM','Routine 80k km oil and filter change completed.','2026-06-01','2026-06-01 09:00:00','2026-06-01 13:00:00',4,2,50,100,103.75,203.75,3,'COMPLETED',1,'2026-09-21 16:07:14','2026-09-21 16:07:14'),(3,'WO-1791428703173',18,3,'ROUTINE_INSPECTION','MEDIUM','Scheduled preventive maintenance as per fleet management protocol.','2026-10-08',NULL,NULL,0,0,100,0,0,0,NULL,'SCHEDULED',7,'2026-10-07 21:35:03','2026-10-07 21:35:03');
/*!40000 ALTER TABLE `maintenance_work_orders` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,'Preventive Maintenance Due Soon','Vehicle KA-01-EQ-9012 (Tata Signa 4825.TK) has reached 49,850 km and is due for Comprehensive Service at 50,000 km (150 km remaining).','HIGH','MAINTENANCE',0,'2026-09-28 07:50:55',NULL),(2,2,'Spare Parts Below Reorder Level','Engine Oil 15W-40 (SKU: OIL-SYN-15W40) stock has fallen to 6 units (Threshold: 10 units). Please generate a procurement purchase order.','WARNING','INVENTORY',0,'2026-09-28 07:50:55',NULL),(3,2,'Driver Commercial License Expiring','Driver Rajesh Kumar (License: DL-0420110023481) commercial license expires in 25 days (2026-10-24). Re-verification required before next month assignment.','WARNING','COMPLIANCE',0,'2026-09-28 07:50:55',NULL),(4,1,'System Audit Alert','Super Administrator account accessed system configuration settings.','INFO','AUDIT',1,'2026-09-28 07:50:55',NULL),(5,2,'Fuel Anomaly Flagged','Trip TRP-2026-003 refuel logged 62 liters with an abnormal efficiency drop of 24.5% below historical baseline.','CRITICAL','FUEL',0,'2026-09-28 07:50:55',NULL),(6,NULL,'Fuel Anomaly Detected','Vehicle FL-TRK-101 refill at Indian Oil Depot flagged for abnormal consumption: Suspicious high efficiency: 10.0 km/L vs avg 3.3 km/L','WARNING','FUEL',0,'2026-10-07 11:12:06',NULL),(7,NULL,'Fuel Anomaly Detected','Vehicle FL-TRK-101 refill at Indian Oil Depot flagged for abnormal consumption: Odometer reading is less than or equal to previous refill','WARNING','FUEL',0,'2026-10-07 11:12:06',NULL),(8,NULL,'Fuel Anomaly Detected','Vehicle FL-TRK-101 refill at Indian Oil Depot flagged for abnormal consumption: Odometer reading is less than or equal to previous refill','WARNING','FUEL',0,'2026-10-07 11:12:07',NULL),(9,NULL,'Vehicle Under Maintenance','Work Order WO-1791428703173 opened for Vehicle KA-03-EV-1001. Vehicle status set to UNDER_MAINTENANCE.','INFO','MAINTENANCE',0,'2026-10-07 21:35:03',NULL);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `spare_parts`
--

LOCK TABLES `spare_parts` WRITE;
/*!40000 ALTER TABLE `spare_parts` DISABLE KEYS */;
INSERT INTO `spare_parts` VALUES (1,'SKU-OIL-SYN15W40','Mobil Delvac 15W-40 Synthetic Oil (Gallon)','LUBRICANTS',28.5,73,15,'ExxonMobil Commercial','2026-09-21 16:07:14','2026-10-07 21:35:32'),(2,'SKU-FLT-OIL-HD','Heavy Duty Oil Filter Element','FILTERS',18.25,52,10,'Donaldson Filters','2026-09-21 16:07:14','2026-10-07 21:35:52'),(3,'SKU-BRK-PAD-TRK','Front Air Disc Brake Pad Kit','BRAKES',145,12,6,'Bendix Commercial','2026-09-21 16:07:14','2026-09-21 16:07:14'),(4,'SKU-TIRE-295-80','Michelin X Line Energy D 295/75R22.5','TIRES',485,8,4,'Michelin Fleet Direct','2026-09-21 16:07:14','2026-09-21 16:07:14'),(5,'SKU-COOL-5050','Peak Fleet Heavy Duty 50/50 Coolant (Gallon)','COOLING',14.75,41,8,'Peak Commercial Chem','2026-09-21 16:07:14','2026-10-07 21:36:04'),(6,'wheel','tires','Tyres',1200,10,3,'AutoParts Direct India','2026-10-07 10:37:42','2026-10-07 10:37:42'),(7,'TEST-PART-8804','Clutch Plate','TRANSMISSION',3500,15,4,'Bosch','2026-10-07 11:12:06','2026-10-07 11:12:06'),(8,'TEST-PART-8247','Clutch Plate','TRANSMISSION',3500,33,4,'Bosch','2026-10-07 11:12:06','2026-10-07 21:36:13'),(9,'TEST-PART-8825','Clutch Plate','TRANSMISSION',3500,15,4,'Bosch','2026-10-07 11:12:07','2026-10-07 11:12:07');
/*!40000 ALTER TABLE `spare_parts` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `trip_rejection_requests`
--

LOCK TABLES `trip_rejection_requests` WRITE;
/*!40000 ALTER TABLE `trip_rejection_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `trip_rejection_requests` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `trips`
--

LOCK TABLES `trips` WRITE;
/*!40000 ALTER TABLE `trips` DISABLE KEYS */;
INSERT INTO `trips` VALUES (1,'TRP-2026-8801',1,1,'Chicago Central Logistics Hub','Detroit Distribution Depot','2026-08-10 06:00:00','2026-08-10 14:00:00','2026-08-10 06:15:00','2026-08-10 13:45:00',84020,84500,480,18500,'COMPLETED',NULL,2,'2026-09-21 16:07:14','2026-09-21 16:07:14'),(2,'TRP-2026-8802',2,2,'O\'Hare Air Cargo Bay 4','Milwaukee Fast Logistics','2026-09-17 07:00:00','2026-09-17 18:00:00','2026-09-17 07:10:00',NULL,31200,NULL,NULL,1200,'IN_TRANSIT',NULL,2,'2026-09-21 16:07:14','2026-09-21 16:07:14'),(3,'TRP-2026-8803',4,1,'Indianapolis Regional Dock','Columbus Gateway','2026-09-18 08:00:00','2026-09-18 16:00:00',NULL,NULL,49800,NULL,NULL,22000,'DRAFT',NULL,2,'2026-09-21 16:07:14','2026-09-21 16:07:14'),(4,'TRP-755995',1,1,'Bengaluru Central Depot','Mysuru Logistics Hub','2026-10-07 16:44:35','2026-10-08 16:44:35',NULL,NULL,84500,NULL,NULL,1200,'ASSIGNED','Priority cargo delivery',2,'2026-10-07 11:14:36','2026-10-07 11:14:36'),(5,'TRP-571788',14,4,'Bengaluru Central Depot','Mysuru Logistics Hub','2026-10-07 21:32:00','2026-10-08 21:32:00',NULL,NULL,31200,NULL,NULL,1200,'ASSIGNED','Priority cargo delivery',7,'2026-10-07 21:33:17','2026-10-07 21:33:17');
/*!40000 ALTER TABLE `trips` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'superadmin','admin@fleetmanager.com','$2a$10$6CnIdUp.sHyFTEleq53PJeAg21wa1Hs6gubWkgcb.GwefMxWzip3C','Alex Mercer (Admin)','SUPER_ADMIN','+1-555-0100',1,'2026-09-21 16:07:14','2026-10-10 09:57:11'),(2,'dispatcher1','dispatch@fleetmanager.com','$2a$10$6CnIdUp.sHyFTEleq53PJeAg21wa1Hs6gubWkgcb.GwefMxWzip3C','Sarah Connor (Dispatch)','DISPATCHER','+1-555-0101',1,'2026-09-21 16:07:14','2026-10-10 09:57:12'),(3,'mechanic_lead','workshop@fleetmanager.com','$2b$10$wEkgk5JqT3hE5xXN4zY/9.a/gMdfHlB7f8u.Tq4G7x5kQe8U8gG3G','Marcus Vance (Lead Mechanic)','MECHANIC','+1-555-0102',1,'2026-09-21 16:07:14','2026-09-21 16:07:14'),(4,'driver_john','john.doe@fleetmanager.com','$2a$10$HRrr/1hLNhEHjjPe8CqyrueBjG4Fd73d4T8VXWVVv5giM9kEWwYoS','John Doe (Heavy Driver)','DRIVER','+1-555-0103',1,'2026-09-21 16:07:14','2026-10-10 09:57:11'),(5,'driver_jane','jane.smith@fleetmanager.com','$2a$10$.rPpwxqrZfxZW3qPOEBO5uUN9NGXqeUb69r43RHV/ZMajA1mine7C','Jane Smith (Van Driver)','DRIVER','+1-555-0104',1,'2026-09-21 16:07:14','2026-10-10 09:57:11'),(6,'driver_carlos','carlos.r@fleetmanager.com','$2a$10$SGPbJ/hsSCjjGlQTGv1EF.wAIeZFVNpCrbHiR4lPjchHqmm5tbW9.','Carlos Ray (Bus Driver)','DRIVER','+1-555-0105',1,'2026-09-21 16:07:14','2026-10-10 09:57:11'),(7,'admin','admin@fleetops.com','$2a$10$6CnIdUp.sHyFTEleq53PJeAg21wa1Hs6gubWkgcb.GwefMxWzip3C','System Administrator','ADMIN','+91 9876543210',1,'2026-09-28 05:00:35','2026-10-10 09:57:11'),(8,'manager','manager@fleetops.com','$2a$10$nIWcvYYTU9WuPlV.BGucEuUHOVWVIKn6xreFk9g6sjPaLFjlgwauS','Fleet Operations Manager','FLEET_MANAGER','+91 9876543211',1,'2026-09-28 05:00:35','2026-09-28 05:00:35'),(9,'driver_rajesh','driver.rajesh@fleetops.com','$2a$10$QFtg8WHWrpTDkvaAcCYmXOlSEiLMA3Mo3E4.goTBbty71wwpuOzwa','Rajesh Kumar','DRIVER','+91 9876543212',1,'2026-09-28 05:00:35','2026-09-28 05:00:35'),(10,'Driver_Ramesh','','$2a$10$YpLOIJYt9pBlPh0mYqRZZ.HG/KpAkdMN7aDkAA07IeW2Q4haunxnO','Ramesh Chandhra','DRIVER','9880011223',1,'2026-10-07 21:32:32','2026-10-07 21:32:32'),(11,'driver_raj','driver.raj@fleetops.com','$2a$10$fsD/KJDNQdJJozzKeSTRm.Uu6eBVRAOsZ6h6xiXpAWefMxq4DVfpq','Rajesh Kumar','DRIVER','+91 9876543213',1,'2026-10-08 00:03:40','2026-10-10 09:57:11');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `vehicle_categories`
--

LOCK TABLES `vehicle_categories` WRITE;
/*!40000 ALTER TABLE `vehicle_categories` DISABLE KEYS */;
INSERT INTO `vehicle_categories` VALUES (1,'TRUCKS','Heavy & Medium Commercial Trucks','Long-haul freight, distribution, and inter-city bulk cargo carriers',1,'2026-09-28 07:50:23','2026-10-07 11:49:15'),(2,'VANS','Cargo & Delivery Vans','Last-mile urban delivery and express parcel distribution vans',1,'2026-09-28 07:50:23','2026-10-07 11:49:19'),(3,'SUVS','Sport Utility Vehicles (SUVs)','Field operations, site supervision, and premium executive transit',1,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(4,'CARS','Sedans & Compact Cars','Staff corporate mobility and administrative pool transport',1,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(5,'BUSES','Passenger & Shuttle Buses','Workforce transit, crew shuttles, and passenger coaches',1,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(6,'EVS','Electric Vehicles (EV Fleet)','Eco-friendly zero-emission electric cargo vans and urban commuters',1,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(7,'TWO_WHEELERS','Two Wheelers & Motorcycles','Rapid document dispatch, urban food logistics, and courier units',1,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(8,'SPECIAL_PURPOSE','Special Purpose Vehicles','Refrigerated cold-chain transport, breakdown recovery tow trucks, and mobile maintenance units',1,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(17,'ELECTRIC_VANS','Electric Commercial Vans','Remote Work',1,'2026-10-07 21:30:38','2026-10-07 21:30:38'),(18,'TEST_CAT','Test Category','Test',1,'2026-10-08 00:05:27','2026-10-08 00:05:27'),(19,'TRIP_BUS','Electric Trip Bus','Everyday shuttle trip',1,'2026-10-08 09:22:48','2026-10-08 09:22:48');
/*!40000 ALTER TABLE `vehicle_categories` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `vehicle_maintenance_plans`
--

LOCK TABLES `vehicle_maintenance_plans` WRITE;
/*!40000 ALTER TABLE `vehicle_maintenance_plans` DISABLE KEYS */;
INSERT INTO `vehicle_maintenance_plans` VALUES (1,1,1,80000,'2026-06-01',90000,'2026-09-01','OVERDUE','2026-09-28 06:00:00'),(2,1,2,70000,'2026-03-15',90000,'2026-09-15','OVERDUE','2026-09-28 06:00:00'),(3,2,1,30000,'2026-07-10',40000,'2026-10-10','OVERDUE','2026-10-10 10:00:00'),(4,3,2,120000,'2026-01-10',140000,'2026-07-10','OVERDUE','2026-09-21 16:07:14'),(5,4,1,40000,'2026-05-18',50000,'2026-08-18','OVERDUE','2026-09-21 16:07:14');
/*!40000 ALTER TABLE `vehicle_maintenance_plans` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES (1,1,'1HGCR2F83HA001001','FL-TRK-101','Freightliner','Cascadia 126',2022,'HEAVY_TRUCK',24000,2,'DIESEL',84500,'2022-03-15',145000,'ASSIGNED',0,'2026-09-21 16:07:14','2026-10-07 11:14:36'),(2,2,'1FT8W3BT4KE002002','FL-VAN-202','Ford','Transit 350 HD',2023,'CARGO_VAN',2100,3,'DIESEL',31200,'2023-01-20',52000,'ASSIGNED',0,'2026-09-21 16:07:14','2026-09-28 07:50:23'),(3,5,'3AKJHHDR5LS003003','FL-BUS-303','Volvo','9700 Motorcoach',2021,'BUS',5500,56,'DIESEL',142000,'2021-06-10',380000,'UNDER_MAINTENANCE',0,'2026-09-21 16:07:14','2026-09-28 07:50:23'),(4,1,'2WKDA7E99MH004004','FL-TRK-104','Kenworth','T680 Next Gen',2023,'HEAVY_TRUCK',25000,2,'DIESEL',49800,'2023-05-11',158000,'AVAILABLE',0,'2026-09-21 16:07:14','2026-09-28 07:50:23'),(5,2,'4UZAA2BC1NC005005','FL-VAN-205','Mercedes-Benz','Sprinter 2500',2020,'CARGO_VAN',1800,2,'DIESEL',198500,'2020-02-14',48000,'INACTIVE_RETIRED',0,'2026-09-21 16:07:14','2026-09-28 07:50:23'),(9,1,'1FTFW1ED8MFC10001','KA-01-EQ-9011','Tata Motors','Prima 4028.S',2022,'HEAVY_TRUCK',28000,2,'DIESEL',84500,'2022-04-15',3800000,'AVAILABLE',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(10,1,'1FTFW1ED8MFC10002','KA-01-EQ-9012','Tata Motors','Signa 4825.TK',2023,'HEAVY_TRUCK',35000,2,'DIESEL',49850,'2023-01-10',4400000,'UNDER_MAINTENANCE',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(11,1,'1FTFW1ED8MFC10003','KA-04-MA-1234','Ashok Leyland','Ecomet 1215',2021,'LIGHT_TRUCK',11500,3,'DIESEL',112400,'2021-06-20',2100000,'AVAILABLE',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(12,1,'1FTFW1ED8MFC10004','KA-04-MA-5678','Ashok Leyland','Boss 1415 HB',2022,'LIGHT_TRUCK',14000,3,'DIESEL',76200,'2022-09-12',2450000,'ASSIGNED',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(13,1,'1FTFW1ED8MFC10005','KA-05-NB-3344','Mahindra','Bolero Maxi Truck',2022,'LIGHT_TRUCK',1700,2,'DIESEL',63500,'2022-03-18',780000,'AVAILABLE',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(14,1,'1FTFW1ED8MFC10006','KA-05-NB-7788','Mahindra','Bolero Pik-Up',2023,'LIGHT_TRUCK',2000,2,'DIESEL',31200,'2023-08-05',890000,'ASSIGNED',0,'2026-09-28 07:50:23','2026-10-07 21:33:17'),(15,2,'1FTFW1ED8MFC10007','KA-02-CV-4411','Tata Motors','Winger Cargo',2022,'CARGO_VAN',1680,2,'DIESEL',54200,'2022-05-11',1350000,'AVAILABLE',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(16,2,'1FTFW1ED8MFC10008','KA-02-CV-4422','Force Motors','Urbania Delivery',2023,'CARGO_VAN',2200,3,'DIESEL',42100,'2023-04-19',2400000,'ASSIGNED',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(17,6,'1FTFW1ED8MFC10009','KA-02-CV-4433','Tata Motors','Ace Gold EV',2023,'CARGO_VAN',1000,2,'ELECTRIC',19800,'2023-11-25',950000,'AVAILABLE',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(18,6,'1FTFW1ED8MFC10010','KA-03-EV-1001','Euler Motors','HiLoad EV',2024,'CARGO_VAN',688,1,'ELECTRIC',11400,'2024-02-14',850000,'UNDER_MAINTENANCE',0,'2026-09-28 07:50:23','2026-10-07 21:35:03'),(19,3,'1FTFW1ED8MFC10011','KA-01-SP-2020','Toyota','Innova Crysta',2021,'PASSENGER_SUV',850,7,'DIESEL',96400,'2021-08-10',2650000,'AVAILABLE',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(20,3,'1FTFW1ED8MFC10012','KA-01-SP-2021','Mahindra','Scorpio-N',2023,'PASSENGER_SUV',750,7,'DIESEL',38900,'2023-06-22',2100000,'ASSIGNED',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(21,4,'1FTFW1ED8MFC10013','KA-01-CR-3001','Maruti Suzuki','Dzire Tour S',2022,'PASSENGER_SUV',450,5,'CNG',78300,'2022-07-14',750000,'AVAILABLE',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(22,4,'1FTFW1ED8MFC10014','KA-01-CR-3002','Hyundai','Aura Prime',2023,'PASSENGER_SUV',450,5,'PETROL',32400,'2023-05-30',820000,'AVAILABLE',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(23,5,'1FTFW1ED8MFC10015','KA-04-BS-6001','Volvo','9600 Multi-Axle',2020,'BUS',6000,49,'DIESEL',210500,'2020-03-01',11500000,'UNDER_MAINTENANCE',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(24,5,'1FTFW1ED8MFC10016','KA-04-BS-6002','Tata Motors','Starbus Ultra',2022,'BUS',4500,36,'DIESEL',89400,'2022-02-15',3800000,'AVAILABLE',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(25,7,'1FTFW1ED8MFC10017','KA-05-TW-8001','Hero MotoCorp','Splendor Plus Super',2022,'LIGHT_TRUCK',150,2,'PETROL',34200,'2022-01-10',85000,'AVAILABLE',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(26,7,'1FTFW1ED8MFC10018','KA-05-TW-8002','Ather Energy','450X Gen 3',2023,'LIGHT_TRUCK',140,2,'ELECTRIC',15800,'2023-09-01',145000,'AVAILABLE',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(27,8,'1FTFW1ED8MFC10019','KA-01-SP-9999','Ashok Leyland','Recovery Crane 1618',2018,'HEAVY_TRUCK',16000,3,'DIESEL',178200,'2018-11-20',4200000,'INACTIVE_RETIRED',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(28,8,'1FTFW1ED8MFC10020','KA-01-SP-8888','Tata Motors','SFC 407 Reefer Cold',2021,'LIGHT_TRUCK',3500,2,'DIESEL',104300,'2021-10-15',1850000,'AVAILABLE',0,'2026-09-28 07:50:23','2026-09-28 07:50:23'),(52,6,'MARA123TK1231234','KA-03-AK-1922','Hyundai','Signa',2022,NULL,0,0,'ELECTRIC',0,NULL,0,'AVAILABLE',0,'2026-10-07 01:54:57','2026-10-07 02:00:01'),(53,4,'DISPATCHR123456','DL-09-ZZ-7777','Mahindra','Bolero',2021,NULL,0,0,'DIESEL',0,NULL,0,'AVAILABLE',0,'2026-10-07 02:02:39','2026-10-07 02:02:39'),(54,1,'TESTVIN1234567890','TEST-99-XX-0001','Test','Car',2024,NULL,0,0,'DIESEL',0,NULL,0,'INACTIVE',0,'2026-10-07 02:42:24','2026-10-07 21:28:44'),(55,2,'MATAR12345678912','KA-04-TK-1234','Tata Motors','Signa',2024,NULL,1500,0,'DIESEL',10000,NULL,0,'UNDER_MAINTENANCE',0,'2026-10-07 02:45:37','2026-10-07 21:28:27'),(56,1,'VIN804336958275','KA-01-TEST-684','Tata','Signa',2024,NULL,0,0,'DIESEL',0,NULL,0,'AVAILABLE',0,'2026-10-07 11:12:06','2026-10-07 11:12:06'),(57,1,'VIN876790483640','KA-01-TEST-492','Tata','Signa',2024,NULL,0,0,'DIESEL',0,NULL,0,'ON_TRIP',0,'2026-10-07 11:12:06','2026-10-07 21:28:16'),(58,1,'VIN498419689669','KA-01-TEST-751','Tata','Signa',2024,NULL,0,0,'DIESEL',0,NULL,0,'AVAILABLE',0,'2026-10-07 11:12:07','2026-10-09 00:01:35'),(59,1,'MAT12345678901234','KA-01-MH-4582','Tata Motors','Signa 4825.TK',2024,'COMMERCIAL',2500,2,'DIESEL',12500,'2026-10-07',1500000,'RETIRED',0,'2026-10-07 11:48:49','2026-10-07 12:40:59');
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `work_order_parts`
--

LOCK TABLES `work_order_parts` WRITE;
/*!40000 ALTER TABLE `work_order_parts` DISABLE KEYS */;
INSERT INTO `work_order_parts` VALUES (1,1,3,2,145,290,'2026-09-21 16:07:14'),(2,2,1,3,28.5,85.5,'2026-09-21 16:07:14'),(3,2,2,1,18.25,18.25,'2026-09-21 16:07:14');
/*!40000 ALTER TABLE `work_order_parts` ENABLE KEYS */;
UNLOCK TABLES;

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
