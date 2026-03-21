import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  IconButton,
  Badge,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Alert as AlertIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useHealthGrid } from '../context/HealthGridContext';
import { HOSPITAL_NAME, SYSTEM_NAME } from '../data/constants';

const DRAWER_WIDTH = 280;

export const Layout = ({ children, currentView, onViewChange }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { criticalAlertsCount, emergencyActive } = useHealthGrid();

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Enfermería',
      icon: DashboardIcon,
      description: 'Vista principal de pacientes'
    },
    {
      id: 'alerts',
      label: 'Panel de Alertas',
      icon: AlertIcon,
      description: 'Supervisión de emergencias'
    },
    {
      id: 'patient-detail',
      label: 'Monitoreo Crítico',
      icon: PersonIcon,
      description: 'Detalle de paciente seleccionado'
    }
  ];

  const Header = () => (
    <AppBar
      position="static"
      sx={{
        background: emergencyActive
          ? 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)'
          : 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
        boxShadow: emergencyActive ? '0 4px 20px rgba(211, 47, 47, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Toolbar
        sx={{
          padding: { xs: '8px 16px', sm: '12px 24px' },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}
      >
        {/* Menu y Logo */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={toggleDrawer(true)}
            sx={{ display: { xs: 'flex', sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Avatar
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              width: 40,
              height: 40,
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            HG
          </Avatar>

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#fff',
                margin: 0,
                lineHeight: 1.2,
                fontSize: { xs: '0.95rem', sm: '1.15rem' }
              }}
            >
              Health Grid
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                display: 'block',
                fontSize: '0.7rem'
              }}
            >
              {HOSPITAL_NAME}
            </Typography>
          </Box>
        </Stack>

        {/* Alertas y Usuario */}
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Badge de Alertas */}
          <Tooltip title={`${criticalAlertsCount} Códigos Rojos activos`}>
            <IconButton
              color="inherit"
              onClick={() => onViewChange('alerts')}
              sx={{
                position: 'relative',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <Badge
                badgeContent={criticalAlertsCount}
                color="warning"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#FFD54F',
                    color: '#000',
                    fontWeight: 700,
                    animation: criticalAlertsCount > 0 ? 'pulse 2s infinite' : 'none'
                  }
                }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Indicador de Emergencia */}
          {emergencyActive && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 2,
                animation: 'pulse 1.5s infinite'
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#FFD54F',
                  animation: 'pulse 1s infinite'
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}
              >
                EMERGENCIA
              </Typography>
            </Box>
          )}

          {/* Botón de Usuario */}
          <Tooltip title="Configuración de usuario">
            <IconButton
              color="inherit"
              size="small"
              sx={{ p: 0 }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  fontSize: '0.9rem',
                  fontWeight: 700
                }}
              >
                EP
              </Avatar>
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );

  const Sidebar = () => (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        display: { xs: 'none', sm: 'block' },
        height: 'calc(100vh - 72px)',
        overflowY: 'auto',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E0E0E0',
        position: 'relative',
        '&::-webkit-scrollbar': {
          width: '6px'
        },
        '&::-webkit-scrollbar-track': {
          background: '#F5F7FA'
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#B0BEC5',
          borderRadius: '3px',
          '&:hover': {
            background: '#78909C'
          }
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: '#1A237E',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '1px',
            mb: 1.5
          }}
        >
          Navegación
        </Typography>
        <List sx={{ p: 0 }}>
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentView === item.id;

            return (
              <ListItem
                button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  px: 1.5,
                  py: 1,
                  backgroundColor: isActive ? '#E3F2FD' : 'transparent',
                  borderLeft: isActive ? '3px solid #1565C0' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: isActive ? '#E3F2FD' : '#F5F7FA'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? '#1565C0' : '#757575'
                  }}
                >
                  <IconComponent />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.description}
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: isActive ? 700 : 600,
                      fontSize: '0.95rem',
                      color: isActive ? '#1565C0' : '#1A237E'
                    }
                  }}
                  secondaryTypographyProps={{
                    sx: {
                      fontSize: '0.75rem',
                      color: '#999'
                    }
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Quick Actions */}
      <Box sx={{ p: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: '#1A237E',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '1px',
            mb: 1.5
          }}
        >
          Configuración
        </Typography>
        <Button
          fullWidth
          startIcon={<SettingsIcon />}
          variant="outlined"
          size="small"
          sx={{ mb: 1 }}
        >
          Preferencias
        </Button>
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          variant="outlined"
          size="small"
          color="error"
        >
          Cerrar sesión
        </Button>
      </Box>
    </Box>
  );

  const DrawerContent = () => (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        p: 2
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Menú
        </Typography>
        <IconButton onClick={toggleDrawer(false)} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <List sx={{ p: 0 }}>
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentView === item.id;

          return (
            <ListItem
              button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                setDrawerOpen(false);
              }}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                backgroundColor: isActive ? '#E3F2FD' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive ? '#E3F2FD' : '#F5F7FA'
                }
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#1565C0' : '#757575' }}>
                <IconComponent />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  sx: {
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? '#1565C0' : '#1A237E'
                  }
                }}
              />
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 2 }} />

      <Button
        fullWidth
        startIcon={<LogoutIcon />}
        variant="outlined"
        color="error"
        size="small"
      >
        Cerrar sesión
      </Button>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#F5F7FA',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Header />

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar - Desktop */}
        <Sidebar />

        {/* Drawer - Mobile */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          PaperProps={{
            sx: {
              backgroundColor: '#FFFFFF',
              width: DRAWER_WIDTH
            }
          }}
        >
          <DrawerContent />
        </Drawer>

        {/* Content Area */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            '&::-webkit-scrollbar': {
              width: '8px'
            },
            '&::-webkit-scrollbar-track': {
              background: '#F5F7FA'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#B0BEC5',
              borderRadius: '4px',
              '&:hover': {
                background: '#78909C'
              }
            }
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};
