package com.healthgrid.monitoring.model;

/**
 * Determina el status GENERAL de un paciente basado en alertas activas.
 * 
 * Lógica de Prioridad:
 * 1. Si hay alertas CRITICAL no reconocidas → CRITICAL
 * 2. Si hay alertas WARNING no reconocidas → WARNING
 * 3. Si todas las alertas están reconocidas → usar status del paciente
 * 4. Si no hay alertas → NORMAL
 */
public enum PatientStatus {
    NORMAL("El paciente está estable", 1),
    WARNING("El paciente requiere atención", 2),
    CRITICAL("El paciente requiere atención urgente", 3);
    
    private final String description;
    private final int priority;
    
    PatientStatus(String description, int priority) {
        this.description = description;
        this.priority = priority;
    }
    
    public String getDescription() {
        return description;
    }
    
    public int getPriority() {
        return priority;
    }
}

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientStatusCalculator {
    
    private final AlertRepository alertRepository;
    
    /**
     * Calcula el status de un paciente basado en alertas sin reconocer.
     */
    public String calculatePatientStatus(UUID patientId, Patient patientEntity) {
        // PASO 1: Obtener alertas SIN reconocer
        List<Alert> unacknowledgedAlerts = alertRepository
            .findByPatientIdAndAcknowledgedFalse(patientId);
        
        if (unacknowledgedAlerts.isEmpty()) {
            // Si no hay alertas sin reconocer → retornar status del paciente
            return patientEntity.getStatus();
        }
        
        // PASO 2: Buscar la alerta con mayor severidad
        Optional<Alert> maxSeverityAlert = unacknowledgedAlerts.stream()
            .max(Comparator.comparing(a -> getSeverityPriority(a.getSeverity())));
        
        if (maxSeverityAlert.isPresent()) {
            String alertSeverity = maxSeverityAlert.get().getSeverity();
            
            // PASO 3: Mapear severidad de alerta a status de paciente
            return switch (alertSeverity.toUpperCase()) {
                case "CRITICAL" -> PatientStatus.CRITICAL.name();
                case "WARNING" -> PatientStatus.WARNING.name();
                case "INFO" -> PatientStatus.NORMAL.name();
                default -> patientEntity.getStatus();
            };
        }
        
        return patientEntity.getStatus();
    }
    
    /**
     * Retorna la prioridad numérica de una severidad de alerta.
     */
    private int getSeverityPriority(String severity) {
        return switch (severity.toUpperCase()) {
            case "CRITICAL" -> 3;
            case "WARNING" -> 2;
            case "INFO" -> 1;
            default -> 0;
        };
    }
    
    /**
     * Test unitario para la lógica de cálculo de status.
     */
    @Test
    void testStatusCalculation() {
        Patient patient = Patient.builder()
            .id(UUID.randomUUID())
            .name("John Doe")
            .status(PatientStatus.NORMAL.name())
            .build();
        
        // Caso 1: Sin alertas → NORMAL
        List<Alert> noAlerts = List.of();
        String status1 = calculateStatusWithMock(patient, noAlerts);
        assertThat(status1).isEqualTo("NORMAL");
        
        // Caso 2: Una alerta WARNING → WARNING
        List<Alert> warningAlerts = List.of(
            Alert.builder()
                .severity("WARNING")
                .message("High blood pressure")
                .build()
        );
        String status2 = calculateStatusWithMock(patient, warningAlerts);
        assertThat(status2).isEqualTo("WARNING");
        
        // Caso 3: Una alerta CRITICAL → CRITICAL
        List<Alert> criticalAlerts = List.of(
            Alert.builder()
                .severity("CRITICAL")
                .message("Low oxygen")
                .build()
        );
        String status3 = calculateStatusWithMock(patient, criticalAlerts);
        assertThat(status3).isEqualTo("CRITICAL");
        
        // Caso 4: Múltiples alertas → Usar la de mayor prioridad
        List<Alert> mixedAlerts = List.of(
            Alert.builder().severity("WARNING").build(),
            Alert.builder().severity("INFO").build(),
            Alert.builder().severity("CRITICAL").build()
        );
        String status4 = calculateStatusWithMock(patient, mixedAlerts);
        assertThat(status4).isEqualTo("CRITICAL"); // CRITICAL gana
    }
}
