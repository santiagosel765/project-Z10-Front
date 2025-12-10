/**
 * Servicio de Pages (Páginas del sistema)
 * Basado en PagesController del backend NestJS
 */
import api from '@/lib/api-client';

/**
 * Rol simplificado para páginas
 */
export interface PageRole {
  id: number;
  name: string;
  description: string | null;
  isActive?: boolean;
}

/**
 * Usuario completo (para createdByUser en respuestas)
 */
export interface PageUser {
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
 * Página básica (para listas GET /pages)
 */
export interface Page {
  id: number;
  name: string;
  description: string | null;
  url: string;
  icon: string | null;
  order: number;
  isActive: boolean;
  roles: PageRole[];
  createdAt: string;
  createdBy: number;
  createdByUser: PageUser; // Usuario completo que creó la página
  updatedAt: string;
  updatedBy: number | null; // Puede ser null si no ha sido actualizado
}

/**
 * Página con detalles completos (GET /pages/:id)
 * Incluye updatedByUser completo
 */
export interface PageDetail {
  id: number;
  name: string;
  description: string | null;
  url: string;
  icon: string | null;
  order: number;
  isActive: boolean;
  roles: PageRole[]; // Incluye isActive en cada rol
  createdAt: string;
  createdBy: number;
  createdByUser: PageUser; // Usuario completo que creó
  updatedAt: string;
  updatedBy: number;
  updatedByUser: PageUser; // Usuario completo que actualizó
}

/**
 * DTO para crear una página
 */
export interface CreatePageDto {
  name: string;
  description?: string;
  url: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  roleIds?: number[]; // IDs de roles a asociar
}

/**
 * DTO para actualizar una página
 */
export interface UpdatePageDto {
  name?: string;
  description?: string;
  url?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  roleIds?: number[]; // Si se proporciona, reemplaza todos los roles
}

/**
 * Filtros para búsqueda de páginas
 */
export interface PageFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

/**
 * Respuesta paginada de páginas
 */
export interface PaginatedPagesResponse {
  data: Page[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Respuesta de páginas por rol
 */
export interface PagesByRoleResponse {
  roleId: number;
  roleName: string;
  pages: Array<{
    id: number;
    name: string;
    description: string | null;
    url: string;
    icon: string | null;
    order: number;
  }>;
}

/**
 * Estadísticas de páginas
 */
export interface PageStats {
  total: number;
  active: number;
  inactive: number;
  topPagesByRoles: Array<{
    id: number;
    name: string;
    roleCount: number;
  }>;
}

/**
 * DTO para reordenar páginas
 */
export interface ReorderPagesDto {
  pages: Array<{
    id: number;
    order: number;
  }>;
}

/**
 * Respuesta de eliminación
 */
export interface DeletePageResponse {
  message: string;
  id: number;
}

/**
 * Respuesta de reordenamiento
 */
export interface ReorderPagesResponse {
  message: string;
  updated: number;
}

/**
 * Servicio de Pages
 */
export const pagesService = {
  /**
   * Crear una nueva página con roles asociados
   * POST /pages
   * 
   * @param data - Datos de la página
   */
  createPage: async (data: CreatePageDto) => {
    const response = await api.post<PageDetail>('/pages', data);
    return response.data;
  },

  /**
   * Obtener todas las páginas con paginación y filtros
   * GET /pages?page=1&limit=10&isActive=true&search=...
   * 
   * Retorna lista paginada con roles asociados
   */
  getPages: async (filters?: PageFilters) => {
    const response = await api.get<PaginatedPagesResponse>('/pages', {
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
   * Obtener estadísticas de páginas
   * GET /pages/stats
   * 
   * Retorna: total, activas, inactivas, top páginas por roles
   */
  getPageStats: async () => {
    const response = await api.get<PageStats>('/pages/stats');
    return response.data;
  },

  /**
   * Obtener páginas asociadas a un rol
   * GET /pages/role/:roleId?isActive=true
   * 
   * @param roleId - ID del rol
   * @param isActive - Filtrar por páginas activas (default: true)
   */
  getPagesByRole: async (roleId: number, isActive: boolean = true) => {
    const response = await api.get<PagesByRoleResponse>(
      `/pages/role/${roleId}`,
      {
        params: { isActive },
      }
    );
    return response.data;
  },

  /**
   * Obtener una página por ID
   * GET /pages/:id
   * 
   * Retorna página con roles asociados y usuarios de auditoría
   */
  getPageById: async (id: number) => {
    const response = await api.get<PageDetail>(`/pages/${id}`);
    return response.data;
  },

  /**
   * Actualizar una página
   * PATCH /pages/:id
   * 
   * Si se proporciona roleIds, reemplaza todos los roles asociados
   * 
   * @param id - ID de la página
   * @param data - Datos a actualizar
   */
  updatePage: async (id: number, data: UpdatePageDto) => {
    const response = await api.patch<PageDetail>(`/pages/${id}`, data);
    return response.data;
  },

  /**
   * Reordenar múltiples páginas
   * PATCH /pages/reorder
   * 
   * Actualiza el orden de visualización de varias páginas
   * 
   * @param pages - Array de { id, order }
   */
  reorderPages: async (pages: Array<{ id: number; order: number }>) => {
    const response = await api.patch<ReorderPagesResponse>('/pages/reorder', {
      pages,
    });
    return response.data;
  },

  /**
   * Eliminar una página (soft delete)
   * DELETE /pages/:id
   * 
   * Cambia isActive a false, no elimina físicamente
   * 
   * @param id - ID de la página
   */
  deletePage: async (id: number) => {
    const response = await api.delete<DeletePageResponse>(`/pages/${id}`);
    return response.data;
  },
};
