/**
 * Hook para cargar capas con estrategia automática
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { BBox } from '@/services/layers.service';
import {
  LayerLoadingManager,
  createLayerLoadingManager,
  getStrategyInfo,
  getLimitedFeaturesMessage,
  type LoadingStrategy,
} from '@/lib/layer-loading-strategy';
import { queryKeys } from '@/lib/react-query';

interface UseLayerLoadingOptions {
  /**
   * ID de la capa a cargar
   */
  layerId: number;
  
  /**
   * Número total de features en la capa
   */
  totalFeatures: number;
  
  /**
   * Bounding box del viewport (requerido para bbox/clusters)
   */
  bbox?: BBox;
  
  /**
   * Nivel de zoom actual (requerido para clusters)
   */
  zoom?: number;
  
  /**
   * Máximo de features para estrategia bbox
   */
  maxFeatures?: number;
  
  /**
   * Simplificar geometrías en estrategia bbox
   */
  simplify?: boolean;
  
  /**
   * Habilitar la carga automática
   */
  enabled?: boolean;
}

interface UseLayerLoadingResult {
  /**
   * Datos GeoJSON de la capa
   */
  data: any;
  
  /**
   * Estado de carga
   */
  isLoading: boolean;
  
  /**
   * Error si ocurre
   */
  error: Error | null;
  
  /**
   * Estrategia de carga utilizada
   */
  strategy: LoadingStrategy;
  
  /**
   * URL de tiles si se usa estrategia de tiles
   */
  tileURL: string | null;
  
  /**
   * Indica si se debe usar tiles en lugar de GeoJSON
   */
  useTiles: boolean;
  
  /**
   * Mensaje para mostrar al usuario (ej: features limitadas)
   */
  userMessage: string | null;
  
  /**
   * Información de la estrategia
   */
  strategyInfo: ReturnType<typeof getStrategyInfo>;
  
  /**
   * Manager de carga
   */
  manager: LayerLoadingManager;
  
  /**
   * Función para recargar la capa
   */
  refetch: () => void;
}

/**
 * Hook para cargar capas con selección automática de estrategia
 * 
 * Determina automáticamente si usar GeoJSON completo, BBox, o Tiles
 * según el número de features.
 * 
 * @example
 * ```tsx
 * const { data, useTiles, tileURL, isLoading, userMessage } = useLayerLoading({
 *   layerId: 123,
 *   totalFeatures: 50000,
 *   bbox: { minLon: -91, minLat: 14, maxLon: -90, maxLat: 15 },
 *   zoom: 10,
 * });
 * 
 * if (useTiles) {
 *   // Usar tiles vectoriales con Mapbox GL o Leaflet VectorGrid
 *   return <VectorTileLayer url={tileURL} />;
 * } else {
 *   // Usar GeoJSON tradicional
 *   return <GeoJSONLayer data={data} />;
 * }
 * ```
 */
export function useLayerLoading(options: UseLayerLoadingOptions): UseLayerLoadingResult {
  const {
    layerId,
    totalFeatures,
    bbox,
    zoom,
    maxFeatures = 5000,
    simplify = true,
    enabled = true,
  } = options;
  
  const [userMessage, setUserMessage] = useState<string | null>(null);
  
  // Crear manager de carga
  const manager = useMemo(
    () => createLayerLoadingManager(layerId, totalFeatures),
    [layerId, totalFeatures]
  );
  
  const strategy = manager.getStrategy();
  const strategyInfo = manager.getInfo();
  const useTiles = manager.shouldUseTiles();
  const tileURL = manager.getTileURL();
  
  // Query para cargar datos (solo si no usa tiles)
  const { data, isLoading, error, refetch } = useQuery(
    ['layer-loading', layerId, strategy, bbox, zoom, maxFeatures, simplify],
    async () => {
      if (useTiles) {
        // No cargar datos si usa tiles
        return null;
      }
      
      const result = await manager.loadWithRecommendedStrategy(bbox, zoom);
      
      // Verificar si hay metadata de límites
      if (result && typeof result === 'object' && 'metadata' in result) {
        const message = getLimitedFeaturesMessage(result.metadata as any);
        setUserMessage(message);
      }
      
      return result;
    },
    {
      enabled: enabled && !useTiles,
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos (v4 usa cacheTime en lugar de gcTime)
    }
  );
  
  // Limpiar mensaje cuando cambie la vista
  useEffect(() => {
    setUserMessage(null);
  }, [bbox, zoom]);
  
  return {
    data,
    isLoading,
    error: error as Error | null,
    strategy,
    tileURL,
    useTiles,
    userMessage,
    strategyInfo,
    manager,
    refetch,
  };
}

/**
 * Hook para cargar clusters de una capa de puntos
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useLayerClusters({
 *   layerId: 123,
 *   bbox: { minLon: -91, minLat: 14, maxLon: -90, maxLat: 15 },
 *   zoom: 10,
 * });
 * ```
 */
export function useLayerClusters(options: {
  layerId: number;
  bbox: BBox;
  zoom: number;
  enabled?: boolean;
}) {
  const { layerId, bbox, zoom, enabled = true } = options;
  
  return useQuery(
    ['layer-clusters', layerId, bbox, zoom],
    async () => {
      const manager = createLayerLoadingManager(layerId, 0); // totalFeatures no importa para clusters
      return manager.loadClusters(bbox, zoom);
    },
    {
      enabled,
      staleTime: 2 * 60 * 1000, // 2 minutos
      cacheTime: 5 * 60 * 1000, // 5 minutos
    }
  );
}

/**
 * Hook para obtener solo la información de estrategia sin cargar datos
 * 
 * Útil para mostrar badges o información en UI antes de cargar
 * 
 * @example
 * ```tsx
 * const { strategy, message, icon } = useLayerStrategy(50000);
 * return <Badge>{icon} {message}</Badge>;
 * ```
 */
export function useLayerStrategy(totalFeatures: number) {
  return useMemo(() => getStrategyInfo(totalFeatures), [totalFeatures]);
}
