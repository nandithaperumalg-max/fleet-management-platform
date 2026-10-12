package com.fleetops.dto.response;

import java.util.List;
import java.util.Map;

public class DashboardKpiResponse {
    private long totalVehicles;
    private long availableVehicles;
    private long assignedVehicles;
    private long underMaintenanceVehicles;
    private long inactiveVehicles;

    private long totalDrivers;
    private long activeTrips;
    private Double totalFleetDistanceKm;
    private Double totalFuelExpenditure;
    private Double totalMaintenanceExpenditure;

    private long upcomingMaintenanceCount;
    private long overdueMaintenanceCount;
    private long lowStockPartsCount;
    private long activeRecommendationsCount;

    private List<Map<String, Object>> categoryDistribution;
    private List<Map<String, Object>> monthlyCosts;

    public DashboardKpiResponse() {}

    // Getters and Setters
    public long getTotalVehicles() { return totalVehicles; }
    public void setTotalVehicles(long totalVehicles) { this.totalVehicles = totalVehicles; }

    public long getAvailableVehicles() { return availableVehicles; }
    public void setAvailableVehicles(long availableVehicles) { this.availableVehicles = availableVehicles; }

    public long getAssignedVehicles() { return assignedVehicles; }
    public void setAssignedVehicles(long assignedVehicles) { this.assignedVehicles = assignedVehicles; }

    public long getUnderMaintenanceVehicles() { return underMaintenanceVehicles; }
    public void setUnderMaintenanceVehicles(long underMaintenanceVehicles) { this.underMaintenanceVehicles = underMaintenanceVehicles; }

    public long getInactiveVehicles() { return inactiveVehicles; }
    public void setInactiveVehicles(long inactiveVehicles) { this.inactiveVehicles = inactiveVehicles; }

    public long getTotalDrivers() { return totalDrivers; }
    public void setTotalDrivers(long totalDrivers) { this.totalDrivers = totalDrivers; }

    public long getActiveTrips() { return activeTrips; }
    public void setActiveTrips(long activeTrips) { this.activeTrips = activeTrips; }

    public Double getTotalFleetDistanceKm() { return totalFleetDistanceKm; }
    public void setTotalFleetDistanceKm(Double totalFleetDistanceKm) { this.totalFleetDistanceKm = totalFleetDistanceKm; }

    public Double getTotalFuelExpenditure() { return totalFuelExpenditure; }
    public void setTotalFuelExpenditure(Double totalFuelExpenditure) { this.totalFuelExpenditure = totalFuelExpenditure; }

    public Double getTotalMaintenanceExpenditure() { return totalMaintenanceExpenditure; }
    public void setTotalMaintenanceExpenditure(Double totalMaintenanceExpenditure) { this.totalMaintenanceExpenditure = totalMaintenanceExpenditure; }

    public long getUpcomingMaintenanceCount() { return upcomingMaintenanceCount; }
    public void setUpcomingMaintenanceCount(long upcomingMaintenanceCount) { this.upcomingMaintenanceCount = upcomingMaintenanceCount; }

    public long getOverdueMaintenanceCount() { return overdueMaintenanceCount; }
    public void setOverdueMaintenanceCount(long overdueMaintenanceCount) { this.overdueMaintenanceCount = overdueMaintenanceCount; }

    public long getLowStockPartsCount() { return lowStockPartsCount; }
    public void setLowStockPartsCount(long lowStockPartsCount) { this.lowStockPartsCount = lowStockPartsCount; }

    public long getActiveRecommendationsCount() { return activeRecommendationsCount; }
    public void setActiveRecommendationsCount(long activeRecommendationsCount) { this.activeRecommendationsCount = activeRecommendationsCount; }

    public List<Map<String, Object>> getCategoryDistribution() { return categoryDistribution; }
    public void setCategoryDistribution(List<Map<String, Object>> categoryDistribution) { this.categoryDistribution = categoryDistribution; }

    public List<Map<String, Object>> getMonthlyCosts() { return monthlyCosts; }
    public void setMonthlyCosts(List<Map<String, Object>> monthlyCosts) { this.monthlyCosts = monthlyCosts; }
}
