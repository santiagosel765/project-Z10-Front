/**
 * Layer Loading Strategy
 * 
 * Determina la mejor estrategia para cargar capas según el número de features
 * Basado en las recomendaciones del backend para optimización de rendimiento
 */

import type { BBox } from '@/services/layers.service';
import { layersService } from '@/services/layers.service';

/**
 * Estrategia de carga de capas
 */
export type LoadingStrategy = 
  | 'geojson'     // < 5,000 features: Carga completa
  | 'bbox'        // 5,000 - 20,000 features: BBox con límite
  | 'tiles'       // 20,000 - 100,000 features: Vector Tiles (MVT)
  | 'tiles-only'; // > 100,000 features: SOLO Vector Tiles

/**
 * Umbral de features para cada estrategia
 */
const STRATEGY_THRESHOLDS = {
  GEOJSON: 10000,
  BBOX: 20000,
  TILES: 100000,
} as const;

/**
 * Determina la estrategia de carga óptima según el número de features
 * 
 * @param totalFeatures - Número total de features en la capa
 * @returns Estrategia recomendada
 */
export function getLoadingStrategy(totalFeatures: number): LoadingStrategy {
  if (totalFeatures < STRATEGY_THRESHOLDS.GEOJSON) {
    return 'geojson';
  } else if (totalFeatures < STRATEGY_THRESHOLDS.BBOX) {
    return 'bbox';
  } else if (totalFeatures < STRATEGY_THRESHOLDS.TILES) {
    return 'tiles';
  } else {
    return 'tiles-only';
  }
}

/**
 * Información de estrategia con mensajes para el usuario
 */
export interface StrategyInfo {
  strategy: LoadingStrategy;
  message: string;
  icon: string;
  color: string;
}

/**
 * Obtiene información descriptiva de la estrategia
 * 
 * @param totalFeatures - Número total de features
 * @returns Información de la estrategia con mensajes para UI
 */
export function getStrategyInfo(totalFeatures: number): StrategyInfo {
  const strategy = getLoadingStrategy(totalFeatures);
  
  const info: Record<LoadingStrategy, Omit<StrategyInfo, 'strategy'>> = {
    'geojson': {
      message: `Capa pequeña (${totalFeatures.toLocaleString()} features). Carga completa.`,
      icon: '📄',
      color: 'green',
    },
    'bbox': {
      message: `Capa mediana (${totalFeatures.toLocaleString()} features). Carga por viewport.`,
      icon: '📦',
      color: 'blue',
    },
    'tiles': {
      message: `Capa grande (${totalFeatures.toLocaleString()} features). Usando tiles vectoriales.`,
      icon: '🗺️',
      color: 'orange',
    },
    'tiles-only': {
      message: `Capa muy grande (${totalFeatures.toLocaleString()} features). Solo tiles vectoriales.`,
      icon: '⚡',
      color: 'red',
    },
  };
  
  return {
    strategy,
    ...info[strategy],
  };
}

/**
 * Manager de carga de capas con selección automática de estrategia
 */
export class LayerLoadingManager {
  private layerId: number;
  private totalFeatures: number;
  private strategy: LoadingStrategy;
  
  constructor(layerId: number, totalFeatures: number) {
    this.layerId = layerId;
    this.totalFeatures = totalFeatures;
    this.strategy = getLoadingStrategy(totalFeatures);
  }
  
  /**
   * Obtiene la estrategia actual
   */
  getStrategy(): LoadingStrategy {
    return this.strategy;
  }
  
  /**
   * Obtiene información de la estrategia
   */
  getInfo(): StrategyInfo {
    return getStrategyInfo(this.totalFeatures);
  }
  
  /**
   * Verifica si debe usar tiles
   */
  shouldUseTiles(): boolean {
    return this.strategy === 'tiles' || this.strategy === 'tiles-only';
  }
  
  /**
   * Verifica si debe usar clustering (para capas de puntos)
   */
  shouldUseCluster(): boolean {
    return this.totalFeatures >= STRATEGY_THRESHOLDS.GEOJSON;
  }
  
  /**
   * Obtiene la URL para tiles si aplica
   */
  getTileURL(): string | null {
    if (!this.shouldUseTiles()) return null;
    return layersService.getLayerTileURL(this.layerId);
  }
  
  /**
   * Carga la capa usando GeoJSON completo
   */
  async loadAsGeoJSON() {
    if (this.strategy !== 'geojson') {
      console.warn(
        `Layer ${this.layerId} tiene ${this.totalFeatures} features. ` +
        `Considera usar ${this.strategy} en lugar de GeoJSON completo.`
      );
    }
    return layersService.getLayerGeoJSON(this.layerId);
  }
  
  /**
   * Carga la capa usando BBox con límite
   */
  async loadByBBox(bbox: BBox, maxFeatures: number = 5000, simplify: boolean = true) {
    return layersService.getLayerFeaturesInBBox(
      this.layerId,
      bbox,
      maxFeatures,
      simplify
    );
  }
  
  /**
   * Obtiene clusters para capas de puntos
   */
  async loadClusters(bbox: BBox, zoom: number) {
    return layersService.getLayerClusters(this.layerId, bbox, zoom);
  }
  
  /**
   * Carga la capa usando la estrategia recomendada automáticamente
   * 
   * @param bbox - Bounding box del viewport (requerido para bbox/clusters)
   * @param zoom - Nivel de zoom (requerido para clusters)
   * @returns GeoJSON data o null si debe usar tiles
   */
  async loadWithRecommendedStrategy(bbox?: BBox, zoom?: number) {
    switch (this.strategy) {
      case 'geojson':
        return this.loadAsGeoJSON();
        
      case 'bbox':
        if (!bbox) {
          throw new Error('BBox is required for bbox strategy');
        }
        return this.loadByBBox(bbox);
        
      case 'tiles':
      case 'tiles-only':
        // Para tiles, retornar la URL en lugar de datos
        return {
          useTiles: true,
          tileURL: this.getTileURL(),
          message: 'Use Vector Tiles para esta capa',
        };
        
      default:
        throw new Error(`Unknown strategy: ${this.strategy}`);
    }
  }
}

/**
 * Crea un manager de carga para una capa
 * 
 * @param layerId - ID de la capa
 * @param totalFeatures - Número total de features
 * @returns LayerLoadingManager instance
 */
export function createLayerLoadingManager(
  layerId: number,
  totalFeatures: number
): LayerLoadingManager {
  return new LayerLoadingManager(layerId, totalFeatures);
}

/**
 * Utilidad para mostrar un mensaje al usuario cuando se limitan features
 * 
 * @param metadata - Metadata de respuesta GeoJSON con límites
 * @returns Mensaje formateado para mostrar al usuario o null
 */
export function getLimitedFeaturesMessage(metadata?: {
  totalInBounds: number;
  returned: number;
  limited: boolean;
  message?: string;
}): string | null {
  if (!metadata || !metadata.limited) return null;
  
  return metadata.message || 
    `Mostrando ${metadata.returned.toLocaleString()} de ${metadata.totalInBounds.toLocaleString()} features. Haz zoom para ver más detalles.`;
}
