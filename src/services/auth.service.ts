/**
 * Servicio de Autenticación
 * Basado en AuthController del backend NestJS
 */
import api from '@/lib/api-client';
import type { User } from '@/types';

/**
 * DTO para login (LoginUserDto del backend)
 */
export interface LoginUserDto {
  email: string;
  password: string;
}

/**
 * Respuesta de login del backend
 * El backend retorna: { accessToken, refreshToken, user }
 * NOTA: Aunque el backend retorna los tokens en el JSON,
 * también los guarda en httpOnly cookies
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * Respuesta de refresh
 * El backend retorna: { ok: true }
 */
export interface RefreshResponse {
  ok: boolean;
}

/**
 * Servicio de Auth
 * Endpoints disponibles en el backend:
 * - POST /auth/login
 * - POST /auth/refresh
 */
export const authService = {
  /**
   * Iniciar sesión
   * POST /auth/login
   * Los tokens (accessToken, refreshToken) se guardan automáticamente en httpOnly cookies
   */
  login: async (loginUserDto: LoginUserDto) => {
    const response = await api.post<AuthResponse>('/auth/login', loginUserDto);
    return response.data;
  },

  /**
   * Refrescar tokens
   * POST /auth/refresh
   * El refreshToken se envía automáticamente vía cookie httpOnly
   * El backend actualiza ambas cookies y retorna { ok: true }
   */
  refresh: async () => {
    const response = await api.post<RefreshResponse>('/auth/refresh');
    return response.data;
  },
};
