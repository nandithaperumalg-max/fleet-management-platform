package com.fleetops.engine;

import com.fleetops.entity.FuelTransaction;
import com.fleetops.entity.Vehicle;
import com.fleetops.repository.FuelTransactionRepository;
import org.springframework.stereotype.Component;

@Component
public class FuelAnomalyDetectionEngine {

    private final FuelTransactionRepository fuelRepository;

    public FuelAnomalyDetectionEngine(FuelTransactionRepository fuelRepository) {
        this.fuelRepository = fuelRepository;
    }

    /**
     * Calculates km/L and determines whether this transaction represents an anomaly.
     */
    public AnomalyResult analyzeTransaction(Vehicle vehicle, Double odometerAtRefuel, Double fuelQuantityLiters) {
        if (fuelQuantityLiters == null || fuelQuantityLiters <= 0) {
            return new AnomalyResult(null, false, "Invalid fuel quantity");
        }

        FuelTransaction lastLog = fuelRepository.findLastFuelLogByVehicle(vehicle.getId());
        if (lastLog == null || lastLog.getOdometerAtRefuel() == null) {
            // First refill recorded, cannot calculate delta
            return new AnomalyResult(null, false, "Baseline refill");
        }

        double deltaKm = odometerAtRefuel - lastLog.getOdometerAtRefuel();
        if (deltaKm <= 0) {
            return new AnomalyResult(null, true, "Odometer reading is less than or equal to previous refill");
        }

        double calculatedKml = deltaKm / fuelQuantityLiters;
        Double historicalAvgKml = fuelRepository.getAverageFuelEconomyByVehicle(vehicle.getId());

        boolean isAnomaly = false;
        String reason = "Normal consumption";

        if (historicalAvgKml != null && historicalAvgKml > 0) {
            // If efficiency is 25% lower than average or 80% higher than average
            if (calculatedKml < (historicalAvgKml * 0.75)) {
                isAnomaly = true;
                reason = String.format("Abnormal efficiency drop: %.1f km/L vs avg %.1f km/L (-%.1f%%)",
                        calculatedKml, historicalAvgKml, (1.0 - calculatedKml / historicalAvgKml) * 100);
            } else if (calculatedKml > (historicalAvgKml * 1.8)) {
                isAnomaly = true;
                reason = String.format("Suspicious high efficiency: %.1f km/L vs avg %.1f km/L", calculatedKml, historicalAvgKml);
            }
        }

        return new AnomalyResult(calculatedKml, isAnomaly, reason);
    }

    public static class AnomalyResult {
        private final Double fuelEconomyKml;
        private final boolean anomaly;
        private final String reason;

        public AnomalyResult(Double fuelEconomyKml, boolean anomaly, String reason) {
            this.fuelEconomyKml = fuelEconomyKml;
            this.anomaly = anomaly;
            this.reason = reason;
        }

        public Double getFuelEconomyKml() { return fuelEconomyKml; }
        public boolean isAnomaly() { return anomaly; }
        public String getReason() { return reason; }
    }
}
