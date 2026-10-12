package com.fleetops.service;

import com.fleetops.entity.AuditLog;
import com.fleetops.entity.User;
import com.fleetops.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuditLogService.class);

    @Transactional
    public void logAction(String tableName, Long recordId, String action, String oldValues, String newValues, User user, String ipAddress) {
        try {
            AuditLog auditLog = new AuditLog(tableName, recordId, action, oldValues, newValues, user, ipAddress);
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.warn("Failed to write audit log for {} #{}: {}", tableName, recordId, e.getMessage());
        }
    }

    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<AuditLog> getAuditLogsByTable(String tableName, Pageable pageable) {
        return auditLogRepository.findByTableNameOrderByCreatedAtDesc(tableName, pageable);
    }
}
