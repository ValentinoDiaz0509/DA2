# 🏗️ Arquitectura Técnica - Health Grid Módulo 9

## 📐 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────┐
│                    App.js (Root)                     │
├─────────────────────────────────────────────────────┤
│  ThemeProvider (Material-UI)                        │
│  └─ HealthGridProvider (React Context)              │
│     └─ Layout (Header + Sidebar)                    │
│        ├─ NursingDashboard (Vista Principal)        │
│        ├─ PatientDetailView (Detalle + Gráficos)   │
│        └─ AlertsSupervisionPanel (Control Alertas)  │
└─────────────────────────────────────────────────────┘
```

---

## 🧠 Context API - HealthGridContext

**Responsabilidad**: Manejo centralizado del estado de pacientes y alertas

### State Management
```javascript
{
  patients: Paciente[],              // Array de todos los pacientes
  alerts: Alerta[],                  // Array de alertas activas
  selectedPatientId: string,         // ID del paciente seleccionado
  filterFloor: number | null,        // Filtro por piso
  filterStatus: string | null,       // Filtro por estado
  criticalAlertsCount: number,       // Contador de alertas críticas
  emergencyActive: boolean,          // Flag de emergencia activa
  acknowledgedAlerts: Set<string>,   // Set de alertas reconocidas
  vitalsTrendData: Object            // Datos históricos de gráficos
}
```

### Hooks Disponibles
- `acknowledgeAlert(alertId)` - Reconocer una alerta
- `triggerManualPanic(patientId)` - Disparar pánico manual
- `updatePatientThresholds(patientId, newThresholds)` - Actualizar umbrales
- `getFilteredPatients()` - Obtener pacientes con filtros aplicados
- `getSelectedPatient()` - Obtener paciente seleccionado
- `getActiveAlerts()` - Obtener alertas no reconocidas

---

## 🔄 Flujo de Datos - Simulación en Tiempo Real

### 1. Inicialización
```
App Mount
  ↓
HealthGridProvider Init
  ├─ Cargar MOCK_PATIENTS
  ├─ Inicializar alertas desde historial
  └─ Generar datos de tendencia inicial
```

### 2. Simulación de Signos Vitales (cada 2 segundos)
```
useEffect (VITAL_SIGNS_UPDATE_INTERVAL)
  ↓
ForEach paciente:
  ├─ Agregar variación realista (10-20% de varianza)
  ├─ Evaluar nuevo estado (Estable/Alerta/Crítico)
  └─ Recalcular tendencias
  ↓
triggerRender()
```

### 3. Detección de Alertas
```
Cambio en vitales?
  ↓
¿spO2 < 90? → CRÍTICA
¿HR > 120? → CRÍTICA
¿Temp > 39? → CRÍTICA
¿Sistólica > 160? → CRÍTICA
  ↓
Crear nueva Alerta
  ├─ ID único (UUID)
  ├─ Timestamp
  └─ Severity: CRITICAL
  ↓
Agregar a alerts[]
Actualizar criticalAlertsCount
setEmergencyActive(true)
```

---

## 📊 Componentes Detallados

### Layout.js
**Props:**
- `children` - Contenido dinámico
- `currentView` - Vista actual
- `onViewChange` - Callback para cambiar vista

**Características:**
- Header responsive con badge de alertas
- Sidebar collapsible en mobile
- Indicador de emergencia pulsante
- Avatar de usuario

### NursingDashboard.js
**Props:**
- `onSelectPatient(patientId)` - Callback al seleccionar paciente

**Funcionalidad:**
- Grid responsivo (1-4 columnas según pantalla)
- Filtros por piso y estado
- Estadísticas rápidas (Estables/Alertas/Críticos)
- Cards interactivas de pacientes

### PatientCard.js
**Props:**
- `patient` - Objeto del paciente
- `onSelect` - Callback al hacer clic
- `isSelected` - Boolean de selección

**Elementos:**
- Borde coloreado (Estable/Alerta/Crítico)
- Indicadores visuales de signos vitales
- Progress bars de cada vital
- Chip con ubicación (Piso-Cama)

### PatientDetailView.js
**Props:**
- `onBack` - Callback para volver al dashboard

**Secciones:**
1. **Header con Estadísticas Rápidas**
2. **Gráficos en Tiempo Real**:
   - Area Chart para Frecuencia Cardíaca
   - Area Chart para Saturación de Oxígeno
   - Eje X: Tiempo en formato HH:mm
   - Eje Y: Valores de vital
3. **Configuración de Umbrales** (Modal)
4. **Historial de Alertas** (Tabla)
5. **Botón de Pánico**

### AlertsSupervisionPanel.js
**Características:**
1. **Emergency Banner**:
   - Solo se muestra si `emergencyActive === true`
   - Animación pulsante roja
   - Contador de códigos rojos

2. **Tabla de Alertas Activas**:
   - Severidad (CRITICAL/WARNING/INFO)
   - Paciente y Mensaje Técnico
   - Timestamp con "hace X minutos"
   - Botones: OK, Ver Detalles, Internación

3. **Tabla de Alertas Atendidas**:
   - Estilo tachado
   - Opacidad reducida
   - Historial de acciones

---

## 🎨 Sistema de Colores y Estados

### Estado del Paciente
```javascript
PATIENT_STATUS = {
  STABLE: 'stable',    // Verde
  WARNING: 'warning',  // Amarillo
  CRITICAL: 'critical' // Rojo
}
```

### Mapeo de Colores
```javascript
STATUS_COLORS = {
  stable: {
    bgColor: '#E8F5E9',      // Verde claro
    borderColor: '#4CAF50',  // Verde oscuro
    textColor: '#1B5E20'     // Verde muy oscuro
  },
  warning: {
    bgColor: '#FFF3E0',      // Naranja claro
    borderColor: '#FF9800',  // Naranja
    textColor: '#E65100'     // Naranja oscuro
  },
  critical: {
    bgColor: '#FFEBEE',      // Rojo claro
    borderColor: '#F44336',  // Rojo
    textColor: '#B71C1C'     // Rojo oscuro
  }
}
```

### Severidad de Alertas
```javascript
SEVERITY_LEVELS = {
  INFO: 'info',           // 🔵 Azul - Informativo
  WARNING: 'warning',     // 🟠 Naranja - Requiere atención
  CRITICAL: 'critical'    // 🔴 Rojo - Emergencia
}
```

---

## 📈 Datos Mock y UUIDs

### Pacientes de Demo
```javascript
{
  id: 'uuid-550e8400-...',
  name: 'Paciente Nombre',
  age: número,
  floor: 3 | 4 | 5,
  bed: 'número',
  diagnosis: 'Diagnóstico',
  status: 'stable' | 'warning' | 'critical',
  vitals: {
    heartRate: número (bpm),
    spO2: número (%),
    systolic: número (mmHg),
    diastolic: número (mmHg),
    temperature: número (°C)
  },
  thresholds: {
    heartRate: { min, max },
    spO2: { min, max },
    systolic: { min, max },
    diastolic: { min, max },
    temperature: { min, max }
  },
  alertHistory: [{ id, timestamp, message, severity }]
}
```

### Formato de UUID
_Consistente con contrato:_
```
550e8400-e29b-41d4-a716-446655440001
550e8400-e29b-41d4-a716-446655440002
...
550e8400-e29b-41d4-a716-446655440006
```

---

## ⚡ Optimizaciones de Rendimiento

### Prevención de Re-renders
```javascript
// useCallback para funciones estables
const acknowledgeAlert = useCallback((alertId) => {
  // lógica
}, [alerts]); // Dependencias mínimas

// useMemo para datos complejos
const filteredPatients = useMemo(() => {
  return patients.filter(...);
}, [patients, filterFloor, filterStatus]);
```

### Lazy Loading (Opcional)
```javascript
const PatientDetailView = React.lazy(() => 
  import('./PatientDetailView')
);
```

---

## 🔌 API de Integración Futura

### Para conectar con Backend Real

**Endpoint: GET /api/patients**
```json
[
  {
    "id": "uuid",
    "name": "Nombre",
    "floor": 3,
    "vitals": { "heartRate": 80, ... },
    ...
  }
]
```

**Endpoint: POST /api/alerts/acknowledge**
```json
{
  "alertId": "uuid",
  "acknowledgedBy": "enfermero-id",
  "timestamp": "ISO-8601"
}
```

**Endpoint: POST /api/panic**
```json
{
  "patientId": "uuid",
  "timestamp": "ISO-8601",
  "message": "Pánico manual"
}
```

**WebSocket: /ws/vitals**
```
Recibe actualizaciones de signos vitales en tiempo real
```

---

## 🧪 Testing Sugerido

### Unit Tests
```javascript
// PatientCard.js
- Debe renderizar nombre del paciente ✓
- Debe aplicar color según estado ✓
- Debe disparar onSelect al hacer clic ✓

// HealthGridContext.js
- acknowledgeAlert debe cambiar status ✓
- triggerManualPanic debe crear alerta ✓
- updatePatientThresholds debe actualizar umbrales ✓
```

### Integration Tests
```javascript
// Flujo completo
1. Cargar dashboard
2. Filtrar pacientes
3. Seleccionar paciente
4. Ver gráficos
5. Editar umbrales
6. Disparar alerta
7. Acknowledge
```

---

## 📝 Mejores Prácticas Implementadas

✅ **Separación de responsabilidades**
- Lógica en Context
- UI en Componentes
- Datos en Constants

✅ **Accesibilidad**
- Labels asociados a inputs
- ARIA attributes
- Contraste WCAG AA

✅ **Responsive Design**
- Breakpoints: xs, sm, md, lg, xl
- Componentes adaptativos
- Mobile-first approach

✅ **Performance**
- Memoización de callbacks
- Evitar re-renders innecesarios
- Lazy loading lists

✅ **UX/DX**
- Confirmaciones para acciones peligrosas
- Feedback visual inmediato
- Mensajes de error claros
- Animaciones sutiles

---

## 🚀 Deploymente y Construcción

### Build para Producción
```bash
npm run build
# Genera carpeta /build optimizada

# Archivos generados:
# - bundle.js (minificado)
# - Main.*.css (Estilos optimizados)
# - Ideal para servir con nginx/apache
```

### Environment Variables (Futuro)
```
REACT_APP_API_URL=https://api.hospital.com
REACT_APP_LOG_LEVEL=info
REACT_APP_FEATURE_FLAGS=...
```

---

## 📞 Debugging

### React DevTools
```
Instalar extensión Chrome:
chrome.google.com/webstore/detail/.../
```

### Console Helpers
```javascript
// Inspeccionar estado del contexto
useHealthGrid() // En consola del navegador
```

### Performance Profiling
```
Chrome DevTools → Performance → Record
Analizar render times de componentes
```

---

**Documentación Técnica - Health Grid Módulo 9**  
*Última actualización: 2026-03-21*
