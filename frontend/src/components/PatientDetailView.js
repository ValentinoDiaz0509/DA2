import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import {
  Air as LungIcon,
  ArrowBack as BackIcon,
  Favorite as HeartIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useHealthGrid } from '../context/HealthGridContext';
import { PATIENT_STATUS, SEVERITY_LEVELS } from '../data/constants';

const getStatusColor = (status) => {
  switch (status) {
    case PATIENT_STATUS.NORMAL:
      return '#4CAF50';
    case PATIENT_STATUS.WARNING:
      return '#FF9800';
    case PATIENT_STATUS.CRITICAL:
      return '#F44336';
    default:
      return '#1565C0';
  }
};

const STATUS_LABELS = {
  [PATIENT_STATUS.NORMAL]: 'Estable',
  [PATIENT_STATUS.WARNING]: 'Alerta',
  [PATIENT_STATUS.CRITICAL]: 'Critico'
};

const formatMetric = (value, digits = 0, suffix = '') => (
  typeof value === 'number' ? `${value.toFixed(digits)}${suffix}` : `--${suffix}`
);

const formatChartValue = (value, unit, label) => (
  typeof value === 'number' ? [`${value.toFixed(0)} ${unit}`, label] : ['Sin dato', label]
);

export const PatientDetailView = ({ onBack }) => {
  const {
    getSelectedPatient,
    triggerManualPanic,
    updatePatientThresholds,
    vitalsTrendData
  } = useHealthGrid();
  const patient = getSelectedPatient();
  const [thresholdsDialogOpen, setThresholdsDialogOpen] = useState(false);
  const [editedThresholds, setEditedThresholds] = useState(patient?.thresholds || {});

  useEffect(() => {
    setEditedThresholds(patient?.thresholds || {});
  }, [patient]);

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
    setEditedThresholds((previousThresholds) => ({
      ...previousThresholds,
      [vital]: {
        ...previousThresholds[vital],
        [field]: parseFloat(value)
      }
    }));
  };

  const handleSaveThresholds = () => {
    updatePatientThresholds(patient.id, editedThresholds);
    setThresholdsDialogOpen(false);
  };

  const handlePanic = () => {
    if (window.confirm('¿Disparar evento de panico para este paciente? Esto notificara al equipo de internacion.')) {
      triggerManualPanic(patient.id);
      alert('Evento de panico registrado. El equipo de respuesta ha sido notificado.');
    }
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
            <IconButton onClick={onBack} sx={{ color: '#fff', mr: 1 }}>
              <BackIcon />
            </IconButton>
            <Box flex={1}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {patient.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Habitacion {patient.room} - Cama {patient.bed} • {patient.diagnosis}
              </Typography>
            </Box>
            <Chip
              label={(STATUS_LABELS[patient.status] || patient.status).toUpperCase()}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.8rem'
              }}
            />
          </Stack>

          <Stack direction="row" spacing={3} sx={{ pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.3)' }}>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>Habitacion</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{patient.room}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>FC</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatMetric(patient.vitals.heartRate, 0, ' bpm')}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>SpO2</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatMetric(patient.vitals.spO2, 0, '%')}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>Temp</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatMetric(patient.vitals.temperature, 1, '°C')}</Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      <Container maxWidth="xl" sx={{ mb: 4 }}>
        {patient.status === PATIENT_STATUS.CRITICAL && (
          <Alert
            severity="error"
            sx={{ mb: 3, animation: 'slideInFromTop 0.5s ease' }}
            icon={<WarningIcon />}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              ALERTA CRITICA: Este paciente requiere atencion inmediata
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: '400px' }}>
              <CardHeader
                title="Frecuencia Cardiaca (ultimos 30 minutos)"
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
                    <XAxis dataKey="time" stroke="#999" tick={{ fontSize: 11 }} />
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
                      formatter={(value) => formatChartValue(value, 'bpm', 'HR')}
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

          <Grid item xs={12} lg={6}>
            <Card sx={{ height: '400px' }}>
              <CardHeader
                title="Saturacion de Oxigeno (ultimos 30 minutos)"
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
                    <XAxis dataKey="time" stroke="#999" tick={{ fontSize: 11 }} />
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
                      formatter={(value) => formatChartValue(value, '%', 'SpO2')}
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

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Configuracion de Umbrales"
                avatar={<SettingsIcon />}
                action={(
                  <Button
                    startIcon={<SettingsIcon />}
                    onClick={() => setThresholdsDialogOpen(true)}
                    size="small"
                  >
                    Editar
                  </Button>
                )}
              />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Frecuencia Cardiaca
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {patient.thresholds.heartRate.min} - {patient.thresholds.heartRate.max} bpm
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Saturacion de Oxigeno
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {patient.thresholds.spO2.min} - {patient.thresholds.spO2.max}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Presion Sistolica
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {patient.thresholds.systolicPressure.min} - {patient.thresholds.systolicPressure.max} mmHg
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

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Acciones Rapidas" />
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
                      animation: patient.status === PATIENT_STATUS.CRITICAL ? 'pulse 1.5s infinite' : 'none'
                    }}
                  >
                    Boton de Panico (Modulo de Internacion)
                  </Button>
                  <Typography variant="caption" sx={{ color: '#666', textAlign: 'center' }}>
                    Dispara una alerta critica al equipo de internacion
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
                {patient.alertHistory.length > 0 ? (
                  patient.alertHistory.map((alert) => (
                    <TableRow key={alert.id} sx={{ '&:hover': { backgroundColor: '#F9F9F9' } }}>
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

      <Dialog open={thresholdsDialogOpen} onClose={() => setThresholdsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configurar Umbrales de Alerta</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Frecuencia Cardiaca (bpm)
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Min"
                  type="number"
                  size="small"
                  value={editedThresholds.heartRate?.min || ''}
                  onChange={(event) => handleThresholdsChange('heartRate', 'min', event.target.value)}
                />
                <TextField
                  label="Max"
                  type="number"
                  size="small"
                  value={editedThresholds.heartRate?.max || ''}
                  onChange={(event) => handleThresholdsChange('heartRate', 'max', event.target.value)}
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Saturacion de Oxigeno (%)
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Min"
                  type="number"
                  size="small"
                  value={editedThresholds.spO2?.min || ''}
                  onChange={(event) => handleThresholdsChange('spO2', 'min', event.target.value)}
                />
                <TextField
                  label="Max"
                  type="number"
                  size="small"
                  value={editedThresholds.spO2?.max || ''}
                  onChange={(event) => handleThresholdsChange('spO2', 'max', event.target.value)}
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Presion Sistolica (mmHg)
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Min"
                  type="number"
                  size="small"
                  value={editedThresholds.systolicPressure?.min || ''}
                  onChange={(event) => handleThresholdsChange('systolicPressure', 'min', event.target.value)}
                />
                <TextField
                  label="Max"
                  type="number"
                  size="small"
                  value={editedThresholds.systolicPressure?.max || ''}
                  onChange={(event) => handleThresholdsChange('systolicPressure', 'max', event.target.value)}
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Temperatura (°C)
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Min"
                  type="number"
                  size="small"
                  inputProps={{ step: '0.1' }}
                  value={editedThresholds.temperature?.min || ''}
                  onChange={(event) => handleThresholdsChange('temperature', 'min', event.target.value)}
                />
                <TextField
                  label="Max"
                  type="number"
                  size="small"
                  inputProps={{ step: '0.1' }}
                  value={editedThresholds.temperature?.max || ''}
                  onChange={(event) => handleThresholdsChange('temperature', 'max', event.target.value)}
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
