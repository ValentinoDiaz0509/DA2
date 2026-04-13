// Constantes de configuración de la aplicación

export const HOSPITAL_NAME = 'Hospital Central San Felipe';
export const SYSTEM_NAME = 'Health Grid - Módulo 9: Monitoreo de Pacientes';

export const NAVIGATION_ROUTES = {
  DASHBOARD: 'dashboard',
  PATIENT_DETAIL: 'patient-detail',
  ALERTS: 'alerts',
  SUPERVISION: 'supervision'
};

/**
 * Estados de paciente - Sincronizados con backend
 * 
 * Backend:  CRITICAL, WARNING, NORMAL
 * Frontend: CRITICAL, WARNING, NORMAL
 */
export const PATIENT_STATUS = {
  CRITICAL: 'CRITICAL',
  WARNING: 'WARNING',
  NORMAL: 'NORMAL'
};

/**
 * Colores de estado - Material-UI mapping
 * Sincronizados con PATIENT_STATUS keys
 */
export const STATUS_COLORS = {
  [PATIENT_STATUS.NORMAL]: {
    bgColor: '#E8F5E9',
    borderColor: '#4CAF50',
    textColor: '#1B5E20'
  },
  [PATIENT_STATUS.WARNING]: {
    bgColor: '#FFF3E0',
    borderColor: '#FF9800',
    textColor: '#E65100'
  },
  [PATIENT_STATUS.CRITICAL]: {
    bgColor: '#FFEBEE',
    borderColor: '#F44336',
    textColor: '#B71C1C'
  }
};

export const SEVERITY_LEVELS = {
  CRITICAL: 'CRITICAL',
  WARNING: 'WARNING',
  INFO: 'INFO'
};

export const FILTER_OPTIONS = {
  FLOORS: [
    { value: null, label: 'Todos los pisos' },
    { value: 3, label: 'Piso 3 - UCI Cardiología' },
    { value: 4, label: 'Piso 4 - UCI General' },
    { value: 5, label: 'Piso 5 - Cuidados Intensivos' }
  ],
  // ✅ ACTUALIZADO: Usar backend status names
  STATUSES: [
    { value: null, label: 'Todos los estados' },
    { value: PATIENT_STATUS.NORMAL, label: 'Estable' },
    { value: PATIENT_STATUS.WARNING, label: 'Alerta' },
    { value: PATIENT_STATUS.CRITICAL, label: 'Crítico' }
  ]
};

export const VITAL_SIGNS_CONFIG = {
  heartRate: {
    label: 'Frecuencia Cardíaca',
    unit: 'bpm',
    min: 40,
    max: 180,
    normalMin: 60,
    normalMax: 100,
    icon: 'favorite'
  },
  spO2: {
    label: 'Saturación de Oxígeno',
    unit: '%',
    min: 70,
    max: 100,
    normalMin: 95,
    normalMax: 100,
    icon: 'air'
  },
  systolicPressure: {
    label: 'Presión Sistólica',
    unit: 'mmHg',
    min: 70,
    max: 200,
    normalMin: 90,
    normalMax: 140,
    icon: 'bloodtype'
  },
  diastolicPressure: {
    label: 'Presión Diastólica',
    unit: 'mmHg',
    min: 40,
    max: 120,
    normalMin: 60,
    normalMax: 90,
    icon: 'bloodtype'
  },
  temperature: {
    label: 'Temperatura',
    unit: '°C',
    min: 35,
    max: 41,
    normalMin: 36.5,
    normalMax: 37.5,
    icon: 'thermostat'
  }
};

export const ALERT_SEVERITY_CONFIG = {
  info: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    textColor: '#1565C0',
    icon: 'info'
  },
  warning: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
    textColor: '#E65100',
    icon: 'warning'
  },
  critical: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    textColor: '#B71C1C',
    icon: 'error'
  }
};

export const SIMULATION_CONFIG = {
  VITAL_SIGNS_UPDATE_INTERVAL: 2000, // 2 segundos - simula actualizaciones en tiempo real
  ALERT_CHECK_INTERVAL: 1000, // Verificación de alertas cada segundo
  TREND_DATA_POINTS: 30, // Puntos en los gráficos de tendencia (histórico)
  ALERT_ANIMATION_DURATION: 300 // ms para animaciones
};

/**
 * ✅ Helper: Mapea status del backend al frontend
 * 
 * Backend returns: NORMAL, WARNING, CRITICAL
 * Frontend expects: NORMAL, WARNING, CRITICAL (ya sincronizados)
 * 
 * Esta función permite futuras traducciones si es necesario.
 */
export const mapStatusFromBackend = (backendStatus) => {
  const normalizedStatus = `${backendStatus || ''}`.toUpperCase();
  const statusMap = {
    NORMAL: PATIENT_STATUS.NORMAL,
    WARNING: PATIENT_STATUS.WARNING,
    CRITICAL: PATIENT_STATUS.CRITICAL,
    // Compatibilidad con antiguo formato si existe
    STABLE: PATIENT_STATUS.NORMAL
  };
  return statusMap[normalizedStatus] || PATIENT_STATUS.NORMAL;
};
