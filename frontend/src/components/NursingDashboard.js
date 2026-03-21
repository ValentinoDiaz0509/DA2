import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Divider,
  Chip,
  Button,
  InputLabel
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useHealthGrid } from '../context/HealthGridContext';
import { PatientCard } from './PatientCard';
import { FILTER_OPTIONS, PATIENT_STATUS } from '../data/constants';

export const NursingDashboard = ({ onSelectPatient }) => {
  const {
    patients,
    filterFloor,
    filterStatus,
    setFilterFloor,
    setFilterStatus,
    getFilteredPatients,
    setSelectedPatientId
  } = useHealthGrid();

  const filteredPatients = getFilteredPatients();

  const statusStats = {
    stable: patients.filter(p => p.status === PATIENT_STATUS.STABLE).length,
    warning: patients.filter(p => p.status === PATIENT_STATUS.WARNING).length,
    critical: patients.filter(p => p.status === PATIENT_STATUS.CRITICAL).length
  };

  const handlePatientClick = (patientId) => {
    setSelectedPatientId(patientId);
    onSelectPatient(patientId);
  };

  const handleRefresh = () => {
    // Simular refresh - en una aplicación real esto dispararía una recarga de datos
    window.location.reload();
  };

  const handleResetFilters = () => {
    setFilterFloor(null);
    setFilterStatus(null);
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
              📊 Dashboard de Enfermería
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Monitoreo en tiempo real de todos los pacientes en UCI
            </Typography>
          </Box>

          {/* Estadísticas rápidas */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              pt: 1,
              borderTop: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Estables
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#4CAF50'
                }}
              >
                {statusStats.stable}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                En Alerta
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#FF9800'
                }}
              >
                {statusStats.warning}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Críticos
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#F44336'
                }}
              >
                {statusStats.critical}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Total de Pacientes
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {patients.length}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      {/* Filters Panel */}
      <Container maxWidth="xl" sx={{ mb: 3 }}>
        <Paper
          sx={{
            p: { xs: 2, sm: 2.5 },
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <FilterIcon sx={{ color: '#1565C0', fontSize: '1.5rem' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A237E' }}>
                Filtrar Pacientes
              </Typography>
            </Box>

            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Piso</InputLabel>
                  <Select
                    value={filterFloor || ''}
                    onChange={(e) => setFilterFloor(e.target.value || null)}
                    label="Piso"
                  >
                    {FILTER_OPTIONS.FLOORS.map((floor) => (
                      <MenuItem key={floor.value || 'all'} value={floor.value || ''}>
                        {floor.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={filterStatus || ''}
                    onChange={(e) => setFilterStatus(e.target.value || null)}
                    label="Estado"
                  >
                    {FILTER_OPTIONS.STATUSES.map((status) => (
                      <MenuItem key={status.value || 'all'} value={status.value || ''}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  sx={{ flex: { xs: 1, md: 'auto' } }}
                >
                  Actualizar
                </Button>
                {(filterFloor !== null || filterStatus !== null) && (
                  <Button
                    variant="outlined"
                    onClick={handleResetFilters}
                    sx={{ flex: { xs: 1, md: 'auto' } }}
                  >
                    Limpiar Filtros
                  </Button>
                )}
              </Grid>
            </Grid>

            {/* Filtros activos */}
            {(filterFloor !== null || filterStatus !== null) && (
              <Box sx={{ pt: 1, borderTop: '1px solid #E0E0E0' }}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {filterFloor !== null && (
                    <Chip
                      label={`Piso: ${FILTER_OPTIONS.FLOORS.find(f => f.value === filterFloor)?.label}`}
                      onDelete={() => setFilterFloor(null)}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  )}
                  {filterStatus !== null && (
                    <Chip
                      label={`Estado: ${FILTER_OPTIONS.STATUSES.find(s => s.value === filterStatus)?.label}`}
                      onDelete={() => setFilterStatus(null)}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Stack>
              </Box>
            )}

            <Divider />

            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
              Mostrando <strong>{filteredPatients.length}</strong> de <strong>{patients.length}</strong> pacientes
            </Typography>
          </Stack>
        </Paper>
      </Container>

      {/* Patient Grid */}
      <Container maxWidth="xl" sx={{ mb: 4 }}>
        {filteredPatients.length > 0 ? (
          <Grid container spacing={2}>
            {filteredPatients.map((patient) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={patient.id}>
                <PatientCard
                  patient={patient}
                  onSelect={() => handlePatientClick(patient.id)}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              backgroundColor: '#fff',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" sx={{ color: '#999', fontWeight: 600 }}>
              No se encontraron pacientes con los filtros seleccionados
            </Typography>
            <Button
              variant="text"
              onClick={handleResetFilters}
              sx={{ mt: 2 }}
            >
              Limpiar filtros
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
};
