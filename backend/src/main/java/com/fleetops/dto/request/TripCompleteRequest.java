package com.fleetops.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class TripCompleteRequest {
    @NotNull(message = "End odometer reading is required")
    private Double endOdometer;

    private LocalDateTime actualEnd;
    private String notes;

    public TripCompleteRequest() {}

    public Double getEndOdometer() { return endOdometer; }
    public void setEndOdometer(Double endOdometer) { this.endOdometer = endOdometer; }

    public LocalDateTime getActualEnd() { return actualEnd; }
    public void setActualEnd(LocalDateTime actualEnd) { this.actualEnd = actualEnd; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
