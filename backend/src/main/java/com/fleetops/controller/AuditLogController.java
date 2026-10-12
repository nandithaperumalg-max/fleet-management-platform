package com.fleetops.controller;

import com.fleetops.dto.response.ApiResponse;
import com.fleetops.entity.AuditLog;
import com.fleetops.service.AuditLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/audit-logs", "/api/v1/audit"})
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditLogs(
            @RequestParam(required = false) String table,
            @RequestParam(required = false) String tableName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        String filterTable = (table != null && !table.isBlank()) ? table : tableName;
        Page<AuditLog> result = (filterTable != null && !filterTable.isBlank())
                ? auditLogService.getAuditLogsByTable(filterTable, PageRequest.of(page, size))
                : auditLogService.getAuditLogs(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
