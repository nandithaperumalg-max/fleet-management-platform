package com.fleetops.controller;

import com.fleetops.dto.response.ApiResponse;
import com.fleetops.dto.response.DashboardKpiResponse;
import com.fleetops.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardKpiResponse>> getDashboardKpis() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getDashboardKPIs()));
    }
}
