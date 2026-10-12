package com.fleetops.controller;

import com.fleetops.dto.response.ApiResponse;
import com.fleetops.entity.Driver;
import com.fleetops.entity.TripRejectionRequest;
import com.fleetops.entity.User;
import com.fleetops.repository.DriverRepository;
import com.fleetops.repository.UserRepository;
import com.fleetops.service.TripRejectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/trip-rejections")
public class TripRejectionController {

    private final TripRejectionService tripRejectionService;
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;

    @Autowired
    public TripRejectionController(TripRejectionService tripRejectionService,
                                   UserRepository userRepository,
                                   DriverRepository driverRepository) {
        this.tripRejectionService = tripRejectionService;
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
    }

    private User getAuthenticatedUser(UserDetails userDetails) {
        if (userDetails == null) return null;
        return userRepository.findByUsername(userDetails.getUsername())
                .orElse(null);
    }

    private Driver getAuthenticatedDriver(UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        if (user == null) return null;
        return driverRepository.findByUserId(user.getId())
                .orElse(null);
    }

    @PostMapping("/")
    @PreAuthorize("hasAuthority('DRIVER') or hasRole('DRIVER')")
    public ResponseEntity<ApiResponse> submitRejection(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long tripId = Long.valueOf(payload.get("tripId").toString());
            String reason = (String) payload.get("reason");

            Driver driver = getAuthenticatedDriver(userDetails);
            if (driver == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Authenticated driver not found"));
            }

            TripRejectionRequest request = tripRejectionService.submitRejection(tripId, driver.getId(), reason);
            return ResponseEntity.ok(ApiResponse.ok("Rejection request submitted successfully", request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('DRIVER') or hasRole('DRIVER')")
    public ResponseEntity<ApiResponse> getMyRejections(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            Driver driver = getAuthenticatedDriver(userDetails);
            if (driver == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Authenticated driver not found"));
            }

            List<TripRejectionRequest> requests = tripRejectionService.getMyRejections(driver.getId());
            return ResponseEntity.ok(ApiResponse.ok(requests));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'FLEET_MANAGER', 'SUPER_ADMIN') or hasAnyRole('ADMIN', 'FLEET_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse> getPendingRejections() {
        try {
            List<TripRejectionRequest> requests = tripRejectionService.getAllPendingRejections();
            return ResponseEntity.ok(ApiResponse.ok(requests));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'FLEET_MANAGER', 'SUPER_ADMIN') or hasAnyRole('ADMIN', 'FLEET_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse> reviewRejection(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            boolean approved = Boolean.parseBoolean(payload.get("approved").toString());
            String reviewNotes = (String) payload.get("reviewNotes");

            User user = getAuthenticatedUser(userDetails);
            if (user == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Authenticated user not found"));
            }

            TripRejectionRequest request = tripRejectionService.reviewRejection(id, approved, user.getId(), reviewNotes);
            return ResponseEntity.ok(ApiResponse.ok("Rejection request reviewed successfully", request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/trip/{tripId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> getRejectionsByTrip(@PathVariable("tripId") Long tripId) {
        try {
            List<TripRejectionRequest> requests = tripRejectionService.getRejectionsByTrip(tripId);
            return ResponseEntity.ok(ApiResponse.ok(requests));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
