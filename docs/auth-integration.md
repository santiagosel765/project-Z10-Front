# ✅ Resumen: Auth Service & Hooks

## 📦 Archivos Creados/Actualizados

### 1. `/src/services/auth.service.ts` ✅
**Actualizado** para coincidir con `AuthController` del backend NestJS

**Endpoints implementados:**
- ✅ `POST /auth/login` - Autenticación con email/password
- ✅ `POST /auth/refresh` - Renovación de tokens

**Características:**
- Manejo de tokens vía httpOnly cookies (automático)
- DTOs coinciden con backend: `LoginUserDto`
- Response types: `AuthResponse`, `RefreshResponse`
- Sin endpoints ficticios (register, forgot-password, etc.)

### 2. `/src/hooks/api/use-auth.ts` ✅
**Creado** con hooks de TanStack Query para auth

**Hooks implementados:**
- ✅ `useLogin()` - Login con auto-redirección y toast
- ✅ `useRefreshToken()` - Refresh silencioso con manejo de errores
- ✅ `useLogout()` - Logout client-side con limpieza de localStorage

**Características:**
- Integración completa con TanStack Query
- Toast notifications automáticas
- Redirección post-login al dashboard
- Guardado de usuario en localStorage (solo datos del user, no tokens)
- Manejo de errores 401 en refresh

### 3. `/src/components/auth/login-form.tsx` ✅
**Actualizado** para usar los nuevos hooks

**Cambios:**
- ❌ Removido: Select de roles (simulación)
- ✅ Agregado: Input de email/password real
- ✅ Usa `useLogin()` hook
- ✅ Estados de carga (`isPending`)
- ✅ Validación de campos
- ✅ Deshabilitación de inputs durante loading

### 4. `/src/types/index.ts` ✅
**Actualizado** tipo User

**Cambios:**
- ✅ `id: string` → `id: number` (coincide con backend)

### 5. `/src/hooks/api/index.ts` ✅
**Actualizado** barrel exports

**Cambios:**
- ✅ Agregado: `export * from './use-auth'`

### 6. `/docs/auth-example.tsx` ✅
**Creado** con 7 ejemplos completos de uso

**Ejemplos incluidos:**
1. Formulario de Login Básico
2. Header con Logout
3. Refresh Automático en 401
4. Protected Route Component
5. Login con Recordar Sesión
6. Hook para Usuario Actual
7. Manejo de Errores Detallado

### 7. `/src/services/README.md` ✅
**Actualizado** lista de servicios

---

## 🔐 Arquitectura de Autenticación

### Backend (NestJS)
```typescript
@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    // Retorna: { accessToken, refreshToken, user }
    // Guarda tokens en httpOnly cookies
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    // Lee refreshToken de cookie
    // Retorna: { ok: true }
    // Actualiza ambas cookies
  }
}
```

### Frontend (Next.js + TanStack Query)
```typescript
// 1. Servicio (HTTP puro)
export const authService = {
  login: async (loginUserDto: LoginUserDto) => {
    const response = await api.post<AuthResponse>('/auth/login', loginUserDto);
    return response.data;
  },
  refresh: async () => {
    const response = await api.post<RefreshResponse>('/auth/refresh');
    return response.data;
  },
};

// 2. Hook (Estado + Cache + React)
export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      const { user } = response.data;
      localStorage.setItem('zenit-user', JSON.stringify(user));
      router.push('/dashboard');
    },
  });
};

// 3. Componente (UI)
export function LoginForm() {
  const { mutate: login, isPending } = useLogin();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🔄 Flujo de Autenticación

### 1. Login Exitoso
```
1. Usuario envía email/password
2. useLogin() → authService.login() → POST /auth/login
3. Backend valida credenciales
4. Backend retorna: { accessToken, refreshToken, user }
5. Backend guarda tokens en httpOnly cookies
6. Frontend guarda user en localStorage
7. Frontend muestra toast de bienvenida
8. Frontend redirige a /dashboard
```

### 2. Request Autenticado
```
1. Frontend hace GET /users (por ejemplo)
2. api-client interceptor agrega header: Authorization: Bearer {localStorage.user.token}
3. Browser envía automáticamente cookies httpOnly
4. Backend valida accessToken
5. Backend retorna data
```

### 3. Token Expirado (401)
```
1. Backend retorna 401 Unauthorized
2. api-client interceptor detecta 401
3. Frontend llama POST /auth/refresh
4. Browser envía refreshToken cookie
5. Backend valida refreshToken
6. Backend retorna nuevos tokens
7. Backend actualiza cookies
8. Frontend reintenta request original
9. Request exitoso
```

### 4. Refresh Fallido (sesión expirada)
```
1. POST /auth/refresh falla (refreshToken inválido/expirado)
2. useRefreshToken() onError
3. Frontend limpia localStorage
4. Frontend muestra toast "Sesión expirada"
5. Frontend redirige a /
```

---

## 🍪 Manejo de Cookies (Backend)

### Configuración de Cookies
```typescript
const accessCookieName = isProd ? '__Host-access' : 'access_token';
const refreshCookieName = isProd ? '__Host-refresh' : 'refresh_token';

const baseCookieOpts = {
  httpOnly: true,      // No accesible desde JavaScript (XSS protection)
  sameSite: 'lax',     // CSRF protection
  secure: isProd,      // Solo HTTPS en producción
  path: '/',
};

// Access Token: corta duración
res.cookie(accessCookieName, data.accessToken, {
  ...accessCookieOpts,
  maxAge: Number(envs.jwtAccessExpiration) * 1000,
});

// Refresh Token: larga duración
res.cookie(refreshCookieName, data.refreshToken, {
  ...refreshCookieOpts,
  maxAge: Number(envs.jwtRefreshExpiration) * 1000,
});
```

### Seguridad
- ✅ **httpOnly**: Previene robo de tokens vía XSS
- ✅ **sameSite: lax**: Previene CSRF attacks
- ✅ **secure (prod)**: Solo transmite por HTTPS
- ✅ **__Host- prefix (prod)**: Seguridad adicional de Chrome

---

## 💾 LocalStorage vs Cookies

### ❌ NO almacenar en localStorage:
- ❌ accessToken
- ❌ refreshToken
- ❌ Información sensible

### ✅ SÍ almacenar en localStorage:
- ✅ Datos del usuario (id, name, email, role)
- ✅ Preferencias de UI
- ✅ Estado de sesión (para verificar si está logueado)

### 🍪 Automático en cookies httpOnly:
- ✅ accessToken (manejado por backend)
- ✅ refreshToken (manejado por backend)
- ✅ Browser envía automáticamente en cada request

---

## 🧪 Testing

### Probar Login
```bash
# 1. Asegurar que el backend esté corriendo
# NEXT_SERVICE_HOST=http://localhost:3200/api/v1

# 2. Abrir la app en desarrollo
npm run dev

# 3. Intentar login con credenciales reales del backend
# Email: admin@ejemplo.com
# Password: 12345678

# 4. Verificar en DevTools:
# - Application > Local Storage > zenit-user (debe contener el user)
# - Application > Cookies > access_token y refresh_token (httpOnly)
# - Network > auth/login (debe retornar 200 con user data)
# - Console > "Tokens refreshed successfully" si hay refresh automático
```

### Probar Refresh
```bash
# 1. Login exitoso
# 2. Esperar que el accessToken expire (según backend config)
# 3. Hacer un request a cualquier endpoint protegido
# 4. Verificar en Network:
#    - Request original → 401
#    - POST /auth/refresh → 200
#    - Request original reintentado → 200
```

---

## 📝 Próximos Pasos

### ✅ Completado
1. ✅ Auth service con login y refresh
2. ✅ Hooks de TanStack Query
3. ✅ LoginForm actualizado
4. ✅ Tipos actualizados (User.id: number)
5. ✅ Documentación y ejemplos

### 🔄 Pendiente (opcional según backend)
1. Implementar endpoint `/auth/register` si el backend lo soporta
2. Implementar endpoint `/auth/logout` en el backend (limpiar cookies)
3. Implementar reset de contraseña si es requerido
4. Agregar validación de JWT en el frontend (opcional)
5. Agregar refresh automático antes de expiración (proactivo)

---

## 🎉 Resultado Final

**Auth completamente funcional con:**
- ✅ Login con email/password
- ✅ Tokens en httpOnly cookies (seguro)
- ✅ Refresh automático en 401
- ✅ Logout con limpieza
- ✅ Redirección automática
- ✅ Toast notifications
- ✅ Estados de carga
- ✅ Manejo de errores
- ✅ TypeScript completo
- ✅ Coincide 100% con backend NestJS

**Listo para usar en cualquier componente:**
```tsx
import { useLogin, useLogout } from '@/hooks/api';

function MyComponent() {
  const { mutate: login, isPending } = useLogin();
  const logout = useLogout();
  
  return (
    <div>
      <button onClick={() => login({ email, password })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```
