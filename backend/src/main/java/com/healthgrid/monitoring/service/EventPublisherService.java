package com.healthgrid.monitoring.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthgrid.monitoring.dto.AdmissionEventDTO;
import com.healthgrid.monitoring.model.Alert;
import com.healthgrid.monitoring.model.Patient;
import com.healthgrid.monitoring.model.Rule;
import com.healthgrid.monitoring.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;
import software.amazon.awssdk.services.sqs.model.SqsException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventPublisherService {
    
    // TODO(core): reemplazar publicacion directa a SQS por el adapter/event bus definido por Core.
    private final SqsClient sqsClient;
    private final ObjectMapper objectMapper;
    private final PatientRepository patientRepository;
    
    @Value("${admission-queue-url:http://localhost:4566/000000000000/admission-events-queue}")
    private String admissionQueueUrl;
    
    /**
     * Publica un evento CRITICAL a Module 6 (Internación) siguiendo el contrato exacto.
     * 
     * Contrato esperado:
     * {
     *   "patient_id": "UUID",
     *   "alert_severity": "CRITICAL",
     *   "location": "ICU-Room-101",
     *   "triggered_rule": "heart_rate > 120 for 300 seconds",
     *   "metric_name": "heart_rate",
     *   "metric_value": 135.5,
     *   "timestamp": "2026-03-21T12:45:00",
     *   "message": "Complete alert message"
     * }
     */
    public void publishCriticalAlertEvent(Alert alert, Rule rule) {
        // TODO(core): este evento deberia salir por la interfaz de integracion con Core, no directo a Module 6.
        try {
            // PASO 1: Recuperar paciente para obtener ubicación
            Patient patient = patientRepository.findById(alert.getPatient().getId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
            
            // PASO 2: Construir AdmissionEventDTO con TODO el contexto requerido
            AdmissionEventDTO event = AdmissionEventDTO.builder()
                .patientId(alert.getPatient().getId())
                .alertSeverity(alert.getSeverity().name())
                .location(patient.getRoom() + "-" + patient.getBed()) // REQUERIDO
                .triggeredRule(buildRuleDescription(rule)) // REQUERIDO
                .metricName(rule.getMetricName())
                .metricValue(extractMetricValueFromAlert(alert))
                .timestamp(alert.getTriggeredAt())
                .message(alert.getMessage())
                .sensorId(extractSensorIdFromAlert(alert))
                .acknowledgmentRequired(true)
                .priorityLevel("RED") // Código Rojo
                .build();
            
            // PASO 3: Serializar a JSON
            String eventPayload = objectMapper.writeValueAsString(event);
            
            // PASO 4: VALIDAR que el JSON contiene los campos requeridos
            validateEventPayload(event);
            
            // PASO 5: Enviar a SQS con Message Group ID (para FIFO order)
            SendMessageRequest request = SendMessageRequest.builder()
                .queueUrl(admissionQueueUrl)
                .messageBody(eventPayload)
                .messageGroupId("admission-events") // FIFO ordering
                .messageDeduplicationId(
                    generateDeduplicationId(alert, rule)) // Evitar duplicados
                .build();
            
            SendMessageResponse response = sqsClient.sendMessage(request);
            
            log.info("✓ CRITICAL ALERT EVENT PUBLISHED TO MODULE 6 - " +
                "Patient: {}, MessageId: {}, Location: {}, Rule: {}",
                alert.getPatient().getId(),
                response.messageId(),
                event.getLocation(),
                rule.getMetricName());
            
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize admission event to JSON", e);
            throw new RuntimeException("Event serialization failed", e);
        } catch (SqsException e) {
            log.error("Failed to publish admission event to SQS", e);
            throw new RuntimeException("Event publishing failed", e);
        }
    }
    
    /**
     * Construye una descripción legible de la regla para Module 6.
     * Ejemplo: "heart_rate > 120.0 for 300 seconds"
     */
    private String buildRuleDescription(Rule rule) {
        return String.format("%s %s %.1f for %d seconds",
            rule.getMetricName(),
            rule.getOperator(),
            rule.getThreshold(),
            rule.getDurationSeconds() != null ? rule.getDurationSeconds() : 0);
    }
    
    /**
     * Extrae el valor numérico de la métrica desde el mensaje de alerta.
     * Parsea: "Alert: heart_rate value (135.00) triggered..."
     */
    private Double extractMetricValueFromAlert(Alert alert) {
        // Patrón: "Alert: metric_name value (XXX.XX)"
        Pattern pattern = Pattern.compile("value \\(([\\d.]+)\\)");
        Matcher matcher = pattern.matcher(alert.getMessage());
        
        if (matcher.find()) {
            return Double.parseDouble(matcher.group(1));
        }
        return null;
    }
    
    /**
     * Extrae el sensor ID del contexto del paciente o metadata.
     */
    private String extractSensorIdFromAlert(Alert alert) {
        // TODO(core): recuperar sensor_id real desde el contrato/evento original administrado por Core.
        return "SENSOR-UNKNOWN";
    }
    
    /**
     * Valida que el evento contiene TODOS los campos requeridos por Module 6.
     */
    private void validateEventPayload(AdmissionEventDTO event) {
        List<String> errors = new ArrayList<>();
        
        if (event.getPatientId() == null) {
            errors.add("patient_id is required");
        }
        if (StringUtils.isBlank(event.getAlertSeverity())) {
            errors.add("alert_severity is required");
        }
        if (StringUtils.isBlank(event.getLocation())) {
            errors.add("location is required (missing patient room/bed)");
        }
        if (StringUtils.isBlank(event.getTriggeredRule())) {
            errors.add("triggered_rule is required");
        }
        if (event.getTimestamp() == null) {
            errors.add("timestamp is required");
        }
        
        if (!errors.isEmpty()) {
            log.error("❌ INVALID ADMISSION EVENT - Errors: {}", errors);
            throw new IllegalArgumentException("Event validation failed: " + String.join("; ", errors));
        }
        
        log.debug("✓ Admission event payload validation passed");
    }
    
    /**
     * Genera un ID único para deduplicación FIFO en SQS.
     */
    private String generateDeduplicationId(Alert alert, Rule rule) {
        return sha256Hex(
            alert.getPatient().getId() + "|" +
            rule.getId() + "|" + 
            alert.getTriggeredAt().toString()
        );
    }

    private String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }
}
