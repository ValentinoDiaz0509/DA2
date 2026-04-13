import { v4 as uuidv4 } from 'uuid';

// UUID base para consistencia con contrato
const BASE_UUID = '550e8400-e29b-41d4-a716-446655440000';

export const PATIENT_STATUS = {
  STABLE: 'stable',
  WARNING: 'warning',
  CRITICAL: 'critical'
};

export const STATUS_COLORS = {
  stable: {
    bgColor: '#E8F5E9',
    borderColor: '#4CAF50',
    textColor: '#1B5E20'
  },
  warning: {
    bgColor: '#FFF3E0',
    borderColor: '#FF9800',
    textColor: '#E65100'
  },
  critical: {
    bgColor: '#FFEBEE',
    borderColor: '#F44336',
    textColor: '#B71C1C'
  }
};

export const SEVERITY_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical'
};

export const generatePatientId = (index) => {
  // Generamos UUIDs derivados del base para mantener consistencia
  return `550e8400-e29b-41d4-a716-${String(446655440000 + index).padStart(12, '0')}`;
};

export const MOCK_PATIENTS = [
  {
    id: generatePatientId(1),
    name: 'Juan Perez',
    age: 65,
    floor: 3,
    bed: '301',
    diagnosis: 'IAM Anterior',
    status: PATIENT_STATUS.CRITICAL,
    vitals: {
      heartRate: 125,
      spO2: 88,
      systolic: 165,
      diastolic: 95,
      temperature: 38.2
    },
    thresholds: {
      heartRate: { min: 60, max: 100 },
      spO2: { min: 95, max: 100 },
      systolic: { min: 90, max: 140 },
      diastolic: { min: 60, max: 90 },
      temperature: { min: 36.5, max: 37.5 }
    },
    alertHistory: [
      { id: 'a1', timestamp: new Date(Date.now() - 5 * 60000), message: 'HR > 120 por 3 min', severity: SEVERITY_LEVELS.CRITICAL },
      { id: 'a2', timestamp: new Date(Date.now() - 12 * 60000), message: 'Presión sistólica elevated', severity: SEVERITY_LEVELS.WARNING },
      { id: 'a3', timestamp: new Date(Date.now() - 25 * 60000), message: 'SpO2 < 90%', severity: SEVERITY_LEVELS.CRITICAL }
    ]
  },
  {
    id: generatePatientId(2),
    name: 'María García',
    age: 58,
    floor: 3,
    bed: '302',
    diagnosis: 'Neumonía bilateral',
    status: PATIENT_STATUS.WARNING,
    vitals: {
      heartRate: 105,
      spO2: 92,
      systolic: 138,
      diastolic: 85,
      temperature: 38.8
    },
    thresholds: {
      heartRate: { min: 60, max: 100 },
      spO2: { min: 95, max: 100 },
      systolic: { min: 90, max: 140 },
      diastolic: { min: 60, max: 90 },
      temperature: { min: 36.5, max: 37.5 }
    },
    alertHistory: [
      { id: 'a4', timestamp: new Date(Date.now() - 8 * 60000), message: 'SpO2 en rango bajo', severity: SEVERITY_LEVELS.WARNING },
      { id: 'a5', timestamp: new Date(Date.now() - 20 * 60000), message: 'Temperatura elevada', severity: SEVERITY_LEVELS.WARNING }
    ]
  },
  {
    id: generatePatientId(3),
    name: 'Carlos López',
    age: 72,
    floor: 3,
    bed: '303',
    diagnosis: 'Post-operatorio',
    status: PATIENT_STATUS.NORMAL,
    vitals: {
      heartRate: 78,
      spO2: 97,
      systolic: 118,
      diastolic: 76,
      temperature: 37.1
    },
    thresholds: {
      heartRate: { min: 60, max: 100 },
      spO2: { min: 95, max: 100 },
      systolic: { min: 90, max: 140 },
      diastolic: { min: 60, max: 90 },
      temperature: { min: 36.5, max: 37.5 }
    },
    alertHistory: []
  },
  {
    id: generatePatientId(4),
    name: 'Ana Martínez',
    age: 55,
    floor: 4,
    bed: '401',
    diagnosis: 'Insuficiencia cardíaca',
    status: PATIENT_STATUS.WARNING,
    vitals: {
      heartRate: 98,
      spO2: 93,
      systolic: 145,
      diastolic: 88,
      temperature: 37.0
    },
    thresholds: {
      heartRate: { min: 60, max: 100 },
      spO2: { min: 95, max: 100 },
      systolic: { min: 90, max: 140 },
      diastolic: { min: 60, max: 90 },
      temperature: { min: 36.5, max: 37.5 }
    },
    alertHistory: [
      { id: 'a6', timestamp: new Date(Date.now() - 15 * 60000), message: 'Presión sistólica > 140', severity: SEVERITY_LEVELS.WARNING }
    ]
  },
  {
    id: generatePatientId(5),
    name: 'Roberto Silva',
    age: 68,
    floor: 4,
    bed: '402',
    diagnosis: 'Sepsis',
    status: PATIENT_STATUS.CRITICAL,
    vitals: {
      heartRate: 132,
      spO2: 86,
      systolic: 155,
      diastolic: 92,
      temperature: 39.5
    },
    thresholds: {
      heartRate: { min: 60, max: 100 },
      spO2: { min: 95, max: 100 },
      systolic: { min: 90, max: 140 },
      diastolic: { min: 60, max: 90 },
      temperature: { min: 36.5, max: 37.5 }
    },
    alertHistory: [
      { id: 'a7', timestamp: new Date(Date.now() - 2 * 60000), message: 'CÓDIGO ROJO - SpO2 crítico', severity: SEVERITY_LEVELS.CRITICAL },
      { id: 'a8', timestamp: new Date(Date.now() - 8 * 60000), message: 'Temperatura crítica', severity: SEVERITY_LEVELS.CRITICAL },
      { id: 'a9', timestamp: new Date(Date.now() - 12 * 60000), message: 'HR crítica', severity: SEVERITY_LEVELS.CRITICAL }
    ]
  },
  {
    id: generatePatientId(6),
    name: 'Elena González',
    age: 62,
    floor: 4,
    bed: '403',
    diagnosis: 'Accidente cerebrovascular',
    status: PATIENT_STATUS.CRITICAL,
    vitals: {
      heartRate: 119,
      spO2: 89,
      systolic: 168,
      diastolic: 98,
      temperature: 37.8
    },
    thresholds: {
      heartRate: { min: 60, max: 100 },
      spO2: { min: 95, max: 100 },
      systolic: { min: 90, max: 140 },
      diastolic: { min: 60, max: 90 },
      temperature: { min: 36.5, max: 37.5 }
    },
    alertHistory: [
      { id: 'a10', timestamp: new Date(Date.now() - 3 * 60000), message: 'CÓDIGO ROJO - SpO2 < 90', severity: SEVERITY_LEVELS.CRITICAL },
      { id: 'a11', timestamp: new Date(Date.now() - 5 * 60000), message: 'Presión sistólica > 160', severity: SEVERITY_LEVELS.CRITICAL }
    ]
  }
];

export const generateVitalsTrendData = (patientId, duration = 30) => {
  // Generar datos históricos de signos vitales para gráficos
  const now = Date.now();
  const data = [];
  const patient = MOCK_PATIENTS.find(p => p.id === patientId);

  if (!patient) return data;

  for (let i = duration; i >= 0; i--) {
    const timestamp = now - i * 60000; // Cada punto es 1 minuto atrás
    // Agregar variación realista a los valores
    const hrVariation = (Math.random() - 0.5) * 20;
    const spO2Variation = (Math.random() - 0.5) * 3;

    data.push({
      time: new Date(timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      timestamp,
      heartRate: Math.max(40, Math.min(180, patient.vitals.heartRate + hrVariation)),
      spO2: Math.max(75, Math.min(100, patient.vitals.spO2 + spO2Variation))
    });
  }

  return data;
};
