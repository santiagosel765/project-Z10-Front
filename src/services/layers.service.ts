/**
 * Servicio de Layers (Capas GeoJSON)
 * Basado en LayersController del backend NestJS
 */
import api from '@/lib/api-client';

/**
 * Tipos de geometría soportados
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
 * Usuario simplificado (para owner)
 */
export interface LayerUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Estilo de capa (Leaflet style)
 */
export interface LayerStyle {
  // Para puntos
  iconUrl?: string;
  iconSize?: [number, number];
  iconAnchor?: [number, number];
  
  // Para líneas y polígonos
  color?: string;
  weight?: number;
  opacity?: number;
  fillColor?: string;
  fillOpacity?: number;
}

/**
 * Capa básica (para listas)
 */
export interface Layer {
  id: number;
  name: string;
  description: string | null;
  layerType: LayerType;
  totalFeatures: number;
  isPublic: boolean;
  style: LayerStyle;
  originalFilename: string | null;
  fileSizeBytes: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Capa con detalles completos (GET /layers/:id)
 */
export interface LayerDetail {
  id: number;
  name: string;
  description: string | null;
  userId: number;
  layerType: LayerType;
  totalFeatures: number;
  bboxGeometry: any; // GeoJSON Polygon del bbox
  style: LayerStyle;
  isActive: boolean;
  isPublic: boolean;
  sharedWith: number[];
  originalFilename: string | null;
  fileSizeBytes: number;
  createdAt: string;
  updatedAt: string;
  user: LayerUser | null;
}

/**
 * Respuesta al crear una capa
 */
export interface CreateLayerResponse {
  id: number;
  name: string;
  description: string | null;
  layerType: string;
  totalFeatures: number;
  centroid: [number, number];
  bbox: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  geometryTypes: string[];
  properties: string[];
  summary: string;
  createdAt: string;
  mapId: number | null;
}

/**
 * DTO para subir una capa GeoJSON
 */
export interface UploadLayerDto {
  name: string;
  description?: string;
  userId: number; // ID del usuario que sube la capa
  style?: LayerStyle;
  isPublic?: boolean;
  createdBy: number;
  mapId?: number; // Opcional: asociar a un mapa
  displayOrder?: number; // Orden de visualización si se asocia a un mapa
}

/**
 * DTO para actualizar una capa
 */
export interface UpdateLayerDto {
  name?: string;
  description?: string;
  style?: LayerStyle;
  mapId?: number; // Opcional: para cambiar asociación a un mapa
}

/**
 * Respuesta paginada de capas
 */
export interface PaginatedLayersResponse {
  data: Layer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Respuesta de búsqueda de capas
 */
export interface SearchLayersResponse {
  data: Layer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    query: string;
  };
}

/**
 * Estadísticas de capas del usuario
 */
export interface LayerStats {
  totalLayers: number;
  totalFeatures: number;
  totalSizeBytes: number;
  totalSizeMB: number;
  publicLayers: number;
  privateLayers: number;
}

/**
 * Bounding box para queries espaciales
 */
export interface BBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

/**
 * Respuesta de GeoJSON con metadata de límites
 */
export interface GeoJSONWithMetadata {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: any;
    properties: Record<string, any>;
  }>;
  metadata?: {
    totalInBounds: number;
    returned: number;
    limited: boolean;
    message?: string;
  };
}

/**
 * GeoJSON FeatureCollection
 */
export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: any;
    properties: Record<string, any>;
  }>;
}

/**
 * Feature del catálogo (sin geometría completa)
 * Endpoint: GET /layers/:id/features/catalog
 */
export interface CatalogFeature {
  id: number;
  featureIndex: number;
  properties: Record<string, any>;
  bboxGeometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  centroid: {
    type: 'Point';
    coordinates: [number, number];
  };
  areaKm2: string;
  geometryType: string;
}

/**
 * Respuesta del catálogo de features
 * Endpoint: GET /layers/:id/features/catalog
 */
export interface FeaturesCatalogResponse {
  layerId: number;
  layerName: string;
  layerType: string;
  totalFeatures: number;
  features: CatalogFeature[];
}

/**
 * Feature completa con geometría
 * Endpoint: GET /layers/:id/features
 */
export interface FeatureWithGeometry {
  type: 'Feature';
  id: number;
  geometry: {
    type: 'MultiPolygon' | 'Polygon';
    coordinates: number[][][][];
  };
  properties: Record<string, any> & {
    featureIndex: number;
    featureId: number;
    layerId?: number;      // Incluido en multi-layer queries
    layerName?: string;    // Incluido en multi-layer queries
  };
}

/**
 * Respuesta de features seleccionadas por ID
 * Endpoint: GET /layers/:id/features
 */
export interface SelectedFeaturesResponse {
  type: 'FeatureCollection';
  features: FeatureWithGeometry[];
  metadata: {
    layerId: number;
    layerName: string;
    totalFeatures: number;
    selectedFeatureIds: number[] | 'all';
    bbox?: {
      minLon: number;
      minLat: number;
      maxLon: number;
      maxLat: number;
    };
  };
}

/**
 * Respuesta de features filtradas (single layer)
 * Endpoint: GET /layers/:id/features/filter
 */
export interface FilteredFeaturesResponse {
  type: 'FeatureCollection';
  features: FeatureWithGeometry[];
  metadata: {
    layerId: number;
    layerName: string;
    totalFeatures: number;
    appliedFilters: Record<string, string>;
    bbox: {
      minLon: number;
      minLat: number;
      maxLon: number;
      maxLat: number;
    };
    selectedFeatureIds: number[] | 'none';
  };
}

/**
 * Respuesta de features filtradas (múltiples capas)
 * Endpoint: GET /layers/features/filter-multiple
 */
export interface MultiLayerFilteredResponse {
  type: 'FeatureCollection';
  features: FeatureWithGeometry[];
  metadata: {
    totalLayers: number;
    totalFeatures: number;
    appliedFilters: Record<string, string | string[]>;
    bbox: {
      minLon: number;
      minLat: number;
      maxLon: number;
      maxLat: number;
    };
    layers: Array<{
      layerId: number;
      layerName: string;
      featuresCount: number;
    }>;
  };
}

/**
 * Parámetros de filtrado dinámico
 */
export interface FilterParams {
  [key: string]: string | number | (string | number)[];
}

/**
 * Parámetros para filtrado de múltiples capas
 */
export interface MultiLayerFilterParams extends FilterParams {
  layerIds: number[];
}

/**
 * Parámetros para intersección espacial
 */
export interface IntersectParams {
  geometry: any; // GeoJSON Geometry (Polygon, MultiPolygon, Point, LineString, etc.)
  maxFeatures?: number;
  simplify?: boolean;
}

/**
 * Respuesta de intersección espacial
 */
export interface IntersectResponse {
  type: 'FeatureCollection';
  features: FeatureWithGeometry[];
  metadata: {
    layerId: number;
    layerName: string;
    totalIntersecting: number;
    returned: number;
    limited: boolean;
    message?: string;
  };
}

/**
 * Servicio de Layers
 */
export const layersService = {
  /**
   * Crear capa desde archivo GeoJSON
   * POST /layers
   * 
   * @param file - Archivo GeoJSON
   * @param data - Metadata de la capa
   */
  uploadLayer: async (file: File, data: UploadLayerDto) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    formData.append('userId', data.userId.toString());
    formData.append('createdBy', data.userId.toString());
    if (data.style) formData.append('style', JSON.stringify(data.style));
    if (data.isPublic !== undefined) formData.append('isPublic', data.isPublic.toString());
    if (data.mapId) formData.append('mapId', data.mapId.toString());
    if (data.displayOrder !== undefined) formData.append('displayOrder', data.displayOrder.toString());

    // Usar método upload con timeout extendido para archivos grandes
    const response = await api.upload<CreateLayerResponse>('/layers', formData);
    return response.data;
  },

  /**
   * Obtener capas del usuario autenticado
   * GET /layers
   * 
   * Retorna lista de capas ordenadas por fecha de creación
   * api-client maneja ApiResponse wrapper, retorna data directamente
   */
  getUserLayers: async () => {
    const response = await api.get<Layer[]>('/layers');
    // response.data contiene Layer[] directamente
    return response.data;
  },

  /**
   * Obtener todas las capas (admin)
   * GET /layers/all
   * 
   * Retorna lista de todas las capas con paginación
   * api-client retorna AxiosResponse<ApiResponse<PaginatedLayersResponse>>
   * response.data.data contiene { data: Layer[], meta: {...} }
   */
  getAllLayers: async () => {
    const response = await api.get<PaginatedLayersResponse>('/layers/all');
    // response.data es ApiResponse<PaginatedLayersResponse>
    // response.data.data es PaginatedLayersResponse = { data: Layer[], meta: {...} }
    return response.data.data;
  },

  /**
   * Obtener capas públicas con paginación
   * GET /layers/public?page=1&limit=20
   */
  getPublicLayers: async (page: number = 1, limit: number = 20) => {
    const response = await api.get<PaginatedLayersResponse>('/layers/public', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Obtener detalles de una capa por ID
   * GET /layers/:id
   * 
   * Retorna metadata completa + bbox como GeoJSON
   * No incluye features (usar getLayerGeoJSON para eso)
   */
  getLayerById: async (id: number) => {
    const response = await api.get<LayerDetail>(`/layers/${id}`);
    return response.data;
  },

  /**
   * Obtener capa completa como GeoJSON
   * GET /layers/:id/geojson
   * 
   * Retorna FeatureCollection con todas las features
   * ADVERTENCIA: Puede ser lento para capas grandes (>5000 features)
   */
  getLayerGeoJSON: async (id: number) => {
    const response = await api.get<GeoJSONFeatureCollection>(`/layers/${id}/geojson`);
    return response.data;
  },

  /**
   * Descargar capa como archivo GeoJSON
   * GET /layers/:id/geojson/download
   * 
   * Descarga el archivo directamente
   */
  downloadLayerGeoJSON: async (id: number) => {
    const response = await api.get(`/layers/${id}/geojson/download`, {
      responseType: 'blob',
    });
    
    const blob = response.data as unknown as Blob;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'layer.geojson';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match) filename = match[1];
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Obtener features en un bounding box (viewport) con límite optimizado
   * GET /layers/:id/geojson/bbox
   * 
   * Perfecto para cargar solo features visibles en el mapa
   * Muy rápido gracias a índices espaciales
   * 
   * @param id - ID de la capa
   * @param bbox - Bounding box del viewport
   * @param maxFeatures - Límite de features a retornar (default: 5000)
   * @param simplify - Simplificar geometrías (default: true)
   */
  getLayerFeaturesInBBox: async (
    id: number, 
    bbox: BBox,
    maxFeatures: number = 5000,
    simplify: boolean = true
  ) => {
    const response = await api.get<GeoJSONWithMetadata>(
      `/layers/${id}/geojson/bbox`,
      {
        params: {
          minLon: bbox.minLon,
          minLat: bbox.minLat,
          maxLon: bbox.maxLon,
          maxLat: bbox.maxLat,
          maxFeatures,
          simplify,
        },
      }
    );
    return response.data;
  },

  /**
   * Obtener URL para Vector Tiles (MVT)
   * GET /layers/:id/tiles/:z/:x/:y.mvt
   * 
   * ⭐ MEJOR OPCIÓN para capas grandes (>20k features)
   * Solo carga tiles visibles, con cache de 24h
   * 
   * @param id - ID de la capa
   * @returns URL template para tiles (ej: /api/layers/1/tiles/{z}/{x}/{y}.mvt)
   */
  getLayerTileURL: (id: number) => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || '';
    return `${baseURL}/layers/${id}/tiles/{z}/{x}/{y}.mvt`;
  },

  /**
   * Obtener clusters para capas de puntos
   * GET /layers/:id/clusters
   * 
   * Agrupa puntos cercanos para mejor visualización
   * Ideal para zoom out en capas de puntos grandes
   * 
   * @param id - ID de la capa
   * @param bbox - Bounding box del viewport
   * @param zoom - Nivel de zoom actual
   */
  getLayerClusters: async (id: number, bbox: BBox, zoom: number) => {
    const response = await api.get<GeoJSONFeatureCollection>(
      `/layers/${id}/clusters`,
      {
        params: {
          minLon: bbox.minLon,
          minLat: bbox.minLat,
          maxLon: bbox.maxLon,
          maxLat: bbox.maxLat,
          zoom: Math.floor(zoom),
        },
      }
    );
    return response.data;
  },

  /**
   * Buscar capas por nombre o descripción
   * GET /layers/search?q=...&page=1&limit=20
   * 
   * Busca en capas públicas y capas del usuario
   */
  searchLayers: async (query: string, page: number = 1, limit: number = 20) => {
    const response = await api.get<SearchLayersResponse>('/layers/search', {
      params: { q: query, page, limit },
    });
    return response.data;
  },

  /**
   * Obtener estadísticas de capas del usuario
   * GET /layers/user/stats
   * 
   * api-client maneja ApiResponse wrapper, retorna data directamente
   */
  getUserLayerStats: async () => {
    const response = await api.get<LayerStats>('/layers/user/stats');
    // response.data contiene LayerStats directamente
    return response.data;
  },

  /**
   * Actualizar metadata de una capa
   * PATCH /layers/:id (no implementado en controller, pero puede agregarse)
   */
  updateLayer: async (id: number, data: UpdateLayerDto) => {
    const response = await api.patch<LayerDetail>(`/layers/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar capa (soft delete)
   * DELETE /layers/:id (no implementado en controller, pero existe en service)
   */
  deleteLayer: async (id: number) => {
    const response = await api.delete<{ message: string; id: number }>(`/layers/${id}`);
    return response.data;
  },

  /**
   * Compartir capa con otros usuarios
   * POST /layers/:id/share (no implementado en controller, pero existe en service)
   */
  shareLayer: async (id: number, userIds: number[]) => {
    const response = await api.post<{ message: string; sharedWith: number[] }>(
      `/layers/${id}/share`,
      { userIds }
    );
    return response.data;
  },

  /**
   * Obtener catálogo de features de una capa multipolygon
   * GET /layers/:id/features/catalog
   * 
   * Retorna listado de features con metadata y bbox, sin geometrías completas
   * Ideal para crear interfaces de selección
   * 
   * @param id - ID de la capa multipolygon
   */
  getFeaturesCatalog: async (id: number) => {
    const response = await api.get<FeaturesCatalogResponse>(
      `/layers/${id}/features/catalog`
    );
    return response.data;
  },

  /**
   * Obtener features seleccionadas por IDs
   * GET /layers/:id/features?featureIds=...
   * 
   * Retorna geometrías completas de features específicas
   * Si no se especifican IDs, retorna todas las features
   * 
   * @param id - ID de la capa multipolygon
   * @param featureIds - Array de IDs de features (opcional)
   */
  getFeaturesByIds: async (id: number, featureIds?: number[]) => {
    // Construir query string manualmente para enviar múltiples featureIds
    // Ejemplo: ?featureIds=122&featureIds=123
    let url = `/layers/${id}/features`;
    
    if (featureIds && featureIds.length > 0) {
      const queryString = featureIds.map(id => `featureIds=${id}`).join('&');
      url += `?${queryString}`;
    }
    
    const response = await api.get<SelectedFeaturesResponse>(url);
    return response.data;
  },

  /**
   * Filtrar features de UNA capa por propiedades dinámicas
   * GET /layers/:id/features/filter
   * 
   * Soporta aliases automáticos (CODDISTRITO = NO_DISTRIT = cod_distrito)
   * Múltiples valores con comas (OR): CODDISTRITO=5,10,15
   * Múltiples propiedades (AND): CODDISTRITO=5&CODREGION=2
   * 
   * @param id - ID de la capa multipolygon
   * @param filters - Objeto con propiedades dinámicas para filtrar
   * @param featureIds - IDs específicos para combinar con filtros (opcional)
   */
  filterFeatures: async (
    id: number,
    filters: FilterParams,
    featureIds?: number[]
  ) => {
    const params: Record<string, any> = { ...filters };
    
    if (featureIds && featureIds.length > 0) {
      params.featureIds = featureIds;
    }

    const response = await api.get<FilteredFeaturesResponse>(
      `/layers/${id}/features/filter`,
      { params }
    );
    return response.data;
  },

  /**
   * Filtrar features de MÚLTIPLES capas simultáneamente
   * GET /layers/features/filter-multiple
   * 
   * Aplica los mismos filtros a múltiples capas y retorna todas las features
   * que cumplan con los criterios
   * 
   * @param layerIds - IDs de las capas a filtrar
   * @param filters - Objeto con propiedades dinámicas para filtrar
   */
  filterMultipleLayersFeatures: async (
    layerIds: number[],
    filters: FilterParams
  ) => {
    const params: Record<string, any> = {
      layerIds: layerIds.join(','),
      ...filters,
    };

    const response = await api.get<MultiLayerFilteredResponse>(
      `/layers/features/filter-multiple`,
      { params }
    );
    return response.data;
  },

  /**
   * Obtener features que se intersectan con una geometría específica
   * POST /layers/:id/geojson/intersects
   * 
   * Ideal para análisis espacial como "encontrar todos los puntos dentro de un polígono"
   * Soporta cualquier tipo de geometría GeoJSON
   * 
   * @param id - ID de la capa a filtrar
   * @param geometry - Geometría GeoJSON para intersección
   * @param maxFeatures - Límite de features a retornar (default: 5000)
   * @param simplify - Simplificar geometrías (default: false)
   */
  intersectFeatures: async (
    id: number,
    geometry: any,
    maxFeatures: number = 5000,
    simplify: boolean = false
  ) => {
    const response = await api.post<IntersectResponse>(
      `/layers/${id}/geojson/intersects`,
      { geometry },
      {
        params: {
          maxFeatures,
          simplify,
        },
      }
    );
    return response.data;
  },
};
