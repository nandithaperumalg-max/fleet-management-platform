package com.fleetops.service;

import com.fleetops.dto.request.VehicleCategoryRequest;
import com.fleetops.entity.VehicleCategory;
import com.fleetops.exception.DuplicateResourceException;
import com.fleetops.exception.ResourceNotFoundException;
import com.fleetops.repository.VehicleCategoryRepository;
import com.fleetops.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VehicleCategoryService {

    private final VehicleCategoryRepository categoryRepository;
    private final VehicleRepository vehicleRepository;

    public VehicleCategoryService(VehicleCategoryRepository categoryRepository, VehicleRepository vehicleRepository) {
        this.categoryRepository = categoryRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public List<Map<String, Object>> getAllCategoriesWithStats() {
        List<VehicleCategory> categories = categoryRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (VehicleCategory cat : categories) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", cat.getId());
            map.put("categoryCode", cat.getCategoryCode());
            map.put("name", cat.getName());
            map.put("description", cat.getDescription());
            map.put("isActive", cat.getIsActive());
            map.put("createdAt", cat.getCreatedAt());

            long vehicleCount = vehicleRepository.findByCategoryIdAndIsDeletedFalse(cat.getId()).size();
            map.put("vehicleCount", vehicleCount);
            result.add(map);
        }
        return result;
    }

    public VehicleCategory getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VehicleCategory", id));
    }

    @Transactional
    public VehicleCategory createCategory(VehicleCategoryRequest request) {
        if (categoryRepository.existsByCategoryCode(request.getCategoryCode())) {
            throw new DuplicateResourceException("Category code " + request.getCategoryCode() + " already exists.");
        }
        VehicleCategory category = new VehicleCategory(request.getCategoryCode(), request.getName(), request.getDescription());
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }
        return categoryRepository.save(category);
    }

    @Transactional
    public VehicleCategory updateCategory(Long id, VehicleCategoryRequest request) {
        VehicleCategory category = getCategoryById(id);
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }
        return categoryRepository.save(category);
    }

    @Transactional
    public void toggleActiveStatus(Long id) {
        VehicleCategory category = getCategoryById(id);
        category.setIsActive(!category.getIsActive());
        categoryRepository.save(category);
    }
}
