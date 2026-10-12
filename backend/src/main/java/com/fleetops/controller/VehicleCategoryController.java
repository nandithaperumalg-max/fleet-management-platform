package com.fleetops.controller;

import com.fleetops.dto.request.VehicleCategoryRequest;
import com.fleetops.dto.response.ApiResponse;
import com.fleetops.entity.VehicleCategory;
import com.fleetops.service.VehicleCategoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/categories")
public class VehicleCategoryController {

    private final VehicleCategoryService categoryService;

    public VehicleCategoryController(VehicleCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllCategoriesWithStats()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleCategory>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getCategoryById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<VehicleCategory>> createCategory(@Valid @RequestBody VehicleCategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Category created successfully", categoryService.createCategory(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<VehicleCategory>> updateCategory(@PathVariable Long id, @Valid @RequestBody VehicleCategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Category updated successfully", categoryService.updateCategory(id, request)));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<String>> toggleStatus(@PathVariable Long id) {
        categoryService.toggleActiveStatus(id);
        return ResponseEntity.ok(ApiResponse.ok("Category status toggled successfully", null));
    }
}
