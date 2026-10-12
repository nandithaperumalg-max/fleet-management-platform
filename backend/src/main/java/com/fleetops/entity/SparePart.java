package com.fleetops.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "spare_parts")
public class SparePart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "part_sku", nullable = false, unique = true, length = 50)
    private String partSku;

    @Column(name = "part_name", nullable = false, length = 100)
    private String partName;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "unit_cost", nullable = false)
    private Double unitCost = 0.0;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "reorder_threshold", nullable = false)
    private Integer reorderThreshold = 5;

    @Column(name = "supplier_name", length = 100)
    private String supplierName;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public SparePart() {}

    public SparePart(String partSku, String partName, String category, Double unitCost, Integer stockQuantity, Integer reorderThreshold, String supplierName) {
        this.partSku = partSku;
        this.partName = partName;
        this.category = category;
        this.unitCost = unitCost;
        this.stockQuantity = stockQuantity;
        this.reorderThreshold = reorderThreshold;
        this.supplierName = supplierName;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isLowStock() {
        return stockQuantity <= reorderThreshold;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
