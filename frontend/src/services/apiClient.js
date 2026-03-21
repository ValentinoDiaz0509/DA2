import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Interceptor: Añadir JWT token a todos los requests
 * 
 * Obtiene el token desde localStorage y lo incluye
 * en el header Authorization: Bearer <token>
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[apiClient] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor: Manejar respuestas y errores
 * 
 * - Si es 401: Token expirado → Logout y redirigir a login
 * - Otros errores: Pasar al error handler de llamadas específicas
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      console.warn('[apiClient] 401 Unauthorized - Token expired');
      localStorage.removeItem('jwt_token');
      // Redirigir a login (se maneja desde el hook useApiError)
    }
    return Promise.reject(error);
  }
);

export default apiClient;
