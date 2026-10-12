package com.fleetops.dto.request;

import com.fleetops.entity.enums.Priority;
import com.fleetops.entity.enums.ServiceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class WorkOrderRequest {
    private String workOrderNo;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    private Long ruleId;
    private ServiceType serviceType = ServiceType.PREVENTIVE;
    private Priority priority = Priority.MEDIUM;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Scheduled date is required")
    private LocalDate scheduledDate;

    private Long assignedMechanicId;
    private Double laborRatePerHour = 50.0;

    public WorkOrderRequest() {}

    // Getters and Setters
    public String getWorkOrderNo() { return workOrderNo; }
    public void setWorkOrderNo(String workOrderNo) { this.workOrderNo = workOrderNo; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public Long getRuleId() { return ruleId; }
    public void setRuleId(Long ruleId) { this.ruleId = ruleId; }

    public ServiceType getServiceType() { return serviceType; }
    public void setServiceType(ServiceType serviceType) { this.serviceType = serviceType; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }

    public Long getAssignedMechanicId() { return assignedMechanicId; }
    public void setAssignedMechanicId(Long assignedMechanicId) { this.assignedMechanicId = assignedMechanicId; }

    public Double getLaborRatePerHour() { return laborRatePerHour; }
    public void setLaborRatePerHour(Double laborRatePerHour) { this.laborRatePerHour = laborRatePerHour; }
}
