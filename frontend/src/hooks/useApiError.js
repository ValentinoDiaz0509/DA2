import { useCallback } from 'react';
import { useSnackbar } from 'notistack';

/**
 * Hook para manejar errores de API con notificaciones visuales
 * 
 * Usa notistack para mostrar alertas amistosas
 * Maneja casos específicos: 401, 404, 403, 500, timeouts, etc.
 * 
 * @returns {function} Función para pasar al catch de una Promise
 */
export const useApiError = () => {
  const { enqueueSnackbar } = useSnackbar();

  return useCallback((error) => {
    console.error('[API Error]', error);

    // Sin respuesta (error de red)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        enqueueSnackbar(
          'Tiempo de conexión agotado. Verificar servidor.',
          { variant: 'error', autoHideDuration: 5000 }
        );
      } else if (error.message === 'Network Error') {
        enqueueSnackbar(
          'Error de conexión. Verificar red.',
          { variant: 'error', autoHideDuration: 5000 }
        );
      } else {
        enqueueSnackbar(
          'Error de conexión con el servidor.',
          { variant: 'error', autoHideDuration: 5000 }
        );
      }
      return;
    }

    const { status, data } = error.response;

    // 401 Unauthorized - Token expirado
    if (status === 401) {
      enqueueSnackbar(
        'Sesión expirada. Inicie sesión nuevamente.',
        { variant: 'error', autoHideDuration: 5000 }
      );
      localStorage.removeItem('jwt_token');
      // Redirigir a login (el interceptor ya maneja esto)
      window.location.href = '/login';
      return;
    }

    // 403 Forbidden - Sin permisos
    if (status === 403) {
      enqueueSnackbar(
        'No tiene permisos para realizar esta acción.',
        { variant: 'error', autoHideDuration: 4000 }
      );
      return;
    }

    // 404 Not Found
    if (status === 404) {
      const message = data?.error || data?.message || 'Recurso no encontrado';
      enqueueSnackbar(message, {
        variant: 'warning',
        autoHideDuration: 4000
      });
      return;
    }

    // 500 Internal Server Error
    if (status === 500) {
      enqueueSnackbar(
        'Error del servidor. Reintentando en 30 segundos...',
        { variant: 'error', autoHideDuration: 6000 }
      );
      return;
    }

    // 400 Bad Request
    if (status === 400) {
      const message = data?.error || data?.message || 'Solicitud inválida';
      enqueueSnackbar(message, {
        variant: 'warning',
        autoHideDuration: 4000
      });
      return;
    }

    // Otros errores HTTP
    if (status >= 400) {
      const message = data?.error || data?.message || `Error ${status}`;
      enqueueSnackbar(message, {
        variant: 'warning',
        autoHideDuration: 4000
      });
      return;
    }

    // Fallback
    enqueueSnackbar(
      'Ocurrió un error inesperado. Intente nuevamente.',
      { variant: 'error', autoHideDuration: 4000 }
    );
  }, [enqueueSnackbar]);
};

export default useApiError;
