package com.fleetops.controller;

import com.fleetops.dto.request.SparePartRequest;
import com.fleetops.dto.response.ApiResponse;
import com.fleetops.entity.SparePart;
import com.fleetops.entity.User;
import com.fleetops.repository.UserRepository;
import com.fleetops.service.SparePartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parts")
public class SparePartController {

    private final SparePartService sparePartService;
    private final UserRepository userRepository;

    public SparePartController(SparePartService sparePartService, UserRepository userRepository) {
        this.sparePartService = sparePartService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SparePart>>> getAllParts() {
        return ResponseEntity.ok(ApiResponse.ok(sparePartService.getAllParts()));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<SparePart>>> getLowStockParts() {
        return ResponseEntity.ok(ApiResponse.ok(sparePartService.getLowStockParts()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SparePart>> getPartById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(sparePartService.getPartById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<SparePart>> addPart(
            @Valid @RequestBody SparePartRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        SparePart part = sparePartService.addPart(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Spare part added to inventory", part));
    }

    @PutMapping("/{id}/restock")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<SparePart>> restockPart(
            @PathVariable Long id,
            @RequestParam int quantity,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        SparePart part = sparePartService.restockPart(id, quantity, user);
        return ResponseEntity.ok(ApiResponse.ok("Stock updated successfully", part));
    }
}
