package com.fleetops.repository;

import com.fleetops.entity.Trip;
import com.fleetops.entity.enums.TripStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    Optional<Trip> findByTripNumber(String tripNumber);
    Boolean existsByTripNumber(String tripNumber);

    List<Trip> findByVehicleId(Long vehicleId);
    List<Trip> findByDriverId(Long driverId);
    List<Trip> findByStatus(TripStatus status);

    @Query("SELECT t FROM Trip t WHERE t.vehicle.id = :vehicleId AND t.status IN ('ASSIGNED', 'IN_PROGRESS', 'IN_TRANSIT')")
    List<Trip> findActiveTripsForVehicle(@Param("vehicleId") Long vehicleId);

    @Query("SELECT t FROM Trip t WHERE t.driver.id = :driverId AND t.status IN ('ASSIGNED', 'IN_PROGRESS', 'IN_TRANSIT')")
    List<Trip> findActiveTripsForDriver(@Param("driverId") Long driverId);

    @Query("SELECT t FROM Trip t WHERE t.vehicle.id = :vehicleId AND t.status NOT IN ('COMPLETED', 'CANCELLED') AND " +
           "((t.scheduledStart BETWEEN :start AND :end) OR (t.scheduledEnd BETWEEN :start AND :end) OR " +
           "(:start BETWEEN t.scheduledStart AND t.scheduledEnd))")
    List<Trip> findConflictingTripsForVehicle(@Param("vehicleId") Long vehicleId,
                                            @Param("start") LocalDateTime start,
                                            @Param("end") LocalDateTime end);

    @Query("SELECT t FROM Trip t WHERE t.driver.id = :driverId AND t.status NOT IN ('COMPLETED', 'CANCELLED') AND " +
           "((t.scheduledStart BETWEEN :start AND :end) OR (t.scheduledEnd BETWEEN :start AND :end) OR " +
           "(:start BETWEEN t.scheduledStart AND t.scheduledEnd))")
    List<Trip> findConflictingTripsForDriver(@Param("driverId") Long driverId,
                                           @Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);

    Page<Trip> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT SUM(t.distanceKm) FROM Trip t WHERE t.status = 'COMPLETED'")
    Double getTotalFleetDistanceTraveled();
}
