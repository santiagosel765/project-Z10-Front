/**
 * Custom hooks para Users con TanStack Query
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';
import { userService, type CreateUserDTO, type UpdateUserDTO } from '@/services/user.service';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para obtener todos los usuarios
 * GET /users
 * Retorna: ApiResponse<User[]> con estructura { data: User[] }
 */
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const response = await userService.getUsers();
      return response; // response ya es { data: User[] } gracias a api-client
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para obtener un usuario por ID
 * GET /users/:id
 */
export function useUser(id: number) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id && id > 0,
  });
}

/**
 * Hook para crear un usuario (solo SuperAdmin)
 * POST /users
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (userData: CreateUserDTO) => userService.createUser(userData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      
      toast({
        title: 'Usuario creado',
        description: `${response.data.firstName} ${response.data.lastName} ha sido creado exitosamente.`,
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al crear usuario';
      
      toast({
        title: 'Error al crear usuario',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para actualizar un usuario (solo SuperAdmin)
 * PATCH /users/:id
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDTO }) => 
      userService.updateUser(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.users.detail(variables.id) 
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      
      toast({
        title: 'Usuario actualizado',
        description: `${response.data.firstName} ${response.data.lastName} ha sido actualizado exitosamente.`,
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al actualizar usuario';
      
      toast({
        title: 'Error al actualizar usuario',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para deshabilitar un usuario (solo SuperAdmin)
 * PATCH /users/disable/:id
 */
export function useDisableUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updatedBy }: { id: number; updatedBy: number }) => 
      userService.disableUser(id, updatedBy),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      
      toast({
        title: 'Usuario deshabilitado',
        description: `${response.data.firstName} ${response.data.lastName} ha sido deshabilitado.`,
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al deshabilitar usuario';
      
      toast({
        title: 'Error al deshabilitar usuario',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para habilitar un usuario (solo SuperAdmin)
 * PATCH /users/enable/:id
 */
export function useEnableUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updatedBy }: { id: number; updatedBy: number }) => 
      userService.enableUser(id, updatedBy),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      
      toast({
        title: 'Usuario habilitado',
        description: `${response.data.firstName} ${response.data.lastName} ha sido habilitado.`,
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al habilitar usuario';
      
      toast({
        title: 'Error al habilitar usuario',
        description: message,
        variant: 'destructive',
      });
    },
  });
}
