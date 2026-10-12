package com.fleetops.service;

import com.fleetops.dto.request.FuelLogRequest;
import com.fleetops.engine.FuelAnomalyDetectionEngine;
import com.fleetops.entity.*;
import com.fleetops.entity.enums.Priority;
import com.fleetops.exception.ResourceNotFoundException;
import com.fleetops.repository.DriverRepository;
import com.fleetops.repository.FuelTransactionRepository;
import com.fleetops.repository.TripRepository;
import com.fleetops.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FuelService {

    private final FuelTransactionRepository fuelRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;
    private final FuelAnomalyDetectionEngine anomalyEngine;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public FuelService(FuelTransactionRepository fuelRepository,
                       VehicleRepository vehicleRepository,
                       DriverRepository driverRepository,
                       TripRepository tripRepository,
                       FuelAnomalyDetectionEngine anomalyEngine,
                       NotificationService notificationService,
                       AuditLogService auditLogService) {
        this.fuelRepository = fuelRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.tripRepository = tripRepository;
        this.anomalyEngine = anomalyEngine;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    public List<FuelTransaction> getAllFuelLogs() {
        return fuelRepository.findAll();
    }

    public List<FuelTransaction> getFuelLogsByVehicle(Long vehicleId) {
        return fuelRepository.findByVehicleIdOrderByTransactionDateDesc(vehicleId);
    }

    @Transactional
    public FuelTransaction recordFuelLog(FuelLogRequest request, User currentUser) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", request.getVehicleId()));

        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver", request.getDriverId()));

        Trip trip = null;
        if (request.getTripId() != null) {
            trip = tripRepository.findById(request.getTripId()).orElse(null);
        }

        // Anomaly Analysis
        FuelAnomalyDetectionEngine.AnomalyResult result = anomalyEngine.analyzeTransaction(
                vehicle, request.getOdometerAtRefuel(), request.getFuelQuantityLiters()
        );

        FuelTransaction log = new FuelTransaction();
        log.setVehicle(vehicle);
        log.setDriver(driver);
        log.setTrip(trip);
        log.setTransactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDateTime.now());
        log.setFuelQuantityLiters(request.getFuelQuantityLiters());
        log.setUnitPrice(request.getUnitPrice());
        log.setTotalCost(request.getFuelQuantityLiters() * request.getUnitPrice());
        log.setOdometerAtRefuel(request.getOdometerAtRefuel());
        log.setStationName(request.getStationName());
        log.setReceiptNumber(request.getReceiptNumber());
        log.setFuelEconomyKml(result.getFuelEconomyKml());
        log.setIsAnomalyFlag(result.isAnomaly());

        FuelTransaction saved = fuelRepository.save(log);

        // If anomaly flagged, dispatch notification
        if (result.isAnomaly()) {
            notificationService.createNotification(
                    null,
                    "Fuel Anomaly Detected",
                    "Vehicle " + vehicle.getLicensePlate() + " refill at " + request.getStationName() +
                            " flagged for abnormal consumption: " + result.getReason(),
                    Priority.WARNING,
                    "FUEL"
            );
        }

        auditLogService.logAction("fuel_logs", saved.getId(), "INSERT", null,
                "Logged refill of " + saved.getFuelQuantityLiters() + "L for " + vehicle.getLicensePlate(), currentUser, null);

        return saved;
    }

    public Map<String, Object> getFuelAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFleetFuelCost", fuelRepository.getTotalFleetFuelCost());
        stats.put("anomalyCount", fuelRepository.findByIsAnomalyFlagTrue().size());
        stats.put("recentLogs", fuelRepository.findAll());
        return stats;
    }
}
