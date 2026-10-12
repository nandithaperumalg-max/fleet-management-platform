package com.fleetops.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_maintenance_plans")
public class VehicleMaintenancePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rule_id", nullable = false)
    private MaintenanceRule rule;

    @Column(name = "last_service_odometer", nullable = false)
    private Double lastServiceOdometer = 0.0;

    @Column(name = "last_service_date", nullable = false)
    private LocalDate lastServiceDate;

    @Column(name = "next_due_odometer", nullable = false)
    private Double nextDueOdometer;

    @Column(name = "next_due_date", nullable = false)
    private LocalDate nextDueDate;

    @Column(name = "maintenance_status", nullable = false, length = 30)
    private String maintenanceStatus = "NORMAL";

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public VehicleMaintenancePlan() {}

    @PrePersist
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

    public Double getLastServiceOdometer() { return lastServiceOdometer; }
    public void setLastServiceOdometer(Double lastServiceOdometer) { this.lastServiceOdometer = lastServiceOdometer; }

    public LocalDate getLastServiceDate() { return lastServiceDate; }
    public void setLastServiceDate(LocalDate lastServiceDate) { this.lastServiceDate = lastServiceDate; }

    public Double getNextDueOdometer() { return nextDueOdometer; }
    public void setNextDueOdometer(Double nextDueOdometer) { this.nextDueOdometer = nextDueOdometer; }

    public LocalDate getNextDueDate() { return nextDueDate; }
    public void setNextDueDate(LocalDate nextDueDate) { this.nextDueDate = nextDueDate; }

    public String getMaintenanceStatus() { return maintenanceStatus; }
    public void setMaintenanceStatus(String maintenanceStatus) { this.maintenanceStatus = maintenanceStatus; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
