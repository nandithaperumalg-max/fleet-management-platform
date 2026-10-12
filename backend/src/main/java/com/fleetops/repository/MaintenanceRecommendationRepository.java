package com.fleetops.repository;

import com.fleetops.entity.MaintenanceRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaintenanceRecommendationRepository extends JpaRepository<MaintenanceRecommendation, Long> {
    List<MaintenanceRecommendation> findByVehicleIdAndIsResolvedFalse(Long vehicleId);
    List<MaintenanceRecommendation> findByIsResolvedFalse();
    long countByIsResolvedFalse();
}
