
import { useMutation } from '@tanstack/react-query';
import { authService, type LoginUserDto } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

/**
 * Hook para login
 * 
 * POST /auth/login
 * 
 * Maneja:
 * - Autenticación del usuario
 * - Guardado automático de tokens en httpOnly cookies
 * - Almacenamiento del usuario en localStorage + AuthContext
 * - Redirección al dashboard
 * - Mensajes de error
 * 
 * @example
 * ```tsx
 * const { mutate: login, isPending } = useLogin();
 * 
 * const handleSubmit = (data: LoginUserDto) => {
 *   login(data);
 * };
 * ```
 */
export const useLogin = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { login: setAuthUser } = useAuth();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      const { user, accessToken } = response.data;
      
      // Mapear rol del backend (user, admin, superadmin)
      const roleName = user.roles[0]?.name;
      const userRole = (['user', 'admin', 'superadmin'].includes(roleName) 
        ? roleName 
        : undefined) as 'user' | 'admin' | 'superadmin' | undefined;
      
      const enrichedUser = {
        ...user,
        name: `${user.firstName} ${user.lastName}`,
        avatar: user.profilePhotoUrl || undefined,
        role: userRole,
        token: accessToken,
      };
      
      setAuthUser(enrichedUser);
      
      toast({
        title: '¡Bienvenido!',
        description: `Sesión iniciada como ${user.firstName} ${user.lastName}`,
      });

      router.push('/zenit');
    },
    onError: (error: any) => {
      toast({
        title: 'Error de autenticación',
        description: error?.message || 'Credenciales inválidas',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para refrescar tokens
 * 
 * POST /auth/refresh
 * 
 * Maneja:
 * - Renovación silenciosa de tokens
 * - Los tokens se actualizan automáticamente en httpOnly cookies
 * - No requiere intervención del usuario
 * 
 * @example
 * ```tsx
 * const { mutate: refresh } = useRefreshToken();
 * 
 * // Llamar cuando detectes un 401
 * useEffect(() => {
 *   if (error?.statusCode === 401) {
 *     refresh();
 *   }
 * }, [error]);
 * ```
 */
export const useRefreshToken = () => {
  const { toast } = useToast();
  const router = useRouter();

  return useMutation({
    mutationFn: authService.refresh,
    onSuccess: () => {
      console.log('Tokens refreshed successfully');
    },
    onError: (error: any) => {
      localStorage.removeItem('zenit-user');
      
      toast({
        title: 'Sesión expirada',
        description: 'Por favor, inicia sesión nuevamente',
        variant: 'destructive',
      });

      router.push('/');
    },
  });
};

/**
 * Hook para logout (client-side only)
 * 
 * Limpia el localStorage y redirige al login.
 * Los httpOnly cookies se limpiarán automáticamente al expirar
 * o cuando el backend implemente un endpoint /auth/logout
 * 
 * @example
 * ```tsx
 * const handleLogout = useLogout();
 * 
 * <Button onClick={handleLogout}>Cerrar sesión</Button>
 * ```
 */
export const useLogout = () => {
  const router = useRouter();
  const { toast } = useToast();

  return () => {
    localStorage.removeItem('zenit-user');
    
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión exitosamente',
    });

    router.push('/');
  };
};
