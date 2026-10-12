package com.fleetops.repository;

import com.fleetops.entity.Vehicle;
import com.fleetops.entity.enums.VehicleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByVin(String vin);
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    Boolean existsByVin(String vin);
    Boolean existsByLicensePlate(String licensePlate);

    List<Vehicle> findByStatusAndIsDeletedFalse(VehicleStatus status);
    List<Vehicle> findByCategoryIdAndIsDeletedFalse(Long categoryId);
    Page<Vehicle> findByIsDeletedFalse(Pageable pageable);

    long countByStatusAndIsDeletedFalse(VehicleStatus status);
    long countByIsDeletedFalse();

    @Query("SELECT v FROM Vehicle v WHERE v.isDeleted = false AND " +
           "(:search IS NULL OR LOWER(v.licensePlate) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.make) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.model) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.vin) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR v.status = :status) AND " +
           "(:categoryId IS NULL OR v.category.id = :categoryId)")
    Page<Vehicle> searchVehicles(@Param("search") String search,
                                 @Param("status") VehicleStatus status,
                                 @Param("categoryId") Long categoryId,
                                 Pageable pageable);

    @Query("SELECT vc.name, COUNT(v) FROM Vehicle v JOIN v.category vc WHERE v.isDeleted = false GROUP BY vc.name")
    List<Object[]> countVehiclesByCategory();
}
