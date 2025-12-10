/**
 * Servicio de Roles
 * Basado en RolesService del backend NestJS
 */
import api from '@/lib/api-client';

/**
 * Entidad Page del backend
 */
export interface Page {
  id: number;
  name: string;
  description?: string;
  url: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

/**
 * Usuario simplificado (para relaciones)
 */
export interface SimpleUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Usuario completo (para createdByUser/updatedByUser en respuestas)
 */
export interface FullUser {
  id: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  phone: string;
  email: string;
  profilePhotoUrl: string | null;
  password: string; // Encriptado
  isActive: boolean;
  birthdate: string | null;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
}

/**
 * Entidad Role del backend con páginas formateadas
 */
export interface Role {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  pages: Page[]; // Array de páginas asignadas
  createdAt: string;
  createdBy: number;
  createdByUser: FullUser; // Usuario completo que creó el rol
  updatedAt: string;
  updatedBy: number | null;
  updatedByUser: FullUser | null; // Usuario completo que actualizó (null si no ha sido actualizado)
}

/**
 * DTO para crear un rol (CreateRoleDto del backend)
 * Body: { name, description, pageIds }
 * isActive se asigna automáticamente como true
 * createdBy se obtiene del token JWT automáticamente
 */
export interface CreateRoleDTO {
  name: string;
  description?: string;
  pageIds?: number[];
}

/**
 * DTO para actualizar un rol (UpdateRoleDto del backend)
 * Todos los campos son opcionales
 */
export interface UpdateRoleDTO {
  name?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Filtros para búsqueda de roles
 */
export interface RoleFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

/**
 * Respuesta paginada de roles
 */
export interface PaginatedRolesResponse {
  data: Role[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Respuesta de roles por usuario
 */
export interface RolesByUserResponse {
  userId: number;
  userName: string;
  roles: Array<{
    id: number;
    name: string;
    description?: string;
  }>;
}

/**
 * Estadísticas de roles del backend
 */
export interface RoleStats {
  total: number;
  active: number;
  inactive: number;
  topRolesByUsers: Array<{
    id: number;
    name: string;
    userCount: number;
  }>;
  topRolesByPages: Array<{
    id: number;
    name: string;
    pageCount: number;
  }>;
}

/**
 * Respuesta al eliminar un rol
 */
export interface DeleteRoleResponse {
  message: string;
  id: number;
}

/**
 * Servicio de Roles
 */
export const rolesService = {
  /**
   * Obtener todos los roles con paginación y filtros
   */
  getRoles: async (filters?: RoleFilters) => {
    const response = await api.get<PaginatedRolesResponse>('/roles', {
      params: {
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        isActive: filters?.isActive,
        search: filters?.search,
      },
    });
    return response.data;
  },

  /**
   * Obtener un rol por ID
   */
  getRoleById: async (id: number) => {
    const response = await api.get<Role>(`/roles/${id}`);
    return response.data;
  },

  /**
   * Obtener roles de un usuario específico
   * GET /roles/user/:userId
   * 
   * Retorna: { userId, userName, roles: [{ id, name, description }] }
   */
  getRolesByUser: async (userId: number) => {
    const response = await api.get<RolesByUserResponse>(`/roles/user/${userId}`);
    return response.data;
  },

  /**
   * Obtener estadísticas de roles
   */
  getStats: async () => {
    const response = await api.get<RoleStats>('/roles/stats');
    return response.data;
  },

  /**
   * Crear un nuevo rol
   * POST /roles
   * 
   * Body: { name, description?, pageIds? }
   * El createdBy se obtiene automáticamente del JWT
   * 
   * Retorna: Role completo con createdByUser y pages asignadas
   */
  createRole: async (roleData: CreateRoleDTO) => {
    const response = await api.post<Role>('/roles', roleData);
    return response.data;
  },

  /**
   * Actualizar un rol
   */
  updateRole: async (id: number, roleData: UpdateRoleDTO) => {
    const response = await api.patch<Role>(`/roles/${id}`, roleData);
    return response.data;
  },

  /**
   * Asignar páginas a un rol
   * POST /roles/:id/pages?replace=true
   * 
   * Body: { pageIds: number[] }
   * Query: replace (default: true) - Si true, reemplaza todas las páginas
   * 
   * Retorna el rol completo con páginas actualizadas (Page[] completo)
   */
  assignPages: async (
    id: number,
    pageIds: number[],
    replace: boolean = true
  ) => {
    const response = await api.post<Role>(
      `/roles/${id}/pages`,
      { pageIds },
      {
        params: { replace },
      }
    );
    return response.data;
  },

  /**
   * Eliminar un rol (soft delete)
   * DELETE /roles/:id
   * 
   * Retorna: { message: string, id: number }
   */
  deleteRole: async (id: number) => {
    const response = await api.delete<DeleteRoleResponse>(`/roles/${id}`);
    return response.data;
  },
};
