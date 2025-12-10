/**
 * Hook para obtener módulos dinámicos basados en páginas de la base de datos
 * Convierte las páginas activas en módulos con prefijo /zenit y filtra por roles
 */
import { useMemo } from 'react';
import { usePages } from './api/use-pages';
import type { Module, UserRole } from '@/types';
import { mapIconStringToLucide } from '@/lib/utils';
import { mapPageRoleToUserRole, MODULES } from '@/lib/constants';
import type { Page } from '@/services/pages.service';

/**
 * Convierte una página de BD a un módulo de la aplicación
 * @param page - Página desde la base de datos
 * @returns Module con el formato requerido por la aplicación
 */
function pageToModule(page: Page): Module {
  // Convertir los roles de la página a UserRole[]
  const allowedRoles: UserRole[] = page.roles
    .filter(role => role.isActive !== false) // Solo roles activos
    .map(role => mapPageRoleToUserRole(role.name));

  // Asegurar que la URL tenga el prefijo /zenit
  const path = page.url.startsWith('/zenit') 
    ? page.url 
    : `/zenit${page.url.startsWith('/') ? '' : '/'}${page.url}`;

  return {
    id: page.id,
    name: page.name,
    description: page.description || undefined,
    path,
    icon: mapIconStringToLucide(page.icon),
    order: page.order,
    allowedRoles,
    isActive: page.isActive,
  };
}

export interface UseDynamicModulesOptions {
  /**
   * Si es true, retorna solo módulos estáticos de constants.ts
   * Si es false, retorna solo módulos dinámicos de BD
   * Si es undefined, mezcla ambos (dinámicos tienen prioridad)
   */
  staticOnly?: boolean;
  
  /**
   * Si es true, incluye solo páginas activas
   * @default true
   */
  activeOnly?: boolean;

  /**
   * Filtrar módulos por roles específicos del usuario
   */
  userRoles?: string[];
}

/**
 * Hook para obtener módulos dinámicos desde la base de datos
 * 
 * @example
 * ```tsx
 * const { modules, isLoading, error } = useDynamicModules({ 
 *   activeOnly: true,
 *   userRoles: user?.roles.map(r => r.name)
 * });
 * ```
 */
export function useDynamicModules(options: UseDynamicModulesOptions = {}) {
  const { staticOnly = false, activeOnly = true, userRoles } = options;

  // Obtener páginas de la BD (solo si no es staticOnly)
  const { 
    data: pagesResponse, 
    isLoading, 
    error 
  } = usePages({ 
    isActive: activeOnly,
    limit: 100, // Obtener todas las páginas
  });

  const modules = useMemo(() => {
    // Si solo queremos módulos estáticos, retornar MODULES directamente
    if (staticOnly) {
      return MODULES;
    }

    // Si no hay datos de BD aún o hay error, usar módulos estáticos como fallback
    if (!pagesResponse?.data || error) {
      return MODULES;
    }

    // Acceder a los datos dentro de la respuesta del API
    const pages = Array.isArray(pagesResponse.data.data) 
      ? pagesResponse.data.data 
      : [];

    // Convertir páginas de BD a módulos
    
    const dynamicModules = pages
      .filter((page: Page) => !activeOnly || page.isActive) // Filtrar por estado activo
      .map((page: Page) => pageToModule(page))
      .sort((a: Module, b: Module) => (a.order || 0) - (b.order || 0)); // Ordenar por campo order

    // Si tenemos roles de usuario, filtrar por acceso
    if (userRoles && userRoles.length > 0) {
      return dynamicModules.filter((module: Module) => 
        module.allowedRoles.some((role: UserRole) => 
          userRoles.some((userRole: string) => 
            mapPageRoleToUserRole(userRole) === role
          )
        )
      );
    }

    return dynamicModules;
  }, [pagesResponse, staticOnly, activeOnly, userRoles, error]);

  return {
    modules,
    isLoading,
    error,
    totalPages: pagesResponse?.data?.meta?.total || 0,
  };
}

/**
 * Hook simplificado que retorna solo los módulos
 * Útil para casos donde no necesitas el estado de carga
 * 
 * @example
 * ```tsx
 * const modules = useModules();
 * ```
 */
export function useModules(options: UseDynamicModulesOptions = {}): Module[] {
  const { modules } = useDynamicModules(options);
  return modules;
}
