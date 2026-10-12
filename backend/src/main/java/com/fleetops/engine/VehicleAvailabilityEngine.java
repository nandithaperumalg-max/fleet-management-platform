package com.fleetops.engine;

import com.fleetops.entity.Vehicle;
import com.fleetops.entity.enums.VehicleStatus;
import com.fleetops.entity.enums.WorkOrderStatus;
import com.fleetops.exception.VehicleUnavailableException;
import com.fleetops.repository.MaintenanceWorkOrderRepository;
import com.fleetops.repository.TripRepository;
import com.fleetops.repository.VehicleMaintenancePlanRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class VehicleAvailabilityEngine {

    private final TripRepository tripRepository;
    private final MaintenanceWorkOrderRepository workOrderRepository;
    private final VehicleMaintenancePlanRepository maintenancePlanRepository;

    public VehicleAvailabilityEngine(TripRepository tripRepository,
                                     MaintenanceWorkOrderRepository workOrderRepository,
                                     VehicleMaintenancePlanRepository maintenancePlanRepository) {
        this.tripRepository = tripRepository;
        this.workOrderRepository = workOrderRepository;
        this.maintenancePlanRepository = maintenancePlanRepository;
    }

    /**
     * Validates whether a vehicle is strictly available for a scheduled trip window.
     * Throws VehicleUnavailableException with clear diagnostic messaging on violation.
     */
    public void validateVehicleForDispatch(Vehicle vehicle, LocalDateTime scheduledStart, LocalDateTime scheduledEnd) {
        if (vehicle == null) {
            throw new VehicleUnavailableException("Vehicle does not exist.");
        }

        if (vehicle.getIsDeleted()) {
            throw new VehicleUnavailableException("Vehicle " + vehicle.getLicensePlate() + " has been deactivated/deleted.");
        }

        if (vehicle.getStatus() == VehicleStatus.UNDER_MAINTENANCE) {
            throw new VehicleUnavailableException("Vehicle " + vehicle.getLicensePlate() +
                    " cannot be assigned because it is currently UNDER_MAINTENANCE.");
        }

        if (vehicle.getStatus() == VehicleStatus.INACTIVE || vehicle.getStatus() == VehicleStatus.INACTIVE_RETIRED || vehicle.getStatus() == VehicleStatus.RETIRED) {
            throw new VehicleUnavailableException("Vehicle " + vehicle.getLicensePlate() +
                    " cannot be assigned because it is currently in " + vehicle.getStatus() + " status.");
        }

        // Check for active open maintenance work orders
        var activeOrders = workOrderRepository.findByVehicleIdAndStatusIn(
                vehicle.getId(),
                List.of(WorkOrderStatus.SCHEDULED, WorkOrderStatus.IN_PROGRESS)
        );
        if (!activeOrders.isEmpty()) {
            throw new VehicleUnavailableException("Vehicle " + vehicle.getLicensePlate() +
                    " has an active or scheduled maintenance work order (" + activeOrders.get(0).getWorkOrderNo() + ").");
        }

        // Check for conflicting trip reservations
        var conflictingTrips = tripRepository.findConflictingTripsForVehicle(
                vehicle.getId(), scheduledStart, scheduledEnd
        );
        if (!conflictingTrips.isEmpty()) {
            throw new VehicleUnavailableException("Vehicle " + vehicle.getLicensePlate() +
                    " is already assigned to trip " + conflictingTrips.get(0).getTripNumber() +
                    " during the requested timeframe.");
        }
    }

    /**
     * Evaluates whether vehicle status transition is allowed.
     */
    public boolean canTransitionTo(VehicleStatus currentStatus, VehicleStatus targetStatus) {
        if (currentStatus == targetStatus) return true;
        if (currentStatus == VehicleStatus.RETIRED || currentStatus == VehicleStatus.INACTIVE_RETIRED) {
            return false; // Retired vehicles cannot transition
        }
        return true;
    }
}
