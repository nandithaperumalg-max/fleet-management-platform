package com.fleetops.service;

import com.fleetops.dto.request.TripCompleteRequest;
import com.fleetops.dto.request.TripRequest;
import com.fleetops.engine.DriverEligibilityEngine;
import com.fleetops.engine.VehicleAvailabilityEngine;
import com.fleetops.entity.Driver;
import com.fleetops.entity.Trip;
import com.fleetops.entity.User;
import com.fleetops.entity.Vehicle;
import com.fleetops.entity.enums.TripStatus;
import com.fleetops.entity.enums.VehicleStatus;
import com.fleetops.exception.BusinessRuleViolationException;
import com.fleetops.exception.DuplicateResourceException;
import com.fleetops.exception.ResourceNotFoundException;
import com.fleetops.repository.DriverRepository;
import com.fleetops.repository.TripRepository;
import com.fleetops.repository.VehicleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final VehicleAvailabilityEngine availabilityEngine;
    private final DriverEligibilityEngine eligibilityEngine;
    private final AuditLogService auditLogService;

    public TripService(TripRepository tripRepository,
                       VehicleRepository vehicleRepository,
                       DriverRepository driverRepository,
                       VehicleAvailabilityEngine availabilityEngine,
                       DriverEligibilityEngine eligibilityEngine,
                       AuditLogService auditLogService) {
        this.tripRepository = tripRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.availabilityEngine = availabilityEngine;
        this.eligibilityEngine = eligibilityEngine;
        this.auditLogService = auditLogService;
    }

    public Page<Trip> getAllTrips(Pageable pageable) {
        return tripRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Trip getTripById(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", id));
    }

    @Transactional
    public Trip dispatchTrip(TripRequest request, User currentUser) {
        if (tripRepository.existsByTripNumber(request.getTripNumber())) {
            throw new DuplicateResourceException("Trip number " + request.getTripNumber() + " already exists.");
        }

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", request.getVehicleId()));

        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver", request.getDriverId()));

        // 1. Strict Guardrail Verification
        availabilityEngine.validateVehicleForDispatch(vehicle, request.getScheduledStart(), request.getScheduledEnd());
        eligibilityEngine.validateDriverForDispatch(driver, request.getScheduledStart(), request.getScheduledEnd());

        // 2. Build and save trip
        Trip trip = new Trip();
        trip.setTripNumber(request.getTripNumber());
        trip.setVehicle(vehicle);
        trip.setDriver(driver);
        trip.setOrigin(request.getOrigin());
        trip.setDestination(request.getDestination());
        trip.setScheduledStart(request.getScheduledStart());
        trip.setScheduledEnd(request.getScheduledEnd());
        trip.setStartOdometer(request.getStartOdometer() != null ? request.getStartOdometer() : vehicle.getCurrentOdometer());
        trip.setCargoWeightKg(request.getCargoWeightKg() != null ? request.getCargoWeightKg() : 0.0);
        trip.setNotes(request.getNotes());
        trip.setStatus(TripStatus.ASSIGNED);
        trip.setCreatedByUser(currentUser);

        // 3. Update Vehicle state to ASSIGNED
        vehicle.setStatus(VehicleStatus.ASSIGNED);
        vehicleRepository.save(vehicle);

        Trip saved = tripRepository.save(trip);
        auditLogService.logAction("trips", saved.getId(), "DISPATCH", null,
                "Dispatched " + saved.getTripNumber() + " with Vehicle " + vehicle.getLicensePlate(), currentUser, null);

        return saved;
    }

    @Transactional
    public Trip startTrip(Long tripId, User currentUser) {
        Trip trip = getTripById(tripId);
        if (trip.getStatus() != TripStatus.ASSIGNED && trip.getStatus() != TripStatus.PLANNED) {
            throw new BusinessRuleViolationException("Cannot start trip in " + trip.getStatus() + " status.");
        }

        trip.setStatus(TripStatus.IN_PROGRESS);
        trip.setActualStart(LocalDateTime.now());
        Trip saved = tripRepository.save(trip);

        auditLogService.logAction("trips", saved.getId(), "START_TRIP", null,
                "Started trip " + saved.getTripNumber(), currentUser, null);

        return saved;
    }

    @Transactional
    public Trip completeTrip(Long tripId, TripCompleteRequest request, User currentUser) {
        Trip trip = getTripById(tripId);
        if (trip.getStatus() != TripStatus.IN_PROGRESS && trip.getStatus() != TripStatus.IN_TRANSIT) {
            throw new BusinessRuleViolationException("Cannot complete a trip that is not IN_PROGRESS.");
        }

        if (request.getEndOdometer() < trip.getStartOdometer()) {
            throw new BusinessRuleViolationException("End odometer (" + request.getEndOdometer() +
                    ") cannot be less than start odometer (" + trip.getStartOdometer() + ").");
        }

        trip.setEndOdometer(request.getEndOdometer());
        trip.setActualEnd(request.getActualEnd() != null ? request.getActualEnd() : LocalDateTime.now());
        trip.setStatus(TripStatus.COMPLETED);
        if (request.getNotes() != null) {
            trip.setNotes((trip.getNotes() != null ? trip.getNotes() + "; " : "") + request.getNotes());
        }

        // Update Vehicle current odometer and release to AVAILABLE
        Vehicle vehicle = trip.getVehicle();
        vehicle.setCurrentOdometer(request.getEndOdometer());
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicleRepository.save(vehicle);

        Trip saved = tripRepository.save(trip);
        auditLogService.logAction("trips", saved.getId(), "COMPLETE_TRIP", null,
                "Completed trip " + saved.getTripNumber() + ". Vehicle " + vehicle.getLicensePlate() + " returned to AVAILABLE.", currentUser, null);

        return saved;
    }

    @Transactional
    public Trip cancelTrip(Long tripId, String reason, User currentUser) {
        Trip trip = getTripById(tripId);
        if (trip.getStatus() == TripStatus.COMPLETED) {
            throw new BusinessRuleViolationException("Cannot cancel a completed trip.");
        }

        trip.setStatus(TripStatus.CANCELLED);
        trip.setNotes((trip.getNotes() != null ? trip.getNotes() + "; Cancel Reason: " : "Cancel Reason: ") + reason);

        // Release Vehicle to AVAILABLE if assigned
        Vehicle vehicle = trip.getVehicle();
        if (vehicle.getStatus() == VehicleStatus.ASSIGNED) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.save(vehicle);
        }

        Trip saved = tripRepository.save(trip);
        auditLogService.logAction("trips", saved.getId(), "CANCEL_TRIP", null,
                "Cancelled trip " + saved.getTripNumber(), currentUser, null);

        return saved;
    }
}
