package com.anand.hospital_management_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Patient name is required")
    @Column(nullable = false)
    private String name;
    
    @NotNull(message = "Patient age is required")
    @Column(nullable = false)
    private Integer age;
    
    @NotBlank(message = "Patient gender is required")
    @Column(nullable = false)
    private String gender;
    
    @NotBlank(message = "Contact number is required")
    @Column(name = "contact_number", nullable = false)
    private String contactNumber;
    
    private String email;
    
    private String address;
    
    @Column(name = "medical_history", columnDefinition = "TEXT")
    private String medicalHistory;
}
