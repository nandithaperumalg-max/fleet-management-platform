package com.fleetops.engine;

import com.fleetops.entity.MaintenanceRecommendation;
import com.fleetops.entity.Vehicle;
import com.fleetops.entity.VehicleMaintenancePlan;
import com.fleetops.entity.enums.Priority;
import com.fleetops.repository.MaintenanceRecommendationRepository;
import com.fleetops.repository.VehicleMaintenancePlanRepository;
import com.fleetops.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class MaintenanceRecommendationEngine {

    private final VehicleRepository vehicleRepository;
    private final VehicleMaintenancePlanRepository planRepository;
    private final MaintenanceRecommendationRepository recommendationRepository;

    @Value("${fleetops.maintenance.warning-km-threshold:500}")
    private double warningKmThreshold;

    @Value("${fleetops.maintenance.warning-days-threshold:14}")
    private int warningDaysThreshold;

    public MaintenanceRecommendationEngine(VehicleRepository vehicleRepository,
                                           VehicleMaintenancePlanRepository planRepository,
                                           MaintenanceRecommendationRepository recommendationRepository) {
        this.vehicleRepository = vehicleRepository;
        this.planRepository = planRepository;
        this.recommendationRepository = recommendationRepository;
    }

    /**
     * Periodic or on-demand evaluation of fleet assets against preventive maintenance thresholds.
     */
    @Scheduled(cron = "0 0 * * * *") // Run hourly
    @Transactional
    public void evaluateFleet() {
        List<VehicleMaintenancePlan> plans = planRepository.findAll();
        LocalDate today = LocalDate.now();

        for (VehicleMaintenancePlan plan : plans) {
            Vehicle vehicle = plan.getVehicle();
            if (vehicle.getIsDeleted()) continue;

            double currentKm = vehicle.getCurrentOdometer();
            double nextKm = plan.getNextDueOdometer();
            LocalDate nextDate = plan.getNextDueDate();

            double deltaKm = nextKm - currentKm;
            long deltaDays = ChronoUnit.DAYS.between(today, nextDate);

            // 1. Check if OVERDUE
            if (deltaKm <= 0 || deltaDays <= 0) {
                plan.setMaintenanceStatus("OVERDUE");
                createOrUpdateRecommendation(vehicle, plan, Priority.CRITICAL, "OVERDUE_SERVICE",
                        "Critical Service Overdue",
                        String.format("Vehicle has exceeded maintenance threshold by %.1f km or %d days. Immediate workshop intake required.",
                                Math.abs(deltaKm), Math.abs(deltaDays)),
                        currentKm, nextKm, nextDate);
            }
            // 2. Check if DUE_SOON / UPCOMING
            else if (deltaKm <= warningKmThreshold || deltaDays <= warningDaysThreshold) {
                plan.setMaintenanceStatus("UPCOMING");
                createOrUpdateRecommendation(vehicle, plan, Priority.HIGH, "PREVENTIVE_THRESHOLD",
                        "Preventive Service Due Soon",
                        String.format("Vehicle is within service threshold (%.1f km remaining or %d days remaining). Please schedule preventive maintenance.",
                                deltaKm, deltaDays),
                        currentKm, nextKm, nextDate);
            } else {
                plan.setMaintenanceStatus("NORMAL");
            }

            planRepository.save(plan);
        }
    }

    private void createOrUpdateRecommendation(Vehicle vehicle, VehicleMaintenancePlan plan, Priority priority,
                                              String type, String title, String reason,
                                              double currentMetric, double thresholdMetric, LocalDate projectedDate) {
        List<MaintenanceRecommendation> existing = recommendationRepository
                .findByVehicleIdAndIsResolvedFalse(vehicle.getId());

        boolean alreadyRecommended = existing.stream()
                .anyMatch(r -> r.getRule() != null && r.getRule().getId().equals(plan.getRule().getId()));

        if (!alreadyRecommended) {
            MaintenanceRecommendation rec = new MaintenanceRecommendation();
            rec.setVehicle(vehicle);
            rec.setRule(plan.getRule());
            rec.setRecommendationType(type);
            rec.setSeverity(priority);
            rec.setTitle(title);
            rec.setReason(reason);
            rec.setCurrentMetricValue(currentMetric);
            rec.setThresholdMetricValue(thresholdMetric);
            rec.setProjectedDueDate(projectedDate);
            rec.setProjectedDueOdometer(thresholdMetric);
            rec.setIsResolved(false);
            recommendationRepository.save(rec);
        }
    }
}
