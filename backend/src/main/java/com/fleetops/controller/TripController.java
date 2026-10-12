package com.fleetops.controller;

import com.fleetops.dto.request.TripCompleteRequest;
import com.fleetops.dto.request.TripRequest;
import com.fleetops.dto.response.ApiResponse;
import com.fleetops.entity.Trip;
import com.fleetops.entity.User;
import com.fleetops.repository.UserRepository;
import com.fleetops.service.TripService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/trips")
public class TripController {

    private final TripService tripService;
    private final UserRepository userRepository;

    public TripController(TripService tripService, UserRepository userRepository) {
        this.tripService = tripService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Trip>>> getAllTrips(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(tripService.getAllTrips(PageRequest.of(page, size))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Trip>> getTripById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(tripService.getTripById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN') or hasRole('DISPATCHER')")
    public ResponseEntity<ApiResponse<Trip>> dispatchTrip(
            @Valid @RequestBody TripRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        Trip trip = tripService.dispatchTrip(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Trip dispatched and vehicle assigned successfully", trip));
    }

    @PutMapping("/{id}/start")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN') or hasRole('DISPATCHER')")
    public ResponseEntity<ApiResponse<Trip>> startTrip(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        Trip trip = tripService.startTrip(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Trip marked IN_PROGRESS", trip));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN') or hasRole('DISPATCHER')")
    public ResponseEntity<ApiResponse<Trip>> completeTrip(
            @PathVariable Long id,
            @Valid @RequestBody TripCompleteRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        Trip trip = tripService.completeTrip(id, request, user);
        return ResponseEntity.ok(ApiResponse.ok("Trip completed successfully. Vehicle returned to AVAILABLE.", trip));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN') or hasRole('DISPATCHER')")
    public ResponseEntity<ApiResponse<Trip>> cancelTrip(
            @PathVariable Long id,
            @RequestParam(defaultValue = "Operational cancellation") String reason,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        Trip trip = tripService.cancelTrip(id, reason, user);
        return ResponseEntity.ok(ApiResponse.ok("Trip cancelled successfully. Vehicle released.", trip));
    }
}
