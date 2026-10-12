package com.fleetops.service;

import com.fleetops.entity.Complaint;
import com.fleetops.entity.User;
import com.fleetops.repository.ComplaintRepository;
import com.fleetops.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public ComplaintService(ComplaintRepository complaintRepository, UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    public Complaint submitComplaint(Long userId, String category, String subject, String description, Long vehicleId, Long tripId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Complaint complaint = new Complaint();
        complaint.setSubmittedBy(user);
        complaint.setCategory(category);
        complaint.setSubject(subject);
        complaint.setDescription(description);
        complaint.setVehicleId(vehicleId);
        complaint.setTripId(tripId);
        complaint.setStatus("OPEN");

        return complaintRepository.save(complaint);
    }

    public List<Complaint> getMyComplaints(Long userId) {
        return complaintRepository.findBySubmittedByIdOrderBySubmittedAtDesc(userId);
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderBySubmittedAtDesc();
    }

    public Complaint updateComplaintStatus(Long complaintId, String newStatus, String resolution) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        
        if (newStatus != null) {
            complaint.setStatus(newStatus);
        }
        if (resolution != null) {
            complaint.setResolution(resolution);
        }
        
        return complaintRepository.save(complaint);
    }

    public Complaint getComplaintById(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
    }
}
