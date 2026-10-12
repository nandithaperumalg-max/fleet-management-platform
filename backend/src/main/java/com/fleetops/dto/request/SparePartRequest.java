package com.fleetops.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SparePartRequest {
    @NotBlank(message = "Part SKU is required")
    private String partSku;

    @NotBlank(message = "Part name is required")
    private String partName;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Unit cost is required")
    private Double unitCost;

    @NotNull(message = "Stock quantity is required")
    private Integer stockQuantity;

    private Integer reorderThreshold = 5;
    private String supplierName;

    public SparePartRequest() {}

    // Getters and Setters
    public String getPartSku() { return partSku; }
    public void setPartSku(String partSku) { this.partSku = partSku; }

    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getUnitCost() { return unitCost; }
    public void setUnitCost(Double unitCost) { this.unitCost = unitCost; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Integer getReorderThreshold() { return reorderThreshold; }
    public void setReorderThreshold(Integer reorderThreshold) { this.reorderThreshold = reorderThreshold; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
}
