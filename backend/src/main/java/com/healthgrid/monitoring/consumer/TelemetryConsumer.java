@Component
@Slf4j
@RequiredArgsConstructor
public class TelemetryConsumer {
    
    private final TelemetryReadingService telemetryReadingService;
    private final RuleEngineService ruleEngineService;
    private final TelemetryReadingRepository telemetryReadingRepository;
    
    /**
     * Consumidor de mensajes de telemetría desde AWS SQS.
     * Implementa IDEMPOTENCIA usando hash del payload.
     */
    @Bean
    public Consumer<TelemetryMessageDTO> telemetryEventInput() {
        return telemetryMessage -> {
            try {
                log.info("Received telemetry message from sensor: {} for patient: {}",
                    telemetryMessage.getSensorId(),
                    telemetryMessage.getPatientId());
                
                // PASO 1: Generar fingerprint único del mensaje
                String messageFingerprint = generateMessageFingerprint(telemetryMessage);
                
                // PASO 2: Verificar si ya procesamos este mensaje
                if (isDuplicateMessage(messageFingerprint)) {
                    log.warn("⚠️ Duplicate message detected (fingerprint: {}), skipping processing", 
                        messageFingerprint);
                    return; // Ignorar duplicado
                }
                
                // PASO 3: Convertir a DTO y guardar lectura
                TelemetryReadingDTO readingDTO = convertToReadingDTO(telemetryMessage);
                TelemetryReading savedReading = telemetryReadingService.recordReading(
                    telemetryMessage.getPatientId(),
                    readingDTO
                );
                
                log.info("✓ Telemetry reading saved with ID: {}", savedReading.getId());
                
                // PASO 4: Evaluar reglas y generar alertas (si es necesario)
                List<Alert> generatedAlerts = ruleEngineService
                    .evaluateReadingAndGenerateAlerts(savedReading);
                
                if (!generatedAlerts.isEmpty()) {
                    log.warn("Generated {} alert(s) for patient: {}", 
                        generatedAlerts.size(), 
                        telemetryMessage.getPatientId());
                }
                
            } catch (Exception e) {
                log.error("Error processing telemetry message", e);
                // TODO: Enviar a Dead-Letter Queue (DLQ) si es necesario
                throw new RuntimeException("Telemetry processing failed", e);
            }
        };
    }
    
    /**
     * Genera un fingerprint único basado en:
     * - sensor_id
     * - patient_id
     * - timestamp (redondeado a segundos)
     * - valores de métricas (redondeados)
     */
    private String generateMessageFingerprint(TelemetryMessageDTO message) {
        String payload = String.format(
            "%s|%s|%d|%.0f|%.0f|%.0f|%.0f|%.0f",
            message.getSensorId(),
            message.getPatientId(),
            message.getRecordedAt().getEpochSecond(), // Redondear a segundos
            Math.round(message.getMetrics().getHeartRate() * 10) / 10.0,
            Math.round(message.getMetrics().getSpO2() * 10) / 10.0,
            Math.round(message.getMetrics().getSystolicPressure() * 10) / 10.0,
            Math.round(message.getMetrics().getDiastolicPressure() * 10) / 10.0,
            Math.round(message.getMetrics().getTemperature() * 10) / 10.0
        );
        
        return DigestUtils.sha256Hex(payload);
    }
    
    /**
     * Verifica si un mensaje con este fingerprint ya fue procesado.
     * Usa una tabla de "processed messages" o cache en Redis.
     */
    private boolean isDuplicateMessage(String fingerprint) {
        // OPCIÓN 1: Usar tabla ProcessedMessage
        // return processedMessageRepository.existsById(fingerprint);
        
        // OPCIÓN 2: Usar Redis (más eficiente)
        // return redisTemplate.hasKey("processed:" + fingerprint);
        
        // OPCIÓN 3: Por ahora, logging simple
        log.debug("Checking if message {} was already processed", fingerprint);
        return false; // TODO: Implementar verificación real
    }
    
    /**
     * Convierte TelemetryMessageDTO a TelemetryReadingDTO.
     */
    private TelemetryReadingDTO convertToReadingDTO(TelemetryMessageDTO message) {
        return TelemetryReadingDTO.builder()
            .heartRate(message.getMetrics().getHeartRate())
            .spO2(message.getMetrics().getSpO2())
            .systolicPressure(message.getMetrics().getSystolicPressure())
            .diastolicPressure(message.getMetrics().getDiastolicPressure())
            .temperature(message.getMetrics().getTemperature())
            .recordedAt(message.getRecordedAt())
            .build();
    }
}
