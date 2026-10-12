package com.fleetops.repository;

import com.fleetops.entity.FuelTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FuelTransactionRepository extends JpaRepository<FuelTransaction, Long> {
    List<FuelTransaction> findByVehicleIdOrderByTransactionDateDesc(Long vehicleId);
    List<FuelTransaction> findByIsAnomalyFlagTrue();

    @Query("SELECT SUM(f.totalCost) FROM FuelTransaction f WHERE f.vehicle.id = :vehicleId")
    Double getTotalFuelCostByVehicle(@Param("vehicleId") Long vehicleId);

    @Query("SELECT SUM(f.totalCost) FROM FuelTransaction f")
    Double getTotalFleetFuelCost();

    @Query("SELECT AVG(f.fuelEconomyKml) FROM FuelTransaction f WHERE f.vehicle.id = :vehicleId AND f.fuelEconomyKml IS NOT NULL")
    Double getAverageFuelEconomyByVehicle(@Param("vehicleId") Long vehicleId);

    @Query("SELECT f FROM FuelTransaction f WHERE f.vehicle.id = :vehicleId ORDER BY f.transactionDate DESC LIMIT 1")
    FuelTransaction findLastFuelLogByVehicle(@Param("vehicleId") Long vehicleId);
}
