import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Stack,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import {
  Favorite as HeartIcon,
  Air as LungIcon,
  Thermostat as TempIcon,
  Settings as SettingsIcon,
  ArrowBack as BackIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useHealthGrid } from '../context/HealthGridContext';
import { SEVERITY_LEVELS } from '../data/constants';

export const PatientDetailView = ({ onBack }) => {
  const {
    getSelectedPatient,
    updatePatientThresholds,
    vitalsTrendData,
    triggerManualPanic
  } = useHealthGrid();

  const patient = getSelectedPatient();
  const [thresholdsDialogOpen, setThresholdsDialogOpen] = useState(false);
  const [editedThresholds, setEditedThresholds] = useState(patient?.thresholds || {});

  if (!patient) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<BackIcon />} onClick={onBack}>
          Volver
        </Button>
        <Typography color="error" sx={{ mt: 2 }}>
          Por favor selecciona un paciente
        </Typography>
      </Box>
    );
  }

  const trendData = vitalsTrendData[patient.id] || [];

  const handleThresholdsChange = (vital, field, value) => {
    setEditedThresholds({
      ...editedThresholds,
      [vital]: {
        ...editedThresholds[vital],
        [field]: parseFloat(value)
      }
    });
  };

  const handleSaveThresholds = () => {
    updatePatientThresholds(patient.id, editedThresholds);
    setThresholdsDialogOpen(false);
  };

  const handlePanic = () => {
    if (window.confirm('¿Disparar evento de pánico para este paciente? Esto notificará al equipo de internación.')) {
      triggerManualPanic(patient.id);
      alert('Evento de pánico registrado. El equipo de respuesta ha sido notificado.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'stable':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'critical':
        return '#F44336';
      default:
        return '#1565C0';
    }
  };

  const statusLabels = {
    stable: 'Estable',
    warning: 'Alerta',
    critical: 'Crítico'
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F5F7FA',
        overflow: 'auto'
      }}
    >
      {/* Header */}
      <Paper
        sx={{
          backgroundImage: `linear-gradient(135deg, ${getStatusColor(patient.status)} 0%, ${getStatusColor(patient.status)} 100%)`,
          color: '#fff',
          p: { xs: 2, sm: 3 },
          borderRadius: 0,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          mb: 3
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              onClick={onBack}
              sx={{ color: '#fff', mr: 1 }}
            >
              <BackIcon />
            </IconButton>
            <Box flex={1}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                📋 {patient.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Piso {patient.floor} - Cama {patient.bed} • {patient.diagnosis}
              </Typography>
            </Box>
            <Chip
              label={statusLabels[patient.status].toUpperCase()}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.8rem'
              }}
            />
          </Stack>

          {/* Quick Stats */}
          <Stack direction="row" spacing={3} sx={{ pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.3)' }}>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>Edad</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{patient.age} años</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>FC</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{patient.vitals.heartRate.toFixed(0)} bpm</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>SpO₂</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{patient.vitals.spO2.toFixed(0)}%</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>Temp</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{patient.vitals.temperature.toFixed(1)}°C</Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      <Container maxWidth="xl" sx={{ mb: 4 }}>
        {/* Critical Alert */}
        {patient.status === 'critical' && (
          <Alert
            severity="error"
            sx={{ mb: 3, animation: 'slideInFromTop 0.5s ease' }}
            icon={<WarningIcon />}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              ⚠️ ALERTA CRÍTICA: Este paciente requiere atención inmediata
            </Typography>
          </Alert>
        )}

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Heart Rate Chart */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: '400px' }}>
              <CardHeader
                title="Frecuencia Cardíaca (últimos 30 minutos)"
                avatar={<HeartIcon sx={{ color: '#F44336' }} />}
                sx={{
                  backgroundColor: '#FFEBEE',
                  borderBottom: '1px solid #E0E0E0'
                }}
              />
              <CardContent sx={{ height: 'calc(100% - 64px)', p: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F44336" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F44336" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                    <XAxis
                      dataKey="time"
                      stroke="#999"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#999"
                      tick={{ fontSize: 11 }}
                      label={{ value: 'bpm', angle: -90, position: 'insideLeft' }}
                      domain={[40, 180]}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: 'none',
                        borderRadius: 8,
                        color: '#fff'
                      }}
                      formatter={(value) => [`${value.toFixed(0)} bpm`, 'HR']}
                    />
                    <Area
                      type="monotone"
                      dataKey="heartRate"
                      stroke="#F44336"
                      fillOpacity={1}
                      fill="url(#colorHR)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* SpO2 Chart */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: '400px' }}>
              <CardHeader
                title="Saturación de Oxígeno (últimos 30 minutos)"
                avatar={<LungIcon sx={{ color: '#2196F3' }} />}
                sx={{
                  backgroundColor: '#E3F2FD',
                  borderBottom: '1px solid #E0E0E0'
                }}
              />
              <CardContent sx={{ height: 'calc(100% - 64px)', p: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorSpO2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2196F3" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                    <XAxis
                      dataKey="time"
                      stroke="#999"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#999"
                      tick={{ fontSize: 11 }}
                      label={{ value: '%', angle: -90, position: 'insideLeft' }}
                      domain={[70, 100]}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: 'none',
                        borderRadius: 8,
                        color: '#fff'
                      }}
                      formatter={(value) => [`${value.toFixed(0)}%`, 'SpO₂']}
                    />
                    <Area
                      type="monotone"
                      dataKey="spO2"
                      stroke="#2196F3"
                      fillOpacity={1}
                      fill="url(#colorSpO2)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Configuration & Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Threshold Configuration */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Configuración de Umbrales"
                avatar={<SettingsIcon />}
                action={
                  <Button
                    startIcon={<SettingsIcon />}
                    onClick={() => setThresholdsDialogOpen(true)}
                    size="small"
                  >
                    Editar
                  </Button>
                }
              />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Frecuencia Cardíaca
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {patient.thresholds.heartRate.min} - {patient.thresholds.heartRate.max} bpm
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Saturación de Oxígeno
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {patient.thresholds.spO2.min} - {patient.thresholds.spO2.max}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Presión Sistólica
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {patient.thresholds.systolic.min} - {patient.thresholds.systolic.max} mmHg
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Temperatura
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {patient.thresholds.temperature.min} - {patient.thresholds.temperature.max}°C
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Acciones Rápidas"
              />
              <CardContent>
                <Stack spacing={1.5}>
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    onClick={handlePanic}
                    sx={{
                      py: 1.5,
                      fontWeight: 700,
                      animation: patient.status === 'critical' ? 'pulse 1.5s infinite' : 'none'
                    }}
                  >
                    🚨 Botón de Pánico (Módulo de Internación)
                  </Button>
                  <Typography variant="caption" sx={{ color: '#666', textAlign: 'center' }}>
                    Dispara una alerta crítica al equipo de internación
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alert History */}
        <Card sx={{ mb: 4 }}>
          <CardHeader
            title="Historial de Alertas"
            avatar={<WarningIcon sx={{ color: '#FF9800' }} />}
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F5F7FA' }}>
                  <TableCell><strong>Timestamp</strong></TableCell>
                  <TableCell><strong>Severidad</strong></TableCell>
                  <TableCell><strong>Mensaje</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patient.alertHistory && patient.alertHistory.length > 0 ? (
                  patient.alertHistory.map((alert, idx) => (
                    <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#F9F9F9' } }}>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {alert.timestamp.toLocaleTimeString('es-ES')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.severity.toUpperCase()}
                          size="small"
                          color={alert.severity === SEVERITY_LEVELS.CRITICAL ? 'error' : 'warning'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{alert.message}</Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ textAlign: 'center', color: '#999', py: 2 }}>
                      Sin alertas registradas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>

      {/* Thresholds Edit Dialog */}
      <Dialog open={thresholdsDialogOpen} onClose={() => setThresholdsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configurar Umbrales de Alerta</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Frecuencia Cardíaca (bpm)
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Mín"
                  type="number"
                  size="small"
                  value={editedThresholds.heartRate?.min || ''}
                  onChange={(e) => handleThresholdsChange('heartRate', 'min', e.target.value)}
                />
                <TextField
                  label="Máx"
                  type="number"
                  size="small"
                  value={editedThresholds.heartRate?.max || ''}
                  onChange={(e) => handleThresholdsChange('heartRate', 'max', e.target.value)}
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Saturación de Oxígeno (%)
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Mín"
                  type="number"
                  size="small"
                  value={editedThresholds.spO2?.min || ''}
                  onChange={(e) => handleThresholdsChange('spO2', 'min', e.target.value)}
                />
                <TextField
                  label="Máx"
                  type="number"
                  size="small"
                  value={editedThresholds.spO2?.max || ''}
                  onChange={(e) => handleThresholdsChange('spO2', 'max', e.target.value)}
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Presión Sistólica (mmHg)
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Mín"
                  type="number"
                  size="small"
                  value={editedThresholds.systolic?.min || ''}
                  onChange={(e) => handleThresholdsChange('systolic', 'min', e.target.value)}
                />
                <TextField
                  label="Máx"
                  type="number"
                  size="small"
                  value={editedThresholds.systolic?.max || ''}
                  onChange={(e) => handleThresholdsChange('systolic', 'max', e.target.value)}
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Temperatura (°C)
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Mín"
                  type="number"
                  size="small"
                  inputProps={{ step: '0.1' }}
                  value={editedThresholds.temperature?.min || ''}
                  onChange={(e) => handleThresholdsChange('temperature', 'min', e.target.value)}
                />
                <TextField
                  label="Máx"
                  type="number"
                  size="small"
                  inputProps={{ step: '0.1' }}
                  value={editedThresholds.temperature?.max || ''}
                  onChange={(e) => handleThresholdsChange('temperature', 'max', e.target.value)}
                />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setThresholdsDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveThresholds} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
