package com.anand.hospital_management_system.controller;

import com.anand.hospital_management_system.entity.Appointment;
import com.anand.hospital_management_system.entity.Doctor;
import com.anand.hospital_management_system.entity.Patient;
import com.anand.hospital_management_system.repository.AppointmentRepository;
import com.anand.hospital_management_system.repository.DoctorRepository;
import com.anand.hospital_management_system.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(@Validated @RequestBody Appointment appointment) {
        if (appointment.getPatient() == null || appointment.getPatient().getId() == null) {
            return ResponseEntity.badRequest().body("Patient and Patient ID are required");
        }
        if (appointment.getDoctor() == null || appointment.getDoctor().getId() == null) {
            return ResponseEntity.badRequest().body("Doctor and Doctor ID are required");
        }

        Patient patient = patientRepository.findById(appointment.getPatient().getId()).orElse(null);
        Doctor doctor = doctorRepository.findById(appointment.getDoctor().getId()).orElse(null);

        if (patient == null) {
            return ResponseEntity.badRequest().body("Patient not found");
        }
        if (doctor == null) {
            return ResponseEntity.badRequest().body("Doctor not found");
        }

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return ResponseEntity.ok(savedAppointment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(@PathVariable Long id, @Validated @RequestBody Appointment appointmentDetails) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    if (appointmentDetails.getPatient() != null && appointmentDetails.getPatient().getId() != null) {
                        Patient patient = patientRepository.findById(appointmentDetails.getPatient().getId()).orElse(null);
                        if (patient != null) {
                            appointment.setPatient(patient);
                        }
                    }
                    if (appointmentDetails.getDoctor() != null && appointmentDetails.getDoctor().getId() != null) {
                        Doctor doctor = doctorRepository.findById(appointmentDetails.getDoctor().getId()).orElse(null);
                        if (doctor != null) {
                            appointment.setDoctor(doctor);
                        }
                    }
                    appointment.setAppointmentDate(appointmentDetails.getAppointmentDate());
                    appointment.setAppointmentTime(appointmentDetails.getAppointmentTime());
                    appointment.setStatus(appointmentDetails.getStatus());
                    appointment.setReason(appointmentDetails.getReason());
                    appointment.setDoctorRemarks(appointmentDetails.getDoctorRemarks());
                    Appointment updatedAppointment = appointmentRepository.save(appointment);
                    return ResponseEntity.ok(updatedAppointment);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointmentRepository.delete(appointment);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
