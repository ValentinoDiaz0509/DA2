package com.healthgrid.monitoring.consumer;

import com.healthgrid.monitoring.dto.TelemetryMessageDTO;
import com.healthgrid.monitoring.dto.TelemetryReadingDTO;
import com.healthgrid.monitoring.model.Alert;
import com.healthgrid.monitoring.model.TelemetryReading;
import com.healthgrid.monitoring.repository.TelemetryReadingRepository;
import com.healthgrid.monitoring.service.RuleEngineService;
import com.healthgrid.monitoring.service.TelemetryReadingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Consumer;

/**
 * Consumer for telemetry messages from AWS SQS.
 * Receives messages from IoT sensors, persists readings, evaluates health rules with time-window logic,
 * and publishes critical admission events.
 *
 * Workflow:
 * 1. Deserialize TelemetryMessageDTO from SQS
 * 2. Persist TelemetryReading to database
 * 3. Evaluate against active rules using RuleEngineService
 * 4. Generate CRITICAL alerts if sustained violations detected
 * 5. Publish admission events to Module 6 (Internación)
 *
 * Bindings configured in application.yml:
 * - Input: telemetry-in (subscribed to SQS queue)
 * - Output: admission-events-queue (publishes to Module 6)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TelemetryConsumer {

    private final TelemetryReadingService telemetryReadingService;
    private final RuleEngineService ruleEngineService;
    private final TelemetryReadingRepository telemetryReadingRepository;

    /**
     * Consume telemetry messages from SQS.
     * Process the message, save telemetry reading, evaluate rules, and generate alerts if necessary.
     *
     * Spring Cloud Stream binding name: "telemetry-in"
     *
     * @return Consumer function that processes telemetry messages
     */
    @Bean
    public Consumer<TelemetryMessageDTO> telemetryEventInput() {
        return telemetryMessage -> {
            try {
                log.info("Received telemetry message from sensor: {} for patient: {}",
                        telemetryMessage.getSensorId(), telemetryMessage.getPatientId());

                // Convert and save telemetry reading
                TelemetryReadingDTO readingDTO = convertMessageToReadingDTO(telemetryMessage);
                TelemetryReadingDTO savedReading = telemetryReadingService.recordReading(
                        telemetryMessage.getPatientId(),
                        readingDTO
                );

                log.info("Telemetry reading saved with ID: {}", savedReading.getId());

                // Retrieve the saved reading entity for rule evaluation
                TelemetryReading reading = telemetryReadingRepository.findById(savedReading.getId())
                        .orElseThrow(() -> new RuntimeException("Reading not found after save"));

                // Evaluate rules with time-window logic using RuleEngineService
                // This will detect sustained violations and generate CRITICAL alerts
                // It will also publish admission events to Module 6 (Internación)
                List<Alert> alerts = ruleEngineService.evaluateReadingAndGenerateAlerts(reading);

                if (!alerts.isEmpty()) {
                    log.warn("Generated {} CRITICAL alert(s) for patient: {}", alerts.size(),
                            telemetryMessage.getPatientId());
                    handleGeneratedAlerts(alerts, telemetryMessage);
                } else {
                    log.debug("No alerts generated for reading ID: {}", savedReading.getId());
                }

                logTelemetryMetrics(telemetryMessage);

            } catch (Exception e) {
                log.error("Error processing telemetry message from sensor: {}",
                        telemetryMessage.getSensorId(), e);
                handleTelemetryProcessingError(telemetryMessage, e);
            }
        };
    }

    /**
     * Convert telemetry message to TelemetryReadingDTO.
     *
     * @param message the telemetry message from SQS
     * @return the reading DTO
     */
    private TelemetryReadingDTO convertMessageToReadingDTO(TelemetryMessageDTO message) {
        return TelemetryReadingDTO.builder()
                .patientId(message.getPatientId())
                .heartRate(message.getMetrics().getHeartRate())
                .spO2(message.getMetrics().getSpO2())
                .systolicPressure(message.getMetrics().getSystolicPressure())
                .diastolicPressure(message.getMetrics().getDiastolicPressure())
                .temperature(message.getMetrics().getTemperature())
                .build();
    }

    /**
     * Handle generated alerts.
     * Log alerts and potentially trigger notifications.
     *
     * @param alerts the list of generated alerts
     * @param originalMessage the original telemetry message
     */
    private void handleGeneratedAlerts(List<Alert> alerts, TelemetryMessageDTO originalMessage) {
        for (Alert alert : alerts) {
            log.warn("ALERT [{}] - Patient: {}, Severity: {}, Message: {}",
                    alert.getId(),
                    alert.getPatient().getId(),
                    alert.getSeverity(),
                    alert.getMessage()
            );

            // NOTE: Admission event is published by RuleEngineService -> EventPublisherService
            // No additional action needed here
        }
    }

    /**
     * Handle errors during telemetry processing.
     * Log the error with full context for debugging and auditing.
     *
     * @param message the telemetry message that caused the error
     * @param exception the exception that occurred
     */
    private void handleTelemetryProcessingError(TelemetryMessageDTO message, Exception exception) {
        log.error("Failed to process telemetry message - Sensor: {}, Patient: {}, Error: {}",
                message.getSensorId(),
                message.getPatientId(),
                exception.getMessage()
        );

        // TODO: Send error to dead-letter queue or error handling service
        // errorHandlingService.logTelemetryProcessingError(message, exception);
        // deadLetterService.sendToQueue(message);
    }

    /**
     * Log telemetry metrics for monitoring and debugging.
     *
     * @param message the telemetry message containing metrics
     */
    private void logTelemetryMetrics(TelemetryMessageDTO message) {
        log.debug("Telemetry Metrics - Sensor: {}, Patient: {}, HR: {} BPM, SpO2: {} %, " +
                "BP: {}/{} mmHg, Temp: {} °C",
                message.getSensorId(),
                message.getPatientId(),
                message.getMetrics().getHeartRate(),
                message.getMetrics().getSpO2(),
                message.getMetrics().getSystolicPressure(),
                message.getMetrics().getDiastolicPressure(),
                message.getMetrics().getTemperature()
        );
    }

}
