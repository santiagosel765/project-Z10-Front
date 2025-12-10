/**
 * EJEMPLO COMPLETO: Autenticación con TanStack Query
 * Basado en AuthController del backend NestJS
 * 
 * Backend endpoints disponibles:
 * - POST /auth/login
 * - POST /auth/refresh
 */

import { useLogin, useRefreshToken, useLogout } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

// ============================================================================
// EJEMPLO 1: Formulario de Login Básico
// ============================================================================

export function BasicLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, isPending, isError, error } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        disabled={isPending}
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        disabled={isPending}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Iniciando sesión...' : 'Entrar'}
      </Button>
      {isError && (
        <p className="text-red-500 text-sm">
          {error?.message || 'Error al iniciar sesión'}
        </p>
      )}
    </form>
  );
}

// ============================================================================
// EJEMPLO 2: Header con Logout
// ============================================================================

export function HeaderWithLogout() {
  const logout = useLogout();
  const [user, setUser] = useState<any>(null);

  // Cargar usuario desde localStorage
  useEffect(() => {
    const userData = localStorage.getItem('zenit-user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) return null;

  return (
    <header className="flex items-center justify-between p-4">
      <div>
        <h2 className="text-lg font-semibold">{user.name}</h2>
        <p className="text-sm text-muted-foreground">{user.role}</p>
      </div>
      <Button onClick={logout} variant="outline">
        Cerrar Sesión
      </Button>
    </header>
  );
}

// ============================================================================
// EJEMPLO 3: Refresh Automático en 401
// ============================================================================

/**
 * Hook personalizado que detecta errores 401 y refresca automáticamente
 * 
 * NOTA: Esto ya está implementado en el api-client.ts interceptor,
 * pero aquí muestro cómo hacerlo manualmente si lo necesitas
 */
export function useAutoRefresh() {
  const { mutate: refresh } = useRefreshToken();

  const handleApiError = (error: any) => {
    if (error?.statusCode === 401) {
      // Token expirado, intentar refresh
      refresh();
    }
  };

  return { handleApiError };
}

// Uso del hook:
export function ComponentWithAutoRefresh() {
  const { handleApiError } = useAutoRefresh();

  // En tu lógica de manejo de errores:
  const onError = (error: any) => {
    handleApiError(error);
  };

  return <div>Component content</div>;
}

// ============================================================================
// EJEMPLO 4: Protected Route Component
// ============================================================================

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay usuario en localStorage
    const userData = localStorage.getItem('zenit-user');
    setIsAuthenticated(!!userData);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    // Redirigir al login
    window.location.href = '/';
    return null;
  }

  return <>{children}</>;
}

// ============================================================================
// EJEMPLO 5: Login con Recordar Sesión
// ============================================================================

export function LoginWithRememberMe() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { mutate: login, isPending } = useLogin();

  // Cargar email guardado al montar
  useEffect(() => {
    const savedEmail = localStorage.getItem('zenit-remembered-email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Guardar o limpiar email según "recordar"
    if (rememberMe) {
      localStorage.setItem('zenit-remembered-email', email);
    } else {
      localStorage.removeItem('zenit-remembered-email');
    }

    login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        disabled={isPending}
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        disabled={isPending}
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <span>Recordar email</span>
      </label>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Iniciando sesión...' : 'Entrar'}
      </Button>
    </form>
  );
}

// ============================================================================
// EJEMPLO 6: Acceso a Usuario Actual desde cualquier componente
// ============================================================================

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('zenit-user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return user;
}

// Uso:
export function WelcomeMessage() {
  const user = useCurrentUser();

  if (!user) return null;

  return (
    <div>
      <h1>¡Bienvenido, {user.name}!</h1>
      <p>Rol: {user.role}</p>
    </div>
  );
}

// ============================================================================
// EJEMPLO 7: Manejo de Errores Detallado
// ============================================================================

export function LoginWithDetailedErrors() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, isPending, error, isError } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        disabled={isPending}
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        disabled={isPending}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Iniciando sesión...' : 'Entrar'}
      </Button>
      
      {/* Mostrar diferentes mensajes según el tipo de error */}
      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          {error?.statusCode === 401 && (
            <p className="text-red-600">Credenciales incorrectas</p>
          )}
          {error?.statusCode === 429 && (
            <p className="text-red-600">Demasiados intentos. Intenta más tarde.</p>
          )}
          {error?.statusCode === 500 && (
            <p className="text-red-600">Error del servidor. Intenta más tarde.</p>
          )}
          {error?.statusCode !== 401 && error?.statusCode !== 429 && error?.statusCode !== 500 && (
            <p className="text-red-600">{error?.message || 'Error desconocido'}</p>
          )}
        </div>
      )}
    </form>
  );
}

// ============================================================================
// NOTAS IMPORTANTES
// ============================================================================

/**
 * 1. TOKENS Y COOKIES
 * 
 * Los tokens (accessToken y refreshToken) se manejan automáticamente
 * mediante httpOnly cookies en el backend. NO necesitas:
 * - Guardarlos en localStorage
 * - Enviarlos manualmente en headers
 * - Leer las cookies desde JavaScript
 * 
 * El navegador los envía automáticamente en cada request.
 * 
 * 2. USUARIO EN LOCALSTORAGE
 * 
 * Solo guardamos el objeto User en localStorage para:
 * - Mostrar información del usuario en el UI
 * - Verificar si hay sesión activa
 * - No incluye tokens ni información sensible
 * 
 * 3. REFRESH AUTOMÁTICO
 * 
 * El api-client.ts ya tiene un interceptor que:
 * - Detecta errores 401 (Unauthorized)
 * - Intenta refrescar el token automáticamente
 * - Reintenta la petición original
 * - Si falla, redirige al login
 * 
 * 4. SEGURIDAD
 * 
 * - httpOnly cookies: Protegen contra XSS
 * - sameSite: lax: Protegen contra CSRF
 * - secure (en producción): Solo HTTPS
 * - __Host- prefix (en producción): Seguridad adicional
 * 
 * 5. BACKEND COMPATIBILITY
 * 
 * Este código está diseñado para trabajar con:
 * - NestJS AuthController
 * - JWT con refresh tokens
 * - Cookie-based authentication
 * - AuthGuard y RolesGuard decorators
 */
