package com.fleetops.controller;

import com.fleetops.dto.response.ApiResponse;
import com.fleetops.entity.Notification;
import com.fleetops.entity.User;
import com.fleetops.repository.UserRepository;
import com.fleetops.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        Long userId = user != null ? user.getId() : null;
        String roleName = user != null ? user.getRole().name() : null;

        List<Notification> list = notificationService.getUserNotifications(userId, roleName);
        long unreadCount = notificationService.getUnreadCount(userId);

        Map<String, Object> result = new HashMap<>();
        result.put("notifications", list);
        result.put("unreadCount", unreadCount);

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetails != null ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) : null;
        if (user != null) {
            notificationService.markAllAsRead(user.getId());
        }
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }

    @PostMapping("/broadcast")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('FLEET_MANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Notification>> broadcastNotification(@RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        String message = payload.get("message");
        String category = payload.getOrDefault("category", "GENERAL");
        String targetAudience = payload.getOrDefault("targetAudience", "EVERYONE");
        String priorityStr = payload.getOrDefault("priority", "INFO");
        com.fleetops.entity.enums.Priority priority = com.fleetops.entity.enums.Priority.valueOf(priorityStr);
        
        Notification notif = notificationService.broadcastNotification(title, message, priority, category, targetAudience);
        return ResponseEntity.ok(ApiResponse.ok("Notification broadcasted", notif));
    }
}
