package com.healthgrid.monitoring.controller;

import com.healthgrid.monitoring.dto.PatientMonitoringDTO;
import com.healthgrid.monitoring.dto.PatientMonitoringDTO.AlertSummaryDTO;
import com.healthgrid.monitoring.dto.PatientMonitoringDTO.LatestMetricsDTO;
import com.healthgrid.monitoring.dto.PatientMonitoringDTO.MetricDTO;
import com.healthgrid.monitoring.model.Alert;
import com.healthgrid.monitoring.model.Patient;
import com.healthgrid.monitoring.model.TelemetryReading;
import com.healthgrid.monitoring.repository.AlertRepository;
import com.healthgrid.monitoring.repository.PatientRepository;
import com.healthgrid.monitoring.repository.TelemetryReadingRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Monitoring Controller for Dashboard API.
 * 
 * Provides real-time and historical patient monitoring data
 * for the React dashboard.
 * 
 * Endpoints:
 * - GET /patients/monitoring - Get all patients with current metrics and alerts
 */
@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Monitoring", description = "Patient monitoring dashboard endpoints")
public class MonitoringController {

    private final PatientRepository patientRepository;
    private final TelemetryReadingRepository telemetryReadingRepository;
    private final AlertRepository alertRepository;

    /**
     * Get all patients with their current monitoring status and alerts.
     * 
     * Returns comprehensive monitoring data for dashboard display:
     * - Patient basic information
     * - Latest telemetry readings for each vital sign
     * - Current status (ACTIVE, DISCHARGED, CRITICAL)
     * - Active alerts with severity
     * 
     * @return list of patients with monitoring data
     */
    @GetMapping("/monitoring")
    @Operation(
            summary = "Get patient monitoring dashboard",
            description = "Retrieve all patients with current vital signs, status, and active alerts for the monitoring dashboard"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved patient monitoring data",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = PatientMonitoringDTO.class)))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<PatientMonitoringDTO>> getPatientMonitoring() {
        log.info("MonitoringController: Fetching patient monitoring dashboard data");

        try {
            // Get all patients
            List<Patient> patients = patientRepository.findAll();
            log.debug("MonitoringController: Found {} patients", patients.size());

            // Build monitoring DTOs for each patient
            List<PatientMonitoringDTO> monitoringData = patients.stream()
                    .map(this::buildPatientMonitoringDTO)
                    .collect(Collectors.toList());

            log.info("MonitoringController: ✓ Successfully built monitoring data for {} patients", monitoringData.size());
            return ResponseEntity.ok(monitoringData);

        } catch (Exception e) {
            log.error("MonitoringController: Error fetching patient monitoring data", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Build comprehensive monitoring DTO for a patient.
     *
     * @param patient the patient
     * @return the monitoring DTO with latest metrics and active alerts
     */
    private PatientMonitoringDTO buildPatientMonitoringDTO(Patient patient) {
        // Get latest telemetry reading
        TelemetryReading latestReading = telemetryReadingRepository
                .findLatestReadingForPatient(patient);

        // Get active alerts (unacknowledged)
        List<Alert> activeAlerts = alertRepository.findByPatientAndAcknowledgedFalse(patient);

        // Build latest metrics DTO
        LatestMetricsDTO latestMetrics = buildLatestMetricsDTO(latestReading);

        // Determine overall status based on alerts and patient status
        String overallStatus = determineOverallStatus(patient, activeAlerts);

        // Build alert summaries
        List<AlertSummaryDTO> alertSummaries = activeAlerts.stream()
                .map(this::buildAlertSummaryDTO)
                .collect(Collectors.toList());

        LocalDateTime lastUpdate = latestReading != null
                ? latestReading.getRecordedAt()
                : LocalDateTime.now();

        return PatientMonitoringDTO.builder()
                .patientId(patient.getId())
                .patientName(patient.getName())
                .room(patient.getRoom())
                .bed(patient.getBed())
                .status(overallStatus)
                .latestMetrics(latestMetrics)
                .activeAlerts(alertSummaries)
                .lastUpdate(lastUpdate)
                .build();
    }

    /**
     * Build LatestMetricsDTO from the most recent telemetry reading.
     *
     * @param reading the latest telemetry reading (may be null)
     * @return metrics DTO with all vital signs
     */
    private LatestMetricsDTO buildLatestMetricsDTO(TelemetryReading reading) {
        if (reading == null) {
            return LatestMetricsDTO.builder()
                    .heartRate(MetricDTO.builder().status("N/A").build())
                    .spO2(MetricDTO.builder().status("N/A").build())
                    .systolicPressure(MetricDTO.builder().status("N/A").build())
                    .diastolicPressure(MetricDTO.builder().status("N/A").build())
                    .temperature(MetricDTO.builder().status("N/A").build())
                    .build();
        }

        return LatestMetricsDTO.builder()
                .heartRate(buildMetricDTO("heart_rate", reading.getHeartRate(), "bpm", reading.getRecordedAt(), 60f, 100f))
                .spO2(buildMetricDTO("spo2", reading.getSpO2(), "%", reading.getRecordedAt(), 95f, 100f))
                .systolicPressure(buildMetricDTO("systolic_pressure", reading.getSystolicPressure(), "mmHg", reading.getRecordedAt(), 120f, 140f))
                .diastolicPressure(buildMetricDTO("diastolic_pressure", reading.getDiastolicPressure(), "mmHg", reading.getRecordedAt(), 80f, 90f))
                .temperature(buildMetricDTO("temperature", reading.getTemperature(), "°C", reading.getRecordedAt(), 36.5f, 37.5f))
                .build();
    }

    /**
     * Build a MetricDTO for a specific metric value.
     *
     * @param name the metric name
     * @param value the metric value
     * @param unit the measurement unit
     * @param timestamp when the reading was taken
     * @param normalMin minimum normal value
     * @param normalMax maximum normal value
     * @return the metric DTO with status
     */
    private MetricDTO buildMetricDTO(String name, Float value, String unit, LocalDateTime timestamp,
                                     Float normalMin, Float normalMax) {
        String status = determineMetricStatus(value, normalMin, normalMax);

        return MetricDTO.builder()
                .value(value)
                .unit(unit)
                .timestamp(timestamp)
                .status(status)
                .ruleThreshold(normalMax)
                .build();
    }

    /**
     * Determine metric status based on normal ranges.
     *
     * @param value the metric value
     * @param normalMin minimum normal value
     * @param normalMax maximum normal value
     * @return status: NORMAL, WARNING, or CRITICAL
     */
    private String determineMetricStatus(Float value, Float normalMin, Float normalMax) {
        if (value == null) {
            return "N/A";
        }

        if (value >= normalMin && value <= normalMax) {
            return "NORMAL";
        } else if (Math.abs(value - normalMin) < 10 || Math.abs(value - normalMax) < 10) {
            return "WARNING";
        } else {
            return "CRITICAL";
        }
    }

    /**
     * Build AlertSummaryDTO from an Alert.
     *
     * @param alert the alert
     * @return alert summary DTO
     */
    private AlertSummaryDTO buildAlertSummaryDTO(Alert alert) {
        // Extract metric name from alert message (format: "CRITICAL ALERT: metric_name value...")
        String metricName = extractMetricNameFromMessage(alert.getMessage());
        
        return AlertSummaryDTO.builder()
                .alertId(alert.getId())
                .severity(alert.getSeverity().toString())
                .message(alert.getMessage())
                .triggeredAt(alert.getTriggeredAt())
                .metricName(metricName)
                .metricValue(null)  // Would need telemetry reading to populate this
                .build();
    }

    /**
     * Extract metric name from alert message.
     *
     * @param message the alert message
     * @return the metric name or "UNKNOWN"
     */
    private String extractMetricNameFromMessage(String message) {
        if (message == null || message.isEmpty()) {
            return "UNKNOWN";
        }
        
        // Look for common metric names in the message
        if (message.toLowerCase().contains("heart rate")) {
            return "heart_rate";
        } else if (message.toLowerCase().contains("spo2") || message.toLowerCase().contains("oxygen")) {
            return "spo2";
        } else if (message.toLowerCase().contains("systolic")) {
            return "systolic_pressure";
        } else if (message.toLowerCase().contains("diastolic")) {
            return "diastolic_pressure";
        } else if (message.toLowerCase().contains("temperature")) {
            return "temperature";
        }
        
        return "UNKNOWN";
    }

    /**
     * Determine overall patient status based on alerts and patient status.
     *
     * @param patient the patient
     * @param activeAlerts active alerts for this patient
     * @return overall status
     */
    private String determineOverallStatus(Patient patient, List<Alert> activeAlerts) {
        // If patient has CRITICAL alerts, overall status is CRITICAL
        boolean hasCritical = activeAlerts.stream()
                .anyMatch(alert -> alert.getSeverity().toString().equals("CRITICAL"));
        if (hasCritical) {
            return "CRITICAL";
        }

        // If patient has WARNING alerts, overall status is WARNING
        boolean hasWarning = activeAlerts.stream()
                .anyMatch(alert -> alert.getSeverity().toString().equals("WARNING"));
        if (hasWarning) {
            return "WARNING";
        }

        // Otherwise use patient's own status
        return patient.getStatus().toString();
    }

}
