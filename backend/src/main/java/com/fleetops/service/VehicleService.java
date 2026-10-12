package com.fleetops.service;

import com.fleetops.dto.request.VehicleRequest;
import com.fleetops.entity.User;
import com.fleetops.entity.Vehicle;
import com.fleetops.entity.VehicleCategory;
import com.fleetops.entity.enums.VehicleStatus;
import com.fleetops.exception.BusinessRuleViolationException;
import com.fleetops.exception.DuplicateResourceException;
import com.fleetops.exception.ResourceNotFoundException;
import com.fleetops.repository.VehicleCategoryRepository;
import com.fleetops.repository.VehicleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleCategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public VehicleService(VehicleRepository vehicleRepository,
                          VehicleCategoryRepository categoryRepository,
                          AuditLogService auditLogService) {
        this.vehicleRepository = vehicleRepository;
        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
    }

    public Page<Vehicle> searchVehicles(String search, VehicleStatus status, Long categoryId, Pageable pageable) {
        return vehicleRepository.searchVehicles(search, status, categoryId, pageable);
    }

    public List<Vehicle> getAvailableVehicles() {
        return vehicleRepository.findByStatusAndIsDeletedFalse(VehicleStatus.AVAILABLE);
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .filter(v -> !v.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
    }

    @Transactional
    public Vehicle registerVehicle(VehicleRequest request, User currentUser) {
        if (vehicleRepository.existsByVin(request.getVin())) {
            throw new DuplicateResourceException("Vehicle with VIN " + request.getVin() + " already exists.");
        }
        if (vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new DuplicateResourceException("Vehicle with License Plate " + request.getLicensePlate() + " already exists.");
        }

        Vehicle vehicle = new Vehicle();
        mapRequestToVehicle(request, vehicle);

        Vehicle saved = vehicleRepository.save(vehicle);
        auditLogService.logAction("vehicles", saved.getId(), "INSERT", null,
                "Registered " + saved.getLicensePlate(), currentUser, null);

        return saved;
    }

    @Transactional
    public Vehicle updateVehicle(Long id, VehicleRequest request, User currentUser) {
        Vehicle vehicle = getVehicleById(id);
        String oldValues = "Plate=" + vehicle.getLicensePlate() + ", Status=" + vehicle.getStatus();

        mapRequestToVehicle(request, vehicle);

        Vehicle saved = vehicleRepository.save(vehicle);
        auditLogService.logAction("vehicles", saved.getId(), "UPDATE", oldValues,
                "Updated " + saved.getLicensePlate(), currentUser, null);

        return saved;
    }

    @Transactional
    public Vehicle changeCategory(Long vehicleId, Long newCategoryId, User currentUser) {
        Vehicle vehicle = getVehicleById(vehicleId);
        VehicleCategory newCat = categoryRepository.findById(newCategoryId)
                .orElseThrow(() -> new ResourceNotFoundException("VehicleCategory", newCategoryId));

        String oldCatName = vehicle.getCategory() != null ? vehicle.getCategory().getName() : "None";
        vehicle.setCategory(newCat);
        Vehicle saved = vehicleRepository.save(vehicle);

        auditLogService.logAction("vehicles", saved.getId(), "CATEGORY_CHANGE",
                "Category: " + oldCatName, "Category: " + newCat.getName(), currentUser, null);

        return saved;
    }

    @Transactional
    public void updateStatus(Long vehicleId, VehicleStatus newStatus, User currentUser) {
        Vehicle vehicle = getVehicleById(vehicleId);
        VehicleStatus oldStatus = vehicle.getStatus();

        if (oldStatus == VehicleStatus.RETIRED && newStatus != VehicleStatus.RETIRED) {
            throw new BusinessRuleViolationException("Cannot change status of a RETIRED vehicle.");
        }

        vehicle.setStatus(newStatus);
        vehicleRepository.save(vehicle);

        auditLogService.logAction("vehicles", vehicle.getId(), "STATUS_TRANSITION",
                "Status: " + oldStatus, "Status: " + newStatus, currentUser, null);
    }

    @Transactional
    public void softDeleteVehicle(Long id, User currentUser) {
        Vehicle vehicle = getVehicleById(id);
        vehicle.setIsDeleted(true);
        vehicle.setStatus(VehicleStatus.INACTIVE_RETIRED);
        vehicleRepository.save(vehicle);

        auditLogService.logAction("vehicles", vehicle.getId(), "SOFT_DELETE",
                "isDeleted=false", "isDeleted=true", currentUser, null);
    }

    private void mapRequestToVehicle(VehicleRequest request, Vehicle vehicle) {
        vehicle.setVin(request.getVin());
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setYearManufactured(request.getYearManufactured());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setCapacityKg(request.getCapacityKg());
        vehicle.setPassengerCapacity(request.getPassengerCapacity());
        vehicle.setFuelType(request.getFuelType());
        if (request.getCurrentOdometer() != null) {
            vehicle.setCurrentOdometer(request.getCurrentOdometer());
        }
        vehicle.setAcquisitionDate(request.getAcquisitionDate());
        vehicle.setAcquisitionCost(request.getAcquisitionCost());
        if (request.getStatus() != null) {
            vehicle.setStatus(request.getStatus());
        }

        if (request.getCategoryId() != null) {
            VehicleCategory cat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("VehicleCategory", request.getCategoryId()));
            vehicle.setCategory(cat);
        }
    }
}
