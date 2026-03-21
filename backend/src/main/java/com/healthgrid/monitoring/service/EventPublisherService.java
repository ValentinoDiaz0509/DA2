package com.healthgrid.monitoring.service;

import com.healthgrid.monitoring.dto.AdmissionEventDTO;
import com.healthgrid.monitoring.dto.AdmissionEventDTO.LatestTelemetryDTO;
import com.healthgrid.monitoring.model.Alert;
import com.healthgrid.monitoring.model.Rule;
import com.healthgrid.monitoring.model.TelemetryReading;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event Publisher Service for publishing critical events to AWS SQS.
 * 
 * Responsible for:
 * - Publishing critical alert events to the Internación module (Module 6)
 * - Serializing alerts to AdmissionEventDTO
 * - Handling event publishing failures
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EventPublisherService {

    private final SqsClient sqsClient;
    private final ObjectMapper objectMapper;

    @Value("${aws.sqs.admission-queue-url:http://localhost:4566/000000000000/admission-events-queue}")
    private String admissionQueueUrl;

    /**
     * Publish a critical alert event to the Admission module.
     * 
     * @param alert the critical alert that was generated
     * @param reading the telemetry reading that triggered the alert
     * @param rule the rule that was violated
     */
    public void publishCriticalAlertEvent(Alert alert, TelemetryReading reading, Rule rule) {
        try {
            log.info("EventPublisher: Publishing critical alert event for patient: {}, alert: {}",
                    alert.getPatient().getId(), alert.getId());

            // Build admission event payload
            AdmissionEventDTO admissionEvent = buildAdmissionEvent(alert, reading, rule);

            // Serialize to JSON
            String eventPayload = objectMapper.writeValueAsString(admissionEvent);

            // Send to SQS
            SendMessageRequest sendMessageRequest = SendMessageRequest.builder()
                    .queueUrl(admissionQueueUrl)
                    .messageBody(eventPayload)
                    .messageGroupId("admission-events")  // For FIFO queues
                    .build();

            SendMessageResponse response = sqsClient.sendMessage(sendMessageRequest);

            log.info("EventPublisher: ✓ Critical alert event published to SQS. " +
                    "Patient: {}, MessageId: {}, QueueUrl: {}",
                    alert.getPatient().getId(),
                    response.messageId(),
                    admissionQueueUrl);

        } catch (Exception e) {
            log.error("EventPublisher: Failed to publish critical alert event for patient: {}",
                    alert.getPatient().getId(), e);
            throw new RuntimeException("Failed to publish admission event", e);
        }
    }

    /**
     * Build the AdmissionEventDTO from alert, reading, and rule.
     *
     * @param alert the critical alert
     * @param reading the telemetry reading
     * @param rule the violated rule
     * @return the admission event DTO
     */
    private AdmissionEventDTO buildAdmissionEvent(Alert alert, TelemetryReading reading, Rule rule) {
        Float metricValue = getMetricValueFromReading(reading, rule.getMetricName());

        LatestTelemetryDTO telemetry = LatestTelemetryDTO.builder()
                .heartRate(reading.getHeartRate())
                .spO2(reading.getSpO2())
                .systolicPressure(reading.getSystolicPressure())
                .diastolicPressure(reading.getDiastolicPressure())
                .temperature(reading.getTemperature())
                .recordedAt(reading.getRecordedAt())
                .build();

        String recommendedAction = buildRecommendedAction(rule.getMetricName(), metricValue, rule.getThreshold());

        return AdmissionEventDTO.builder()
                .eventType("CRITICAL_ALERT_ADMISSION")
                .eventId(UUID.randomUUID())
                .timestamp(LocalDateTime.now())
                .patientId(alert.getPatient().getId())
                .patientName(alert.getPatient().getName())
                .patientRoom(alert.getPatient().getRoom())
                .patientBed(alert.getPatient().getBed())
                .currentStatus(alert.getPatient().getStatus().toString())
                .alertId(alert.getId())
                .alertSeverity(alert.getSeverity().toString())
                .alertMessage(alert.getMessage())
                .triggeredAt(alert.getTriggeredAt())
                .metricName(rule.getMetricName())
                .metricValue(metricValue)
                .ruleThreshold(rule.getThreshold())
                .durationSeconds(rule.getDurationSeconds())
                .latestTelemetry(telemetry)
                .recommendedAction(recommendedAction)
                .build();
    }

    /**
     * Extract metric value from reading based on metric name.
     *
     * @param reading the telemetry reading
     * @param metricName the metric name
     * @return the metric value
     */
    private Float getMetricValueFromReading(TelemetryReading reading, String metricName) {
        return switch (metricName.toLowerCase()) {
            case "heart_rate", "heartrate" -> reading.getHeartRate();
            case "spo2", "oxygen_saturation" -> reading.getSpO2();
            case "systolic_pressure" -> reading.getSystolicPressure();
            case "diastolic_pressure" -> reading.getDiastolicPressure();
            case "temperature" -> reading.getTemperature();
            default -> null;
        };
    }

    /**
     * Build recommended clinical action based on the metric violation.
     *
     * @param metricName the metric that was violated
     * @param currentValue the current metric value
     * @param threshold the rule threshold
     * @return recommended action description
     */
    private String buildRecommendedAction(String metricName, Float currentValue, Float threshold) {
        return switch (metricName.toLowerCase()) {
            case "heart_rate", "heartrate" -> {
                if (currentValue > threshold) {
                    yield "URGENT: Tachycardia detected. Assess for cardiac issues, anxiety, pain, infection. Consider ECG. Notify cardiologist if not already on the team.";
                } else {
                    yield "URGENT: Bradycardia detected. Monitor for hemodynamic compromise. Consider pacing. Notify cardiologist immediately.";
                }
            }
            case "spo2", "oxygen_saturation" -> "URGENT: Hypoxemia detected. Increase oxygen delivery, check airway patency, consider respiratory support. Notify respiratory therapy and physician immediately.";
            case "systolic_pressure", "blood_pressure" -> {
                if (currentValue > threshold) {
                    yield "URGENT: Hypertensive crisis. Obtain IV access, prepare vasodilators. Notify physician for medication adjustment.";
                } else {
                    yield "URGENT: Hypotension detected. Check perfusion, prepare vasopressors, obtain IV access. Notify physician and assess for bleeding/sepsis.";
                }
            }
            case "temperature" -> {
                if (currentValue > threshold) {
                    yield "URGENT: High fever detected. Initiate cooling measures, obtain blood cultures if suspected infection, administer antipyretics as ordered.";
                } else {
                    yield "URGENT: Hypothermia detected. Apply warming measures, check for sepsis/medication effects. Notify physician.";
                }
            }
            default -> "Immediate physician review and patient assessment required. Critical metric threshold violation detected.";
        };
    }

}

