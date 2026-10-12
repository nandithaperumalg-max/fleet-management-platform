package com.fleetops.dto.request;

import com.fleetops.entity.enums.DriverStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class DriverRequest {
    private Long userId;

    private String fullName;
    private String email;
    private String username;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    private String licenseClass = "HEAVY_COMMERCIAL";

    @NotNull(message = "License expiry date is required")
    private LocalDate licenseExpiryDate;

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String emergencyContact;
    private DriverStatus employmentStatus = DriverStatus.ACTIVE;

    public DriverRequest() {}

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getLicenseClass() { return licenseClass; }
    public void setLicenseClass(String licenseClass) { this.licenseClass = licenseClass; }

    public LocalDate getLicenseExpiryDate() { return licenseExpiryDate; }
    public void setLicenseExpiryDate(LocalDate licenseExpiryDate) { this.licenseExpiryDate = licenseExpiryDate; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public DriverStatus getEmploymentStatus() { return employmentStatus; }
    public void setEmploymentStatus(DriverStatus employmentStatus) { this.employmentStatus = employmentStatus; }
}
