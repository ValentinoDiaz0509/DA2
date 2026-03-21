import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Stack,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  NorthEast as TrendingUp,
  Phone as PhoneIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useHealthGrid } from '../context/HealthGridContext';
import { SEVERITY_LEVELS, ALERT_SEVERITY_CONFIG } from '../data/constants';

export const AlertsSupervisionPanel = ({ onContactInternation }) => {
  const {
    alerts,
    emergencyActive,
    criticalAlertsCount,
    acknowledgeAlert,
    triggerManualPanic,
    getSelectedPatient,
    setSelectedPatientId,
    patients
  } = useHealthGrid();

  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);
  const [selectedAlertId, setSelectedAlertId] = React.useState(null);

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged');

  const handleAcknowledge = (alertId) => {
    acknowledgeAlert(alertId);
  };

  const handleViewDetails = (alertId) => {
    setSelectedAlertId(alertId);
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      setSelectedPatientId(alert.patientId);
    }
    setDetailsDialogOpen(true);
  };

  const handleContactInternation = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient && window.confirm(`¿Contactar al equipo de internación para ${patient.name}?`)) {
      triggerManualPanic(patientId);
      alert('Contacto iniciado con el equipo de internación');
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case SEVERITY_LEVELS.CRITICAL:
        return <ErrorIcon sx={{ color: '#F44336' }} />;
      case SEVERITY_LEVELS.WARNING:
        return <WarningIcon sx={{ color: '#FF9800' }} />;
      default:
        return <InfoIcon sx={{ color: '#2196F3' }} />;
    }
  };

  const getTimeSince = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `hace ${seconds}s`;
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`;
    return `hace ${Math.floor(seconds / 3600)}h`;
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
      {/* Emergency Banner */}
      {emergencyActive && (
        <Alert
          severity="error"
          icon={<ErrorIcon sx={{ fontSize: '2rem' }} />}
          sx={{
            m: 0,
            p: 2,
            borderRadius: 0,
            backgroundColor: '#B71C1C',
            color: '#fff',
            animation: 'pulse 1s infinite',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            '& .MuiAlert-message': {
              flex: 1
            }
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.25 }}>
                ⚠️ EMERGENCIA ACTIVA
              </Typography>
              <Typography variant="body2">
                {criticalAlertsCount} código(s) rojo(s) requieren atención inmediata
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#fff',
              color: '#B71C1C',
              fontWeight: 700,
              '&:hover': {
                backgroundColor: '#f0f0f0'
              }
            }}
          >
            ATENDER AHORA
          </Button>
        </Alert>
      )}

      {/* Header */}
      <Paper
        sx={{
          backgroundImage: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
          color: '#fff',
          p: { xs: 2, sm: 3 },
          borderRadius: 0,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          mb: 3
        }}
      >
        <Stack spacing={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              🚨 Panel de Supervisión y Alertas
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Monitoreo de emergencias y eventos críticos en el hospital
            </Typography>
          </Box>

          {/* Stats */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              pt: 1,
              borderTop: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Alertas Activas
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: activeAlerts.length > 0 ? '#FF9800' : '#4CAF50'
                }}
              >
                {activeAlerts.length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Críticas
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#F44336'
                }}
              >
                {activeAlerts.filter(a => a.severity === SEVERITY_LEVELS.CRITICAL).length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Atendidas
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {acknowledgedAlerts.length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Total
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {alerts.length}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      <Container maxWidth="xl" sx={{ mb: 4 }}>
        {/* Active Alerts */}
        <Card sx={{ mb: 4 }}>
          <CardHeader
            title={`Alertas Activas (${activeAlerts.length})`}
            avatar={<WarningIcon sx={{ color: '#FF9800' }} />}
            sx={{
              backgroundColor: activeAlerts.length > 0 ? '#FFF3E0' : '#E8F5E9',
              borderBottom: '1px solid #E0E0E0'
            }}
          />
          {activeAlerts.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F7FA' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Severidad</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Paciente</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Mensaje Técnico</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeAlerts.map((alert) => (
                    <TableRow
                      key={alert.id}
                      sx={{
                        backgroundColor:
                          alert.severity === SEVERITY_LEVELS.CRITICAL ? 'rgba(244, 67, 54, 0.05)' : 'rgba(255, 152, 0, 0.05)',
                        borderLeft: `4px solid ${alert.severity === SEVERITY_LEVELS.CRITICAL ? '#F44336' : '#FF9800'}`,
                        '&:hover': {
                          backgroundColor:
                            alert.severity === SEVERITY_LEVELS.CRITICAL ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 152, 0, 0.1)'
                        },
                        animation: alert.severity === SEVERITY_LEVELS.CRITICAL ? 'pulse 2s infinite' : 'none'
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={alert.severity.toUpperCase()}
                          size="small"
                          icon={getSeverityIcon(alert.severity)}
                          color={alert.severity === SEVERITY_LEVELS.CRITICAL ? 'error' : 'warning'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {alert.patientName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {alert.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {getTimeSince(alert.timestamp)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Ver detalles">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(alert.id)}
                            >
                              <TrendingUp fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reconocer alerta">
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<CheckIcon />}
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              OK
                            </Button>
                          </Tooltip>
                          <Tooltip title="Contactar internación">
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<PhoneIcon />}
                              onClick={() => handleContactInternation(alert.patientId)}
                            >
                              Internación
                            </Button>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <CardContent>
              <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 3 }}>
                ✅ No hay alertas activas
              </Typography>
            </CardContent>
          )}
        </Card>

        {/* Acknowledged Alerts */}
        {acknowledgedAlerts.length > 0 && (
          <Card>
            <CardHeader
              title={`Alertas Atendidas (${acknowledgedAlerts.length})`}
              avatar={<CheckIcon sx={{ color: '#4CAF50' }} />}
              sx={{
                backgroundColor: '#E8F5E9',
                borderBottom: '1px solid #E0E0E0'
              }}
            />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F7FA' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Severidad</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Paciente</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Mensaje</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {acknowledgedAlerts.map((alert) => (
                    <TableRow
                      key={alert.id}
                      sx={{
                        opacity: 0.7,
                        textDecoration: 'line-through',
                        '&:hover': { backgroundColor: '#F9F9F9' }
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={alert.severity.toUpperCase()}
                          size="small"
                          icon={getSeverityIcon(alert.severity)}
                          color={alert.severity === SEVERITY_LEVELS.CRITICAL ? 'error' : 'warning'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {alert.patientName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{alert.message}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          {getTimeSince(alert.timestamp)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label="ATENDIDA"
                          size="small"
                          color="success"
                          icon={<CheckIcon />}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </Container>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles de Alerta</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedAlertId && (() => {
            const alert = alerts.find(a => a.id === selectedAlertId);
            return alert ? (
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                    PACIENTE
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {alert.patientName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                    SEVERIDAD
                  </Typography>
                  <Chip
                    label={alert.severity.toUpperCase()}
                    color={alert.severity === SEVERITY_LEVELS.CRITICAL ? 'error' : 'warning'}
                    icon={getSeverityIcon(alert.severity)}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                    MENSAJE TÉCNICO
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      backgroundColor: '#F5F5F5',
                      p: 1,
                      borderRadius: 1,
                      mt: 0.5,
                      wordBreak: 'break-word'
                    }}
                  >
                    {alert.message}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                    REGISTRADO
                  </Typography>
                  <Typography variant="body2">
                    {alert.timestamp.toLocaleString('es-ES')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                    ESTADO
                  </Typography>
                  <Chip
                    label={alert.status === 'active' ? 'ACTIVA' : 'ATENDIDA'}
                    color={alert.status === 'active' ? 'error' : 'success'}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Stack>
            ) : null;
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
