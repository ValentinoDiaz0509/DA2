// 🔗 Módulo de Integración - Health Grid Module 9
// Este archivo documenta cómo integrar con otros módulos del ecosistema

/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║        INTEGRACIÓN CON MÓDULO DE INTERNACIÓN                   ║
 * ║     (Para comunicación con equipo de internación)               ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

// PUBLIC API DE HEALTH GRID MÓDULO 9
// ====================================

class HealthGridModule9API {
  /**
   * Dispara una alerta crítica de pánico manual
   * 
   * @param {string} patientId - UUID del paciente
   * @param {string} description - Descripción del incidente
   * @param {number} priority - 1-5 (1=urgencia máxima)
   * 
   * @returns {Promise<Object>} { success, alertId, timestamp }
   * 
   * Ejemplo:
   * ```javascript
   * await HealthGrid.triggerEmergency(
   *   '550e8400-e29b-41d4-a716-446655440001',
   *   'Paro cardíaco - Requerida desfibrilación',
   *   1
   * );
   * ```
   */
  static async triggerEmergency(patientId, description, priority = 1) {
    // Lógica interna del módulo 9
    const alert = {
      id: `emergency-${Date.now()}`,
      patientId,
      message: description,
      severity: 'CRITICAL',
      priority,
      timestamp: new Date().toISOString(),
      source: 'MODULE_9_PANIC'
    };

    // Enviar al Módulo de Internación
    return await dispatch('INTERNATION.ALERT', alert);
  }

  /**
   * Obtiene estado actual de un paciente
   * 
   * @param {string} patientId - UUID del paciente
   * @returns {Promise<Object>} { vitals, status, lastAlert, thresholds }
   */
  static async getPatientStatus(patientId) {
    // Lógica que obtiene datos del contexto
    return {
      vitals: { /* ... */ },
      status: 'critical',
      lastAlert: { /* ... */ },
      thresholds: { /* ... */ }
    };
  }

  /**
   * Suscribirse a cambios de paciente
   * 
   * @param {string} patientId - UUID del paciente
   * @param {Function} callback - Función que recibe actualizaciones
   */
  static subscribeToPatient(patientId, callback) {
    // WebSocket o polling
    window.addEventListener(`health-grid:${patientId}`, (event) => {
      callback(event.detail);
    });
  }
}

// ═══════════════════════════════════════════════════════════════════

/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║     CÓMO EL MÓDULO DE INTERNACIÓN DEBE CONSUMIR EVENTOS        ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

// EVENT TYPES QUE EMITE MODULE 9
const EVENT_TYPES = {
  ALERT_TRIGGERED: 'healthgrid.alert.triggered',
  ALERT_ACKNOWLEDGED: 'healthgrid.alert.acknowledged',
  PATIENT_CRITICAL: 'healthgrid.patient.critical',
  PANIC_BUTTON: 'healthgrid.panic.triggered',
  EMERGENCY_RESOLVED: 'healthgrid.emergency.resolved'
};

// EJEMPLO: Suscribirse a eventos desde otro módulo
class InternationModule {
  constructor() {
    this.healthGrid = window.__HEALTH_GRID_API__;
    this.setupListeners();
  }

  setupListeners() {
    // Escuchar panics del módulo 9
    document.addEventListener(EVENT_TYPES.PANIC_BUTTON, (event) => {
      const { patientId, patientName, room, severity } = event.detail;
      
      console.log(`🚨 PÁNICO RECIBIDO: ${patientName} (${room})`);
      
      // Notificar al equipo de internación
      this.notifyInternationTeam({
        patientId,
        patientName,
        room,
        severity,
        timestamp: new Date(),
        actionRequired: 'IMMEDIATE'
      });

      // Actualizar estado en tiempo real
      this.updateDashboard();
    });

    // Escuchar alertas críticas
    document.addEventListener(EVENT_TYPES.ALERT_TRIGGERED, (event) => {
      const { alertId, patientId, severity, message } = event.detail;
      
      if (severity === 'CRITICAL') {
        this.escalateAlert(alertId, patientId);
      }
    });
  }

  private notifyInternationTeam(data) {
    // POST a backend del módulo de internación
    fetch('/api/internation/emergency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  private escalateAlert(alertId, patientId) {
    // Lógica de escalada
  }

  private updateDashboard() {
    // Actualizar UI del módulo de internación
  }
}

// ═══════════════════════════════════════════════════════════════════

/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║    ESTRUCTURA DE DATOS PARA INTEROPERABILIDAD                  ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

const ALERT_SCHEMA = {
  id: 'uuid-string',                    // Identificador único
  patientId: 'uuid-string',             // Referencia a paciente
  patientName: 'string',                // Nombre del paciente
  severity: 'CRITICAL|WARNING|INFO',    // Nivel de severidad
  message: 'string',                    // Descripción técnica
  timestamp: 'ISO-8601-string',         // Cuándo ocurrió
  source: 'MODULE_9_MONITOR|MODULE_9_PANIC|MODULE_9_RULE_ENGINE',
  status: 'ACTIVE|ACKNOWLEDGED|RESOLVED', // Estado actual
  acknowledgedBy: 'user-id|null',       // Quién lo reconoció
  acknowledgedAt: 'ISO-8601-string|null', // Cuándo
  metadata: {
    floor: 'number',                    // Piso del paciente
    bed: 'string',                      // Cama
    vitals: {                           // Signos vitales en ese momento
      heartRate: 'number',
      spO2: 'number',
      systolic: 'number',
      diastolic: 'number',
      temperature: 'number'
    },
    thresholdExceeded: {                // Qué umbral se excedió
      vital: 'heartRate|spO2|temp|...',
      value: 'number',
      threshold: 'number',
      direction: 'ABOVE|BELOW'
    }
  }
};

// ═══════════════════════════════════════════════════════════════════

/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║         CONFIGURACIÓN DE COMUNICACIÓN INTER-MÓDULOS            ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

const INTER_MODULE_CONFIG = {
  // Timeout para respuestas entre módulos
  RESPONSE_TIMEOUT: 5000,

  // Configuración de reintentos
  RETRY_CONFIG: {
    maxAttempts: 3,
    backoffMs: 1000
  },

  // Rate limiting de alertas
  RATE_LIMIT: {
    CRITICAL: '1 alert per 5 seconds per patient',
    WARNING: '1 alert per 10 seconds per patient',
    INFO: '1 alert per 30 seconds per patient'
  },

  // Prioridades de la cola
  QUEUE_PRIORITIES: {
    CRITICAL: 1,
    WARNING: 2,
    INFO: 3
  }
};

// ═══════════════════════════════════════════════════════════════════

/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║      EJEMPLO DE INTEGRACIÓN CON WEBSOCKETS EN TIEMPO REAL      ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

class RealtimeSync {
  constructor(websocketUrl) {
    this.ws = null;
    this.url = websocketUrl;
    this.connect();
  }

  connect() {
    // ws://hospital.local/ws/module9
    this.ws = new WebSocket(this.url);

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'VITAL_UPDATE':
          // Actualizar signos vitales de paciente
          this.updateVitals(message.patientId, message.vitals);
          break;
        
        case 'ALERT_TRIGGERED':
          // Nueva alerta detectada
          this.handleAlert(message.alert);
          break;
        
        case 'THRESHOLD_CHANGED':
          // Umbrales actualizados por otro usuario
          this.updateThresholds(message.patientId, message.thresholds);
          break;
        
        case 'PATIENT_ADMITTED':
          // Nuevo paciente en la UCI
          this.addPatient(message.patient);
          break;
        
        case 'PATIENT_DISCHARGED':
          // Paciente dado de alta
          this.removePatient(message.patientId);
          break;
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Reconectar después de 5 segundos
      setTimeout(() => this.connect(), 5000);
    };
  }

  private updateVitals(patientId, vitals) {
    // Sincronizar con estado global
    window.__HEALTH_GRID_API__.updatePatientVitals(patientId, vitals);
  }

  private handleAlert(alert) {
    // Procesar alerta
  }

  private updateThresholds(patientId, thresholds) {
    // Actualizar umbrales
  }

  private addPatient(patient) {
    // Agregar paciente a la vista
  }

  private removePatient(patientId) {
    // Remover paciente
  }
}

// ═══════════════════════════════════════════════════════════════════

/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║     CONTRATO DE COMUNICACIÓN CON MOTOR DE REGLAS               ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

const RULES_ENGINE_CONTRACT = {
  /**
   * El Motor de Reglas debe exponer estos métodos:
   */
  
  // Evaluar si un paciente debe generar alerta
  evaluatePatient: (patientId, vitals, customThresholds) => {
    // Retorna: { shouldAlert: boolean, severity: 'CRITICAL'|'WARNING' }
  },

  // Obtener reglas aplicables para un paciente
  getRulesForPatient: (patientId) => {
    // Retorna array de reglas activas
  },

  // Actualizar umbrales para un paciente
  updatePatientThresholds: (patientId, thresholds) => {
    // Void, emite evento THRESHOLD_CHANGED
  },

  // Evaluar múltiples pacientes en batch
  evaluateBatch: (patientIds, vitals[]) => {
    // Para actualizaciones masivas
  }
};

// Cómo lo llama Module 9:
const ruleEngine = window.__RULES_ENGINE__;
const shouldAlert = ruleEngine.evaluatePatient(
  patientId,
  {
    heartRate: 125,
    spO2: 88,
    systolic: 165,
    diastolic: 95,
    temperature: 38.2
  },
  customThresholds
);

// ═══════════════════════════════════════════════════════════════════

/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║           VERSIONING Y COMPATIBILITY                          ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

const API_VERSION = 'v1.0.0';

const COMPATIBILITY = {
  'internation-module': '>=2.0.0',
  'rules-engine': '>=3.0.0',
  'patient-database': '>=1.5.0',
  'authentication': '>=1.0.0'
};

// Versionado de cambios en API
const API_CHANGELOG = {
  'v1.0.0': {
    date: '2026-03-21',
    changes: [
      'Initial release',
      'triggerEmergency() endpoint',
      'getPatientStatus() endpoint',
      'WebSocket real-time sync',
      'Acknowledge flow implementation'
    ]
  },
  'v1.1.0': {
    date: 'TBD',
    planned: [
      'batchUpdateVitals()',
      'getAlertHistory() with pagination',
      'Custom rule creation API',
      'Multi-facility support'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════

/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║    GUÍA PARA DESARROLLADORES DE OTROS MÓDULOS                  ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

/*

1. INICIALIZAR COMUNICACIÓN
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   import { HealthGridAPI } from '@health-grid/module9';
   
   const healthGrid = new HealthGridAPI({
     endpoint: 'http://localhost:3000',
     module: 'INTERNATION'
   });

2. ESCUCHAR EVENTOS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   healthGrid.on('alert:triggered', (alert) => {
     console.log('Nueva alerta:', alert);
     // Procesar alerta en módulo de internación
   });

   healthGrid.on('emergency:active', (data) => {
     console.log('Emergencia activa:', data);
     // Mostrar indicador en panel
   });

3. DISPARAR ACCIONES
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   // Reconocer una alerta desde otro módulo
   healthGrid.acknowledgeAlert(alertId, {
     acknowledgedBy: userId,
     module: 'INTERNATION'
   });

   // Solicitar datos de paciente
   const status = await healthGrid.getPatientStatus(patientId);

4. MANEJO DE ERRORES
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   try {
     await healthGrid.triggerEmergency(patientId, description);
   } catch (error) {
     if (error.code === 'TIMEOUT') {
       // Reintentar
     } else if (error.code === 'INVALID_PATIENT_ID') {
       // Validar entrada
     }
   }

5. MONITOREO DE SALUD
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   setInterval(() => {
     const health = healthGrid.getHealth();
     if (!health.connected) {
       console.warn('Module 9 no disponible - reconectando...');
     }
   }, 10000);

*/

// ═══════════════════════════════════════════════════════════════════

export {
  HealthGridModule9API,
  EVENT_TYPES,
  ALERT_SCHEMA,
  INTER_MODULE_CONFIG,
  RealtimeSync,
  API_VERSION,
  COMPATIBILITY
};

// 📞 Soporte: healthgrid-team@hospital.local
