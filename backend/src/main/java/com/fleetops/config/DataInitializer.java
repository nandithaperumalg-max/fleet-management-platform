package com.fleetops.config;

import com.fleetops.entity.MaintenanceRule;
import com.fleetops.entity.SparePart;
import com.fleetops.entity.User;
import com.fleetops.entity.enums.UserRole;
import com.fleetops.repository.MaintenanceRuleRepository;
import com.fleetops.repository.SparePartRepository;
import com.fleetops.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MaintenanceRuleRepository maintenanceRuleRepository;

    @Autowired
    private SparePartRepository sparePartRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initUsers();
        initMaintenanceRules();
        initSpareParts();
    }

    private void initUsers() {
        String encodedDefaultPassword = passwordEncoder.encode("admin123");
        String encodedDriverPassword = passwordEncoder.encode("driver123");

        // Seed / Update admin user
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", "admin@fleetops.com", encodedDefaultPassword, "System Administrator", UserRole.ADMIN);
            admin.setPhone("+91 9876543210");
            userRepository.save(admin);
            log.info("Initialized default 'admin' user with password 'admin123'");
        } else {
            userRepository.findByUsername("admin").ifPresent(u -> {
                u.setPasswordHash(encodedDefaultPassword);
                userRepository.save(u);
            });
        }

        // Seed / Update manager user
        if (!userRepository.existsByUsername("manager")) {
            User manager = new User("manager", "manager@fleetops.com", encodedDefaultPassword, "Fleet Operations Manager", UserRole.FLEET_MANAGER);
            manager.setPhone("+91 9876543211");
            userRepository.save(manager);
            log.info("Initialized default 'manager' user with password 'admin123'");
        }

        // Seed / Update driver_rajesh user
        if (!userRepository.existsByUsername("driver_rajesh")) {
            User driver = new User("driver_rajesh", "driver.rajesh@fleetops.com", encodedDriverPassword, "Rajesh Kumar", UserRole.DRIVER);
            driver.setPhone("+91 9876543212");
            userRepository.save(driver);
            log.info("Initialized default 'driver_rajesh' user with password 'driver123'");
        }

        // Seed / Update driver_raj user (as per RBAC spec)
        if (!userRepository.existsByUsername("driver_raj")) {
            User driverRaj = new User("driver_raj", "driver.raj@fleetops.com", encodedDriverPassword, "Rajesh Kumar", UserRole.DRIVER);
            driverRaj.setPhone("+91 9876543213");
            userRepository.save(driverRaj);
            log.info("Initialized default 'driver_raj' user with password 'driver123'");
        } else {
            userRepository.findByUsername("driver_raj").ifPresent(d -> {
                d.setPasswordHash(encodedDriverPassword);
                userRepository.save(d);
            });
        }

        // Specific Demo Passwords for Existing 3 Drivers (Task 11)
        String passDriver1 = passwordEncoder.encode("FleetDriver@101");
        String passDriver2 = passwordEncoder.encode("FleetDriver@102");
        String passDriver3 = passwordEncoder.encode("FleetDriver@103");

        userRepository.findByUsername("driver_john").ifPresent(d -> {
            d.setPasswordHash(passDriver1);
            d.setIsActive(true);
            userRepository.save(d);
            log.info("Updated driver_john password to FleetDriver@101");
        });

        userRepository.findByUsername("driver_jane").ifPresent(d -> {
            d.setPasswordHash(passDriver2);
            d.setIsActive(true);
            userRepository.save(d);
            log.info("Updated driver_jane password to FleetDriver@102");
        });

        userRepository.findByUsername("driver_carlos").ifPresent(d -> {
            d.setPasswordHash(passDriver3);
            d.setIsActive(true);
            userRepository.save(d);
            log.info("Updated driver_carlos password to FleetDriver@103");
        });

        // Ensure superadmin has known password
        userRepository.findByUsername("superadmin").ifPresent(sa -> {
            sa.setPasswordHash(encodedDefaultPassword);
            userRepository.save(sa);
        });

        // Ensure dispatcher1 has known password
        if (!userRepository.existsByUsername("dispatcher1")) {
            User dispatcher = new User("dispatcher1", "dispatcher@fleetops.com", encodedDefaultPassword, "Lead Dispatcher", UserRole.DISPATCHER);
            dispatcher.setPhone("+91 9876543214");
            userRepository.save(dispatcher);
            log.info("Initialized default 'dispatcher1' user with password 'admin123'");
        } else {
            userRepository.findByUsername("dispatcher1").ifPresent(d -> {
                d.setPasswordHash(encodedDefaultPassword);
                userRepository.save(d);
            });
        }
    }

    private void initMaintenanceRules() {
        if (maintenanceRuleRepository.count() == 0) {
            List<MaintenanceRule> defaultRules = Arrays.asList(
                    new MaintenanceRule("OIL-CHANGE", "Engine Oil & Filter Replacement", 10000.0, 180, false),
                    new MaintenanceRule("BRAKE-PADS", "Brake System & Disc Overhaul", 25000.0, 365, true),
                    new MaintenanceRule("TIRE-ROT", "Tire Rotation & Wheel Alignment", 15000.0, 180, false),
                    new MaintenanceRule("TRANSMISSION", "Transmission Fluid & Gearbox Inspection", 50000.0, 730, true),
                    new MaintenanceRule("COOLING-SYS", "Coolant Flush & Thermostat Replacement", 40000.0, 365, false)
            );
            maintenanceRuleRepository.saveAll(defaultRules);
            log.info("Seeded {} default preventive maintenance rules", defaultRules.size());
        }
    }

    private void initSpareParts() {
        if (sparePartRepository.count() == 0) {
            List<SparePart> parts = Arrays.asList(
                    new SparePart("OIL-FILT-001", "Synthetic High-Flow Oil Filter", "FILTERS", 450.0, 25, 5, "Bosch Auto"),
                    new SparePart("BRK-PAD-CER", "Ceramic Heavy-Duty Brake Pads", "BRAKES", 2200.0, 12, 4, "Brembo India"),
                    new SparePart("ENG-OIL-5W30", "Castrol Edge Fully Synthetic 5W-30 (5L)", "ENGINE", 3200.0, 18, 6, "Castrol Lubricants"),
                    new SparePart("AIR-FILT-002", "Mann-Filter Micro-Air Intake Filter", "FILTERS", 650.0, 15, 4, "Mann-Filter India"),
                    new SparePart("TYR-RAD-215", "MRF Steel Muscle Commercial Radial Tyre", "TYRES", 6800.0, 8, 4, "MRF Tyres"),
                    new SparePart("BAT-12V-75", "Exide Heavy Commercial 12V 75Ah Battery", "ELECTRICAL", 7500.0, 3, 3, "Exide Industries")
            );
            sparePartRepository.saveAll(parts);
            log.info("Seeded {} spare parts into inventory", parts.size());
        }
    }
}
