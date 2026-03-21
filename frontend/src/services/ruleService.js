import apiClient from './apiClient';

/**
 * Service para obtener reglas de triage y thresholds del backend
 * 
 * Transforma las reglas de la API en una estructura de thresholds
 * para que el frontend pueda usarlas dinámicamente
 */

/**
 * Obtener thresholds desde la API del backend
 * 
 * @returns {Promise} Resuelve con objeto de thresholds
 */
export const getRulesForMetrics = async () => {
  try {
    const response = await apiClient.get('/rules');

    // Estructura inicial con valores por defecto
    const thresholds = {
      heartRate: { critical: 120, warning: 100 },
      spO2: { critical: 90, warning: 95 },
      systolicPressure: { critical: 160, warning: 140 },
      diastolicPressure: { critical: 100, warning: 90 },
      temperature: { critical: 39, warning: 38 }
    };

    // Procesar reglas desde la API
    if (response.data && Array.isArray(response.data)) {
      response.data.forEach((rule) => {
        // Mapear nombre de métrica (backend → frontend)
        const metricKey = mapMetricName(rule.metric_name);

        if (!metricKey) return;

        // Actualizar threshold según severidad
        if (rule.severity === 'CRITICAL') {
          thresholds[metricKey].critical = rule.threshold;
        } else if (rule.severity === 'WARNING') {
          thresholds[metricKey].warning = rule.threshold;
        }
      });
    }

    console.log('[RuleService] ✅ Loaded thresholds from backend:', thresholds);
    return thresholds;
  } catch (error) {
    console.error('[RuleService] Error fetching rules:', error);
    // Retornar thresholds por defecto si falla
    return getDefaultThresholds();
  }
};

/**
 * Mapear nombre de métrica del backend al frontend
 * 
 * Backend: snake_case → Frontend: camelCase
 * 
 * @param {string} backendName - Nombre de métrica en backend
 * @returns {string|null} Nombre de métrica en frontend
 */
function mapMetricName(backendName) {
  const map = {
    'heart_rate': 'heartRate',
    'spo2': 'spO2',
    'systolic_pressure': 'systolicPressure',
    'diastolic_pressure': 'diastolicPressure',
    'temperature': 'temperature'
  };
  return map[backendName] || null;
}

/**
 * Obtener thresholds por defecto (fallback)
 * 
 * Se usa si la API falla
 * 
 * @returns {object} Thresholds por defecto
 */
export function getDefaultThresholds() {
  return {
    heartRate: { critical: 120, warning: 100 },
    spO2: { critical: 90, warning: 95 },
    systolicPressure: { critical: 160, warning: 140 },
    diastolicPressure: { critical: 100, warning: 90 },
    temperature: { critical: 39, warning: 38 }
  };
}

/**
 * Evaluar si un valor de métrica genera alerta
 * 
 * @param {number} value - Valor de la métrica
 * @param {string} metricName - Nombre de la métrica
 * @param {object} thresholds - Objeto de thresholds
 * @returns {string} 'CRITICAL' | 'WARNING' | 'NORMAL'
 */
export function evaluateMetricStatus(value, metricName, thresholds) {
  if (!thresholds[metricName]) {
    return 'NORMAL';
  }

  const { critical, warning } = thresholds[metricName];

  // Lógica especial para SpO2 y presión (menor es peor)
  if (metricName === 'spO2' || metricName === 'diastolicPressure') {
    if (value < critical) return 'CRITICAL';
    if (value < warning) return 'WARNING';
    return 'NORMAL';
  }

  // Lógica para HR, Peso, Temperatura (mayor es peor)
  if (value > critical) return 'CRITICAL';
  if (value > warning) return 'WARNING';
  return 'NORMAL';
}

export default getRulesForMetrics;
