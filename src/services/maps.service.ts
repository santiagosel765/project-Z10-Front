/**
 * Servicio de Mapas
 * Basado en MapsController del backend NestJS
 */
import api from '@/lib/api-client';

/**
 * Entidad MapType del backend
 */
export interface MapTypeEntity {
  id: number;
  code: string; // 'arcgis', 'leaflet', etc.
  name: string; // 'ArcGIS Web Map', etc.
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Códigos de tipos de mapa
 */
export type MapTypeCode = 'arcgis' | 'leaflet' | 'mapbox';

/**
 * Tipos de geometría para capas
 */
export type LayerType =
  | 'point'
  | 'linestring'
  | 'polygon'
  | 'multipoint'
  | 'multilinestring'
  | 'multipolygon'
  | 'mixed';

/**
 * Estilo de capa (Leaflet style)
 */
export interface LayerStyle {
  color?: string;
  weight?: number;
  opacity?: number;
  fillColor?: string;
  fillOpacity?: number;
  iconUrl?: string;
  iconSize?: [number, number];
  iconAnchor?: [number, number];
}

/**
 * Configuración del mapa (settings JSON)
 */
export interface MapSettings {
  zoom: number;
  center: [number, number]; // [longitude, latitude]
  basemap: string;
}

/**
 * Capa anidada en MapLayer (cuando includeLayers=true)
 */
export interface LayerInMap {
  id: number;
  name: string;
  description: string | null;
  userId: number;
  layerType: LayerType;
  totalFeatures: number;
  bboxGeometry: any; // GeoJSON Polygon
  style: LayerStyle;
  isActive: boolean;
  isPublic: boolean;
  sharedWith: number[] | null;
  originalFilename: string | null;
  fileSizeBytes: string; // Viene como string del backend
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
}

/**
 * MapLayer (relación Map-Layer con configuración)
 */
export interface MapLayer {
  mapId: number;
  layerId: number;
  layer: LayerInMap; // Capa completa anidada
  displayOrder: number;
  isVisible: boolean;
  opacity: string; // Viene como string del backend (ej: "1.00")
  layerConfig: any | null;
  createdAt: string;
  createdBy: number;
}

/**
 * DTO para crear un mapa (CreateMapDto del backend)
 * Todos los campos son requeridos excepto description
 */
export interface CreateMapDto {
  name: string;
  description?: string;
  webmapItemId: string;
  mapTypeId: number; // ID de la entidad MapType
  isDefault?: boolean;
  settings?: MapSettings;
}

/**
 * DTO para actualizar un mapa (UpdateMapDto del backend)
 */
export interface UpdateMapDto {
  name?: string;
  description?: string;
  webmapItemId?: string;
  mapTypeId?: number; // ID de la entidad MapType
  isDefault?: boolean;
  settings?: MapSettings;
}

/**
 * Entidad Map del backend
 * Estructura de la respuesta GET /maps (lista)
 */
export interface Map {
  id: number;
  name: string;
  description: string | null;
  webmapItemId: string | null;
  mapTypeId: number;
  mapType?: MapTypeEntity; // Puede venir poblado o no
  isDefault: boolean;
  settings: MapSettings;
  createdAt: string;
  updatedAt: string;
}

/**
 * Mapa público con URL de embed
 * Estructura de la respuesta GET /maps/public/:id y GET /maps/public/all
 */
export interface PublicMap {
  id: number;
  name: string;
  description: string | null;
  webmapItemId: string | null;
  mapTypeId: number;
  mapType: MapTypeEntity;
  isActive: boolean;
  isDefault: boolean;
  isPublic: boolean;
  settings: MapSettings;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  embedUrl: string;
}

/**
 * Respuesta detallada de un mapa
 * Estructura de la respuesta GET /maps/:id
 * Incluye campos adicionales de auditoría
 * Si includeLayers=true, incluye mapLayers array
 */
export interface MapDetail {
  id: number;
  name: string;
  description: string | null;
  webmapItemId: string;
  mapTypeId: number;
  mapType: MapTypeEntity; // Siempre viene poblado en detalle
  isActive: boolean;
  isDefault: boolean;
  settings: MapSettings;
  createdAt: string; // Formateado: "25/11/2025, 10:01:11 a.m."
  createdBy: number;
  updatedAt: string; // Formateado: "25/11/2025, 10:25:59 a.m."
  updatedBy: number;
  mapLayers?: MapLayer[]; // Solo si includeLayers=true
}

/**
 * Respuesta al crear un mapa
 * Estructura de la respuesta POST /maps
 * Solo incluye createdAt, sin campos de auditoría completos
 */
export interface MapCreateResponse {
  id: number;
  name: string;
  description: string | null;
  webmapItemId: string;
  mapTypeId: number;
  mapType?: MapTypeEntity;
  isDefault: boolean;
  settings: MapSettings;
  createdAt: string; // Formateado: "25/11/2025, 4:14:16 p.m."
}

/**
 * Respuesta paginada del backend
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Respuesta de búsqueda con metadata adicional
 */
export interface SearchResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    query?: string;
    mapType?: string;
  };
}

/**
 * Estadísticas de mapas del backend
 */
export interface MapStats {
  totalMaps: number;
  defaultMaps: number;
  generalMaps: number;
  arcgisMaps: number;
  layerCounts: Array<{
    mapId: number;
    layerCount: number;
  }>;
}

/**
 * Filtros para búsqueda de mapas
 */
export interface MapSearchFilters {
  q?: string;
  mapType?: string; // Código del tipo de mapa (ej: 'arcgis', 'leaflet')
  page?: number;
  limit?: number;
}

/**
 * Filtros para paginación
 */
export interface MapPaginationFilters {
  page?: number;
  limit?: number;
}

/**
 * Respuesta al eliminar un mapa
 */
export interface DeleteMapResponse {
  message: string;
  id: number;
}

/**
 * Servicio de Mapas
 * Endpoints disponibles en el backend:
 * - POST /maps
 * - GET /maps (con paginación)
 * - GET /maps/default
 * - GET /maps/search
 * - GET /maps/stats
 * - GET /maps/:id
 * - PATCH /maps/:id
 * - DELETE /maps/:id (soft delete)
 */
export const mapsService = {
  /**
   * Crear un nuevo mapa
   * POST /maps
   * Requiere autenticación
   * 
   * Retorna el mapa creado con id, createdAt
   * No incluye isActive, createdBy, updatedBy, updatedAt
   */
  createMap: async (createMapDto: CreateMapDto) => {
    const response = await api.post<MapCreateResponse>('/maps', createMapDto);
    return response.data;
  },

  /**
   * Obtener todos los mapas con paginación
   * GET /maps?page=1&limit=20
   * 
   * Retorna: { data: Map[], meta: { total, page, limit, totalPages } }
   */
  getMaps: async (filters?: MapPaginationFilters) => {
    const response = await api.get<PaginatedResponse<Map>>('/maps', { params: filters });
    return response.data;
  },

  /**
   * Obtener el mapa por defecto
   * GET /maps/default
   * 
   * Retorna MapDetail del mapa marcado como default
   */
  getDefaultMap: async () => {
    const response = await api.get<MapDetail>('/maps/default');
    return response.data;
  },

  /**
   * Buscar mapas por nombre o descripción
   * GET /maps/search?q=...&mapType=...&page=1&limit=20
   * 
   * Retorna: { data: Map[], meta: { total, page, limit, totalPages, query, mapType } }
   */
  searchMaps: async (filters: MapSearchFilters) => {
    const response = await api.get<SearchResponse<Map>>('/maps/search', { params: filters });
    return response.data;
  },

  /**
   * Obtener estadísticas de mapas
   * GET /maps/stats
   */
  getMapStats: async () => {
    const response = await api.get<MapStats>('/maps/stats');
    return response.data;
  },

  /**
   * Obtener un mapa por ID
   * GET /maps/:id?includeLayers=true
   * 
   * @param id - ID del mapa
   * @param includeLayers - Si true, incluye array de mapLayers con capas asociadas
   * 
   * Retorna MapDetail con campos adicionales:
   * isActive, createdBy, updatedBy, mapLayers (opcional)
   */
  getMapById: async (id: number, includeLayers: boolean = true) => {
    const response = await api.get<MapDetail>(`/maps/${id}`, {
      params: { includeLayers },
    });
    return response.data;
  },

  /**
   * Actualizar un mapa
   * PATCH /maps/:id
   * Requiere autenticación
   * 
   * Retorna MapDetail con información actualizada
   */
  updateMap: async (id: number, updateMapDto: UpdateMapDto) => {
    const response = await api.patch<MapDetail>(`/maps/${id}`, updateMapDto);
    return response.data;
  },

  /**
   * Eliminar un mapa (soft delete)
   * DELETE /maps/:id
   * Requiere autenticación
   * No se puede eliminar el mapa por defecto
   * 
   * Retorna: { message: string, id: number }
   * Error 400 si intentas eliminar el mapa por defecto
   */
  deleteMap: async (id: number) => {
    const response = await api.delete<DeleteMapResponse>(`/maps/${id}`);
    return response.data;
  },

  /**
   * Obtener todos los tipos de mapas disponibles
   * GET /map-types
   * 
   * Retorna lista de MapTypeEntity activos
   */
  getMapTypes: async () => {
    const response = await api.get<MapTypeEntity[]>('/map-types');
    return response.data;
  },

  /**
   * Obtener todos los mapas públicos (sin autenticación)
   * GET /maps/public/all
   * 
   * Retorna lista de mapas públicos con embedUrl
   */
  getAllPublicMaps: async () => {
    const response = await api.get<PublicMap[]>('/maps/public/all');
    return response.data;
  },

  /**
   * Obtener un mapa público por ID (sin autenticación)
   * GET /maps/public/:id
   * 
   * @param id - ID del mapa público
   * 
   * Retorna PublicMap con embedUrl
   */
  getPublicMapById: async (id: number) => {
    const response = await api.get<PublicMap>(`/maps/public/${id}?includeLayers=true`);
    return response.data;
  },
};
