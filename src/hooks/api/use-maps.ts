/**
 * Hooks de Mapas para TanStack Query
 * Basado en MapsController del backend NestJS
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  mapsService,
  type CreateMapDto,
  type UpdateMapDto,
  type MapSearchFilters,
  type MapPaginationFilters,
} from '@/services/maps.service';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/react-query';

/**
 * Hook para obtener todos los mapas con paginación
 * 
 * GET /maps?page=1&limit=20
 * 
 * @example
 * ```tsx
 * const { data: maps, isLoading } = useMaps({ page: 1, limit: 20 });
 * ```
 */
export const useMaps = (filters?: MapPaginationFilters) => {
  return useQuery({
    queryKey: queryKeys.maps.list(filters),
    queryFn: () => mapsService.getMaps(filters),
  });
};

/**
 * Hook para obtener el mapa por defecto
 * 
 * GET /maps/default
 * 
 * @example
 * ```tsx
 * const { data: defaultMap, isLoading } = useDefaultMap();
 * ```
 */
export const useDefaultMap = () => {
  return useQuery({
    queryKey: queryKeys.maps.default,
    queryFn: () => mapsService.getDefaultMap(),
  });
};

/**
 * Hook para buscar mapas
 * 
 * GET /maps/search?q=...&mapType=...
 * 
 * @example
 * ```tsx
 * const { data: results } = useSearchMaps({ q: 'guatemala', mapType: 'terrain' });
 * ```
 */
export const useSearchMaps = (filters: MapSearchFilters) => {
  return useQuery({
    queryKey: queryKeys.maps.search(filters),
    queryFn: () => mapsService.searchMaps(filters),
    enabled: !!filters.q || !!filters.mapType, // Solo ejecutar si hay criterios de búsqueda
  });
};

/**
 * Hook para obtener estadísticas de mapas
 * 
 * GET /maps/stats
 * 
 * @example
 * ```tsx
 * const { data: stats } = useMapStats();
 * ```
 */
export const useMapStats = () => {
  return useQuery({
    queryKey: queryKeys.maps.stats,
    queryFn: () => mapsService.getMapStats(),
  });
};

/**
 * Hook para obtener un mapa por ID
 * 
 * GET /maps/:id?includeLayers=true
 * 
 * @param id - ID del mapa
 * @param includeLayers - Si true, incluye array de mapLayers con capas asociadas
 * 
 * @example
 * ```tsx
 * const { data: map } = useMap(1);
 * const { data: mapWithLayers } = useMap(1, true);
 * ```
 */
export const useMap = (id: number, includeLayers: boolean = false, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.maps.detail(id, includeLayers),
    queryFn: () => mapsService.getMapById(id, includeLayers),
    enabled: !!id && enabled,
  });
};

/**
 * Hook para crear un nuevo mapa
 * 
 * POST /maps
 * 
 * @example
 * ```tsx
 * const { mutate: createMap } = useCreateMap();
 * 
 * createMap({
 *   name: 'Mapa de Guatemala',
 *   description: 'Mapa base del país',
 *   mapType: 'terrain',
 * });
 * ```
 */
export const useCreateMap = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mapsService.createMap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maps.all });

      toast({
        title: 'Mapa creado',
        description: 'El mapa se ha creado exitosamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al crear mapa',
        description: error?.message || 'No se pudo crear el mapa',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para actualizar un mapa
 * 
 * PATCH /maps/:id
 * 
 * @example
 * ```tsx
 * const { mutate: updateMap } = useUpdateMap();
 * 
 * updateMap({
 *   id: 1,
 *   data: { name: 'Nuevo nombre', isDefault: true },
 * });
 * ```
 */
export const useUpdateMap = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMapDto }) =>
      mapsService.updateMap(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maps.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.maps.detail(variables.id) });

      toast({
        title: 'Mapa actualizado',
        description: 'Los cambios se han guardado exitosamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al actualizar mapa',
        description: error?.message || 'No se pudo actualizar el mapa',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para eliminar un mapa (soft delete)
 * 
 * DELETE /maps/:id
 * 
 * No se puede eliminar el mapa por defecto
 * 
 * @example
 * ```tsx
 * const { mutate: deleteMap } = useDeleteMap();
 * 
 * deleteMap(1);
 * ```
 */
export const useDeleteMap = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mapsService.deleteMap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maps.all });

      toast({
        title: 'Mapa eliminado',
        description: 'El mapa se ha eliminado exitosamente',
      });
    },
    onError: (error: any) => {
      const isDefaultMap = error?.statusCode === 400;
      
      toast({
        title: 'Error al eliminar mapa',
        description: isDefaultMap 
          ? 'No se puede eliminar el mapa por defecto'
          : error?.message || 'No se pudo eliminar el mapa',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para obtener todos los tipos de mapas disponibles
 * 
 * GET /map-types
 * 
 * @example
 * ```tsx
 * const { data: mapTypes, isLoading } = useMapTypes();
 * ```
 */
export const useMapTypes = () => {
  return useQuery({
    queryKey: queryKeys.maps.types,
    queryFn: () => mapsService.getMapTypes(),
    staleTime: 5 * 60 * 1000, // 5 minutos (los tipos de mapa no cambian frecuentemente)
  });
};

/**
 * Hook para obtener todos los mapas públicos (sin autenticación)
 * 
 * GET /maps/public/all
 * 
 * @example
 * ```tsx
 * const { data: publicMaps, isLoading } = usePublicMaps();
 * ```
 */
export const usePublicMaps = () => {
  return useQuery({
    queryKey: queryKeys.maps.public.all,
    queryFn: () => mapsService.getAllPublicMaps(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

/**
 * Hook para obtener un mapa público por ID (sin autenticación)
 * 
 * GET /maps/public/:id
 * 
 * @param id - ID del mapa público
 * 
 * @example
 * ```tsx
 * const { data: publicMap, isLoading } = usePublicMap(7);
 * ```
 */
export const usePublicMap = (id: number) => {
  return useQuery({
    queryKey: queryKeys.maps.public.detail(id),
    queryFn: () => mapsService.getPublicMapById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};
