package com.fleetops.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class WorkOrderCompleteRequest {
    @NotNull(message = "Labor hours is required")
    private Double laborHours;

    @NotNull(message = "Downtime hours is required")
    private Double downtimeHours;

    private String remarks;
    private List<PartUsageDTO> partsUsed = new ArrayList<>();

    public WorkOrderCompleteRequest() {}

    public Double getLaborHours() { return laborHours; }
    public void setLaborHours(Double laborHours) { this.laborHours = laborHours; }

    public Double getDowntimeHours() { return downtimeHours; }
    public void setDowntimeHours(Double downtimeHours) { this.downtimeHours = downtimeHours; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public List<PartUsageDTO> getPartsUsed() { return partsUsed; }
    public void setPartsUsed(List<PartUsageDTO> partsUsed) { this.partsUsed = partsUsed; }
}
