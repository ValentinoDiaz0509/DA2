package com.healthgrid.monitoring.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO representing a critical admission event.
 * Published to SQS for the Internación (Admission) module (Module 6).
 * 
 * Payload structure for admitting a patient to intensive monitoring/admission.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "AdmissionEvent", description = "Critical alert event for patient admission/internación")
public class AdmissionEventDTO {

    @JsonProperty("event_type")
    @Schema(description = "Event type identifier", example = "CRITICAL_ALERT_ADMISSION", required = true)
    private String eventType;

    @JsonProperty("event_id")
    @Schema(description = "Unique event UUID", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
    private UUID eventId;

    @JsonProperty("timestamp")
    @Schema(description = "Event creation timestamp (ISO-8601)", required = true)
    private LocalDateTime timestamp;

    @JsonProperty("patient_id")
    @Schema(description = "Patient UUID requiring admission", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
    private UUID patientId;

    @JsonProperty("patient_name")
    @Schema(description = "Patient full name", example = "John Doe")
    private String patientName;

    @JsonProperty("patient_room")
    @Schema(description = "Current patient location/room", example = "ICU-101")
    private String patientRoom;

    @JsonProperty("patient_bed")
    @Schema(description = "Current patient bed assignment", example = "A1")
    private String patientBed;

    @JsonProperty("current_status")
    @Schema(description = "Patient current status", example = "CRITICAL")
    private String currentStatus;

    @JsonProperty("alert_id")
    @Schema(description = "Alert UUID that triggered this event", required = true)
    private UUID alertId;

    @JsonProperty("alert_severity")
    @Schema(description = "Alert severity level", example = "CRITICAL")
    private String alertSeverity;

    @JsonProperty("alert_message")
    @Schema(description = "Detailed alert message", example = "CRITICAL ALERT: heart_rate value (135.00) exceeded threshold...")
    private String alertMessage;

    @JsonProperty("triggered_at")
    @Schema(description = "When the alert was triggered (ISO-8601)")
    private LocalDateTime triggeredAt;

    @JsonProperty("metric_name")
    @Schema(description = "Metric that violated the rule", example = "heart_rate")
    private String metricName;

    @JsonProperty("metric_value")
    @Schema(description = "Current metric value that triggered alert", example = "135.0")
    private Float metricValue;

    @JsonProperty("rule_threshold")
    @Schema(description = "Rule threshold that was exceeded", example = "120.0")
    private Float ruleThreshold;

    @JsonProperty("duration_seconds")
    @Schema(description = "How long the metric was in violation (seconds)")
    private Integer durationSeconds;

    @JsonProperty("latest_telemetry")
    @Schema(description = "Latest vital signs at time of alert")
    private LatestTelemetryDTO latestTelemetry;

    @JsonProperty("recommended_action")
    @Schema(description = "Recommended clinical action", example = "Immediate physician review and patient assessment required")
    private String recommendedAction;

    /**
     * Nested DTO for latest telemetry at time of event.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(name = "LatestTelemetry", description = "Latest vital signs")
    public static class LatestTelemetryDTO {
        
        @JsonProperty("heart_rate")
        @Schema(description = "Heart rate in BPM", example = "135.0")
        private Float heartRate;

        @JsonProperty("spo2")
        @Schema(description = "Oxygen saturation %", example = "98.5")
        private Float spO2;

        @JsonProperty("systolic_pressure")
        @Schema(description = "Systolic BP in mmHg", example = "140.0")
        private Float systolicPressure;

        @JsonProperty("diastolic_pressure")
        @Schema(description = "Diastolic BP in mmHg", example = "90.0")
        private Float diastolicPressure;

        @JsonProperty("temperature")
        @Schema(description = "Temperature in Celsius", example = "37.2")
        private Float temperature;

        @JsonProperty("recorded_at")
        @Schema(description = "When telemetry was recorded (ISO-8601)")
        private LocalDateTime recordedAt;
    }

}
