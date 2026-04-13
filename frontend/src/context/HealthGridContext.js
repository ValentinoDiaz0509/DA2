import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import apiClient from '../services/apiClient';
import WebSocketClient from '../services/websocketClient';
import { getDefaultThresholds, getRulesForMetrics } from '../services/ruleService';
import { useApiError } from '../hooks/useApiError';
import {
  PATIENT_STATUS,
  SEVERITY_LEVELS,
  VITAL_SIGNS_CONFIG,
  mapStatusFromBackend
} from '../data/constants';

const HealthGridContext = createContext();

const POLLING_INTERVAL_MS = 5000;
const MAX_TREND_POINTS = 30;

const buildDisplayThresholds = (ruleThresholds) => ({
  heartRate: {
    min: VITAL_SIGNS_CONFIG.heartRate.normalMin,
    max: VITAL_SIGNS_CONFIG.heartRate.normalMax,
    warning: ruleThresholds.heartRate.warning,
    critical: ruleThresholds.heartRate.critical
  },
  spO2: {
    min: VITAL_SIGNS_CONFIG.spO2.normalMin,
    max: VITAL_SIGNS_CONFIG.spO2.normalMax,
    warning: ruleThresholds.spO2.warning,
    critical: ruleThresholds.spO2.critical
  },
  systolicPressure: {
    min: VITAL_SIGNS_CONFIG.systolicPressure.normalMin,
    max: VITAL_SIGNS_CONFIG.systolicPressure.normalMax,
    warning: ruleThresholds.systolicPressure.warning,
    critical: ruleThresholds.systolicPressure.critical
  },
  diastolicPressure: {
    min: VITAL_SIGNS_CONFIG.diastolicPressure.normalMin,
    max: VITAL_SIGNS_CONFIG.diastolicPressure.normalMax,
    warning: ruleThresholds.diastolicPressure.warning,
    critical: ruleThresholds.diastolicPressure.critical
  },
  temperature: {
    min: VITAL_SIGNS_CONFIG.temperature.normalMin,
    max: VITAL_SIGNS_CONFIG.temperature.normalMax,
    warning: ruleThresholds.temperature.warning,
    critical: ruleThresholds.temperature.critical
  }
});

const DEFAULT_THRESHOLDS = buildDisplayThresholds(getDefaultThresholds());

const toDate = (value) => {
  if (!value) {
    return new Date();
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
};

const extractMetricValue = (metric) => {
  if (metric == null) {
    return null;
  }

  if (typeof metric === 'number') {
    return metric;
  }

  return metric.value ?? null;
};

const inferFloorFromRoom = (room) => {
  const match = `${room || ''}`.match(/(\d)/);
  return match ? Number(match[1]) : null;
};

const normalizeAlert = (alert, patientId, patientName) => ({
  id: alert.alert_id || alert.id || `alert-${patientId}-${alert.metric_name || 'general'}-${alert.triggered_at || Date.now()}`,
  patientId,
  patientName,
  message: alert.message || 'Alerta activa',
  severity: alert.severity || SEVERITY_LEVELS.WARNING,
  timestamp: toDate(alert.triggered_at || alert.timestamp),
  metricName: alert.metric_name || null,
  metricValue: alert.metric_value ?? null,
  status: 'active',
  source: 'backend'
});

const buildTrendPoint = (patient) => {
  const hasNumericValue = Object.values(patient.vitals).some((value) => typeof value === 'number');

  if (!hasNumericValue) {
    return null;
  }

  return {
    timestamp: patient.lastUpdated.getTime(),
    time: patient.lastUpdated.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    heartRate: patient.vitals.heartRate,
    spO2: patient.vitals.spO2,
    systolicPressure: patient.vitals.systolicPressure,
    diastolicPressure: patient.vitals.diastolicPressure,
    temperature: patient.vitals.temperature
  };
};

const appendTrendPoint = (previousTrendData, patient) => {
  const nextPoint = buildTrendPoint(patient);

  if (!nextPoint) {
    return previousTrendData;
  }

  const patientTrend = previousTrendData[patient.id] || [];
  const lastPoint = patientTrend[patientTrend.length - 1];

  if (lastPoint?.timestamp === nextPoint.timestamp) {
    return previousTrendData;
  }

  return {
    ...previousTrendData,
    [patient.id]: [...patientTrend, nextPoint].slice(-MAX_TREND_POINTS)
  };
};

const normalizePatient = (apiPatient, patientThresholds, existingPatient) => {
  const patientId = apiPatient.patient_id || apiPatient.id;
  const room = apiPatient.room || existingPatient?.room || 'Sin asignar';
  const bed = apiPatient.bed || existingPatient?.bed || 'Sin asignar';
  const name = apiPatient.patient_name || existingPatient?.name || 'Paciente sin nombre';
  const backendAlerts = (apiPatient.active_alerts || []).map((alert) =>
    normalizeAlert(alert, patientId, name)
  );
  const localAlerts = (existingPatient?.alertHistory || []).filter((alert) => alert.source === 'local');
  const activeAlerts = [...backendAlerts, ...localAlerts.filter((alert) => alert.status === 'active')];
  const alertHistory = [...backendAlerts, ...localAlerts];

  return {
    id: patientId,
    patientId,
    patient_id: patientId,
    name,
    floor: inferFloorFromRoom(room),
    room,
    bed,
    status: mapStatusFromBackend(apiPatient.status || existingPatient?.status || PATIENT_STATUS.NORMAL),
    vitals: {
      heartRate: extractMetricValue(apiPatient.latest_metrics?.heart_rate),
      spO2: extractMetricValue(apiPatient.latest_metrics?.spo2),
      systolicPressure: extractMetricValue(apiPatient.latest_metrics?.systolic_pressure),
      diastolicPressure: extractMetricValue(apiPatient.latest_metrics?.diastolic_pressure),
      temperature: extractMetricValue(apiPatient.latest_metrics?.temperature)
    },
    thresholds: existingPatient?.thresholds || patientThresholds,
    activeAlerts,
    alertHistory,
    diagnosis: existingPatient?.diagnosis || 'Monitoreo clinico en tiempo real',
    lastUpdated: toDate(apiPatient.last_update || apiPatient.last_updated),
    rawData: apiPatient
  };
};

const mergeAlerts = (previousAlerts, nextPatients) => {
  const previousAlertsById = new Map(previousAlerts.map((alert) => [alert.id, alert]));
  const backendAlerts = nextPatients.flatMap((patient) =>
    patient.activeAlerts.map((alert) => {
      const previousAlert = previousAlertsById.get(alert.id);

      return {
        ...alert,
        status: previousAlert?.status === 'acknowledged' ? 'acknowledged' : 'active'
      };
    })
  );

  const localAlerts = previousAlerts.filter(
    (alert) => alert.source === 'local' && !backendAlerts.some((backendAlert) => backendAlert.id === alert.id)
  );

  return [...backendAlerts, ...localAlerts].sort((left, right) => right.timestamp - left.timestamp);
};

export const HealthGridProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState(new Set());
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [filterFloor, setFilterFloor] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [criticalAlertsCount, setCriticalAlertsCount] = useState(0);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [vitalsTrendData, setVitalsTrendData] = useState({});

  const handleApiError = useApiError();
  const patientsRef = useRef([]);
  const thresholdsRef = useRef(DEFAULT_THRESHOLDS);
  const wsClientRef = useRef(null);
  const subscriptionsRef = useRef(new Map());

  const updateCriticalAlertsCount = useCallback((alertsList) => {
    const criticalCount = alertsList.filter(
      (alert) => alert.severity === SEVERITY_LEVELS.CRITICAL && alert.status === 'active'
    ).length;

    setCriticalAlertsCount(criticalCount);
    setEmergencyActive(criticalCount > 0);
  }, []);

  const refreshPatients = useCallback(async () => {
    const isInitialLoad = patientsRef.current.length === 0;

    try {
      if (isInitialLoad) {
        setLoading(true);
      }

      setError(null);

      const response = await apiClient.get('/patients/monitoring');
      const normalizedPatients = response.data.map((apiPatient) => {
        const existingPatient = patientsRef.current.find(
          (patient) => patient.id === (apiPatient.patient_id || apiPatient.id)
        );

        return normalizePatient(apiPatient, thresholdsRef.current, existingPatient);
      });

      patientsRef.current = normalizedPatients;
      setPatients(normalizedPatients);
      setVitalsTrendData((previousTrendData) =>
        normalizedPatients.reduce((accumulator, patient) => appendTrendPoint(accumulator, patient), previousTrendData)
      );
      setAlerts((previousAlerts) => {
        const mergedAlerts = mergeAlerts(previousAlerts, normalizedPatients);
        updateCriticalAlertsCount(mergedAlerts);
        return mergedAlerts;
      });
    } catch (requestError) {
      setError(requestError.message);
      handleApiError(requestError);
      setPatients([]);
      setAlerts([]);
      patientsRef.current = [];
      updateCriticalAlertsCount([]);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  }, [handleApiError, updateCriticalAlertsCount]);

  useEffect(() => {
    refreshPatients();
  }, [refreshPatients]);

  useEffect(() => {
    let isMounted = true;

    const fetchThresholds = async () => {
      const nextRuleThresholds = await getRulesForMetrics();

      if (!isMounted) {
        return;
      }

      const nextDisplayThresholds = buildDisplayThresholds(nextRuleThresholds);
      thresholdsRef.current = nextDisplayThresholds;
      setThresholds(nextDisplayThresholds);
    };

    fetchThresholds();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const pollingInterval = window.setInterval(() => {
      refreshPatients();
    }, POLLING_INTERVAL_MS);

    return () => {
      window.clearInterval(pollingInterval);
    };
  }, [refreshPatients]);

  useEffect(() => {
    if (patients.length === 0) {
      return undefined;
    }

    let isCancelled = false;

    const handleRealtimeUpdate = (patientId, message) => {
      setPatients((previousPatients) => {
        const nextPatients = previousPatients.map((patient) => {
          if (patient.id !== patientId) {
            return patient;
          }

          const updatedPatient = {
            ...patient,
            vitals: {
              heartRate: message.heart_rate ?? patient.vitals.heartRate,
              spO2: message.spo2 ?? patient.vitals.spO2,
              systolicPressure: message.systolic_pressure ?? patient.vitals.systolicPressure,
              diastolicPressure: message.diastolic_pressure ?? patient.vitals.diastolicPressure,
              temperature: message.temperature ?? patient.vitals.temperature
            },
            lastUpdated: toDate(message.timestamp)
          };

          setVitalsTrendData((previousTrendData) => appendTrendPoint(previousTrendData, updatedPatient));
          return updatedPatient;
        });

        patientsRef.current = nextPatients;
        return nextPatients;
      });
    };

    const ensureWebSocket = async () => {
      try {
        if (!wsClientRef.current) {
          wsClientRef.current = new WebSocketClient();
          await wsClientRef.current.connect();
        }

        if (isCancelled || !wsClientRef.current?.isConnected()) {
          return;
        }

        patients.forEach((patient) => {
          const topic = `/topic/monitoring/${patient.id}`;

          if (subscriptionsRef.current.has(topic)) {
            return;
          }

          const subscription = wsClientRef.current.subscribe(topic, (message) =>
            handleRealtimeUpdate(patient.id, message)
          );

          if (subscription) {
            subscriptionsRef.current.set(topic, subscription);
          }
        });
      } catch (wsError) {
        handleApiError(wsError);
      }
    };

    ensureWebSocket();

    return () => {
      isCancelled = true;
    };
  }, [handleApiError, patients]);

  useEffect(() => {
    const subscriptions = subscriptionsRef.current;

    return () => {
      subscriptions.forEach((subscription, topic) => {
        subscription?.unsubscribe?.();
        subscriptions.delete(topic);
      });

      wsClientRef.current?.disconnect();
      wsClientRef.current = null;
    };
  }, []);

  const acknowledgeAlert = useCallback((alertId) => {
    setAcknowledgedAlerts((previous) => {
      const next = new Set(previous);
      next.add(alertId);
      return next;
    });

    setAlerts((previousAlerts) => {
      const nextAlerts = previousAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
      );

      updateCriticalAlertsCount(nextAlerts);
      return nextAlerts;
    });
  }, [updateCriticalAlertsCount]);

  const triggerManualPanic = useCallback((patientId) => {
    const patient = patientsRef.current.find((currentPatient) => currentPatient.id === patientId);

    if (!patient) {
      return;
    }

    const newAlert = {
      id: `panic-${patientId}-${Date.now()}`,
      patientId,
      patientName: patient.name,
      message: 'PANICO MANUAL - Enfermeria solicito intervencion urgente',
      severity: SEVERITY_LEVELS.CRITICAL,
      timestamp: new Date(),
      status: 'active',
      source: 'local'
    };

    setPatients((previousPatients) => {
      const nextPatients = previousPatients.map((currentPatient) => {
        if (currentPatient.id !== patientId) {
          return currentPatient;
        }

        return {
          ...currentPatient,
          status: PATIENT_STATUS.CRITICAL,
          activeAlerts: [newAlert, ...currentPatient.activeAlerts],
          alertHistory: [newAlert, ...currentPatient.alertHistory]
        };
      });

      patientsRef.current = nextPatients;
      return nextPatients;
    });

    setAlerts((previousAlerts) => {
      const nextAlerts = [newAlert, ...previousAlerts];
      updateCriticalAlertsCount(nextAlerts);
      return nextAlerts;
    });
  }, [updateCriticalAlertsCount]);

  const updatePatientThresholds = useCallback((patientId, nextThresholds) => {
    setPatients((previousPatients) => {
      const nextPatients = previousPatients.map((patient) => {
        if (patient.id !== patientId) {
          return patient;
        }

        return {
          ...patient,
          thresholds: {
            ...patient.thresholds,
            ...nextThresholds
          }
        };
      });

      patientsRef.current = nextPatients;
      return nextPatients;
    });
  }, []);

  const getFilteredPatients = useCallback(() => (
    patients.filter((patient) => {
      const floorMatch = filterFloor == null || patient.floor === filterFloor;
      const statusMatch = filterStatus == null || patient.status === filterStatus;
      return floorMatch && statusMatch;
    })
  ), [filterFloor, filterStatus, patients]);

  const getSelectedPatient = useCallback(
    () => patients.find((patient) => patient.id === selectedPatientId) || null,
    [patients, selectedPatientId]
  );

  const getActiveAlerts = useCallback(
    () => alerts.filter((alert) => alert.status === 'active'),
    [alerts]
  );

  const value = {
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
    vitalsTrendData,
    setSelectedPatientId,
    setFilterFloor,
    setFilterStatus,
    acknowledgeAlert,
    triggerManualPanic,
    updatePatientThresholds,
    refreshPatients,
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
