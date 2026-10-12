package com.fleetops.service;

import com.fleetops.dto.request.SparePartRequest;
import com.fleetops.entity.SparePart;
import com.fleetops.entity.User;
import com.fleetops.entity.enums.Priority;
import com.fleetops.exception.DuplicateResourceException;
import com.fleetops.exception.InsufficientStockException;
import com.fleetops.exception.ResourceNotFoundException;
import com.fleetops.repository.SparePartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SparePartService {

    private final SparePartRepository sparePartRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public SparePartService(SparePartRepository sparePartRepository,
                            NotificationService notificationService,
                            AuditLogService auditLogService) {
        this.sparePartRepository = sparePartRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    public List<SparePart> getAllParts() {
        return sparePartRepository.findAll();
    }

    public List<SparePart> getLowStockParts() {
        return sparePartRepository.findLowStockParts();
    }

    public SparePart getPartById(Long id) {
        return sparePartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SparePart", id));
    }

    @Transactional
    public SparePart addPart(SparePartRequest request, User currentUser) {
        if (sparePartRepository.existsByPartSku(request.getPartSku())) {
            throw new DuplicateResourceException("Part with SKU " + request.getPartSku() + " already exists.");
        }

        SparePart part = new SparePart();
        part.setPartSku(request.getPartSku());
        part.setPartName(request.getPartName());
        part.setCategory(request.getCategory());
        part.setUnitCost(request.getUnitCost());
        part.setStockQuantity(request.getStockQuantity());
        part.setReorderThreshold(request.getReorderThreshold() != null ? request.getReorderThreshold() : 5);
        part.setSupplierName(request.getSupplierName());

        SparePart saved = sparePartRepository.save(part);
        auditLogService.logAction("spare_parts", saved.getId(), "INSERT", null,
                "Added part " + saved.getPartName() + " (" + saved.getPartSku() + ")", currentUser, null);

        return saved;
    }

    @Transactional
    public SparePart restockPart(Long partId, int quantity, User currentUser) {
        SparePart part = getPartById(partId);
        int oldStock = part.getStockQuantity();
        part.setStockQuantity(oldStock + quantity);
        SparePart saved = sparePartRepository.save(part);

        auditLogService.logAction("spare_parts", saved.getId(), "RESTOCK",
                "Stock: " + oldStock, "Stock: " + saved.getStockQuantity(), currentUser, null);

        return saved;
    }

    @Transactional
    public void consumeStock(Long partId, int quantityToConsume) {
        SparePart part = getPartById(partId);
        if (part.getStockQuantity() < quantityToConsume) {
            throw new InsufficientStockException("Insufficient stock for " + part.getPartName() +
                    ". Available: " + part.getStockQuantity() + ", Requested: " + quantityToConsume);
        }

        part.setStockQuantity(part.getStockQuantity() - quantityToConsume);
        sparePartRepository.save(part);

        // Check if now below threshold
        if (part.isLowStock()) {
            notificationService.createNotification(
                    null,
                    "Low Spare Part Stock Alert",
                    "Stock for " + part.getPartName() + " (" + part.getPartSku() +
                            ") has fallen to " + part.getStockQuantity() + " (Threshold: " + part.getReorderThreshold() + "). Please reorder.",
                    Priority.WARNING,
                    "INVENTORY"
            );
        }
    }
}
