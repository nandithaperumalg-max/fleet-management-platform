package com.fleetops.repository;

import com.fleetops.entity.TripRejectionRequest;
import com.fleetops.entity.enums.RejectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRejectionRequestRepository extends JpaRepository<TripRejectionRequest, Long> {
    List<TripRejectionRequest> findByDriverIdOrderByRequestedAtDesc(Long driverId);
    List<TripRejectionRequest> findByRequestStatusOrderByRequestedAtDesc(RejectionStatus status);
    List<TripRejectionRequest> findByTripId(Long tripId);
}
