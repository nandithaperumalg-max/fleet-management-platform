package com.fleetops.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "work_order_parts")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class WorkOrderPart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    private MaintenanceWorkOrder workOrder;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "part_id", nullable = false)
    private SparePart part;

    @Column(name = "quantity_used", nullable = false)
    private Integer quantityUsed = 1;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    @Column(name = "total_price", insertable = false, updatable = false)
    private Double totalPrice;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public WorkOrderPart() {}

    public WorkOrderPart(MaintenanceWorkOrder workOrder, SparePart part, Integer quantityUsed, Double unitPrice) {
        this.workOrder = workOrder;
        this.part = part;
        this.quantityUsed = quantityUsed;
        this.unitPrice = unitPrice;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public MaintenanceWorkOrder getWorkOrder() { return workOrder; }
    public void setWorkOrder(MaintenanceWorkOrder workOrder) { this.workOrder = workOrder; }

    public SparePart getPart() { return part; }
    public void setPart(SparePart part) { this.part = part; }

    public Integer getQuantityUsed() { return quantityUsed; }
    public void setQuantityUsed(Integer quantityUsed) { this.quantityUsed = quantityUsed; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public Double getTotalPrice() {
        if (totalPrice != null) return totalPrice;
        if (quantityUsed != null && unitPrice != null) return quantityUsed * unitPrice;
        return 0.0;
    }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
