# Sistema Dinámico de Módulos - ZENIT GeoAI

## Descripción General

El sistema de módulos de ZENIT ahora es completamente dinámico, basado en las páginas almacenadas en la base de datos. Esto permite gestionar la navegación, permisos y estructura de la aplicación sin necesidad de modificar código.

## Arquitectura

### 1. Flujo de Datos

```
Base de Datos (Pages) 
    ↓
pagesService.getPages() 
    ↓
usePages() hook (TanStack Query)
    ↓
useDynamicModules() 
    ↓
Sidebar Component (Navegación)
```

### 2. Componentes Principales

#### `useDynamicModules` Hook
**Ubicación:** `src/hooks/use-dynamic-modules.ts`

Hook principal que convierte páginas de BD a módulos de la aplicación:

```tsx
const { modules, isLoading, error, totalPages } = useDynamicModules({
  activeOnly: true,        // Solo páginas activas
  userRoles: ['admin'],    // Filtrar por roles
  staticOnly: false,       // false = BD, true = constants.ts
});
```

**Características:**
- Convierte automáticamente `Page` a `Module`
- Agrega prefijo `/zenit` a todas las rutas
- Mapea íconos de string a componentes Lucide
- Filtra por roles del usuario
- Ordena por campo `order`
- Fallback a módulos estáticos si falla la carga

#### `mapIconStringToLucide` Utility
**Ubicación:** `src/lib/utils.ts`

Convierte nombres de íconos (strings) a componentes de Lucide React:

```tsx
import { mapIconStringToLucide } from '@/lib/utils';

const IconComponent = mapIconStringToLucide("home");
// Retorna: Home de lucide-react

const IconComponent = mapIconStringToLucide("users");
// Retorna: Users de lucide-react
```

**Soporta nombres en:**
- **PascalCase:** `"Home"`, `"Users"`, `"Database"`
- **lowercase:** `"home"`, `"users"`, `"database"`
- **kebab-case:** `"arrow-right"`, `"chevron-down"`

Si no encuentra el ícono, retorna `HelpCircle` por defecto.

#### `mapPageRoleToUserRole` Function
**Ubicación:** `src/lib/constants.ts`

Mapea roles de BD a roles del sistema:

```tsx
import { mapPageRoleToUserRole } from '@/lib/constants';

mapPageRoleToUserRole("SuperAdmin") // → 'superadmin'
mapPageRoleToUserRole("Admin")      // → 'admin'
mapPageRoleToUserRole("Usuario")    // → 'user'
```

### 3. Estructura de Datos

#### Interface `Page` (Base de Datos)
```typescript
interface Page {
  id: number;
  name: string;              // Nombre del módulo
  description: string | null;
  url: string;               // Ruta sin prefijo: "/geodata"
  icon: string | null;       // Nombre del ícono: "database"
  order: number;             // Orden de visualización
  isActive: boolean;         // Estado activo/inactivo
  roles: PageRole[];         // Roles con acceso
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number | null;
}
```

#### Interface `Module` (Aplicación)
```typescript
type Module = {
  id?: number;               // ID de página en BD
  name: string;              // Nombre visible
  description?: string;      // Descripción
  path: string;              // Ruta completa: "/zenit/geodata"
  icon: LucideIcon;          // Componente de ícono
  order?: number;            // Orden
  allowedRoles: UserRole[];  // ['user', 'admin', 'superadmin']
  isActive?: boolean;        // Estado
  submodules?: Module[];     // Submódulos anidados
};
```

## Uso en Componentes

### Sidebar (Ya Implementado)

```tsx
import { useDynamicModules } from "@/hooks/use-dynamic-modules";

export function Sidebar() {
  const { user } = useAuth();
  
  const { modules, isLoading } = useDynamicModules({
    activeOnly: true,
    userRoles: user?.roles?.map(r => r.name),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <nav>
      {modules.map(module => (
        <Link key={module.id} href={module.path}>
          <module.icon />
          {module.name}
        </Link>
      ))}
    </nav>
  );
}
```

### Hook Simplificado

Para casos donde no necesitas el estado de carga:

```tsx
import { useModules } from "@/hooks/use-dynamic-modules";

export function Navigation() {
  const modules = useModules({ activeOnly: true });
  
  return (
    <ul>
      {modules.map(m => <li key={m.id}>{m.name}</li>)}
    </ul>
  );
}
```

## Gestión de Páginas

### Crear Nueva Página

Desde el panel de administración (`/zenit/configuracion/pages`):

1. Clic en "Nueva Página"
2. Completar formulario:
   - **Nombre:** Nombre visible del módulo
   - **URL:** Ruta sin prefijo (ej: `/geodata`)
   - **Ícono:** Nombre del ícono (ej: `database`)
   - **Orden:** Número para ordenamiento (ej: `10`)
   - **Roles:** Seleccionar roles con acceso
   - **Estado:** Activo/Inactivo

3. El módulo aparecerá automáticamente en el sidebar

### Actualizar Página

Los cambios en BD se reflejan automáticamente gracias a TanStack Query:
- Caché se invalida al crear/actualizar/eliminar
- Refetch automático en background
- UI se actualiza reactivamente

### Desactivar Módulo

Cambiar `isActive` a `false` en la BD. El módulo desaparecerá del sidebar automáticamente.

## Control de Permisos

### Por Rol en Base de Datos

Cada página tiene asociados roles (`PageRole[]`):

```sql
-- Ejemplo: Solo SuperAdmin y Admin pueden ver GeoDB
INSERT INTO page_roles (pageId, roleId) 
VALUES 
  (1, 1),  -- SuperAdmin
  (1, 2);  -- Admin
```

### Por Rol en la Aplicación

El sidebar filtra módulos automáticamente:

```tsx
const availableModules = modules.filter(module =>
  user.roles.some(r => module.allowedRoles.includes(r.name))
);
```

### Rutas Protegidas

Además del sidebar, protege las rutas en el layout:

```tsx
// src/app/zenit/geodata/layout.tsx
import { useAuth } from "@/hooks/use-auth";
import { useDynamicModules } from "@/hooks/use-dynamic-modules";
import { redirect } from "next/navigation";

export default function GeodataLayout({ children }) {
  const { user } = useAuth();
  const { modules } = useDynamicModules({ 
    userRoles: user?.roles.map(r => r.name) 
  });

  const hasAccess = modules.some(m => m.path === "/zenit/geodata");
  
  if (!hasAccess) {
    redirect("/zenit");
  }

  return <>{children}</>;
}
```

## Íconos Disponibles

### Categorías Principales

| Categoría | Íconos |
|-----------|--------|
| **Navegación** | `home`, `menu`, `arrow-right`, `arrow-left`, `chevron-down`, `chevron-up` |
| **Usuarios** | `user`, `users`, `user-cog` |
| **GIS/Maps** | `map`, `globe`, `layers`, `target`, `waypoints` |
| **Datos** | `database`, `folder`, `file`, `chart`, `analytics` |
| **Acciones** | `edit`, `delete`, `add`, `search`, `download`, `upload` |
| **Estado** | `check`, `alert`, `warning`, `error`, `success`, `info` |
| **Seguridad** | `lock`, `unlock`, `shield`, `eye`, `eye-off` |

### Mapeo Personalizado

Para agregar más íconos, edita `src/lib/utils.ts`:

```typescript
const iconMappings: Record<string, string> = {
  "mi-icono-custom": "Star",  // Mapea a lucide-react/Star
  "tablero": "LayoutDashboard",
  // ...
};
```

## Migración desde Módulos Estáticos

### Antes (constants.ts)

```typescript
export const MODULES: Module[] = [
  { 
    name: "GeoDB", 
    path: "/zenit/geodata", 
    icon: Database, 
    allowedRoles: ["admin", "superadmin"] 
  },
];
```

### Después (Base de Datos)

1. Crear página en BD:
   ```json
   {
     "name": "GeoDB",
     "url": "/geodata",
     "icon": "database",
     "order": 10,
     "roleIds": [1, 2]
   }
   ```

2. El sistema automáticamente:
   - Agrega prefijo `/zenit`
   - Convierte `"database"` → `Database` component
   - Mapea `roleIds` a `allowedRoles`

## Fallback y Manejo de Errores

### Si falla la API de páginas:

```typescript
// useDynamicModules automáticamente usa MODULES de constants.ts
const { modules } = useDynamicModules();
// Si API falla → modules = MODULES (estáticos)
```

### Modo estático forzado:

```typescript
const { modules } = useDynamicModules({ staticOnly: true });
// Siempre usa constants.ts, ignora BD
```

## Debugging

### Ver módulos cargados:

```tsx
const { modules, isLoading, error } = useDynamicModules();

console.log("Módulos:", modules);
console.log("Cargando:", isLoading);
console.log("Error:", error);
```

### Verificar íconos:

```tsx
import { mapIconStringToLucide } from '@/lib/utils';

const TestIcons = () => {
  const icons = ["home", "users", "database", "map"];
  
  return icons.map(name => {
    const Icon = mapIconStringToLucide(name);
    return <Icon key={name} />;
  });
};
```

## Mejores Prácticas

### 1. Nombres de Íconos
- Usa nombres en **lowercase** en BD: `"home"`, `"users"`
- Evita espacios: `"arrow right"` ❌ → `"arrow-right"` ✅

### 2. URLs de Páginas
- Sin prefijo `/zenit`: ✅ `"/geodata"`
- Con prefijo: ❌ `"/zenit/geodata"`
- Siempre con `/` inicial: ✅ `"/geodata"`

### 3. Orden de Módulos
- Usa múltiplos de 10: `10, 20, 30...`
- Permite insertar entre ellos: `15, 25...`

### 4. Roles
- Asigna al menos un rol a cada página
- Páginas sin roles → No visibles para nadie

### 5. Estado Activo
- Páginas inactivas no aparecen en navegación
- Usa para ocultar temporalmente sin eliminar

## Soporte para Submódulos

Actualmente, los submódulos se definen estáticamente en `constants.ts`. Para hacerlos dinámicos:

### Opción 1: Campo parent_id en BD

```sql
ALTER TABLE pages ADD COLUMN parent_id INT NULL;
```

Luego actualizar `pageToModule` para construir jerarquía.

### Opción 2: Campo JSON en BD

```sql
ALTER TABLE pages ADD COLUMN submodules JSON NULL;
```

Almacenar submódulos como array JSON en la página padre.

## Troubleshooting

### Módulo no aparece en sidebar

1. ✅ Verificar `isActive = true` en BD
2. ✅ Verificar que tiene roles asignados
3. ✅ Verificar que el usuario tiene ese rol
4. ✅ Verificar que la URL es correcta

### Ícono no se muestra

1. ✅ Verificar nombre del ícono en BD
2. ✅ Revisar `iconMappings` en `utils.ts`
3. ✅ Verificar que el ícono existe en `lucide-react`
4. ✅ Si falla, aparecerá `HelpCircle` por defecto

### Cambios no se reflejan

1. ✅ Refrescar página (TanStack Query cachea)
2. ✅ Verificar invalidación de caché tras mutación
3. ✅ Revisar console para errores de API

## Ejemplo Completo: Agregar Nuevo Módulo

```bash
# 1. Crear página en BD (via API o panel admin)
POST /api/pages
{
  "name": "Análisis Climático",
  "description": "Módulo de análisis de riesgo climático",
  "url": "/clima",
  "icon": "cloud",
  "order": 50,
  "isActive": true,
  "roleIds": [1, 2, 3]  // SuperAdmin, Admin, User
}

# 2. Crear ruta en Next.js
mkdir -p src/app/zenit/clima
touch src/app/zenit/clima/page.tsx

# 3. El módulo aparecerá automáticamente en el sidebar
# No se requiere modificar constants.ts ni otros archivos
```

## Referencias

- **Servicio:** `src/services/pages.service.ts`
- **Hook de páginas:** `src/hooks/api/use-pages.ts`
- **Hook de módulos:** `src/hooks/use-dynamic-modules.ts`
- **Tipos:** `src/types/index.ts`
- **Utilidades:** `src/lib/utils.ts`
- **Constantes:** `src/lib/constants.ts`
- **Sidebar:** `src/components/layout/sidebar.tsx`
