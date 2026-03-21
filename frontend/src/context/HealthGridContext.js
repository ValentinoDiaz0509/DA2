import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import apiClient from '../services/apiClient';
import WebSocketClient from '../services/websocketClient';
import { getRulesForMetrics, evaluateMetricStatus } from '../services/ruleService';
import { useApiError } from '../hooks/useApiError';
import { PATIENT_STATUS, mapStatusFromBackend } from '../data/constants';

// ✅ REFACTORIZACIÓN FASE 2: Cambiar de MOCK_PATIENTS a API real
// - Fetch inicial: GET /api/v1/patients/monitoring
// - Actualizaciones en tiempo real: WebSocket /topic/monitoring/{patientId}
// - Thresholds dinámicos: GET /api/v1/rules

const SEVERITY_LEVELS = {
  CRITICAL: 'CRITICAL',
  WARNING: 'WARNING',
  INFO: 'INFO'
};

const HealthGridContext = createContext();

export const HealthGridProvider = ({ children }) => {
  // ===== Estados principales =====
  const [patients, setPatients] = useState([]);        // Datos reales de la API
  const [alerts, setAlerts] = useState([]);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState(new Set());
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [filterFloor, setFilterFloor] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [criticalAlertsCount, setCriticalAlertsCount] = useState(0);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thresholds, setThresholds] = useState(null);

  // ===== Referencias =====
  const wsClientRef = useRef(null);
  const subscriptionsRef = useRef(new Map());
  const handleApiErrorRef = useRef(useApiError());

  // ===== 1. FETCH INICIAL - Obtener lista de pacientes del backend =====
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener lista de pacientes desde backend
        const response = await apiClient.get('/patients/monitoring');
        console.log('✅ Pacientes obtenidos del backend:', response.data);

        // Transformar datos del backend al formato esperado por el frontend
        const transformedPatients = response.data.map(apiPatient => ({
          // Mantener IDs del backend
          id: apiPatient.patient_id || apiPatient.id,
          patient_id: apiPatient.patient_id,

          // Datos demográficos
          name: apiPatient.patient_name || 'Paciente',
          floor: apiPatient.floor || 3,
          room: apiPatient.room || 'Sin asignar',
          bed: apiPatient.bed || 'Sin asignar',

          // Signos vitales (backend usa snake_case)
          vitals: {
            heartRate: apiPatient.latest_metrics?.heart_rate || 0,
            spO2: apiPatient.latest_metrics?.spo2 || 0,
            systolic: apiPatient.latest_metrics?.systolic_bp || 0,
            diastolic: apiPatient.latest_metrics?.diastolic_bp || 0,
            temperature: apiPatient.latest_metrics?.temperature || 0,
            respiratoryRate: apiPatient.latest_metrics?.respiratory_rate || 0
          },

          // Estado (mapear del backend)
          status: mapStatusFromBackend(apiPatient.status || 'NORMAL'),

          // Alertas activas (si existen)
          alertHistory: apiPatient.active_alerts || [],
          activeAlerts: apiPatient.active_alerts || [],

          // Datos adicionales
          monitoringStartTime: apiPatient.monitoring_start_time,
          lastUpdated: new Date(apiPatient.last_updated || Date.now()),
          rawData: apiPatient  // Mantener respuesta original para referencia
        }));

        setPatients(transformedPatients);

        // Inicializar alertas desde los datos obtenidos
        const initialAlerts = [];
        transformedPatients.forEach(patient => {
          if (patient.activeAlerts && patient.activeAlerts.length > 0) {
            patient.activeAlerts.forEach(alert => {
              initialAlerts.push({
                id: alert.id || `alert-${patient.id}-${Date.now()}`,
                patientId: patient.id,
                patientName: patient.name,
                message: alert.message || alert.description,
                severity: alert.severity || SEVERITY_LEVELS.WARNING,
                timestamp: new Date(alert.timestamp || Date.now()),
                status: 'active'
              });
            });
          }
        });

        setAlerts(initialAlerts);
        updateCriticalAlertsCount(initialAlerts);
      } catch (err) {
        console.error('❌ Error al obtener pacientes:', err);
        setError(err.message);
        handleApiErrorRef.current(err);
        // Fallback a datos vacíos
        setPatients([]);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // ===== 2. OBTENER THRESHOLDS DINÁMICOS =====
  useEffect(() => {
    const fetchThresholds = async () => {
      try {
        const rulesResponse = await getRulesForMetrics();
        setThresholds(rulesResponse);
        console.log('✅ Thresholds dinámicos obtenidos:', rulesResponse);
      } catch (err) {
        console.warn('⚠️ Error al obtener thresholds, usando valores por defecto:', err);
        // Continuar sin thresholds específicos - evalueMetricStatus usa defaults
      }
    };

    if (patients.length > 0) {
      fetchThresholds();
    }
  }, [patients.length]);

  // ===== 3. CONECTAR WebSocket para actualizaciones en tiempo real =====
  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        wsClientRef.current = new WebSocketClient();
        await wsClientRef.current.connect();
        console.log('✅ WebSocket conectado');

        // Suscribirse a cada paciente
        patients.forEach(patient => {
          const topic = `/topic/monitoring/${patient.patient_id || patient.id}`;
          
          wsClientRef.current.subscribe(topic, (message) => {
            console.log(`📨 Actualización recibida para ${patient.name}:`, message);
            
            // Actualizar signos vitales en tiempo real
            setPatients(prevPatients =>
              prevPatients.map(p => {
                if ((p.patient_id === patient.patient_id || p.id === patient.id)) {
                  // Backend envía MonitoringUpdateDTO con latest_metrics
                  const updatedMetrics = message.latest_metrics || {};
                  const newStatus = mapStatusFromBackend(message.status || p.status);

                  return {
                    ...p,
                    vitals: {
                      heartRate: updatedMetrics.heart_rate !== undefined ? updatedMetrics.heart_rate : p.vitals.heartRate,
                      spO2: updatedMetrics.spo2 !== undefined ? updatedMetrics.spo2 : p.vitals.spO2,
                      systolic: updatedMetrics.systolic_bp !== undefined ? updatedMetrics.systolic_bp : p.vitals.systolic,
                      diastolic: updatedMetrics.diastolic_bp !== undefined ? updatedMetrics.diastolic_bp : p.vitals.diastolic,
                      temperature: updatedMetrics.temperature !== undefined ? updatedMetrics.temperature : p.vitals.temperature,
                      respiratoryRate: updatedMetrics.respiratory_rate !== undefined ? updatedMetrics.respiratory_rate : p.vitals.respiratoryRate
                    },
                    status: newStatus,
                    lastUpdated: new Date(),
                    activeAlerts: message.active_alerts || p.activeAlerts
                  };
                }
                return p;
              })
            );

            // Procesar nuevas alertas del WebSocket
            if (message.active_alerts && message.active_alerts.length > 0) {
              setAlerts(prevAlerts => {
                const newAlerts = [];
                message.active_alerts.forEach(wsAlert => {
                  const exists = prevAlerts.some(a => a.id === wsAlert.id);
                  if (!exists) {
                    newAlerts.push({
                      id: wsAlert.id,
                      patientId: patient.id,
                      patientName: patient.name,
                      message: wsAlert.message || wsAlert.description,
                      severity: wsAlert.severity || SEVERITY_LEVELS.WARNING,
                      timestamp: new Date(wsAlert.timestamp || Date.now()),
                      status: 'active'
                    });
                  }
                });
                return [...newAlerts, ...prevAlerts];
              });
            }
          });

          subscriptionsRef.current.set(topic, true);
        });
      } catch (err) {
        console.error('❌ Error al conectar WebSocket:', err);
        handleApiErrorRef.current(err);
      }
    };

    if (patients.length > 0 && wsClientRef.current === null) {
      initializeWebSocket();
    }

    // Cleanup
    return () => {
      if (wsClientRef.current) {
        subscriptionsRef.current.forEach((_, topic) => {
          wsClientRef.current?.unsubscribe(topic);
        });
      }
    };
  }, [patients.length]);

  // ===== 4. POLLING OPCIONAL (cada 5 segundos) =====
  // Útil como fallback si WebSocket falla
  useEffect(() => {
    if (patients.length === 0 || !wsClientRef.current?.isConnected?.()) {
      const pollingInterval = setInterval(async () => {
        try {
          const response = await apiClient.get('/patients/monitoring');
          // Actualizar solo si hay cambios significativos
          setPatients(prev =>
            response.data.map(apiPatient => {
              const existing = prev.find(p => p.patient_id === apiPatient.patient_id || p.id === apiPatient.id);
              if (existing && existing.lastUpdated === apiPatient.last_updated) {
                return existing; // No cambios
              }

              return {
                ...existing,
                vitals: {
                  heartRate: apiPatient.latest_metrics?.heart_rate || 0,
                  spO2: apiPatient.latest_metrics?.spo2 || 0,
                  systolic: apiPatient.latest_metrics?.systolic_bp || 0,
                  diastolic: apiPatient.latest_metrics?.diastolic_bp || 0,
                  temperature: apiPatient.latest_metrics?.temperature || 0,
                  respiratoryRate: apiPatient.latest_metrics?.respiratory_rate || 0
                },
                status: mapStatusFromBackend(apiPatient.status || 'NORMAL'),
                lastUpdated: new Date(apiPatient.last_updated || Date.now())
              };
            })
          );
        } catch (err) {
          console.warn('⚠️ Error en polling de pacientes:', err);
        }
      }, 5000);

      return () => clearInterval(pollingInterval);
    }
  }, [patients.length]);

  // ===== Callbacks y funciones auxiliares =====
  const updateCriticalAlertsCount = useCallback((alertsList) => {
    const criticalCount = alertsList.filter(
      a => a.severity === SEVERITY_LEVELS.CRITICAL && a.status === 'active'
    ).length;
    setCriticalAlertsCount(criticalCount);
    setEmergencyActive(criticalCount > 0);
  }, []);

  const acknowledgeAlert = useCallback((alertId) => {
    setAlerts((prevAlerts) => {
      const updated = prevAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
      );
      updateCriticalAlertsCount(updated);
      return updated;
    });

    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      setAcknowledgedAlerts((prev) => new Set(prev).add(alert.patientId));
    }
  }, [alerts, updateCriticalAlertsCount]);

  const triggerManualPanic = useCallback((patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      const newAlert = {
        id: `panic-${patientId}-${Date.now()}`,
        patientId,
        patientName: patient.name,
        message: 'PÁNICO MANUAL - Enfermero solicitó intervención urgente',
        severity: SEVERITY_LEVELS.CRITICAL,
        timestamp: new Date(),
        status: 'active'
      };

      setAlerts((prevAlerts) => {
        const updated = [newAlert, ...prevAlerts];
        updateCriticalAlertsCount(updated);
        return updated;
      });
    }
  }, [patients, updateCriticalAlertsCount]);

  const updatePatientThresholds = useCallback((patientId, newThresholds) => {
    setThresholds((prev) => ({
      ...prev,
      [patientId]: { ...prev?.[patientId], ...newThresholds }
    }));
  }, []);

  const getFilteredPatients = useCallback(() => {
    return patients.filter((patient) => {
      const floorMatch = filterFloor === null || patient.floor === filterFloor;
      const statusMatch = filterStatus === null || patient.status === filterStatus;
      return floorMatch && statusMatch;
    });
  }, [patients, filterFloor, filterStatus]);

  const getSelectedPatient = useCallback(() => {
    return patients.find((p) => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);

  const getActiveAlerts = useCallback(() => {
    return alerts.filter((alert) => alert.status === 'active');
  }, [alerts]);

  const value = {
    // State
    patients,
    alerts,
    acknowledgedAlerts,
    selectedPatientId,
    filterFloor,
    filterStatus,
    criticalAlertsCount,
    emergencyActive,
    loading,
    error,
    thresholds,

    // Actions
    setSelectedPatientId,
    setFilterFloor,
    setFilterStatus,
    acknowledgeAlert,
    triggerManualPanic,
    updatePatientThresholds,

    // Getters
    getFilteredPatients,
    getSelectedPatient,
    getActiveAlerts
  };

  return (
    <HealthGridContext.Provider value={value}>
      {children}
    </HealthGridContext.Provider>
  );
};

export const useHealthGrid = () => {
  const context = useContext(HealthGridContext);
  if (!context) {
    throw new Error('useHealthGrid must be used within HealthGridProvider');
  }
  return context;
};
