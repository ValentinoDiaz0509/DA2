# 📘 Guía de Uso Health Grid - Módulo 9

## 🎯 Para Enfermeros y Supervisores de UCI

---

## 🚀 Inicio Rápido

### 1. Acceder a la Aplicación
```
URL: http://hospital.local/healthgrid
Usuario: Tu nombre de usuario
```

### 2. Vista Principal - Dashboard de Enfermería
Tu inicio de sesión te llevará automáticamente al **Dashboard de Enfermería**.

---

## 📊 Dashboard de Enfermería

### ¿Qué ves?

**Panel Superior (Azul)**
- Título: "Dashboard de Enfermería"
- Estadísticas rápidas en tiempo real:
  - 🟢 **Estables**: Pacientes sin problemas
  - 🟡 **En Alerta**: Pacientes que necesitan monitoreo
  - 🔴 **Críticos**: Emergencias activas
  - **Total**: Número total de pacientes

**Sección de Filtros**
- Filtrar por **Piso** (Piso 3, 4, 5)
- Filtrar por **Estado** (Estable, Alerta, Crítico)
- Botón **Actualizar** para refrescar datos
- Botón **Limpiar Filtros** (aparece si hay filtros activos)

**Grid de Pacientes**
- Tarjetas con información de cada paciente
- Código de colores visual

---

## 🔍 Tarjeta de Paciente - Información Detallada

### Estructura de la Tarjeta

```
┌─────────────────────────────────────┐
│  ⚠️ [Nombre del Paciente]  [Piso-Cama] │
│  Edad: XX años                      │
│  Diagnóstico: Descripción           │
│                                     │
│  [ESTADO]  [X alertas]              │
│                                     │
│  Frecuencia  │  SpO₂%              │
│  Cardíaca    │  Saturación O₂      │
│  ­­­HR (bpm)  │  ­­­(%)             │
│                                     │
│  Presión Sistólica │  Temperatura   │
│  (mmHg)            │  (°C)          │
│                                     │
│        [MONITOREAR]                │
└─────────────────────────────────────┘
```

### Código de Colores
- 🟢 **BORDE VERDE** = Paciente estable
- 🟡 **BORDE NARANJA** = Requiere atención
- 🔴 **BORDE ROJO** = Emergencia inmediata ⚠️

### Signos Vitales Mostrados
| Signo | Rango Normal | Sigla |
|-------|------------|-------|
| Frecuencia Cardíaca | 60-100 bpm | HR |
| Saturación O₂ | 95-100% | SpO₂ |
| Presión Sistólica | 90-140 mmHg | SBP |
| Temperatura | 36.5-37.5°C | Temp |

---

## 📋 Acciones en el Dashboard

### Monitorear un Paciente
1. Busca la tarjeta del paciente
2. Haz clic en el botón azul **"MONITOREAR"**
3. Se abrirá la vista detallada

### Filtrar Pacientes
1. Ve a la sección "Filtrar Pacientes"
2. Selecciona **Piso** (ej: "Piso 3 - UCI Cardiología")
3. Selecciona **Estado** (ej: "Crítico")
4. El grid se actualizará automáticamente

### Limpiar Filtros
1. Haz clic en **"Limpiar Filtros"** (si hay filtros aplicados)
2. O selecciona "Todos" en los dropdowns

### Actualizar Datos
1. Haz clic en el botón con ícono de actualización
2. Los datos se refrescarán con los últimos valores

---

## 🔬 Vista Detallada del Paciente (Monitoreo Crítico)

### Acceder
- Haz clic en "MONITOREAR" en cualquier tarjeta
- O usa el header superior para cambiar entre vistas

### Secciones Principales

#### 1️⃣ Header con Info Rápida
```
NOMBRE DEL PACIENTE
Piso X • Cama XXX • DIAGNÓSTICO
[ESTADO]

FC: XX bpm  │  SpO₂: XX%  │  Temp: XX°C
```

#### 2️⃣ Banner de Alerta (si aplica)
- 🔴 **Rojo oscuro** = Paciente crítico
- ⚠️ Lee el mensaje de alerta

#### 3️⃣ Gráficos en Tiempo Real (2 gráficos)

**Gráfico Izquierdo: Frecuencia Cardíaca**
- Línea roja
- Eje X: Tiempo (últimos 30 minutos)
- Eje Y: BPM (40-180)
- Actualización cada 2 segundos

**Gráfico Derecho: Saturación de Oxígeno**
- Línea azul
- Eje X: Tiempo (últimos 30 minutos)
- Eje Y: Porcentaje (70-100%)
- Actualización cada 2 segundos

#### 4️⃣ Configuración de Umbrales
- Tarjeta con valores actuales
- Botón **"Editar"** para cambiar umbrales
- Personaliza por paciente específico

**Para Editar Umbrales:**
1. Haz clic en el botón **"Editar"**
2. Se abre un modal (cuadro de diálogo)
3. Modifica los valores MIN y MAX
4. Haz clic en **"Guardar"**
5. Los cambios aplican inmediatamente

#### 5️⃣ Botón de Pánico 🚨
- **Grande y rojo**
- Texto: "Botón de Pánico (Módulo de Internación)"
- **ÚSALO SOLO EN EMERGENCIAS**
- Requiere confirmación (verás un popup)
- Notifica al equipo de internación inmediatamente

#### 6️⃣ Historial de Alertas (Tabla)
- Muestra las últimas anomalías detectadas
- Columnas:
  - **Timestamp**: Cuándo ocurrió
  - **Severidad**: CRÍTICA/WARNING/INFO
  - **Mensaje**: Descripción técnica

---

## 🚨 Panel de Supervisión y Alertas

### Acceder
- Haz clic en el icono de **campana** (🔔) en el header
- O selecciona "Panel de Alertas" en el sidebar

### Banner de Emergencia (si hay)
```
┌─ ROJO PULSANTE ──────────────────────────┐
│ ⚠️ EMERGENCIA ACTIVA                      │
│ X código(s) rojo(s) requieren atención   │
│                          [ATENDER AHORA] │
└──────────────────────────────────────────┘
```

### Tabla de Alertas Activas

#### Columnas:
| Columna | Qué significa |
|---------|--------------|
| **Severidad** | 🔴 CRÍTICA, 🟠 WARNING, 🔵 INFO |
| **Paciente** | Nombre del paciente |
| **Mensaje Técnico** | ej: "HR > 120 por 2 min" |
| **Timestamp** | "hace 5 minutos" |
| **Acciones** | Botones para responder |

#### Botones de Acción:

**📊 Ver Detalles**
- Abre información completa de la alerta
- Muestra signos vitales en ese momento
- Acceso rápido a gráficos

**✅ OK (Reconocer)**
- Indica que ya estás atendiendo
- La alerta pasa a "ATENDIDA"
- Cambia de color (verde)

**📞 Internación**
- Contacta al equipo de internación
- Envía información del paciente
- Abre en nuevo lugar si es necesario

### Tabla de Alertas Atendidas
- Muestra alertas que ya fueron reconocidas
- Tachadas (gris)
- Historial completo para auditoría

---

## 📱 Usando en Mobile/Tablet

### En Pantalla Pequeña
- El **sidebar se contrae** automáticamente
- Toca el **icono ≡** (menú) para verlo
- Las tarjetas se adaptan: 1 por fila

### Gestos Útiles
- Desliza para cerrar el menú lateral
- Pinch to zoom en los gráficos
- Tap dos veces para seleccionar texto

---

## ⌚ Alertas y Notificaciones

### ¿Cuándo aparecen alertas?

**🔴 CRÍTICA** (Rojo pulsante)
- SpO₂ < 90%
- Frecuencia Cardíaca > 120 o < 50 bpm
- Presión Sistólica > 160 mmHg
- Temperatura > 39°C

**🟠 WARNING** (Naranja)
- SpO₂ < 95%
- Frecuencia Cardíaca > 100 bpm
- Presión Sistólica > 140 mmHg
- Temperatura > 38°C

### Badge en la Campana
- El número en rojo = Alertas críticas activas
- Se actualiza en tiempo real
- Haz clic para ir al Panel de Alertas

---

## 🎮 Atajos y Tips

### Navegar Rápido
| Acción | Resultado |
|--------|-----------|
| Clic en campana (🔔) | Ir a Alertas |
| Clic en Dashboard | Volver a grid de pacientes |
| Clic en paciente | Ver detalles |
| Botón atrás (←) | Volver atrás |

### Buscar Paciente
1. Ve a Dashboard
2. Usa filtros por Piso
3. Busca visualmente en el grid

### Info Técnica Rápida
- Los datos se actualizan cada 2 segundos
- No requiere F5 (refresh manual)
- Los gráficos muestran 30 minutos de historia

---

## 🆘 Solución de Problemas

### Los datos no se actualizan
- **Solución**: Haz clic en "Actualizar" en el Dashboard
- O cierra y abre nuevamente

### No veo cierto paciente
- **Solución**: Asegúrate de haber limpiado los filtros
- Verifica que el paciente esté en ese piso

### Un gráfico se ve extraño
- **Solución**: Es normal, los datos cambian constantemente
- Observa la tendencia (sube/baja), no un punto aislado

### El botón de pánico no funciona
- **Solución**: Requiere confirmación, lee el popup
- Si aparece un error, contacta al soporte

### Perdí la conexión
- **Solución**: Recarga la página (F5)
- El header se volverá gris si se desconecta

---

## 📞 Contacto y Soporte

**Equipo de Soporte:**
- 📧 Email: support@hospital.local
- 📱 Teléfono: Ext. 5555
- 💬 Chat: Interno en sistema

**Reportar Problemas:**
1. Abre el navigador DevTools (F12)
2. Ve a la pestaña "Console"
3. Copia cualquier error rojo
4. Envía a soporte con captura de pantalla

---

## ✅ Checklist Diario

- [ ] Verificar Dashboard al inicio de turno
- [ ] Revisar alertas críticas (🔴)
- [ ] Reconocer alertas atendidas (✅)
- [ ] Actualizar umbrales si es necesario
- [ ] Registrar cualquier incidente en el sistema
- [ ] Cerrar sesión al terminar turno

---

**¡Gracias por usar Health Grid!**  
*Juntos cuidamos vidas.*

---

**Versión**: v1.0.0  
**Última actualización**: Marzo 21, 2026  
**Idioma**: Español

