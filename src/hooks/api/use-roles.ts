/**
 * Custom hooks para Roles con TanStack Query
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';
import {
  rolesService,
  type CreateRoleDTO,
  type UpdateRoleDTO,
  type RoleFilters,
} from '@/services/roles.service';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para obtener todos los roles con paginación y filtros
 */
export function useRoles(filters?: RoleFilters) {
  return useQuery({
    queryKey: queryKeys.roles.list(filters),
    queryFn: () => rolesService.getRoles(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para obtener un rol por ID
 */
export function useRole(id: number) {
  return useQuery({
    queryKey: queryKeys.roles.detail(id),
    queryFn: () => rolesService.getRoleById(id),
    enabled: !!id && id > 0,
  });
}

/**
 * Hook para obtener roles de un usuario específico
 */
export function useRolesByUser(userId: number) {
  return useQuery({
    queryKey: queryKeys.roles.byUser(userId),
    queryFn: () => rolesService.getRolesByUser(userId),
    enabled: !!userId && userId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener estadísticas de roles
 */
export function useRoleStats() {
  return useQuery({
    queryKey: queryKeys.roles.stats,
    queryFn: () => rolesService.getStats(),
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

/**
 * Hook para crear un rol
 */
export function useCreateRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (roleData: CreateRoleDTO) => rolesService.createRole(roleData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });

      toast({
        title: 'Rol creado',
        description: `El rol "${response.data.name}" ha sido creado exitosamente.`,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Error al crear el rol';

      toast({
        title: 'Error al crear rol',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para actualizar un rol
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateRoleDTO;
    }) => rolesService.updateRole(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.detail(variables.id),
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });

      toast({
        title: 'Rol actualizado',
        description: `El rol "${response.data.name}" ha sido actualizado exitosamente.`,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Error al actualizar el rol';

      toast({
        title: 'Error al actualizar rol',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para asignar páginas a un rol
 */
export function useAssignPages() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      roleId,
      pageIds,
      replace = true,
    }: {
      roleId: number;
      pageIds: number[];
      replace?: boolean;
    }) => rolesService.assignPages(roleId, pageIds, replace),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.detail(variables.roleId),
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });

      toast({
        title: 'Páginas asignadas',
        description: `Las páginas han sido asignadas al rol "${response.data.name}" exitosamente.`,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Error al asignar páginas';

      toast({
        title: 'Error al asignar páginas',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para eliminar un rol (soft delete)
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => rolesService.deleteRole(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });

      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.detail(deletedId),
      });

      toast({
        title: 'Rol eliminado',
        description: 'El rol ha sido desactivado exitosamente.',
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Error al eliminar el rol';

      toast({
        title: 'Error al eliminar rol',
        description: message,
        variant: 'destructive',
      });
    },
  });
}
