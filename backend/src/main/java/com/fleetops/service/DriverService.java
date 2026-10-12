package com.fleetops.service;

import com.fleetops.dto.request.DriverRequest;
import com.fleetops.entity.Driver;
import com.fleetops.entity.User;
import com.fleetops.entity.enums.UserRole;
import com.fleetops.exception.DuplicateResourceException;
import com.fleetops.exception.ResourceNotFoundException;
import com.fleetops.repository.DriverRepository;
import com.fleetops.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class DriverService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public DriverService(DriverRepository driverRepository,
                         UserRepository userRepository,
                         PasswordEncoder passwordEncoder,
                         AuditLogService auditLogService) {
        this.driverRepository = driverRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public List<Driver> getEligibleDrivers() {
        return driverRepository.findEligibleDrivers();
    }

    public Driver getDriverById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", id));
    }

    @Transactional
    public Driver onboardDriver(DriverRequest request, User currentUser) {
        if (driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new DuplicateResourceException("Driver with license " + request.getLicenseNumber() + " already exists.");
        }

        User driverUser;
        if (request.getUserId() != null) {
            driverUser = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));
        } else {
            // Auto-create user account for the driver
            String username = request.getUsername() != null ? request.getUsername() : "driver_" + System.currentTimeMillis();
            String email = request.getEmail() != null ? request.getEmail() : username + "@fleetops.com";
            if (userRepository.existsByUsername(username)) {
                username = username + "_" + (int)(Math.random() * 1000);
            }
            driverUser = new User(
                    username,
                    email,
                    passwordEncoder.encode("driver123"),
                    request.getFullName() != null ? request.getFullName() : "Driver " + request.getLicenseNumber(),
                    UserRole.DRIVER
            );
            driverUser.setPhone(request.getPhone());
            driverUser = userRepository.save(driverUser);
        }

        Driver driver = new Driver();
        driver.setUser(driverUser);
        driver.setLicenseNumber(request.getLicenseNumber());
        driver.setLicenseClass(request.getLicenseClass());
        driver.setLicenseExpiryDate(request.getLicenseExpiryDate());
        driver.setPhone(request.getPhone());
        driver.setEmergencyContact(request.getEmergencyContact());
        if (request.getEmploymentStatus() != null) {
            driver.setEmploymentStatus(request.getEmploymentStatus());
        }

        Driver saved = driverRepository.save(driver);
        auditLogService.logAction("drivers", saved.getId(), "ONBOARD", null,
                "Onboarded driver " + driver.getLicenseNumber(), currentUser, null);

        return saved;
    }

    @Transactional
    public Driver updateDriver(Long id, DriverRequest request, User currentUser) {
        Driver driver = getDriverById(id);
        driver.setLicenseClass(request.getLicenseClass());
        driver.setLicenseExpiryDate(request.getLicenseExpiryDate());
        driver.setPhone(request.getPhone());
        driver.setEmergencyContact(request.getEmergencyContact());
        if (request.getEmploymentStatus() != null) {
            driver.setEmploymentStatus(request.getEmploymentStatus());
        }

        Driver saved = driverRepository.save(driver);
        auditLogService.logAction("drivers", saved.getId(), "UPDATE", null,
                "Updated driver " + driver.getLicenseNumber(), currentUser, null);

        return saved;
    }

    public List<Driver> getDriversWithExpiringLicense(int daysAhead) {
        return driverRepository.findDriversWithExpiringLicense(LocalDate.now().plusDays(daysAhead));
    }
}
