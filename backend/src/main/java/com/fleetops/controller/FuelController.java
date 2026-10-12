package com.fleetops.controller;

import com.fleetops.dto.request.FuelLogRequest;
import com.fleetops.dto.response.ApiResponse;
import com.fleetops.entity.FuelTransaction;
import com.fleetops.entity.User;
import com.fleetops.repository.UserRepository;
import com.fleetops.service.FuelService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/fuel")
public class FuelController {

    private final FuelService fuelService;
    private final UserRepository userRepository;

    public FuelController(FuelService fuelService, UserRepository userRepository) {
        this.fuelService = fuelService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FuelTransaction>>> getAllFuelLogs() {
        return ResponseEntity.ok(ApiResponse.ok(fuelService.getAllFuelLogs()));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<ApiResponse<List<FuelTransaction>>> getFuelLogsByVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(ApiResponse.ok(fuelService.getFuelLogsByVehicle(vehicleId)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<FuelTransaction>> recordFuelLog(
            @Valid @RequestBody FuelLogRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        FuelTransaction log = fuelService.recordFuelLog(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Fuel transaction logged successfully", log));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFuelAnalytics() {
        return ResponseEntity.ok(ApiResponse.ok(fuelService.getFuelAnalytics()));
    }
}
