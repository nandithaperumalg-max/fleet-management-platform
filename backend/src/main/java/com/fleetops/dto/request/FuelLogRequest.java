package com.fleetops.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class FuelLogRequest {
    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Driver ID is required")
    private Long driverId;

    private Long tripId;
    private LocalDateTime transactionDate;

    @NotNull(message = "Fuel quantity is required")
    private Double fuelQuantityLiters;

    @NotNull(message = "Unit price is required")
    private Double unitPrice;

    @NotNull(message = "Odometer at refuel is required")
    private Double odometerAtRefuel;

    @NotBlank(message = "Station name is required")
    private String stationName;

    private String receiptNumber;

    public FuelLogRequest() {}

    // Getters and Setters
    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }

    public Double getFuelQuantityLiters() { return fuelQuantityLiters; }
    public void setFuelQuantityLiters(Double fuelQuantityLiters) { this.fuelQuantityLiters = fuelQuantityLiters; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public Double getOdometerAtRefuel() { return odometerAtRefuel; }
    public void setOdometerAtRefuel(Double odometerAtRefuel) { this.odometerAtRefuel = odometerAtRefuel; }

    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }

    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }
}
