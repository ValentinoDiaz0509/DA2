import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { theme, globalStyles } from './theme/theme';
import { HealthGridProvider } from './context/HealthGridContext';
import { Layout } from './components/Layout';
import { NursingDashboard } from './components/NursingDashboard';
import { PatientDetailView } from './components/PatientDetailView';
import { AlertsSupervisionPanel } from './components/AlertsSupervisionPanel';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  // Inyectar estilos globales
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleViewChange = (viewId) => {
    setCurrentView(viewId);
  };

  const handleSelectPatient = (patientId) => {
    setCurrentView('patient-detail');
  };

  const handleBackFromDetail = () => {
    setCurrentView('dashboard');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <NursingDashboard onSelectPatient={handleSelectPatient} />
        );
      case 'patient-detail':
        return (
          <PatientDetailView onBack={handleBackFromDetail} />
        );
      case 'alerts':
        return (
          <AlertsSupervisionPanel onContactInternation={() => {}} />
        );
      default:
        return (
          <NursingDashboard onSelectPatient={handleSelectPatient} />
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <HealthGridProvider>
          <Layout
            currentView={currentView}
            onViewChange={handleViewChange}
          >
            {renderView()}
          </Layout>
        </HealthGridProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
