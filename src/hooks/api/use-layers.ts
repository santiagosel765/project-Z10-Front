/**
 * Hooks de Layers para TanStack Query
 * Basado en LayersController del backend NestJS
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  layersService,
  type UploadLayerDto,
  type UpdateLayerDto,
  type BBox,
  type FilterParams,
} from '@/services/layers.service';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/react-query';

/**
 * Hook para obtener capas del usuario
 * GET /layers
 * 
 * @example
 * ```tsx
 * const { data: layers, isLoading } = useUserLayers();
 * ```
 */
export const useUserLayers = () => {
  return useQuery({
    queryKey: queryKeys.layers.user,
    queryFn: () => layersService.getUserLayers(),
  });
};

/**
 * Hook para obtener todas las capas (admin)
 * GET /layers/all
 * 
 * Retorna lista paginada con metadata
 * 
 * @example
 * ```tsx
 * const { data } = useAllLayers();
 * // data.data = Layer[] (array de capas)
 * // data.meta = { total, page, limit, totalPages }
 * ```
 */
export const useAllLayers = () => {
  return useQuery({
    queryKey: queryKeys.layers.all,
    queryFn: () => layersService.getAllLayers(),
  });
};

/**
 * Hook para obtener capas públicas con paginación
 * GET /layers/public?page=1&limit=20
 * 
 * @example
 * ```tsx
 * const { data: publicLayers } = usePublicLayers(1, 20);
 * ```
 */
export const usePublicLayers = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: queryKeys.layers.public(page, limit),
    queryFn: () => layersService.getPublicLayers(page, limit),
  });
};

/**
 * Hook para obtener detalles de una capa
 * GET /layers/:id
 * 
 * @example
 * ```tsx
 * const { data: layer } = useLayer(1);
 * const { data: layer } = useLayer(1, true); // with enabled control
 * ```
 */
export const useLayer = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.layers.detail(id),
    queryFn: () => layersService.getLayerById(id),
    enabled: enabled && !!id && id > 0,
  });
};

/**
 * Hook para obtener capa como GeoJSON completo
 * GET /layers/:id/geojson
 * 
 * ADVERTENCIA: Puede ser lento para capas grandes
 * 
 * @example
 * ```tsx
 * const { data: geojson, isLoading } = useLayerGeoJSON(1);
 * ```
 */
export const useLayerGeoJSON = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.layers.geojson(id),
    queryFn: () => layersService.getLayerGeoJSON(id),
    enabled: enabled && !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData: any) => previousData,
  });
};

/**
 * Hook para obtener features en un bounding box
 * GET /layers/:id/geojson/bbox
 * 
 * Perfecto para cargar solo features visibles
 * 
 * @example
 * ```tsx
 * const bbox = { minLon: -90.55, minLat: 14.55, maxLon: -90.45, maxLat: 14.65 };
 * const { data: features } = useLayerBBox(1, bbox);
 * ```
 */
export const useLayerBBox = (id: number, bbox?: BBox) => {
  return useQuery({
    queryKey: queryKeys.layers.bbox(id, bbox),
    queryFn: () => layersService.getLayerFeaturesInBBox(id, bbox!),
    enabled: !!id && !!bbox,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

/**
 * Hook para obtener features en un bounding box con parámetros personalizados
 * GET /layers/:id/geojson/bbox?maxFeatures=...&simplify=...
 * 
 * Versión avanzada con control sobre límite de features y simplificación de geometrías
 * 
 * @example
 * ```tsx
 * const bbox = { minLon: -90.55, minLat: 14.55, maxLon: -90.45, maxLat: 14.65 };
 * const { data, isLoading, refetch } = useLayerFeaturesInBBox({
 *   id: 1,
 *   bbox,
 *   maxFeatures: 5000,
 *   simplify: true,
 *   enabled: true
 * });
 * ```
 */
export const useLayerFeaturesInBBox = ({
  id,
  bbox,
  maxFeatures = 5000,
  simplify = true,
  enabled = true,
}: {
  id: number;
  bbox?: BBox;
  maxFeatures?: number;
  simplify?: boolean;
  enabled?: boolean;
}) => {
  return useQuery({
    //@ts-ignore
    queryKey: queryKeys.layers.bboxFeatures(id),
    queryFn: () => layersService.getLayerFeaturesInBBox(id, bbox!, maxFeatures, simplify),
    enabled: enabled && !!id && !!bbox,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

/**
 * Hook para buscar capas
 * GET /layers/search?q=...
 * 
 * @example
 * ```tsx
 * const { data: results } = useSearchLayers('hospitales', 1, 20);
 * ```
 */
export const useSearchLayers = (
  query: string,
  page: number = 1,
  limit: number = 20,
) => {
  return useQuery({
    queryKey: queryKeys.layers.search(query, page, limit),
    queryFn: () => layersService.searchLayers(query, page, limit),
    enabled: !!query && query.trim().length > 0,
  });
};

/**
 * Hook para obtener estadísticas de capas del usuario
 * GET /layers/user/stats
 * 
 * @example
 * ```tsx
 * const { data: stats } = useUserLayerStats();
 * // stats: { totalLayers, totalFeatures, totalSizeMB, ... }
 * ```
 */
export const useUserLayerStats = () => {
  return useQuery({
    queryKey: queryKeys.layers.stats,
    queryFn: () => layersService.getUserLayerStats(),
  });
};

/**
 * Hook para subir una capa GeoJSON
 * POST /layers
 * 
 * @example
 * ```tsx
 * const { mutate: uploadLayer, isPending } = useUploadGeoJSONLayer();
 * 
 * const handleUpload = (file: File) => {
 *   uploadLayer({
 *     file,
 *     data: {
 *       name: 'Mi capa',
 *       description: 'Descripción',
 *       userId: currentUser.id,
 *       isPublic: false,
 *     },
 *   });
 * };
 * ```
 */
export const useUploadGeoJSONLayer = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, data }: { file: File; data: UploadLayerDto }) =>
      layersService.uploadLayer(file, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.layers.user });
      queryClient.invalidateQueries({ queryKey: queryKeys.layers.stats });

      toast({
        title: 'Capa creada',
        description: `${response.data.name} se ha subido exitosamente (${response.data.totalFeatures} features).`,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Error al subir la capa';

      toast({
        title: 'Error al subir capa',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para actualizar una capa
 * PATCH /layers/:id
 * 
 * @example
 * ```tsx
 * const { mutate: updateLayer } = useUpdateLayer();
 * 
 * updateLayer({
 *   id: 1,
 *   data: { name: 'Nuevo nombre', description: 'Nueva descripción' },
 * });
 * ```
 */
export const useUpdateLayer = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLayerDto }) =>
      layersService.updateLayer(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.layers.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.layers.detail(variables.id),
      });

      toast({
        title: 'Capa actualizada',
        description: `${response.data.name} se ha actualizado exitosamente.`,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Error al actualizar la capa';

      toast({
        title: 'Error al actualizar capa',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para eliminar una capa (soft delete)
 * DELETE /layers/:id
 * 
 * @example
 * ```tsx
 * const { mutate: deleteLayer } = useDeleteGeoJSONLayer();
 * 
 * deleteLayer(1);
 * ```
 */
export const useDeleteGeoJSONLayer = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => layersService.deleteLayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.layers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.layers.stats });

      toast({
        title: 'Capa eliminada',
        description: 'La capa se ha eliminado exitosamente.',
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Error al eliminar la capa';

      toast({
        title: 'Error al eliminar capa',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para compartir una capa con otros usuarios
 * POST /layers/:id/share
 * 
 * @example
 * ```tsx
 * const { mutate: shareLayer } = useShareLayer();
 * 
 * shareLayer({ id: 1, userIds: [2, 3, 4] });
 * ```
 */
export const useShareLayer = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userIds }: { id: number; userIds: number[] }) =>
      layersService.shareLayer(id, userIds),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.layers.detail(variables.id),
      });

      toast({
        title: 'Capa compartida',
        description: `Se ha compartido con ${response.data.sharedWith.length} usuario(s).`,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Error al compartir la capa';

      toast({
        title: 'Error al compartir capa',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para descargar una capa como GeoJSON
 * GET /layers/:id/geojson/download
 * 
 * @example
 * ```tsx
 * const { mutate: downloadLayer, isPending } = useDownloadLayer();
 * 
 * <button onClick={() => downloadLayer(1)}>
 *   Descargar GeoJSON
 * </button>
 * ```
 */
export const useDownloadLayer = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => layersService.downloadLayerGeoJSON(id),
    onSuccess: () => {
      toast({
        title: 'Descarga iniciada',
        description: 'El archivo GeoJSON se está descargando.',
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Error al descargar la capa';

      toast({
        title: 'Error al descargar',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para obtener catálogo de features de una capa multipolygon
 * GET /layers/:id/features/catalog
 * 
 * Retorna listado con metadata y bbox de cada feature, sin geometrías completas
 * Perfecto para crear interfaces de selección donde el usuario elige qué features cargar
 * 
 * @example
 * ```tsx
 * const { data: catalog, isLoading } = useFeaturesCatalog(18);
 * // catalog: { layerId, layerName, totalFeatures, features: [{id, properties, bboxGeometry, centroid, areaKm2}] }
 * 
 * // Mostrar lista de features para que el usuario seleccione
 * catalog?.features.map(feature => (
 *   <div key={feature.id}>
 *     {feature.properties.NOMBRE} - {feature.areaKm2} km²
 *   </div>
 * ))
 * ```
 */
export const useFeaturesCatalog = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.layers.featuresCatalog(id),
    queryFn: () => layersService.getFeaturesCatalog(id),
    enabled: enabled && !!id && id > 0,
    staleTime: 10 * 60 * 1000, // 10 minutos - el catálogo no cambia frecuentemente
  });
};

/**
 * Hook para obtener features seleccionadas por sus IDs
 * GET /layers/:id/features?featureIds=...
 * 
 * Carga solo las geometrías completas de las features especificadas
 * Si no se pasan IDs, retorna todas las features de la capa
 * 
 * @example
 * ```tsx
 * // Cargar features específicas
 * const { data: features } = useFeaturesByIds(18, [136, 137, 140]);
 * 
 * // Cargar todas las features
 * const { data: allFeatures } = useFeaturesByIds(18);
 * 
 * // Renderizar en mapa
 * <GeoJSON data={features} />
 * ```
 */
export const useFeaturesByIds = (
  id: number,
  featureIds?: number[],
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: queryKeys.layers.featuresByIds(id, featureIds),
    queryFn: () => layersService.getFeaturesByIds(id, featureIds),
    enabled: enabled && !!id && id > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para filtrar features de UNA capa por propiedades dinámicas
 * GET /layers/:id/features/filter
 * 
 * Soporta:
 * - Aliases automáticos (CODDISTRITO = NO_DISTRIT = cod_distrito)
 * - Múltiples valores (OR logic): { CODDISTRITO: '5,10,15' }
 * - Múltiples propiedades (AND logic): { CODDISTRITO: '5', CODREGION: '2' }
 * - Combinación con IDs específicos
 * 
 * @example
 * ```tsx
 * // Filtrar por un distrito
 * const { data } = useFilterFeatures(18, { CODDISTRITO: '5' });
 * 
 * // Filtrar por múltiples distritos (OR)
 * const { data } = useFilterFeatures(18, { CODDISTRITO: '5,10,15' });
 * 
 * // Filtrar por distrito Y región (AND)
 * const { data } = useFilterFeatures(18, { CODDISTRITO: '5', CODREGION: '2' });
 * 
 * // Combinar filtros con IDs específicos
 * const { data } = useFilterFeatures(18, { CODDISTRITO: '5' }, [136, 137]);
 * ```
 */
export const useFilterFeatures = (
  id: number,
  filters: FilterParams,
  featureIds?: number[],
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: queryKeys.layers.filteredFeatures(id, filters, featureIds),
    queryFn: () => layersService.filterFeatures(id, filters, featureIds),
    enabled: enabled && !!id && id > 0 && Object.keys(filters).length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

/**
 * Hook para filtrar features de MÚLTIPLES capas simultáneamente
 * GET /layers/features/filter-multiple
 * 
 * Aplica los mismos filtros a múltiples capas y retorna todas las features combinadas
 * que cumplan con los criterios. Ideal para visualizar datos relacionados de varias capas.
 * 
 * @example
 * ```tsx
 * // Filtrar 4 capas por distrito 5
 * const { data } = useFilterMultipleLayersFeatures(
 *   [1, 2, 3, 4],
 *   { CODDISTRITO: '5' }
 * );
 * 
 * // Filtrar por distrito Y región en múltiples capas
 * const { data } = useFilterMultipleLayersFeatures(
 *   [1, 2, 3, 4],
 *   { CODDISTRITO: '5', CODREGION: '2' }
 * );
 * 
 * // Resultado: GeoJSON con features de todas las capas
 * // data.metadata.layers contiene info de cuántas features vienen de cada capa
 * <GeoJSON data={data} />
 * ```
 */
export const useFilterMultipleLayersFeatures = (
  layerIds: number[],
  filters: FilterParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: queryKeys.layers.multiLayerFiltered(layerIds, filters),
    queryFn: () => layersService.filterMultipleLayersFeatures(layerIds, filters),
    enabled:
      enabled &&
      layerIds.length > 0 &&
      Object.keys(filters).length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

/**
 * Hook para obtener features que se intersectan con una geometría específica
 * POST /layers/:id/geojson/intersects
 * 
 * Ideal para análisis espacial: encuentra todas las features de una capa que tocan/cruzan/están dentro
 * de una geometría dada. Perfecto para filtrar puntos por polígonos, líneas por áreas, etc.
 * 
 * @example
 * ```tsx
 * // Encontrar puntos dentro de un distrito
 * const { data: pointsInDistrict } = useLayerIntersect(
 *   16,  // ID de capa de puntos
 *   districtGeometry,  // Geometría del distrito seleccionado
 *   { maxFeatures: 1000, simplify: false }
 * );
 * 
 * // Usar features filtradas como geometría de intersección
 * const { data: filteredData } = useFilterMultipleLayersFeatures([1, 2], filters);
 * const geometries = filteredData?.features.map(f => f.geometry);
 * const { data: intersectedPoints } = useLayerIntersect(18, geometries[0]);
 * ```
 */
export const useLayerIntersect = (
  layerId: number,
  geometry: any,
  options: {
    maxFeatures?: number;
    simplify?: boolean;
    enabled?: boolean;
  } = {}
) => {
  const { maxFeatures = 5000, simplify = false, enabled = true } = options;

  return useQuery({
    queryKey: ['layers', 'intersect', layerId, geometry, maxFeatures, simplify],
    queryFn: () => layersService.intersectFeatures(layerId, geometry, maxFeatures, simplify),
    enabled: enabled && !!layerId && !!geometry,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};
