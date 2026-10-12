package com.fleetops.repository;

import com.fleetops.entity.VehicleMaintenancePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VehicleMaintenancePlanRepository extends JpaRepository<VehicleMaintenancePlan, Long> {
    List<VehicleMaintenancePlan> findByVehicleId(Long vehicleId);

    @Query("SELECT p FROM VehicleMaintenancePlan p WHERE p.maintenanceStatus IN ('UPCOMING', 'OVERDUE')")
    List<VehicleMaintenancePlan> findUpcomingAndOverdue();

    @Query("SELECT p FROM VehicleMaintenancePlan p WHERE p.maintenanceStatus = 'OVERDUE'")
    List<VehicleMaintenancePlan> findOverduePlans();

    long countByMaintenanceStatus(String status);
}
