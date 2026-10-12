package com.fleetops.repository;

import com.fleetops.entity.SparePart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SparePartRepository extends JpaRepository<SparePart, Long> {
    Optional<SparePart> findByPartSku(String partSku);
    Boolean existsByPartSku(String partSku);

    @Query("SELECT s FROM SparePart s WHERE s.stockQuantity <= s.reorderThreshold")
    List<SparePart> findLowStockParts();

    List<SparePart> findByCategory(String category);
}
