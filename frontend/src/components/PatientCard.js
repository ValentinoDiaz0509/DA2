import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Stack,
  Button,
  Chip,
  Grid,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Favorite as HeartIcon,
  Air as LungIcon,
  Thermostat as TempIcon,
  Warning as WarningIcon,
  Done as DoneIcon
} from '@mui/icons-material';
import { STATUS_COLORS, PATIENT_STATUS } from '../data/constants';

const getVitalStatus = (value, min, max) => {
  if (value < min || value > max) {
    return 'error';
  }
  return 'success';
};

const getVitalColor = (status) => {
  return status === 'error' ? '#F44336' : '#4CAF50';
};

export const PatientCard = ({ patient, onSelect, isSelected }) => {
  if (!patient) return null;

  const statusConfig = STATUS_COLORS[patient.status];

  const VitalDisplay = ({ icon: Icon, label, value, unit, min, max }) => {
    const status = getVitalStatus(value, min, max);
    const color = getVitalColor(status);

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 1,
          borderRadius: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          transition: 'background-color 0.2s ease'
        }}
      >
        <Icon
          sx={{
            fontSize: '1.5rem',
            color: color,
            mb: 0.5
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: '#666',
            textAlign: 'center',
            lineHeight: 1.2
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 800,
            fontSize: '1.1rem',
            color: color
          }}
        >
          {value.toFixed(1)}<Typography component="span" sx={{ fontSize: '0.75rem' }}>{unit}</Typography>
        </Typography>
        <LinearProgress
          variant="determinate"
          value={Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))}
          sx={{
            width: '100%',
            mt: 0.5,
            height: 3,
            borderRadius: 2,
            backgroundColor: '#E0E0E0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color
            }
          }}
        />
      </Box>
    );
  };

  const criticalVitals = [
    patient.vitals.heartRate > 120 || patient.vitals.heartRate < 50,
    patient.vitals.spO2 < 90,
    patient.vitals.systolic > 160 || patient.vitals.systolic < 70,
    patient.vitals.temperature > 39 || patient.vitals.temperature < 36
  ];

  const hasCriticalVital = criticalVitals.some(v => v);

  return (
    <Card
      onClick={onSelect}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        border: `2px solid ${statusConfig.borderColor}`,
        backgroundColor: isSelected ? '#E3F2FD' : statusConfig.bgColor,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
          border: `2px solid ${statusConfig.borderColor}`
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: statusConfig.borderColor,
          animation: patient.status === PATIENT_STATUS.CRITICAL ? 'pulse 1.5s infinite' : 'none'
        }
      }}
    >
      {/* Indicador de alerta */}
      {hasCriticalVital && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            animation: 'pulse 1s infinite'
          }}
        >
          <WarningIcon sx={{ color: '#F44336', fontSize: '1.5rem' }} />
        </Box>
      )}

      <CardContent sx={{ flex: 1, pb: 1 }}>
        {/* Header del Paciente */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
          <Box flex={1}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: statusConfig.textColor,
                fontSize: '1rem',
                mb: 0.25
              }}
            >
              {patient.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#666',
                display: 'block',
                fontSize: '0.8rem'
              }}
            >
              Edad: {patient.age} años
            </Typography>
          </Box>
          <Chip
            label={`${patient.floor}-${patient.bed}`}
            size="small"
            sx={{
              backgroundColor: statusConfig.borderColor,
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.7rem'
            }}
          />
        </Stack>

        {/* Diagnóstico */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: '#555',
            fontStyle: 'italic',
            fontSize: '0.75rem',
            mb: 1,
            borderLeft: `2px solid ${statusConfig.borderColor}`,
            pl: 1
          }}
        >
          {patient.diagnosis}
        </Typography>

        {/* Estado Badge */}
        <Box sx={{ mb: 1.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip
            label={patient.status.toUpperCase()}
            size="small"
            icon={patient.status === PATIENT_STATUS.STABLE ? <DoneIcon /> : undefined}
            sx={{
              backgroundColor: statusConfig.borderColor,
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.7rem'
            }}
          />
          {patient.alertHistory && patient.alertHistory.length > 0 && (
            <Chip
              label={`${patient.alertHistory.length} alertas`}
              size="small"
              color="error"
              variant="outlined"
              sx={{
                fontSize: '0.7rem'
              }}
            />
          )}
        </Box>

        {/* Signos Vitales */}
        <Grid container spacing={0.5}>
          <Grid item xs={6}>
            <VitalDisplay
              icon={HeartIcon}
              label="Frecuencia Cardíaca"
              value={patient.vitals.heartRate}
              unit="bpm"
              min={patient.thresholds.heartRate.min}
              max={patient.thresholds.heartRate.max}
            />
          </Grid>
          <Grid item xs={6}>
            <VitalDisplay
              icon={LungIcon}
              label="Saturación O₂"
              value={patient.vitals.spO2}
              unit="%"
              min={patient.thresholds.spO2.min}
              max={patient.thresholds.spO2.max}
            />
          </Grid>
          <Grid item xs={6}>
            <VitalDisplay
              icon={TempIcon}
              label="Presión Sistólica"
              value={patient.vitals.systolic}
              unit="mmHg"
              min={patient.thresholds.systolic.min}
              max={patient.thresholds.systolic.max}
            />
          </Grid>
          <Grid item xs={6}>
            <VitalDisplay
              icon={TempIcon}
              label="Temperatura"
              value={patient.vitals.temperature}
              unit="°C"
              min={patient.thresholds.temperature.min}
              max={patient.thresholds.temperature.max}
            />
          </Grid>
        </Grid>
      </CardContent>

      <CardActions sx={{ pt: 0, display: 'flex', gap: 1 }}>
        <Button
          size="small"
          variant="contained"
          fullWidth
          onClick={onSelect}
          sx={{
            backgroundColor: statusConfig.borderColor,
            '&:hover': {
              backgroundColor: statusConfig.borderColor,
              opacity: 0.9
            }
          }}
        >
          Monitorear
        </Button>
      </CardActions>
    </Card>
  );
};
