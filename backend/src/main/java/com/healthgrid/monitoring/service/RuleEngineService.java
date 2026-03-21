package com.healthgrid.monitoring.service;

import com.healthgrid.monitoring.dto.MonitoringUpdateDTO;
import com.healthgrid.monitoring.model.Alert;
import com.healthgrid.monitoring.model.AlertSeverity;
import com.healthgrid.monitoring.model.Patient;
import com.healthgrid.monitoring.model.Rule;
import com.healthgrid.monitoring.model.RuleOperator;
import com.healthgrid.monitoring.model.TelemetryReading;
import com.healthgrid.monitoring.repository.AlertRepository;
import com.healthgrid.monitoring.repository.RuleRepository;
import com.healthgrid.monitoring.repository.TelemetryReadingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Rule Engine Service for evaluating telemetry readings against health rules.
 * Implements time-window logic to detect sustained metric violations.
 *
 * Workflow:
 * 1. Receive telemetry reading
 * 2. Fetch active rules for the patient/metric
 * 3. Check if metric violates rule AND persists for duration_seconds
 * 4. Generate CRITICAL alert if condition met
 * 5. Publish admission event if needed
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RuleEngineService {

    private final TelemetryReadingRepository telemetryReadingRepository;
    private final RuleRepository ruleRepository;
    private final AlertRepository alertRepository;
    private final EventPublisherService eventPublisherService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    private static final int LOOKBACK_MINUTES = 10;  // Look back 10 minutes for readings
    private static final int MIN_READINGS_FOR_DETECTION = 2;  // Need at least 2 readings

    /**
     * Evaluate telemetry reading against rules with time-window logic.
     * 
     * Process:
     * 1. Fetch all active rules
     * 2. For each rule, check if current reading violates it
     * 3. If violated, check historical readings for sustained violation (time-window)
     * 4. If sustained violation > rule.durationSeconds, create CRITICAL alert
     * 5. Publish admission event for critical alerts
     *
     * @param reading the telemetry reading to evaluate
     * @return list of generated alerts (usually 0 or 1, can be multiple)
     */
    public List<Alert> evaluateReadingAndGenerateAlerts(TelemetryReading reading) {
        log.info("RuleEngine: Starting evaluation for patient: {}, reading: {}",
                reading.getPatient().getId(), reading.getId());

        List<Alert> generatedAlerts = new java.util.ArrayList<>();
        Patient patient = reading.getPatient();

        // Fetch all active rules
        List<Rule> activeRules = ruleRepository.findByEnabledTrue();
        log.debug("RuleEngine: Found {} active rules", activeRules.size());

        for (Rule rule : activeRules) {
            // Check if current reading violates this rule
            if (doesReadingViolateRule(reading, rule)) {
                log.debug("RuleEngine: Reading violates rule: {}", rule.getMetricName());

                // Check for sustained violation (time-window logic)
                ViolationContext context = detectSustainedViolation(reading, rule);
                
                if (context.isSustained()) {
                    log.warn("RuleEngine: SUSTAINED VIOLATION detected! Metric: {}, Duration: {}s, Rule: {}s",
                            rule.getMetricName(),
                            context.getViolationDurationSeconds(),
                            rule.getDurationSeconds());

                    // Check if we already have an unacknowledged alert for this patient+metric+rule
                    Optional<Alert> existingAlert = findExistingUnacknowledgedAlert(patient, rule);

                    if (existingAlert.isEmpty()) {
                        // Generate new CRITICAL alert
                        Alert alert = generateCriticalAlert(reading, rule, context);
                        alert = alertRepository.save(alert);
                        generatedAlerts.add(alert);

                        log.warn("RuleEngine: ✓ CRITICAL ALERT GENERATED - Alert ID: {}, Patient: {}, Severity: {}",
                                alert.getId(), patient.getId(), alert.getSeverity());

                        // Publish admission event for critical alerts
                        try {
                            eventPublisherService.publishCriticalAlertEvent(alert, reading, rule);
                            log.info("RuleEngine: ✓ Admission event published for patient: {}", patient.getId());
                        } catch (Exception e) {
                            log.error("RuleEngine: Failed to publish admission event", e);
                            // Don't fail the whole process if event publishing fails
                        }
                    } else {
                        log.debug("RuleEngine: Unacknowledged alert already exists for this rule");
                    }
                } else {
                    log.debug("RuleEngine: Violation detected but not sustained yet. " +
                            "Current: {}s, Required: {}s",
                            context.getViolationDurationSeconds(),
                            rule.getDurationSeconds());
                }
            }
        }

        // Send monitoring update to WebSocket subscribers
        sendMonitoringUpdate(reading);

        return generatedAlerts;
    }

    /**
     * Check if a single reading violates a rule.
     *
     * @param reading the telemetry reading
     * @param rule the rule to check
     * @return true if reading violates the rule
     */
    private boolean doesReadingViolateRule(TelemetryReading reading, Rule rule) {
        Float metricValue = getMetricValueFromReading(reading, rule.getMetricName());
        
        if (metricValue == null) {
            return false;
        }

        return compareMetricValue(metricValue, rule.getThreshold(), rule.getOperator());
    }

    /**
     * Detect sustained violation using time-window logic.
     * 
     * Strategy:
     * 1. Get historical readings for this patient+metric (last 10 minutes)
     * 2. Find consecutive readings that violate the rule
     * 3. Calculate duration from first to last violation
     * 4. If duration > rule.durationSeconds, mark as sustained
     *
     * @param currentReading the current telemetry reading
     * @param rule the rule to check
     * @return ViolationContext with violation status and duration
     */
    private ViolationContext detectSustainedViolation(TelemetryReading currentReading, Rule rule) {
        Patient patient = currentReading.getPatient();
        LocalDateTime lookbackTime = LocalDateTime.now().minusMinutes(LOOKBACK_MINUTES);

        // Get historical readings for this patient
        List<TelemetryReading> historicalReadings = telemetryReadingRepository
                .findReadingsByPatientAndTimeRange(patient, lookbackTime, LocalDateTime.now());

        // Filter to readings that violate this rule (in chronological order)
        List<TelemetryReading> violatingReadings = new java.util.ArrayList<>();
        for (TelemetryReading reading : historicalReadings) {
            if (doesReadingViolateRule(reading, rule)) {
                violatingReadings.add(reading);
            }
        }

        // Add current reading if it also violates and not already in list
        if (doesReadingViolateRule(currentReading, rule)) {
            if (violatingReadings.isEmpty() || 
                !violatingReadings.get(violatingReadings.size() - 1).getId().equals(currentReading.getId())) {
                violatingReadings.add(currentReading);
            }
        }

        log.debug("RuleEngine: Found {} violating readings for metric: {}", 
                violatingReadings.size(), rule.getMetricName());

        // Need at least 2 readings to detect sustained violation
        if (violatingReadings.size() < MIN_READINGS_FOR_DETECTION) {
            return new ViolationContext(false, 0);
        }

        // Calculate duration from first to last violation
        TelemetryReading firstViolation = violatingReadings.get(0);
        TelemetryReading lastViolation = violatingReadings.get(violatingReadings.size() - 1);
        
        long durationSeconds = java.time.temporal.ChronoUnit.SECONDS.between(
                firstViolation.getRecordedAt(),
                lastViolation.getRecordedAt()
        );

        log.debug("RuleEngine: Violation duration: {}s, Required: {}s",
                durationSeconds, rule.getDurationSeconds());

        // Check if sustained violation meets duration threshold
        boolean isSustained = durationSeconds >= rule.getDurationSeconds();
        
        return new ViolationContext(isSustained, (int) durationSeconds);
    }

    /**
     * Find existing unacknowledged alert for patient and rule.
     * 
     * @param patient the patient
     * @param rule the rule
     * @return Optional containing alert if exists
     */
    private Optional<Alert> findExistingUnacknowledgedAlert(Patient patient, Rule rule) {
        List<Alert> unacknowledgedAlerts = alertRepository.findByPatientAndAcknowledgedFalse(patient);
        
        return unacknowledgedAlerts.stream()
                .filter(alert -> alert.getMessage().contains(rule.getMetricName()))
                .findFirst();
    }

    /**
     * Generate a CRITICAL alert for a sustained violation.
     *
     * @param reading the current telemetry reading
     * @param rule the violated rule
     * @param context the violation context with duration
     * @return the generated alert (not yet persisted)
     */
    private Alert generateCriticalAlert(TelemetryReading reading, Rule rule, ViolationContext context) {
        Float metricValue = getMetricValueFromReading(reading, rule.getMetricName());
        
        String alertMessage = String.format(
                "CRITICAL ALERT: %s value (%.2f) exceeded threshold (%.2f) for %d seconds. " +
                "Rule required: %d seconds. Operator: %s",
                rule.getMetricName(),
                metricValue,
                rule.getThreshold(),
                context.getViolationDurationSeconds(),
                rule.getDurationSeconds(),
                rule.getOperator().getSymbol()
        );

        return Alert.builder()
                .patient(reading.getPatient())
                .severity(AlertSeverity.CRITICAL)
                .message(alertMessage)
                .acknowledged(false)
                .triggeredAt(LocalDateTime.now())
                .build();
    }

    /**
     * Extract metric value from telemetry reading based on metric name.
     *
     * @param reading the telemetry reading
     * @param metricName the metric name
     * @return the metric value or null if not found
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
     * Compare metric value against threshold using the specified operator.
     *
     * @param metricValue the actual metric value
     * @param threshold the threshold value
     * @param operator the comparison operator
     * @return true if condition is met
     */
    private boolean compareMetricValue(Float metricValue, Float threshold, RuleOperator operator) {
        return switch (operator) {
            case GREATER_THAN -> metricValue > threshold;
            case GREATER_THAN_OR_EQUAL -> metricValue >= threshold;
            case LESS_THAN -> metricValue < threshold;
            case LESS_THAN_OR_EQUAL -> metricValue <= threshold;
            case EQUAL -> Math.abs(metricValue - threshold) < 0.01;
            case NOT_EQUAL -> Math.abs(metricValue - threshold) >= 0.01;
        };
    }

    /**
     * Send real-time monitoring update via WebSocket to subscribed clients.
     * 
     * Sends a MonitoringUpdateDTO to /topic/monitoring/{patientId}
     * for dashboard real-time updates.
     *
     * @param reading the telemetry reading to broadcast
     */
    private void sendMonitoringUpdate(TelemetryReading reading) {
        try {
            Patient patient = reading.getPatient();
            
            // Prepare monitoring update
            MonitoringUpdateDTO update = MonitoringUpdateDTO.builder()
                    .patientId(patient.getId())
                    .heartRate(reading.getHeartRate())
                    .spO2(reading.getSpO2())
                    .systolicPressure(reading.getSystolicPressure())
                    .diastolicPressure(reading.getDiastolicPressure())
                    .temperature(reading.getTemperature())
                    .timestamp(reading.getRecordedAt())
                    .build();

            // Send to WebSocket topic: /topic/monitoring/{patientId}
            String destination = "/topic/monitoring/" + patient.getId();
            simpMessagingTemplate.convertAndSend(destination, update);

            log.debug("RuleEngine: ✓ Monitoring update sent to WebSocket for patient: {}", patient.getId());

        } catch (Exception e) {
            log.warn("RuleEngine: Failed to send WebSocket update (non-critical)", e);
            // Don't fail the main process if WebSocket send fails
        }
    }

    /**
     * Inner class to represent violation context.
     */
    private static class ViolationContext {
        private final boolean sustained;
        private final int violationDurationSeconds;

        ViolationContext(boolean sustained, int violationDurationSeconds) {
            this.sustained = sustained;
            this.violationDurationSeconds = violationDurationSeconds;
        }

        boolean isSustained() {
            return sustained;
        }

        int getViolationDurationSeconds() {
            return violationDurationSeconds;
        }
    }

}
