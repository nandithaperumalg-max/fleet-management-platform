package com.fleetops.service;

import com.fleetops.dto.request.PartUsageDTO;
import com.fleetops.dto.request.WorkOrderCompleteRequest;
import com.fleetops.dto.request.WorkOrderRequest;
import com.fleetops.entity.*;
import com.fleetops.entity.enums.Priority;
import com.fleetops.entity.enums.VehicleStatus;
import com.fleetops.entity.enums.WorkOrderStatus;
import com.fleetops.exception.BusinessRuleViolationException;
import com.fleetops.exception.DuplicateResourceException;
import com.fleetops.exception.ResourceNotFoundException;
import com.fleetops.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MaintenanceService {

    private final MaintenanceWorkOrderRepository workOrderRepository;
    private final MaintenanceRuleRepository ruleRepository;
    private final VehicleMaintenancePlanRepository planRepository;
    private final MaintenanceRecommendationRepository recommendationRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final SparePartRepository sparePartRepository;
    private final SparePartService sparePartService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public MaintenanceService(MaintenanceWorkOrderRepository workOrderRepository,
                              MaintenanceRuleRepository ruleRepository,
                              VehicleMaintenancePlanRepository planRepository,
                              MaintenanceRecommendationRepository recommendationRepository,
                              VehicleRepository vehicleRepository,
                              UserRepository userRepository,
                              SparePartRepository sparePartRepository,
                              SparePartService sparePartService,
                              NotificationService notificationService,
                              AuditLogService auditLogService) {
        this.workOrderRepository = workOrderRepository;
        this.ruleRepository = ruleRepository;
        this.planRepository = planRepository;
        this.recommendationRepository = recommendationRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.sparePartRepository = sparePartRepository;
        this.sparePartService = sparePartService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    public Page<MaintenanceWorkOrder> getAllWorkOrders(WorkOrderStatus status, Pageable pageable) {
        if (status != null) {
            return workOrderRepository.findByStatus(status, pageable);
        }
        return workOrderRepository.findAll(pageable);
    }

    public MaintenanceWorkOrder getWorkOrderById(Long id) {
        return workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceWorkOrder", id));
    }

    public List<MaintenanceRule> getAllRules() {
        return ruleRepository.findAllByOrderByIntervalKmAsc();
    }

    public List<VehicleMaintenancePlan> getUpcomingAndOverduePlans() {
        return planRepository.findUpcomingAndOverdue();
    }

    public List<MaintenanceRecommendation> getActiveRecommendations() {
        return recommendationRepository.findByIsResolvedFalse();
    }

    @Transactional
    public MaintenanceWorkOrder createWorkOrder(WorkOrderRequest request, User currentUser) {
        String woNo = request.getWorkOrderNo() != null ? request.getWorkOrderNo() : "WO-" + System.currentTimeMillis();
        if (workOrderRepository.existsByWorkOrderNo(woNo)) {
            throw new DuplicateResourceException("Work Order No " + woNo + " already exists.");
        }

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", request.getVehicleId()));

        if (vehicle.getStatus() == VehicleStatus.ASSIGNED) {
            throw new BusinessRuleViolationException("Cannot place vehicle into maintenance while actively ASSIGNED to a trip.");
        }

        MaintenanceRule rule = null;
        if (request.getRuleId() != null) {
            rule = ruleRepository.findById(request.getRuleId()).orElse(null);
        }

        User mechanic = null;
        if (request.getAssignedMechanicId() != null) {
            mechanic = userRepository.findById(request.getAssignedMechanicId()).orElse(null);
        }

        MaintenanceWorkOrder wo = new MaintenanceWorkOrder();
        wo.setWorkOrderNo(woNo);
        wo.setVehicle(vehicle);
        wo.setRule(rule);
        if (request.getServiceType() != null) wo.setServiceType(request.getServiceType());
        if (request.getPriority() != null) wo.setPriority(request.getPriority());
        wo.setDescription(request.getDescription());
        wo.setScheduledDate(request.getScheduledDate());
        wo.setAssignedMechanic(mechanic);
        wo.setLaborRatePerHour(request.getLaborRatePerHour() != null ? request.getLaborRatePerHour() : 50.0);
        wo.setStatus(WorkOrderStatus.SCHEDULED);
        wo.setCreatedByUser(currentUser);

        // Core Business Rule: Auto-transition vehicle to UNDER_MAINTENANCE
        vehicle.setStatus(VehicleStatus.UNDER_MAINTENANCE);
        vehicleRepository.save(vehicle);

        MaintenanceWorkOrder saved = workOrderRepository.save(wo);

        notificationService.createNotification(
                null,
                "Vehicle Under Maintenance",
                "Work Order " + saved.getWorkOrderNo() + " opened for Vehicle " + vehicle.getLicensePlate() +
                        ". Vehicle status set to UNDER_MAINTENANCE.",
                Priority.INFO,
                "MAINTENANCE"
        );

        auditLogService.logAction("maintenance_work_orders", saved.getId(), "CREATE", null,
                "Created work order " + saved.getWorkOrderNo() + " for " + vehicle.getLicensePlate(), currentUser, null);

        return saved;
    }

    @Transactional
    public MaintenanceWorkOrder startWorkOrder(Long id, User currentUser) {
        MaintenanceWorkOrder wo = getWorkOrderById(id);
        wo.setStatus(WorkOrderStatus.IN_PROGRESS);
        wo.setStartTime(LocalDateTime.now());
        MaintenanceWorkOrder saved = workOrderRepository.save(wo);

        auditLogService.logAction("maintenance_work_orders", saved.getId(), "START", null,
                "Started repair job on " + wo.getWorkOrderNo(), currentUser, null);

        return saved;
    }

    @Transactional
    public MaintenanceWorkOrder completeWorkOrder(Long id, WorkOrderCompleteRequest request, User currentUser) {
        MaintenanceWorkOrder wo = getWorkOrderById(id);
        if (wo.getStatus() == WorkOrderStatus.COMPLETED) {
            throw new BusinessRuleViolationException("Work Order is already completed.");
        }

        wo.setCompletionTime(LocalDateTime.now());
        wo.setStatus(WorkOrderStatus.COMPLETED);
        wo.setLaborHours(request.getLaborHours());
        wo.setDowntimeHours(request.getDowntimeHours());

        double laborCost = request.getLaborHours() * wo.getLaborRatePerHour();
        wo.setLaborCost(laborCost);

        double partsCost = 0.0;
        // Consume Spare Parts
        if (request.getPartsUsed() != null && !request.getPartsUsed().isEmpty()) {
            for (PartUsageDTO usage : request.getPartsUsed()) {
                SparePart part = sparePartRepository.findById(usage.getPartId())
                        .orElseThrow(() -> new ResourceNotFoundException("SparePart", usage.getPartId()));

                sparePartService.consumeStock(part.getId(), usage.getQuantity());

                WorkOrderPart wop = new WorkOrderPart(wo, part, usage.getQuantity(), part.getUnitCost());
                wo.getConsumedParts().add(wop);
                partsCost += (usage.getQuantity() * part.getUnitCost());
            }
        }

        wo.setPartsCost(partsCost);
        wo.setTotalCost(laborCost + partsCost);

        // Core Business Rule: Return Vehicle status to AVAILABLE
        Vehicle vehicle = wo.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicleRepository.save(vehicle);

        // Resolve any matching recommendation for this vehicle
        List<MaintenanceRecommendation> activeRecs = recommendationRepository.findByVehicleIdAndIsResolvedFalse(vehicle.getId());
        for (MaintenanceRecommendation rec : activeRecs) {
            rec.setIsResolved(true);
            rec.setResolvedWorkOrderId(wo.getId());
            recommendationRepository.save(rec);
        }

        MaintenanceWorkOrder saved = workOrderRepository.save(wo);

        notificationService.createNotification(
                null,
                "Maintenance Completed",
                "Work Order " + saved.getWorkOrderNo() + " completed. Vehicle " + vehicle.getLicensePlate() +
                        " is now AVAILABLE for dispatch.",
                Priority.INFO,
                "MAINTENANCE"
        );

        auditLogService.logAction("maintenance_work_orders", saved.getId(), "COMPLETE", null,
                "Completed " + saved.getWorkOrderNo() + ". Total cost: $" + saved.getTotalCost(), currentUser, null);

        return saved;
    }
}
