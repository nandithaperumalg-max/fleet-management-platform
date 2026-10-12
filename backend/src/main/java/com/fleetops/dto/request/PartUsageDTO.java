package com.fleetops.dto.request;

public class PartUsageDTO {
    private Long partId;
    private Integer quantity;

    public PartUsageDTO() {}

    public PartUsageDTO(Long partId, Integer quantity) {
        this.partId = partId;
        this.quantity = quantity;
    }

    public Long getPartId() { return partId; }
    public void setPartId(Long partId) { this.partId = partId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
