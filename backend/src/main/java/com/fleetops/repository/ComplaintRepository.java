package com.fleetops.repository;

import com.fleetops.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findBySubmittedByIdOrderBySubmittedAtDesc(Long userId);
    List<Complaint> findAllByOrderBySubmittedAtDesc();
    List<Complaint> findByStatus(String status);
}
