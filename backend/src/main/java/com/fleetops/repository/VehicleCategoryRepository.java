package com.fleetops.repository;

import com.fleetops.entity.VehicleCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleCategoryRepository extends JpaRepository<VehicleCategory, Long> {
    Optional<VehicleCategory> findByCategoryCode(String categoryCode);
    Boolean existsByCategoryCode(String categoryCode);
    List<VehicleCategory> findAllByIsActiveTrue();
}
