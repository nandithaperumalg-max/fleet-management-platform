package com.fleetops.controller;

import com.fleetops.dto.request.WorkOrderCompleteRequest;
import com.fleetops.dto.request.WorkOrderRequest;
import com.fleetops.dto.response.ApiResponse;
import com.fleetops.engine.MaintenanceRecommendationEngine;
import com.fleetops.entity.*;
import com.fleetops.entity.enums.WorkOrderStatus;
import com.fleetops.repository.UserRepository;
import com.fleetops.service.MaintenanceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;
    private final MaintenanceRecommendationEngine recommendationEngine;
    private final UserRepository userRepository;

    public MaintenanceController(MaintenanceService maintenanceService,
                                 MaintenanceRecommendationEngine recommendationEngine,
                                 UserRepository userRepository) {
        this.maintenanceService = maintenanceService;
        this.recommendationEngine = recommendationEngine;
        this.userRepository = userRepository;
    }

    @GetMapping("/work-orders")
    public ResponseEntity<ApiResponse<Page<MaintenanceWorkOrder>>> getWorkOrders(
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(maintenanceService.getAllWorkOrders(status, PageRequest.of(page, size))));
    }

    @GetMapping("/work-orders/{id}")
    public ResponseEntity<ApiResponse<MaintenanceWorkOrder>> getWorkOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(maintenanceService.getWorkOrderById(id)));
    }

    @PostMapping("/work-orders")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<MaintenanceWorkOrder>> createWorkOrder(
            @Valid @RequestBody WorkOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        MaintenanceWorkOrder wo = maintenanceService.createWorkOrder(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Work order created. Vehicle status set to UNDER_MAINTENANCE.", wo));
    }

    @PutMapping("/work-orders/{id}/start")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<MaintenanceWorkOrder>> startWorkOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        MaintenanceWorkOrder wo = maintenanceService.startWorkOrder(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Work order marked IN_PROGRESS", wo));
    }

    @PutMapping("/work-orders/{id}/complete")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<MaintenanceWorkOrder>> completeWorkOrder(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderCompleteRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        MaintenanceWorkOrder wo = maintenanceService.completeWorkOrder(id, request, user);
        return ResponseEntity.ok(ApiResponse.ok("Work order completed. Spare parts deducted and vehicle returned to AVAILABLE.", wo));
    }

    @GetMapping("/rules")
    public ResponseEntity<ApiResponse<List<MaintenanceRule>>> getAllRules() {
        return ResponseEntity.ok(ApiResponse.ok(maintenanceService.getAllRules()));
    }

    @GetMapping("/monitor")
    public ResponseEntity<ApiResponse<List<VehicleMaintenancePlan>>> getUpcomingAndOverdue() {
        return ResponseEntity.ok(ApiResponse.ok(maintenanceService.getUpcomingAndOverduePlans()));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<MaintenanceRecommendation>>> getRecommendations() {
        return ResponseEntity.ok(ApiResponse.ok(maintenanceService.getActiveRecommendations()));
    }

    @PostMapping("/recommendations/evaluate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<String>> evaluateFleetRecommendations() {
        recommendationEngine.evaluateFleet();
        return ResponseEntity.ok(ApiResponse.ok("Fleet recommendation evaluation completed successfully", null));
    }
}
