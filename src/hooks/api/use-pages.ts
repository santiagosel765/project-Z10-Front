/**
 * Hooks de Pages para TanStack Query
 * Basado en PagesController del backend NestJS
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  pagesService,
  type CreatePageDto,
  type UpdatePageDto,
  type PageFilters,
} from '@/services/pages.service';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/react-query';

/**
 * Hook para obtener todas las páginas con filtros
 * GET /pages?page=1&limit=10&isActive=true&search=...
 * 
 * @example
 * ```tsx
 * const { data: pages, isLoading } = usePages({ 
 *   page: 1, 
 *   limit: 10, 
 *   isActive: true,
 *   search: 'dashboard' 
 * });
 * ```
 */
export const usePages = (filters?: PageFilters) => {
  return useQuery({
    queryKey: queryKeys.pages.list(filters),
    queryFn: () => pagesService.getPages(filters),
    staleTime: 0, // Datos siempre stale para refetch automático
    refetchOnMount: true, // Refetch al montar el componente
    refetchOnWindowFocus: true, // Refetch al enfocar la ventana
  });
};

/**
 * Hook para obtener una página por ID
 * GET /pages/:id
 * 
 * @example
 * ```tsx
 * const { data: page } = usePage(1);
 * ```
 */
export const usePage = (id: number) => {
  return useQuery({
    queryKey: queryKeys.pages.detail(id),
    queryFn: () => pagesService.getPageById(id),
    enabled: !!id && id > 0,
  });
};

/**
 * Hook para obtener estadísticas de páginas
 * GET /pages/stats
 * 
 * @example
 * ```tsx
 * const { data: stats } = usePageStats();
 * // stats: { total, active, inactive, topPagesByRoles }
 * ```
 */
export const usePageStats = () => {
  return useQuery({
    queryKey: queryKeys.pages.stats,
    queryFn: () => pagesService.getPageStats(),
  });
};

/**
 * Hook para obtener páginas de un rol específico
 * GET /pages/role/:roleId?isActive=true
 * 
 * @example
 * ```tsx
 * const { data: rolePages } = usePagesByRole(1, true);
 * ```
 */
export const usePagesByRole = (roleId: number, isActive: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.pages.byRole(roleId, isActive),
    queryFn: () => pagesService.getPagesByRole(roleId, isActive),
    enabled: !!roleId && roleId > 0,
  });
};

/**
 * Hook para crear una página
 * POST /pages
 * 
 * @example
 * ```tsx
 * const { mutate: createPage } = useCreatePage();
 * 
 * createPage({
 *   name: 'Dashboard',
 *   description: 'Página principal',
 *   url: '/zenit',
 *   icon: 'home',
 *   order: 1,
 *   roleIds: [1, 2],
 * });
 * ```
 */
export const useCreatePage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePageDto) => pagesService.createPage(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });

      toast({
        title: 'Página creada',
        description: `${response.data.name} se ha creado exitosamente.`,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Error al crear la página';

      toast({
        title: 'Error al crear página',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para actualizar una página
 * PATCH /pages/:id
 * 
 * @example
 * ```tsx
 * const { mutate: updatePage } = useUpdatePage();
 * 
 * updatePage({
 *   id: 1,
 *   data: { 
 *     name: 'Nuevo nombre',
 *     roleIds: [1, 2, 3] // Reemplaza todos los roles
 *   },
 * });
 * ```
 */
export const useUpdatePage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePageDto }) =>
      pagesService.updatePage(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pages.detail(variables.id),
      });

      toast({
        title: 'Página actualizada',
        description: `${response.data.name} se ha actualizado exitosamente.`,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Error al actualizar la página';

      toast({
        title: 'Error al actualizar página',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para reordenar páginas
 * PATCH /pages/reorder
 * 
 * @example
 * ```tsx
 * const { mutate: reorderPages } = useReorderPages();
 * 
 * reorderPages([
 *   { id: 1, order: 5 },
 *   { id: 2, order: 10 },
 *   { id: 3, order: 15 },
 * ]);
 * ```
 */
export const useReorderPages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pages: Array<{ id: number; order: number }>) =>
      pagesService.reorderPages(pages),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });

      toast({
        title: 'Páginas reordenadas',
        description: `Se actualizó el orden de ${response.data.updated} página(s).`,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Error al reordenar páginas';

      toast({
        title: 'Error al reordenar',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para eliminar una página (soft delete)
 * DELETE /pages/:id
 * 
 * @example
 * ```tsx
 * const { mutate: deletePage } = useDeletePage();
 * 
 * deletePage(1);
 * ```
 */
export const useDeletePage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pagesService.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });

      toast({
        title: 'Página eliminada',
        description: 'La página se ha desactivado exitosamente.',
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Error al eliminar la página';

      toast({
        title: 'Error al eliminar página',
        description: message,
        variant: 'destructive',
      });
    },
  });
};
