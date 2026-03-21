package com.healthgrid.monitoring.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for patient monitoring dashboard display.
 * 
 * Contains:
 * - Patient basic information
 * - Latest telemetry readings for each metric
 * - Current patient status
 * - Active alerts
 * 
 * Used by: MonitoringController GET /patients/monitoring
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientMonitoringDTO {

    @JsonProperty("patient_id")
    private UUID patientId;

    @JsonProperty("patient_name")
    private String patientName;

    @JsonProperty("room")
    private String room;

    @JsonProperty("bed")
    private String bed;

    @JsonProperty("status")
    private String status;  // From Patient.status enum

    @JsonProperty("latest_metrics")
    private LatestMetricsDTO latestMetrics;

    @JsonProperty("active_alerts")
    private List<AlertSummaryDTO> activeAlerts;

    @JsonProperty("last_update")
    private LocalDateTime lastUpdate;

    /**
     * Latest telemetry metrics for a patient.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LatestMetricsDTO {

        @JsonProperty("heart_rate")
        private MetricDTO heartRate;

        @JsonProperty("spo2")
        private MetricDTO spO2;

        @JsonProperty("systolic_pressure")
        private MetricDTO systolicPressure;

        @JsonProperty("diastolic_pressure")
        private MetricDTO diastolicPressure;

        @JsonProperty("temperature")
        private MetricDTO temperature;

    }

    /**
     * Single metric reading with status.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MetricDTO {

        @JsonProperty("value")
        private Float value;

        @JsonProperty("unit")
        private String unit;

        @JsonProperty("timestamp")
        private LocalDateTime timestamp;

        @JsonProperty("status")
        private String status;  // NORMAL, WARNING, CRITICAL

        @JsonProperty("rule_threshold")
        private Float ruleThreshold;

    }

    /**
     * Summary of an active alert.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlertSummaryDTO {

        @JsonProperty("alert_id")
        private UUID alertId;

        @JsonProperty("severity")
        private String severity;  // CRITICAL, WARNING, INFO

        @JsonProperty("message")
        private String message;

        @JsonProperty("triggered_at")
        private LocalDateTime triggeredAt;

        @JsonProperty("metric_name")
        private String metricName;

        @JsonProperty("metric_value")
        private Float metricValue;

    }

}
