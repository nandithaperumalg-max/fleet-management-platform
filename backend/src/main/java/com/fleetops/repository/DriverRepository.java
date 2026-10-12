package com.fleetops.repository;

import com.fleetops.entity.Driver;
import com.fleetops.entity.enums.DriverStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    Optional<Driver> findByLicenseNumber(String licenseNumber);
    Optional<Driver> findByUserId(Long userId);
    Boolean existsByLicenseNumber(String licenseNumber);

    List<Driver> findByEmploymentStatus(DriverStatus status);

    @Query("SELECT d FROM Driver d WHERE d.employmentStatus = 'ACTIVE' AND d.licenseExpiryDate > CURRENT_DATE")
    List<Driver> findEligibleDrivers();

    @Query("SELECT d FROM Driver d WHERE d.employmentStatus = 'ACTIVE' AND d.licenseExpiryDate <= :thresholdDate")
    List<Driver> findDriversWithExpiringLicense(LocalDate thresholdDate);
}
