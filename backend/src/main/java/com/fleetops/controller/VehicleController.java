package com.fleetops.controller;

import com.fleetops.dto.request.VehicleRequest;
import com.fleetops.dto.response.ApiResponse;
import com.fleetops.entity.User;
import com.fleetops.entity.Vehicle;
import com.fleetops.entity.enums.VehicleStatus;
import com.fleetops.repository.UserRepository;
import com.fleetops.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;
    private final UserRepository userRepository;

    public VehicleController(VehicleService vehicleService, UserRepository userRepository) {
        this.vehicleService = vehicleService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Vehicle>>> getVehicles(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) VehicleStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<Vehicle> result = vehicleService.searchVehicles(search, status, categoryId, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<Vehicle>>> getAvailableVehicles() {
        return ResponseEntity.ok(ApiResponse.ok(vehicleService.getAvailableVehicles()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Vehicle>> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(vehicleService.getVehicleById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Vehicle>> registerVehicle(
            @Valid @RequestBody VehicleRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        Vehicle vehicle = vehicleService.registerVehicle(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Vehicle registered successfully", vehicle));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Vehicle>> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        Vehicle vehicle = vehicleService.updateVehicle(id, request, user);
        return ResponseEntity.ok(ApiResponse.ok("Vehicle updated successfully", vehicle));
    }

    @PatchMapping("/{id}/category")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Vehicle>> changeCategory(
            @PathVariable Long id,
            @RequestParam Long categoryId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        Vehicle vehicle = vehicleService.changeCategory(id, categoryId, user);
        return ResponseEntity.ok(ApiResponse.ok("Category updated successfully", vehicle));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN') or hasRole('DISPATCHER')")
    public ResponseEntity<ApiResponse<String>> updateStatus(
            @PathVariable Long id,
            @RequestParam VehicleStatus status,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        vehicleService.updateStatus(id, status, user);
        return ResponseEntity.ok(ApiResponse.ok("Status updated successfully", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteVehicle(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        vehicleService.softDeleteVehicle(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Vehicle deactivated/soft-deleted successfully", null));
    }
}
