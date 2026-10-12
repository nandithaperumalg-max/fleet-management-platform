package com.fleetops.entity;

import com.fleetops.entity.enums.Priority;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_recommendations")
public class MaintenanceRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rule_id")
    private MaintenanceRule rule;

    @Column(name = "recommendation_type", nullable = false, length = 50)
    private String recommendationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Priority severity = Priority.MEDIUM;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Column(name = "current_metric_value")
    private Double currentMetricValue;

    @Column(name = "threshold_metric_value")
    private Double thresholdMetricValue;

    @Column(name = "projected_due_date")
    private LocalDate projectedDueDate;

    @Column(name = "projected_due_odometer")
    private Double projectedDueOdometer;

    @Column(name = "is_resolved", nullable = false)
    private Boolean isResolved = false;

    @Column(name = "resolved_work_order_id")
    private Long resolvedWorkOrderId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public MaintenanceRecommendation() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

    public MaintenanceRule getRule() { return rule; }
    public void setRule(MaintenanceRule rule) { this.rule = rule; }

    public String getRecommendationType() { return recommendationType; }
    public void setRecommendationType(String recommendationType) { this.recommendationType = recommendationType; }

    public Priority getSeverity() { return severity; }
    public void setSeverity(Priority severity) { this.severity = severity; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Double getCurrentMetricValue() { return currentMetricValue; }
    public void setCurrentMetricValue(Double currentMetricValue) { this.currentMetricValue = currentMetricValue; }

    public Double getThresholdMetricValue() { return thresholdMetricValue; }
    public void setThresholdMetricValue(Double thresholdMetricValue) { this.thresholdMetricValue = thresholdMetricValue; }

    public LocalDate getProjectedDueDate() { return projectedDueDate; }
    public void setProjectedDueDate(LocalDate projectedDueDate) { this.projectedDueDate = projectedDueDate; }

    public Double getProjectedDueOdometer() { return projectedDueOdometer; }
    public void setProjectedDueOdometer(Double projectedDueOdometer) { this.projectedDueOdometer = projectedDueOdometer; }

    public Boolean getIsResolved() { return isResolved; }
    public void setIsResolved(Boolean isResolved) { this.isResolved = isResolved; }

    public Long getResolvedWorkOrderId() { return resolvedWorkOrderId; }
    public void setResolvedWorkOrderId(Long resolvedWorkOrderId) { this.resolvedWorkOrderId = resolvedWorkOrderId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
