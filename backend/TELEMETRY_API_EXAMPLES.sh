#!/bin/bash
# Telemetry API Examples
# This file contains example API requests for the telemetry monitoring system

# ============================================================
# 1. TELEMETRY MESSAGE INGESTION (via SQS)
# ============================================================
# This is the format of messages consumed from AWS SQS
# Save as: telemetry-message-example.json

cat > telemetry-message-example.json << 'EOF'
{
  "sensor_id": "SENSOR-ICU-001",
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "metrics": {
    "heart_rate": 85.5,
    "spo2": 98.5,
    "systolic_pressure": 120.0,
    "diastolic_pressure": 80.0,
    "temperature": 37.2
  },
  "unit_metadata": {
    "unit_id": "UNIT-001",
    "unit_location": "ICU-Room-101",
    "device_model": "Philips IntelliVue",
    "device_serial": "SN-789456",
    "firmware_version": "2.1.5"
  }
}
EOF

echo "Created telemetry-message-example.json"

# ============================================================
# 2. POST TELEMETRY READING (Direct API)
# ============================================================

curl -X POST http://localhost:8080/api/v1/telemetry/patient/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "heartRate": 85.5,
    "spO2": 98.5,
    "systolicPressure": 120.0,
    "diastolicPressure": 80.0,
    "temperature": 37.2
  }'

# ============================================================
# 3. GET LATEST TELEMETRY READING
# ============================================================

curl -X GET http://localhost:8080/api/v1/telemetry/patient/550e8400-e29b-41d4-a716-446655440000/latest

# ============================================================
# 4. GET ALL TELEMETRY READINGS FOR PATIENT
# ============================================================

curl -X GET http://localhost:8080/api/v1/telemetry/patient/550e8400-e29b-41d4-a716-446655440000

# ============================================================
# 5. GET TELEMETRY BY TIME RANGE
# ============================================================

curl -X GET "http://localhost:8080/api/v1/telemetry/patient/550e8400-e29b-41d4-a716-446655440000/range?startTime=2026-03-20T00:00:00&endTime=2026-03-21T23:59:59"

# ============================================================
# 6. GET HIGH HEART RATE READINGS
# ============================================================

curl -X GET "http://localhost:8080/api/v1/telemetry/patient/550e8400-e29b-41d4-a716-446655440000/high-heart-rate?threshold=100"

# ============================================================
# 7. GET LOW SPO2 READINGS
# ============================================================

curl -X GET "http://localhost:8080/api/v1/telemetry/patient/550e8400-e29b-41d4-a716-446655440000/low-spo2?threshold=95"

# ============================================================
# 8. CREATE MONITORING RULE
# ============================================================

curl -X POST http://localhost:8080/api/v1/rules \
  -H "Content-Type: application/json" \
  -d '{
    "metricName": "heart_rate",
    "operator": "GREATER_THAN",
    "threshold": 120.0,
    "durationSeconds": 300,
    "severity": "CRITICAL",
    "description": "Alert if heart rate exceeds 120 BPM for 5 minutes",
    "enabled": true
  }'

# ============================================================
# 9. GET ALL ACTIVE RULES
# ============================================================

curl -X GET http://localhost:8080/api/v1/rules/active

# ============================================================
# 10. GET RULES FOR SPECIFIC METRIC
# ============================================================

curl -X GET http://localhost:8080/api/v1/rules/metric/heart_rate

# ============================================================
# 11. GET CRITICAL RULES
# ============================================================

curl -X GET http://localhost:8080/api/v1/rules/critical

# ============================================================
# 12. ENABLE RULE
# ============================================================

curl -X PATCH http://localhost:8080/api/v1/rules/{rule-uuid}/enable

# ============================================================
# 13. DISABLE RULE
# ============================================================

curl -X PATCH http://localhost:8080/api/v1/rules/{rule-uuid}/disable

# ============================================================
# 14. GET UNACKNOWLEDGED ALERTS
# ============================================================

curl -X GET http://localhost:8080/api/v1/alerts/unacknowledged

# ============================================================
# 15. GET UNACKNOWLEDGED CRITICAL ALERTS
# ============================================================

curl -X GET http://localhost:8080/api/v1/alerts/unacknowledged/critical

# ============================================================
# 16. GET ALERTS FOR PATIENT
# ============================================================

curl -X GET http://localhost:8080/api/v1/alerts/patient/550e8400-e29b-41d4-a716-446655440000

# ============================================================
# 17. GET UNACKNOWLEDGED ALERTS FOR PATIENT
# ============================================================

curl -X GET http://localhost:8080/api/v1/alerts/patient/550e8400-e29b-41d4-a716-446655440000/unacknowledged

# ============================================================
# 18. ACK ACKNOWLEDGE ALERT (Mark as reviewed by staff)
# ============================================================

curl -X PATCH "http://localhost:8080/api/v1/alerts/{alert-uuid}/acknowledge?acknowledgedBy=Dr.%20Smith"

# ============================================================
# 19. GET COUNT OF CRITICAL ALERTS
# ============================================================

curl -X GET http://localhost:8080/api/v1/alerts/critical/count

# ============================================================
# TESTING THE END-TO-END FLOW
# ============================================================
# 1. Create a patient first:
curl -X POST http://localhost:8080/api/v1/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "room": "ICU-101",
    "bed": "A1",
    "status": "NORMAL"
  }'

# 2. Create a critical rule (e.g., heart rate > 120):
# Use the rule creation curl above

# 3. Send a telemetry message via API or SQS with metrics that violate the rule

# 4. The TelemetryConsumer will:
#    - Receive and parse the message
#    - Save it to TelemetryReading
#    - Evaluate it against all active rules
#    - Create an Alert if threshold is exceeded

# 5. Query the alerts to see the generated alert:
# curl -X GET http://localhost:8080/api/v1/alerts/patient/{patient-uuid}/unacknowledged

# 6. Acknowledge the alert when medical staff reviews it:
# curl -X PATCH "http://localhost:8080/api/v1/alerts/{alert-uuid}/acknowledge?acknowledgedBy=Dr.%20Smith"
