package com.healthgrid.monitoring.service;

import com.healthgrid.monitoring.dto.PatientDTO;
import com.healthgrid.monitoring.model.Patient;
import com.healthgrid.monitoring.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for PatientService.
 */
@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientService patientService;

    private PatientDTO testPatientDTO;
    private Patient testPatient;

    @BeforeEach
    void setUp() {
        testPatientDTO = PatientDTO.builder()
            .mrn("MRN-001")
            .firstName("John")
            .lastName("Doe")
            .age(45)
            .gender("M")
            .status("ADMITTED")
            .diagnosis("Hypertension")
            .roomNumber("101")
            .bedNumber("A")
            .build();

        testPatient = Patient.builder()
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
    }

    @Test
    void testCreatePatient() {
        when(patientRepository.save(any(Patient.class))).thenReturn(testPatient);

        PatientDTO result = patientService.createPatient(testPatientDTO);

        assertNotNull(result);
        assertEquals("MRN-001", result.getMrn());
        assertEquals("John", result.getFirstName());
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    void testGetPatientById() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(testPatient));

        PatientDTO result = patientService.getPatientById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("MRN-001", result.getMrn());
        verify(patientRepository, times(1)).findById(1L);
    }

    @Test
    void testGetPatientByIdNotFound() {
        when(patientRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> patientService.getPatientById(999L));
    }

    @Test
    void testGetPatientByMrn() {
        when(patientRepository.findByMrn("MRN-001")).thenReturn(Optional.of(testPatient));

        PatientDTO result = patientService.getPatientByMrn("MRN-001");

        assertNotNull(result);
        assertEquals("MRN-001", result.getMrn());
        verify(patientRepository, times(1)).findByMrn("MRN-001");
    }

}
