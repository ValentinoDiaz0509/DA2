@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class AdmissionEventDTO {
    
    @JsonProperty("patient_id")
    private UUID patientId;
    
    @JsonProperty("alert_severity")
    private String alertSeverity; // CRITICAL, WARNING, etc.
    
    @JsonProperty("location")
    private String location; // "ICU-Room-101" o "ICU-101-A"
    
    @JsonProperty("triggered_rule")
    private String triggeredRule; // "heart_rate > 120.0 for 300 seconds"
    
    @JsonProperty("metric_name")
    private String metricName;
    
    @JsonProperty("metric_value")
    private Double metricValue;
    
    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("sensor_id")
    private String sensorId;
    
    @JsonProperty("acknowledgment_required")
    private Boolean acknowledgmentRequired;
    
    @JsonProperty("priority_level")
    private String priorityLevel; // "RED" = Código Rojo
}
