package com.fleetops.engine;

import com.fleetops.entity.Driver;
import com.fleetops.entity.enums.DriverStatus;
import com.fleetops.exception.DriverIneligibleException;
import com.fleetops.repository.TripRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DriverEligibilityEngine {

    private final TripRepository tripRepository;

    public DriverEligibilityEngine(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }

    /**
     * Validates whether a driver is legally and operationally eligible for dispatch.
     */
    public void validateDriverForDispatch(Driver driver, LocalDateTime scheduledStart, LocalDateTime scheduledEnd) {
        if (driver == null) {
            throw new DriverIneligibleException("Driver does not exist.");
        }

        if (driver.getEmploymentStatus() != DriverStatus.ACTIVE) {
            throw new DriverIneligibleException("Driver " + driver.getUser().getFullName() +
                    " cannot be assigned because their employment status is " + driver.getEmploymentStatus() + ".");
        }

        if (driver.getLicenseExpiryDate() == null || driver.getLicenseExpiryDate().isBefore(LocalDate.now())) {
            throw new DriverIneligibleException("Driver " + driver.getUser().getFullName() +
                    " cannot be assigned because their commercial driving license expired on " +
                    driver.getLicenseExpiryDate() + ".");
        }

        // Check if license expires before trip starts
        if (driver.getLicenseExpiryDate().isBefore(scheduledStart.toLocalDate())) {
            throw new DriverIneligibleException("Driver license will expire before the scheduled trip start date.");
        }

        // Check for conflicting trip assignments
        var conflictingTrips = tripRepository.findConflictingTripsForDriver(
                driver.getId(), scheduledStart, scheduledEnd
        );
        if (!conflictingTrips.isEmpty()) {
            throw new DriverIneligibleException("Driver " + driver.getUser().getFullName() +
                    " is already assigned to active trip " + conflictingTrips.get(0).getTripNumber() +
                    " during this timeframe.");
        }
    }
}
