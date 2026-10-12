package com.fleetops.service;

import com.fleetops.entity.Notification;
import com.fleetops.entity.User;
import com.fleetops.entity.enums.Priority;
import com.fleetops.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Notification createNotification(User recipient, String title, String message, Priority priority, String category) {
        Notification notification = new Notification(recipient, title, message, priority, category);
        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification broadcastNotification(String title, String message, Priority priority, String category, String targetAudience) {
        Notification notification = new Notification(null, title, message, priority, category);
        notification.setTargetAudience(targetAudience);
        return notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(Long userId, String roleName) {
        if (userId != null) {
            List<Notification> individual = notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId);
            List<Notification> audience = notificationRepository.findByTargetAudienceInOrderByCreatedAtDesc(List.of(roleName, "EVERYONE"));
            List<Notification> combined = new java.util.ArrayList<>();
            combined.addAll(individual);
            combined.addAll(audience);
            combined.sort((n1, n2) -> n2.getCreatedAt().compareTo(n1.getCreatedAt()));
            return combined;
        }
        return notificationRepository.findByTargetAudienceInOrderByCreatedAtDesc(List.of("EVERYONE"));
    }

    public long getUnreadCount(Long userId) {
        if (userId != null) {
            return notificationRepository.countByRecipientUserIdAndIsReadFalse(userId);
        }
        return 0;
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByRecipientUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }
}
