package com.healthgrid.monitoring.controller;

import com.healthgrid.monitoring.dto.PatientDTO;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;

/**
 * Integration tests for PatientController.
 * 
 * Note: Full integration tests would require running application with 
 * PostgreSQL and can be run with: mvn verify
 */
@SpringBootTest
class PatientControllerTest {

    @Test
    void contextLoads() {
        // Test that application context loads successfully
    }

    /**
     * Example test case - extend with actual testing
     */
    @Test
    void testPatientDTOCreation() {
        PatientDTO patientDTO = PatientDTO.builder()
            .id(1L)
            .mrn("MRN-001")
            .firstName("John")
            .lastName("Doe")
            .age(45)
            .gender("M")
            .status("ADMITTED")
            .diagnosis("Hypertension")
            .roomNumber("101")
            .bedNumber("A")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        assert patientDTO.getId().equals(1L);
        assert patientDTO.getMrn().equals("MRN-001");
        assert patientDTO.getFirstName().equals("John");
    }

}
