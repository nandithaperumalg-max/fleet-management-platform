package com.fleetops.controller;

import com.fleetops.dto.request.DriverRequest;
import com.fleetops.dto.response.ApiResponse;
import com.fleetops.entity.Driver;
import com.fleetops.entity.User;
import com.fleetops.repository.UserRepository;
import com.fleetops.service.DriverService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/drivers")
public class DriverController {

    private final DriverService driverService;
    private final UserRepository userRepository;

    public DriverController(DriverService driverService, UserRepository userRepository) {
        this.driverService = driverService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Driver>>> getAllDrivers() {
        return ResponseEntity.ok(ApiResponse.ok(driverService.getAllDrivers()));
    }

    @GetMapping("/eligible")
    public ResponseEntity<ApiResponse<List<Driver>>> getEligibleDrivers() {
        return ResponseEntity.ok(ApiResponse.ok(driverService.getEligibleDrivers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Driver>> getDriverById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(driverService.getDriverById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Driver>> onboardDriver(
            @Valid @RequestBody DriverRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        Driver driver = driverService.onboardDriver(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Driver onboarded successfully", driver));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Driver>> updateDriver(
            @PathVariable Long id,
            @Valid @RequestBody DriverRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        Driver driver = driverService.updateDriver(id, request, user);
        return ResponseEntity.ok(ApiResponse.ok("Driver updated successfully", driver));
    }

    @GetMapping("/expiring")
    public ResponseEntity<ApiResponse<List<Driver>>> getExpiringLicenses(@RequestParam(defaultValue = "30") int daysAhead) {
        return ResponseEntity.ok(ApiResponse.ok(driverService.getDriversWithExpiringLicense(daysAhead)));
    }
}
