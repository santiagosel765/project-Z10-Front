/**
 * Cliente HTTP centralizado con Axios
 * Configuración base para todas las peticiones al backend
 */
import axios, { 
  AxiosError, 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse,
  InternalAxiosRequestConfig 
} from 'axios';

// Tipos para las respuestas estándar del API
export interface ApiResponse<T = any> {
  success: boolean;
  timestamp: string;
  path: string;
  method: string;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  error: string;
  message: string;
}

// Configuración base del cliente
const API_BASE_URL = process.env.NEXT_SERVICE_HOST || 'http://localhost:3200/api/v1';
const API_TIMEOUT = 1200000; // 20 minutos (para permitir carga de layers pesadas con muchos features)
const API_UPLOAD_TIMEOUT = 1800000; // 30 minutos para uploads muy grandes (>50MB)

/**
 * Instancia principal de Axios
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true, // CRÍTICO: Envía cookies httpOnly automáticamente
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Interceptor de Request
 * Agrega el token de autenticación si está disponible
 * 
 * ESTRATEGIA HÍBRIDA:
 * 1. Envía cookies httpOnly automáticamente (withCredentials: true)
 * 2. También envía Authorization header como respaldo (por si CORS bloquea cookies)
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('zenit-user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
          }
        } catch (error) {
          console.error('Error parsing user token:', error);
        }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      // console.log(`🔵 [API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      //   params: config.params,
      //   data: config.data,
      //   withCredentials: config.withCredentials,
      //   hasAuthHeader: !!config.headers.Authorization,
      // });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ [API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Response
 * Maneja respuestas exitosas y errores de forma centralizada
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      // console.log(`🟢 [API Response] ${response.config.url}`, response.data);
    }

    return response;
  },
  (error: AxiosError<ApiError>) => {
    console.error('❌ [API Error]', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      path: error.response?.data?.path,
      method: error.response?.data?.method,
    });

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          console.error('🔐 No autorizado:', data?.message || 'Token inválido o expirado');
          console.error('🔐 URL que falló:', error.config?.url);
          console.error('🔐 Cookies enviadas:', error.config?.withCredentials);
          if (data?.message?.toLowerCase().includes('token') || 
              data?.message?.toLowerCase().includes('unauthorized') ||
              data?.message?.toLowerCase().includes('expirado')) {
            if (typeof window !== 'undefined') {
              console.warn('⚠️ Cerrando sesión debido a token inválido');
              localStorage.removeItem('zenit-user');
              window.location.href = '/';
            }
          }
          break;
        
        case 403:
          console.warn('⚠️ Acceso denegado:', data?.message || 'Permisos insuficientes');
          break;
        
        case 404:
          console.warn('⚠️ Recurso no encontrado:', data?.message || error.config?.url);
          break;
        
        case 422:
          console.warn('⚠️ Errores de validación:', data?.message || 'Error de validación');
          break;
        
        case 500:
          console.error('💥 Error del servidor:', data?.message || 'Error interno del servidor');
          break;
        
        default:
          console.error('❌ Error:', status, data?.message || 'Error desconocido');
      }
    } else if (error.request) {
      console.error('🔌 Sin conexión al servidor. Verifica tu conexión a internet.');
    } else {
      console.error('⚙️ Error al configurar la petición:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Métodos helper para requests comunes
 */
export const api = {
  /**
   * GET request
   */
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.get<ApiResponse<T>>(url, config);
  },

  /**
   * POST request
   */
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.post<ApiResponse<T>>(url, data, config);
  },

  /**
   * PUT request
   */
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.put<ApiResponse<T>>(url, data, config);
  },

  /**
   * PATCH request
   */
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.patch<ApiResponse<T>>(url, data, config);
  },

  /**
   * DELETE request
   */
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.delete<ApiResponse<T>>(url, config);
  },

  /**
   * Upload de archivos (multipart/form-data)
   * Para archivos grandes (>50MB), usa timeout extendido de 30 minutos
   */
  upload: <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.post<ApiResponse<T>>(url, formData, {
      ...config,
      timeout: API_UPLOAD_TIMEOUT, // 30 minutos para uploads grandes
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
  },

  /**
   * Download de archivos
   */
  download: (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<Blob>> => {
    return apiClient.get(url, {
      ...config,
      responseType: 'blob',
    });
  },
};

// Export del cliente raw para casos especiales
export { apiClient };

export default api;
