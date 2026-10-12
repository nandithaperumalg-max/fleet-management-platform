package com.fleetops.service;

import com.fleetops.entity.Driver;
import com.fleetops.entity.Trip;
import com.fleetops.entity.TripRejectionRequest;
import com.fleetops.entity.User;
import com.fleetops.entity.enums.RejectionStatus;
import com.fleetops.entity.enums.TripStatus;
import com.fleetops.repository.DriverRepository;
import com.fleetops.repository.TripRejectionRequestRepository;
import com.fleetops.repository.TripRepository;
import com.fleetops.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TripRejectionService {

    private final TripRejectionRequestRepository tripRejectionRequestRepository;
    private final TripRepository tripRepository;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;

    @Autowired
    public TripRejectionService(TripRejectionRequestRepository tripRejectionRequestRepository,
                                TripRepository tripRepository,
                                DriverRepository driverRepository,
                                UserRepository userRepository) {
        this.tripRejectionRequestRepository = tripRejectionRequestRepository;
        this.tripRepository = tripRepository;
        this.driverRepository = driverRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TripRejectionRequest submitRejection(Long tripId, Long driverId, String reason) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        if (trip.getStatus() != TripStatus.ASSIGNED) {
            throw new RuntimeException("Trip must be in ASSIGNED status to be rejected");
        }

        if (trip.getDriver() == null || !trip.getDriver().getId().equals(driverId)) {
            throw new RuntimeException("Driver is not assigned to this trip");
        }

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        TripRejectionRequest request = new TripRejectionRequest();
        request.setTrip(trip);
        request.setDriver(driver);
        request.setReason(reason);
        request.setRequestStatus(RejectionStatus.PENDING);

        return tripRejectionRequestRepository.save(request);
    }

    @Transactional
    public TripRejectionRequest reviewRejection(Long rejectionId, boolean approved, Long reviewerUserId, String reviewNotes) {
        TripRejectionRequest request = tripRejectionRequestRepository.findById(rejectionId)
                .orElseThrow(() -> new RuntimeException("Rejection request not found"));

        if (request.getRequestStatus() != RejectionStatus.PENDING) {
            throw new RuntimeException("Request has already been reviewed");
        }

        User reviewer = userRepository.findById(reviewerUserId)
                .orElseThrow(() -> new RuntimeException("Reviewer user not found"));

        request.setRequestStatus(approved ? RejectionStatus.APPROVED : RejectionStatus.REJECTED);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewedBy(reviewer);
        request.setReviewNotes(reviewNotes);

        if (approved) {
            Trip trip = request.getTrip();
            trip.setStatus(TripStatus.PLANNED);
            trip.setDriver(null);
            tripRepository.save(trip);
        }

        return tripRejectionRequestRepository.save(request);
    }

    public List<TripRejectionRequest> getMyRejections(Long driverId) {
        return tripRejectionRequestRepository.findByDriverIdOrderByRequestedAtDesc(driverId);
    }

    public List<TripRejectionRequest> getAllPendingRejections() {
        return tripRejectionRequestRepository.findByRequestStatusOrderByRequestedAtDesc(RejectionStatus.PENDING);
    }

    public List<TripRejectionRequest> getRejectionsByTrip(Long tripId) {
        return tripRejectionRequestRepository.findByTripId(tripId);
    }
}
