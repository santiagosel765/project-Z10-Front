/**
 * Servicio de Usuarios
 * Basado en UsersController del backend NestJS
 */
import api from '@/lib/api-client';

/**
 * Usuario simplificado (para relaciones createdBy/updatedBy)
 */
export interface SimpleUser {
  id: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  email: string;
}

/**
 * Rol simplificado
 */
export interface SimpleRole {
  id: number;
  name: string;
}

/**
 * Rol del usuario con fecha de asignación (para GET /users)
 */
export interface UserRole {
  role: SimpleRole;
  createdAt: string;
}

/**
 * Entidad User para lista (GET /users)
 */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  phone: string;
  email: string;
  profilePhotoUrl: string | null;
  isActive: boolean;
  birthdate: string | null;
  createdAt: string;
  createdBy: number;
  createdByUser: SimpleUser;
  updatedAt: string;
  updatedBy: number;
  updatedByUser: SimpleUser;
  userRoles: UserRole[];
}

/**
 * Respuesta de GET /users/:id (diferente estructura)
 */
export interface UserDetailResponse {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    employeeCode: string;
    phone: string;
    email: string;
    profilePhotoUrl: string | null;
    password: string; // Incluido en detalle (encriptado)
    isActive: boolean;
    birthdate: string | null;
    createdAt: string;
    createdBy: number;
    updatedAt: string;
    updatedBy: number;
  };
  roles: SimpleRole[]; // Array directo de roles
}

/**
 * DTO para crear un usuario (CreateUserDto del backend)
 */
export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  employeeCode: string;
  phone: string;
  email: string;
  password: string;
  roleId: number;
  createdBy: number;
  birthdate?: string;
}

/**
 * DTO para actualizar un usuario (UpdateUserDto del backend)
 */
export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  employeeCode?: string;
  phone?: string;
  email?: string;
  password?: string;
  birthdate?: string;
  profilePhotoUrl?: string;
  roleId?: number; // ID del rol (singular)
  updatedBy: number; // ID del usuario que actualiza
}

/**
 * Servicio de Usuarios
 */
export const userService = {
  /**
   * Obtener todos los usuarios
   * GET /users
   * Respuesta: { success, timestamp, path, method, data: User[], message }
   */
  getUsers: async () => {
    const response = await api.get<User[]>('/users');
    return response.data; // api-client ya maneja ApiResponse<T>, retorna { data: User[] }
  },

  /**
   * Obtener un usuario por ID
   * GET /users/:id
   * 
   * Retorna: { user: {...}, roles: [{ id, name }] }
   * Nota: Estructura diferente a GET /users (incluye password encriptado)
   */
  getUserById: async (id: number) => {
    const response = await api.get<UserDetailResponse>(`/users/${id}`);
    return response.data; // Ya extraído por api-client
  },

  /**
   * Crear un nuevo usuario (solo SuperAdmin)
   * POST /users
   */
  createUser: async (userData: CreateUserDTO) => {
    const response = await api.post<User>('/users', userData);
    return response.data; // Ya extraído por api-client
  },

  /**
   * Actualizar un usuario (solo SuperAdmin)
   * PATCH /users/:id
   */
  updateUser: async (id: number, userData: UpdateUserDTO) => {
    const response = await api.patch<User>(`/users/${id}`, userData);
    return response.data; // Ya extraído por api-client
  },

  /**
   * Deshabilitar un usuario (solo SuperAdmin)
   * PATCH /users/disable/:id
   * Body: { updatedBy: number }
   * 
   * Retorna el usuario actualizado con isActive: false
   */
  disableUser: async (id: number, updatedBy: number) => {
    const response = await api.patch<User>(`/users/disable/${id}`, { updatedBy });
    return response.data; // Ya extraído por api-client
  },

  /**
   * Habilitar un usuario (solo SuperAdmin)
   * PATCH /users/enable/:id
   * Body: { updatedBy: number }
   * 
   * Retorna el usuario actualizado con isActive: true
   */
  enableUser: async (id: number, updatedBy: number) => {
    const response = await api.patch<User>(`/users/enable/${id}`, { updatedBy });
    return response.data; // Ya extraído por api-client
  },
};
