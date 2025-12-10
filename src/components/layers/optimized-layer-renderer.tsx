/**
 * Componente optimizado para renderizar capas grandes con Leaflet
 * 
 * Usa estrategia automática según el número de features:
 * - < 5k: GeoJSON completo
 * - 5k-20k: BBox con límite
 * - 20k-100k: Vector Tiles
 * - > 100k: Solo Vector Tiles
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useLayerLoading, useLayerStrategy } from '@/hooks/use-layer-loading';
import type { BBox } from '@/services/layers.service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, Loader2 } from 'lucide-react';

interface OptimizedLayerRendererProps {
  /**
   * Instancia del mapa de Leaflet
   */
  map: L.Map | null;
  
  /**
   * ID de la capa a renderizar
   */
  layerId: number;
  
  /**
   * Número total de features en la capa
   */
  totalFeatures: number;
  
  /**
   * Tipo de geometría de la capa
   */
  layerType: 'point' | 'linestring' | 'polygon' | 'multipoint' | 'multilinestring' | 'multipolygon' | 'mixed';
  
  /**
   * Estilo para la capa
   */
  style?: L.PathOptions;
  
  /**
   * Callback cuando se hace click en un feature
   */
  onFeatureClick?: (properties: any) => void;
  
  /**
   * Visibilidad de la capa
   */
  visible?: boolean;
  
  /**
   * Opacidad de la capa (0-1)
   */
  opacity?: number;
}

/**
 * Componente que renderiza capas de forma optimizada según su tamaño
 * 
 * Para capas grandes (>20k features), automáticamente usa Vector Tiles.
 * Para capas medianas, carga solo features visibles en el viewport.
 * Para capas pequeñas, carga todo el GeoJSON.
 * 
 * @example
 * ```tsx
 * <OptimizedLayerRenderer
 *   map={mapInstance}
 *   layerId={123}
 *   totalFeatures={50000}
 *   layerType="polygon"
 *   style={{ color: '#3388ff', fillOpacity: 0.5 }}
 *   visible={true}
 *   opacity={0.8}
 * />
 * ```
 */
export function OptimizedLayerRenderer({
  map,
  layerId,
  totalFeatures,
  layerType,
  style = {},
  onFeatureClick,
  visible = true,
  opacity = 1,
}: OptimizedLayerRendererProps) {
  const layerRef = useRef<L.GeoJSON | L.TileLayer | null>(null);
  const [bbox, setBBox] = useState<BBox | undefined>();
  const [zoom, setZoom] = useState<number>(10);
  
  const strategyInfo = useLayerStrategy(totalFeatures);
  
  const {
    data,
    isLoading,
    error,
    useTiles,
    tileURL,
    userMessage,
    strategy,
  } = useLayerLoading({
    layerId,
    totalFeatures,
    bbox,
    zoom,
    enabled: !!map && visible,
  });
  
  useEffect(() => {
    if (!map) return;
    
    const updateViewport = () => {
      const bounds = map.getBounds();
      setBBox({
        minLon: bounds.getWest(),
        minLat: bounds.getSouth(),
        maxLon: bounds.getEast(),
        maxLat: bounds.getNorth(),
      });
      setZoom(map.getZoom());
    };
    
    updateViewport();
    map.on('moveend', updateViewport);
    
    return () => {
      map.off('moveend', updateViewport);
    };
  }, [map]);
  
  useEffect(() => {
    if (!map || !visible) {
      if (layerRef.current) {
        map?.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }
    
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    
    if (useTiles && tileURL) {
      console.info(`Use Vector Tiles for layer ${layerId}: ${tileURL}`);
      console.info('Install: npm install leaflet.vectorgrid');
      console.info('Docs: https://github.com/Leaflet/Leaflet.VectorGrid');
      
      /*
      import 'leaflet.vectorgrid';
      
      const vectorTileLayer = (L as any).vectorGrid.protobuf(tileURL, {
        vectorTileLayerStyles: {
          layer: {
            ...style,
            weight: style.weight || 2,
            opacity: opacity,
            fillOpacity: style.fillOpacity ? style.fillOpacity * opacity : 0.5 * opacity,
          }
        },
        interactive: true,
        getFeatureId: (f: any) => f.properties.id,
      });
      
      vectorTileLayer.on('click', (e: any) => {
        if (onFeatureClick && e.layer.properties) {
          onFeatureClick(e.layer.properties);
        }
      });
      
      vectorTileLayer.addTo(map);
      layerRef.current = vectorTileLayer;
      */
      
      return;
    }
    
    if (data) {
      const geoJsonLayer = L.geoJSON(data, {
        style: () => ({
          ...style,
          opacity: opacity,
          fillOpacity: style.fillOpacity ? style.fillOpacity * opacity : 0.5 * opacity,
        }),
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 6,
            ...style,
            opacity: opacity,
            fillOpacity: style.fillOpacity ? style.fillOpacity * opacity : 0.7 * opacity,
          });
        },
        onEachFeature: (feature, layer) => {
          if (onFeatureClick) {
            layer.on('click', () => {
              onFeatureClick(feature.properties);
            });
          }
          
          if (feature.properties) {
            const popupContent = Object.entries(feature.properties)
              .slice(0, 5)
              .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
              .join('<br>');
            layer.bindPopup(popupContent);
          }
        },
      });
      
      geoJsonLayer.addTo(map);
      layerRef.current = geoJsonLayer;
    }
    
    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, data, useTiles, tileURL, visible, opacity, style, onFeatureClick, layerId]);
  
  useEffect(() => {
    if (!layerRef.current || !visible) return;
    
    if (layerRef.current instanceof L.GeoJSON) {
      layerRef.current.setStyle({
        opacity: opacity,
        fillOpacity: style.fillOpacity ? style.fillOpacity * opacity : 0.5 * opacity,
      });
    }
  }, [opacity, visible, style.fillOpacity]);
  
  if (!map) return null;
  
  return (
    <div className="absolute top-4 right-4 z-[1000] max-w-sm space-y-2">
      {/* Badge de estrategia */}
      <Badge 
        variant="secondary" 
        className="bg-background/90 backdrop-blur-sm"
      >
        {strategyInfo.icon} {strategy.toUpperCase()}
      </Badge>
      
      {/* Loading */}
      {isLoading && visible && (
        <Alert className="bg-background/90 backdrop-blur-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Cargando capa ({totalFeatures.toLocaleString()} features)...
          </AlertDescription>
        </Alert>
      )}
      
      {/* Error */}
      {error && (
        <Alert variant="destructive" className="bg-background/90 backdrop-blur-sm">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Error al cargar capa: {error.message}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Mensaje de features limitadas */}
      {userMessage && (
        <Alert className="bg-blue-500/10 border-blue-500/50 backdrop-blur-sm">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            {userMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Mensaje de tiles */}
      {useTiles && (
        <Alert className="bg-orange-500/10 border-orange-500/50 backdrop-blur-sm">
          <Info className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-700">
            <div>
              <strong>Capa muy grande.</strong>
              <br />
              Requiere Vector Tiles (leaflet.vectorgrid)
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Hook simplificado para obtener el bbox del mapa
 */
export function useMapBounds(map: L.Map | null): BBox | null {
  const [bbox, setBBox] = useState<BBox | null>(null);
  
  useEffect(() => {
    if (!map) return;
    
    const updateBounds = () => {
      const bounds = map.getBounds();
      setBBox({
        minLon: bounds.getWest(),
        minLat: bounds.getSouth(),
        maxLon: bounds.getEast(),
        maxLat: bounds.getNorth(),
      });
    };
    
    updateBounds();
    map.on('moveend', updateBounds);
    
    return () => {
      map.off('moveend', updateBounds);
    };
  }, [map]);
  
  return bbox;
}
