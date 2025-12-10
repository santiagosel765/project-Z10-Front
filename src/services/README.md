# 📦 Servicios HTTP - ZENIT

## 🎯 Propósito

Esta carpeta contiene todos los servicios que encapsulan las llamadas HTTP al backend. Cada servicio corresponde a un módulo o dominio específico de la aplicación.

## 📁 Estructura

```
services/
├── auth.service.ts         # Autenticación (login, refresh)
├── user.service.ts         # Gestión de usuarios (CRUD)
├── roles.service.ts        # Roles y permisos
├── geodata.service.ts      # Datos geoespaciales
└── README.md              # Este archivo
```

## ✨ Características

Todos los servicios:
- ✅ Usan el cliente Axios centralizado (`@/lib/api-client`)
- ✅ Retornan promesas con tipos TypeScript
- ✅ No manejan estados (eso es trabajo de los hooks)
- ✅ Son funciones puras y fáciles de testear
- ✅ Siguen convenciones de nomenclatura consistentes

## 📝 Convenciones

### Nomenclatura de Archivos
```
[modulo].service.ts
```

### Nomenclatura de Exports
```typescript
export const [modulo]Service = {
  // Métodos aquí
};
```

### Nomenclatura de Métodos
- `get[Recurso]` - Para GET requests individuales
- `list[Recursos]` o `get[Recursos]` - Para GET de listas
- `create[Recurso]` - Para POST
- `update[Recurso]` - Para PUT/PATCH
- `delete[Recurso]` - Para DELETE
- `upload[Recurso]` - Para multipart/form-data
- `download[Recurso]` - Para archivos

## 🎨 Template de Servicio

```typescript
/**
 * Servicio de [Módulo]
 * [Descripción del módulo]
 */
import api from '@/lib/api-client';
import type { [Tipos] } from '@/types';

// Tipos específicos del servicio
export interface Create[Recurso]DTO {
  campo1: string;
  campo2: number;
}

export interface [Recurso]Filters {
  filtro1?: string;
  filtro2?: number;
  page?: number;
  limit?: number;
}

/**
 * Servicio de [Módulo]
 */
export const [modulo]Service = {
  /**
   * Obtener todos los [recursos]
   */
  get[Recursos]: async (filters?: [Recurso]Filters) => {
    const response = await api.get<[Recurso][]>('/[endpoint]', { 
      params: filters 
    });
    return response.data;
  },

  /**
   * Obtener un [recurso] por ID
   */
  get[Recurso]ById: async (id: string) => {
    const response = await api.get<[Recurso]>(`/[endpoint]/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo [recurso]
   */
  create[Recurso]: async (data: Create[Recurso]DTO) => {
    const response = await api.post<[Recurso]>('/[endpoint]', data);
    return response.data;
  },

  /**
   * Actualizar un [recurso]
   */
  update[Recurso]: async (id: string, data: Partial<Create[Recurso]DTO>) => {
    const response = await api.put<[Recurso]>(`/[endpoint]/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar un [recurso]
   */
  delete[Recurso]: async (id: string) => {
    const response = await api.delete<void>(`/[endpoint]/${id}`);
    return response.data;
  },
};
```

## 💡 Ejemplos Reales

### Ejemplo 1: Servicio Simple
```typescript
// geomarketing.service.ts
import api from '@/lib/api-client';

export const geomarketingService = {
  getClientes: async () => {
    const response = await api.get('/geomarketing/clientes');
    return response.data;
  },
  
  getPoblacion: async () => {
    const response = await api.get('/geomarketing/poblacion');
    return response.data;
  },
};
```

### Ejemplo 2: Servicio con Filtros
```typescript
// solicitudes.service.ts
import api from '@/lib/api-client';

export interface SolicitudFilters {
  estado?: 'pendiente' | 'en_progreso' | 'completada';
  gerencia?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export const solicitudesService = {
  listar: async (filters?: SolicitudFilters) => {
    const response = await api.get('/solicitudes', { params: filters });
    return response.data;
  },
};
```

### Ejemplo 3: Servicio con Upload
```typescript
// reportes.service.ts
import api from '@/lib/api-client';

export const reportesService = {
  uploadArchivo: async (file: File, metadata: any) => {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await api.upload('/reportes/upload', formData);
    return response.data;
  },
  
  descargarReporte: async (id: string, formato: 'pdf' | 'excel') => {
    const response = await api.download(
      `/reportes/${id}/descargar?formato=${formato}`
    );
    return response.data;
  },
};
```

## 🔗 Integración con Hooks

Los servicios NO deben usarse directamente en componentes. Siempre crear hooks personalizados:

```typescript
// ❌ MAL - No hacer esto
function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    userService.getUsers().then(setData);
  }, []);
  
  return <div>{/* ... */}</div>;
}

// ✅ BIEN - Hacer esto
function MyComponent() {
  const { data } = useUsers();
  return <div>{/* ... */}</div>;
}
```

## 🧪 Testing

Los servicios son fáciles de testear porque son funciones puras:

```typescript
import { userService } from './user.service';
import api from '@/lib/api-client';

jest.mock('@/lib/api-client');

describe('userService', () => {
  it('should fetch users', async () => {
    const mockUsers = [{ id: '1', name: 'Test' }];
    api.get.mockResolvedValue({ data: { data: mockUsers } });
    
    const result = await userService.getUsers();
    
    expect(result.data).toEqual(mockUsers);
    expect(api.get).toHaveBeenCalledWith('/users', { params: undefined });
  });
});
```

## 📚 Mejores Prácticas

1. **Un servicio por módulo de negocio**
   - No mezclar dominios diferentes
   - Mantener cohesión alta

2. **Tipos TypeScript completos**
   - DTOs para requests
   - Interfaces para responses
   - Tipos para filtros

3. **Documentación clara**
   - JSDoc para cada método
   - Ejemplos de uso cuando sea necesario

4. **Manejo de errores**
   - Los errores se manejan en los interceptores
   - No hacer try/catch en servicios

5. **Configuración de requests**
   - Pasar config options cuando sea necesario
   - Timeouts específicos para operaciones pesadas

## 🚀 Crear un Nuevo Servicio

1. Crear archivo `[modulo].service.ts`
2. Definir tipos (DTOs, Filters, etc.)
3. Crear objeto de servicio con métodos
4. Exportar el servicio
5. Crear hooks correspondientes en `hooks/api/`
6. Documentar endpoints y uso

## 🔍 Debugging

Si un servicio falla:
1. Verificar que `NEXT_SERVICE_HOST` esté configurado
2. Revisar console logs (requests automáticos en desarrollo)
3. Usar React Query DevTools para ver el estado
4. Verificar que el endpoint en el backend exista
5. Verificar estructura de response del backend

## 📖 Referencias

- [Axios Docs](https://axios-http.com/)
- [Cliente API](../lib/api-client.ts)
- [Hooks Personalizados](../hooks/api/)
- [Documentación Completa](../../docs/http-architecture.md)
