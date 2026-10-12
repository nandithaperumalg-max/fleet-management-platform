package com.fleetops.controller;

import com.fleetops.dto.response.ApiResponse;
import com.fleetops.entity.Complaint;
import com.fleetops.entity.User;
import com.fleetops.repository.UserRepository;
import com.fleetops.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final UserRepository userRepository;

    public ComplaintController(ComplaintService complaintService, UserRepository userRepository) {
        this.complaintService = complaintService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> submitComplaint(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> payload) {
        User user = getCurrentUser(userDetails);
        
        String category = (String) payload.get("category");
        String subject = (String) payload.get("subject");
        String description = (String) payload.get("description");
        
        if (subject == null || subject.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Subject is required"));
        }
        if (description == null || description.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Description is required"));
        }
        if (category == null || category.trim().isEmpty()) {
            category = "GENERAL";
        }

        Long vehicleId = null;
        if (payload.get("vehicleId") != null && !payload.get("vehicleId").toString().trim().isEmpty()) {
            try {
                vehicleId = Long.valueOf(payload.get("vehicleId").toString().trim());
            } catch (NumberFormatException ignored) {}
        }

        Long tripId = null;
        if (payload.get("tripId") != null && !payload.get("tripId").toString().trim().isEmpty()) {
            try {
                tripId = Long.valueOf(payload.get("tripId").toString().trim());
            } catch (NumberFormatException ignored) {}
        }

        Complaint complaint = complaintService.submitComplaint(
                user.getId(), category.trim(), subject.trim(), description.trim(), vehicleId, tripId);
                
        return ResponseEntity.ok(ApiResponse.ok("Complaint submitted successfully", complaint));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse> getMyComplaints(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        List<Complaint> complaints = complaintService.getMyComplaints(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(complaints));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse> getAllComplaints() {
        List<Complaint> complaints = complaintService.getAllComplaints();
        return ResponseEntity.ok(ApiResponse.ok(complaints));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getComplaintById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        Complaint complaint = complaintService.getComplaintById(id);
        
        boolean isManagerOrAdmin = user.getRole() == com.fleetops.entity.enums.UserRole.ADMIN 
                || user.getRole() == com.fleetops.entity.enums.UserRole.FLEET_MANAGER 
                || user.getRole() == com.fleetops.entity.enums.UserRole.SUPER_ADMIN;
                
        if (!isManagerOrAdmin && (complaint.getSubmittedBy() == null || !complaint.getSubmittedBy().getId().equals(user.getId()))) {
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied: You can only view your own complaints"));
        }
        
        return ResponseEntity.ok(ApiResponse.ok(complaint));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse> updateComplaintStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        String resolution = payload.get("resolution");
        
        Complaint updated = complaintService.updateComplaintStatus(id, status, resolution);
        return ResponseEntity.ok(ApiResponse.ok("Complaint status updated", updated));
    }
}
