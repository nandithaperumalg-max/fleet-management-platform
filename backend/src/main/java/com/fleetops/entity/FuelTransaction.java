package com.fleetops.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fuel_logs")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FuelTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    @Column(name = "fuel_quantity_liters", nullable = false)
    private Double fuelQuantityLiters;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    @Column(name = "total_cost", nullable = false)
    private Double totalCost;

    @Column(name = "odometer_at_refuel", nullable = false)
    private Double odometerAtRefuel;

    @Column(name = "station_name", nullable = false, length = 100)
    private String stationName;

    @Column(name = "receipt_number", length = 50)
    private String receiptNumber;

    @Column(name = "fuel_economy_kml")
    private Double fuelEconomyKml;

    @Column(name = "is_anomaly_flag", nullable = false)
    private Boolean isAnomalyFlag = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public FuelTransaction() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

    public Driver getDriver() { return driver; }
    public void setDriver(Driver driver) { this.driver = driver; }

    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }

    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }

    public Double getFuelQuantityLiters() { return fuelQuantityLiters; }
    public void setFuelQuantityLiters(Double fuelQuantityLiters) { this.fuelQuantityLiters = fuelQuantityLiters; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public Double getTotalCost() { return totalCost; }
    public void setTotalCost(Double totalCost) { this.totalCost = totalCost; }

    public Double getOdometerAtRefuel() { return odometerAtRefuel; }
    public void setOdometerAtRefuel(Double odometerAtRefuel) { this.odometerAtRefuel = odometerAtRefuel; }

    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }

    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }

    public Double getFuelEconomyKml() { return fuelEconomyKml; }
    public void setFuelEconomyKml(Double fuelEconomyKml) { this.fuelEconomyKml = fuelEconomyKml; }

    public Boolean getIsAnomalyFlag() { return isAnomalyFlag; }
    public void setIsAnomalyFlag(Boolean isAnomalyFlag) { this.isAnomalyFlag = isAnomalyFlag; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
