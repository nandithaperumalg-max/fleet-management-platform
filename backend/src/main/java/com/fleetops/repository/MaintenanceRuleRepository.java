package com.fleetops.repository;

import com.fleetops.entity.MaintenanceRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceRuleRepository extends JpaRepository<MaintenanceRule, Long> {
    Optional<MaintenanceRule> findByServiceCode(String serviceCode);
    Boolean existsByServiceCode(String serviceCode);
    List<MaintenanceRule> findAllByOrderByIntervalKmAsc();
}
