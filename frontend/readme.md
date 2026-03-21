# 🏥 Health Grid - Módulo 9: Monitoreo de Pacientes

## 📋 Descripción

Sistema integral de **monitoreo de pacientes en tiempo real** para un ecosistema hospitalario. Interfaz profesional, crítica y de alto contraste diseñada para enfermeros y supervisores de UCI.

**Stack Tecnológico:**
- ⚛️ **React 18** - Framework UI
- 🎨 **Material UI (MUI 5)** - Componentes y diseño profesional
- 📊 **Recharts** - Gráficos de tendencias en tiempo real
- 🆔 **UUID** - Identificadores únicos consistentes

---

## 🎯 Características Principales

### 1️⃣ Dashboard de Enfermería
- **Grid de pacientes** con tarjetas interactivas
- **Filtros dinámicos** por piso y estado
- **Signos vitales en tiempo real**:
  - Frecuencia Cardíaca (bpm)
  - Saturación de Oxígeno (%)
  - Presión Arterial (mmHg)
  - Temperatura (°C)
- **Código de colores visual**:
  - 🟢 **Verde** = Estable
  - 🟡 **Amarillo** = Alerta
  - 🔴 **Rojo** = Crítico

### 2️⃣ Monitoreo Crítico (Detalle del Paciente)
- **Gráficos en tiempo real** con Recharts
- **Histórico de últimos 30 minutos** de signos vitales
- **Configuración de umbrales personalizados** para cada paciente
- **Historial de alertas** con timestamps y severidad
- **Botón de pánico** para contactar internación

### 3️⃣ Panel de Supervisión y Alertas
- **Banner rojo persistente** si hay emergencias activas
- **Tabla de alertas con severidad**:
  - 🔴 CRÍTICA - Requiere atención inmediata
  - 🟠 WARNING - Requiere monitoreo
- **Sistema de Acknowledge** ("Atendido")
- **Integración con Módulo de Internación**

---

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.js                 # Header + Sidebar de navegación
│   │   ├── NursingDashboard.js       # Vista principal con grid de pacientes
│   │   ├── PatientCard.js            # Tarjeta individual de paciente
│   │   ├── PatientDetailView.js      # Detalle con gráficos y configuración
│   │   └── AlertsSupervisionPanel.js # Panel de supervisión de alertas
│   ├── context/
│   │   └── HealthGridContext.js      # Contexto global (alertas, pacientes)
│   ├── data/
│   │   ├── mockPatients.js           # Datos de pacientes (6 pacientes de demo)
│   │   └── constants.js              # Constantes y configuración
│   ├── theme/
│   │   └── theme.js                  # Tema MUI personalizado
│   ├── App.js                        # Componente raíz
│   └── index.js                      # Punto de entrada
├── public/
│   └── index.html                    # HTML base
├── package.json                      # Dependencias
└── readme.md                         # Este archivo
```

---

## 🚀 Instalación y Ejecución

### Requisitos
- Node.js 16+ 
- npm o yarn

### Instalación
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Compilar para producción
npm build

# Ejecutar tests
npm test
```

La aplicación se abrirá en `http://localhost:3000`

---

## 🎮 Guía de Uso

### Dashboard de Enfermería
1. **Vista Principal** - Muestra grid de todos los pacientes
2. **Filtros** - Filtra por piso o estado
3. **Tarjetas de Pacientes**:
   - Haz clic en "Monitorear" para ver detalles
   - Los colores indican el estado actual

### Detalle del Paciente
1. **Gráficos en Tiempo Real**:
   - Frecuencia Cardíaca (izquierda)
   - Saturación de Oxígeno (derecha)
2. **Configurar Umbrales**:
   - Haz clic en "Editar" para ajustar valores de alerta
3. **Acciones Rápidas**:
   - Botón de pánico para internación

### Panel de Alertas
1. **Alertas Activas** - Se muestran en rojo
2. **Acknowledge** - Haz clic en "OK" para reconocer
3. **Contactar Internación** - Envía alerta crítica
4. **Banner de Emergencia** - Solo se muestra si hay códigos rojos

---

## 📊 Simulación de Datos

La aplicación **simula datos en tiempo real** con:
- ✅ Actualizaciones de signos vitales cada 2 segundos
- ✅ Cambios automáticos de estado (Estable → Alerta → Crítico)
- ✅ Historial automático de alertas
- ✅ UUIDs consistentes con el contrato (550e8400-e29b-41d4-a716-...)

**No requiere backend** - Funciona totalmente en el cliente con React Context.

---

## 🔐 Seguridad y Confiabilidad

✅ Alta legibilidad para situaciones de emergencia  
✅ Contraste de colores (WCAG AA)  
✅ Animaciones sutiles para alertas críticas  
✅ Confirmaciones para acciones peligrosas  
✅ Historial auditado de alertas  

---

## 🎨 Paleta de Colores

| Estado | Color | Uso |
|--------|-------|-----|
| Estable | 🟢 #4CAF50 | Pacientes sin problemas |
| Alerta | 🟡 #FF9800 | Requiere monitoreo |
| Crítico | 🔴 #F44336 | Emergencia inmediata |
| Primario | 🔵 #1565C0 | Elementos principales |

---

## 📝 Datos Mock Incluidos

Se incluyen **6 pacientes de demostración**:

1. **Juan Perez** (Piso 3, Cama 301) - 🔴 CRÍTICO (IAM)
2. **María García** (Piso 3, Cama 302) - 🟡 ALERTA (Neumonía)
3. **Carlos López** (Piso 3, Cama 303) - 🟢 ESTABLE (Post-op)
4. **Ana Martínez** (Piso 4, Cama 401) - 🟡 ALERTA (Insuficiencia cardíaca)
5. **Roberto Silva** (Piso 4, Cama 402) - 🔴 CRÍTICO (Sepsis)
6. **Elena González** (Piso 4, Cama 403) - 🔴 CRÍTICO (ACV)

Los IDs usan el UUID base: `550e8400-e29b-41d4-a716-44665544XXXX`

---

## 🔄 Flujo de Alertas

```
Cambio en Signos Vitales
         ↓
Evaluación de Umbrales
         ↓
¿Fuera de rango?
    ↙         ↘
   SÍ          NO
   ↓           ↓
Nueva Alerta   Sin cambio
   ↓
Mostrar en:
- Badge (Header)
- Panel de Alertas
- Historial del Paciente
   ↓
Enfermero Acknowledge
   ↓
Cambiar estado a "Atendida"
```

---

## 🛠️ Configuración Avanzada

### Intervalo de Actualización
Archivo: `src/data/constants.js`
```javascript
VITAL_SIGNS_UPDATE_INTERVAL: 2000 // ms
```

### Puntos en Gráficos
```javascript
TREND_DATA_POINTS: 30 // últimos 30 minutos
```

### Duración de Animaciones
```javascript
ALERT_ANIMATION_DURATION: 300 // ms
```

---

## 🤝 Integración con Otros Módulos

El sistema está diseñado para integrarse con:
- **Módulo de Internación** - Recibe eventos de pánico
- **Motor de Reglas** - Procesa umbrales personalizados
- **Base de Datos Hospitalaria** - Sincroniza pacientes

---

## 📞 Soporte y Documentación

- **UUIDs Contratados**: `550e8400-e29b-41d4-a716-446655440000`
- **Compatibilidad**: Chrome, Firefox, Safari, Edge (últimas 2 versiones)
- **Responsivo**: Desktop, Tablet, Mobile

---

## 📄 Licencia

Desarrollado como parte del ecosistema **Health Grid**. Uso interno hospitalario.

---

## ✨ Notas de Implementación

- ✅ Sistema reactivo con React Context
- ✅ Animaciones para situaciones críticas
- ✅ Gráficos profesionales con Recharts
- ✅ Material Design 5.0
- ✅ Totalmente responsive
- ✅ Sin dependencias externas innecesarias
- ✅ Código limpio y bien estructurado
- ✅ Comments en español para equipo local

---

**Desarrollado con ❤️ para mejorar la atención de pacientes críticos**
