package com.fleetops.repository;

import com.fleetops.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByRecipientUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    long countByRecipientUserIdAndIsReadFalse(Long userId);
    List<Notification> findByRecipientUserIsNullOrderByCreatedAtDesc();
    List<Notification> findByTargetAudienceOrderByCreatedAtDesc(String targetAudience);
    List<Notification> findByTargetAudienceInOrderByCreatedAtDesc(List<String> audiences);
}
