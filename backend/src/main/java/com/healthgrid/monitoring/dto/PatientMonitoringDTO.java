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
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class PatientMonitoringDTO {
    
    @JsonProperty("patient_id")
    private UUID patientId;
    
    @JsonProperty("patient_name")
    private String patientName;
    
    @JsonProperty("room")
    private String room;
    
    @JsonProperty("bed")
    private String bed;
    
    @JsonProperty("status") // NORMAL, WARNING, CRITICAL
    private String status;
    
    @JsonProperty("latest_metrics")
    private LatestMetricsDTO latestMetrics;
    
    @JsonProperty("active_alerts")
    private List<AlertSummaryDTO> activeAlerts;
    
    @JsonProperty("last_update")
    private LocalDateTime lastUpdate;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class MetricDTO {
    
    @JsonProperty("value")
    private Float value;
    
    @JsonProperty("unit")
    private String unit;
    
    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
    
    @JsonProperty("status") // NORMAL, WARNING, CRITICAL, UNKNOWN
    private String status;
    
    @JsonProperty("rule_threshold")
    private Double ruleThreshold;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class AlertSummaryDTO {
    
    @JsonProperty("alert_id")
    private UUID alertId;
    
    @JsonProperty("severity") // CRITICAL, WARNING, INFO
    private String severity;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("triggered_at")
    private LocalDateTime triggeredAt;
    
    @JsonProperty("metric_name")
    private String metricName;
    
    @JsonProperty("metric_value")
    private Double metricValue;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class MonitoringUpdateDTO {
    
    @JsonProperty("patient_id")
    private UUID patientId;
    
    @JsonProperty("heart_rate")
    private Float heartRate;
    
    @JsonProperty("spo2")
    private Float spO2;
    
    @JsonProperty("systolic_pressure")
    private Float systolicPressure;
    
    @JsonProperty("diastolic_pressure")
    private Float diastolicPressure;
    
    @JsonProperty("temperature")
    private Float temperature;
    
    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
}
