# Módulo de Administración de Mapas

## Descripción
Módulo completo CRUD para la gestión de mapas base en la aplicación ZENIT. Permite crear, visualizar, editar y eliminar mapas con configuración completa de ArcGIS.

## Estructura de Archivos

### Componentes
- **`/components/maps/map-dialog.tsx`**: Diálogo genérico para crear y editar mapas
- **`/components/maps/map-details-dialog.tsx`**: Diálogo para visualizar detalles completos de un mapa

### Páginas
- **`/app/dashboard/configuracion/mapas/page.tsx`**: Página principal de administración de mapas

## Características

### 1. Listado de Mapas
- ✅ Vista en tabla con paginación
- ✅ Búsqueda por nombre, descripción o tipo
- ✅ Indicador visual de mapa por defecto (estrella dorada)
- ✅ Badges diferenciados por tipo de mapa
- ✅ Información de fecha de creación

### 2. Estadísticas
- ✅ Total de mapas en el sistema
- ✅ Contadores por tipo (General, Operaciones, Análisis)
- ✅ Cards visuales con iconos

### 3. Crear Mapa
Formulario completo con:
- **Campos básicos:**
  - Nombre (requerido, 3-200 caracteres)
  - Descripción (opcional)
  - Web Map Item ID (requerido, alfanumérico)
  - Tipo de mapa (General, Operaciones, Análisis)
  - Mapa por defecto (switch)

- **Configuración inicial:**
  - Nivel de zoom (1-20)
  - Coordenadas del centro (latitud/longitud)
  - ID del mapa base de ArcGIS

### 4. Editar Mapa
- ✅ Mismo formulario que crear, pre-llenado con datos actuales
- ✅ Actualización en tiempo real
- ✅ Validación de campos

### 5. Ver Detalles
- ✅ Información general completa
- ✅ Configuración del mapa (zoom, coordenadas, basemap)
- ✅ Listado de capas asociadas (si existen)
- ✅ Información de auditoría (fechas de creación y actualización)

### 6. Eliminar Mapa
- ✅ Confirmación mediante AlertDialog
- ✅ Protección: No se puede eliminar el mapa por defecto
- ✅ Mensajes de error descriptivos

## Hooks Utilizados

### `useMaps(filters)`
Obtiene lista paginada de mapas con filtros opcionales.

```tsx
const { data: mapsResponse, isLoading } = useMaps({ 
  page: 1, 
  limit: 10 
});
```

### `useMapStats()`
Obtiene estadísticas generales de mapas.

```tsx
const { data: statsResponse } = useMapStats();
```

### `useMap(id, includeLayers)`
Obtiene detalles de un mapa específico, opcionalmente con capas asociadas.

```tsx
const { data: mapResponse } = useMap(7, true);
```

### `useCreateMap()`
Crea un nuevo mapa.

```tsx
const { mutate: createMap, isPending } = useCreateMap();

createMap({
  name: "Mapa de Guatemala",
  webmapItemId: "abc123",
  mapType: "general",
  settings: {
    zoom: 8,
    center: [-90.2308, 15.7835],
    basemap: "streets-vector"
  }
});
```

### `useUpdateMap()`
Actualiza un mapa existente.

```tsx
const { mutate: updateMap } = useUpdateMap();

updateMap({
  id: 1,
  data: { name: "Nuevo nombre", isDefault: true }
});
```

### `useDeleteMap()`
Elimina un mapa (soft delete).

```tsx
const { mutate: deleteMap } = useDeleteMap();

deleteMap(1);
```

## Tipos de Datos

### MapType
```typescript
type MapType = 'general' | 'operations' | 'analytics';
```

### CreateMapDto
```typescript
interface CreateMapDto {
  name: string;
  description?: string;
  webmapItemId: string;
  mapType: MapType;
  isDefault?: boolean;
  settings?: MapSettings;
}
```

### MapSettings
```typescript
interface MapSettings {
  zoom: number;
  center: [number, number]; // [longitude, latitude]
  basemap: string;
}
```

### Map (Entidad)
```typescript
interface Map {
  id: number;
  name: string;
  description: string | null;
  webmapItemId: string;
  mapType: MapType;
  isDefault: boolean;
  settings: MapSettings;
  createdAt: string;
  updatedAt: string;
}
```

## Navegación

El módulo se agregó al menú principal en:
```
Administración → Mapas
```

Ruta: `/dashboard/configuracion/mapas`

## Validaciones

### Formulario de Mapa
- ✅ Nombre: 3-200 caracteres
- ✅ Web Map Item ID: Solo caracteres alfanuméricos
- ✅ Zoom: 1-20
- ✅ Latitud: -90 a 90
- ✅ Longitud: -180 a 180

### Reglas de Negocio
- ✅ No se puede eliminar el mapa marcado como por defecto
- ✅ Solo puede haber un mapa por defecto a la vez
- ✅ Web Map Item ID debe ser único

## Estilos y UX

### Badges
- **General**: Badge azul por defecto
- **Operaciones**: Badge secundario
- **Análisis**: Badge outline
- **Por Defecto**: Badge verde con estrella dorada

### Estados
- **Loading**: Skeletons animados
- **Empty State**: Mensaje e icono centrados
- **Error**: Toast notifications con variante destructive
- **Success**: Toast notifications confirmando la acción

## Acceso y Permisos

Módulo disponible para roles:
- ✅ SuperAdmin
- ✅ Admin  
- ✅ User (Pro)

## Integración con Backend

Todos los endpoints utilizados:
- `GET /maps?page=1&limit=20` - Listar mapas
- `GET /maps/stats` - Estadísticas
- `GET /maps/:id?includeLayers=true` - Detalles de mapa
- `POST /maps` - Crear mapa
- `PATCH /maps/:id` - Actualizar mapa
- `DELETE /maps/:id` - Eliminar mapa

## Mejoras Futuras

- [ ] Búsqueda con filtros avanzados (tipo, fecha)
- [ ] Exportar listado de mapas a CSV/Excel
- [ ] Vista previa del mapa en miniatura
- [ ] Duplicar mapa
- [ ] Historial de cambios
- [ ] Asignación masiva de capas a mapas
- [ ] Drag & drop para reordenar capas en un mapa
