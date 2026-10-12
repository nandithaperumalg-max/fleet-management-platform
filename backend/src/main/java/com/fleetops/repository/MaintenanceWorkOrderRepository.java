package com.fleetops.repository;

import com.fleetops.entity.MaintenanceWorkOrder;
import com.fleetops.entity.enums.WorkOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaintenanceWorkOrderRepository extends JpaRepository<MaintenanceWorkOrder, Long> {
    Boolean existsByWorkOrderNo(String workOrderNo);

    List<MaintenanceWorkOrder> findByVehicleIdAndStatusIn(Long vehicleId, List<WorkOrderStatus> statuses);
    List<MaintenanceWorkOrder> findByVehicleId(Long vehicleId);

    Page<MaintenanceWorkOrder> findByStatus(WorkOrderStatus status, Pageable pageable);

    long countByStatus(WorkOrderStatus status);

    @Query("SELECT SUM(w.totalCost) FROM MaintenanceWorkOrder w WHERE w.status = 'COMPLETED'")
    Double getTotalMaintenanceCost();

    @Query("SELECT SUM(w.downtimeHours) FROM MaintenanceWorkOrder w WHERE w.vehicle.id = :vehicleId AND w.status = 'COMPLETED'")
    Double getTotalDowntimeByVehicle(@Param("vehicleId") Long vehicleId);
}
