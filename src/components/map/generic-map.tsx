"use client";

import { useState, useEffect } from "react";
import type { Map, MapDetail, PublicMap } from "@/services/maps.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import ArcGISWebMap from "@/components/arcgis/arcgis-webmap";
import { LeafletMap } from "@/components/map/leaflet-map";

interface GenericMapProps {
  map: Map | MapDetail | PublicMap;

  layerIds?: number[];

  height?: string;

  className?: string;

  showLayersControl?: boolean;

  layerVisibilityOverrides?: Record<number, boolean>;

  layerOpacityOverrides?: Record<number, number>;

  customGeoJSON?: any;

  customGeoJSONStyle?: any;

  filterBBox?: any;

  filteredGeoJSON?: any;

  onMapLoad?: () => void;

  onError?: (error: Error) => void;
}

/**
 * Componente GenericMap
 *
 * Renderiza el mapa apropiado basado en webmapItemId y mapType:
 * - Si webmapItemId existe y no está vacío → Usa ArcGISWebMap
 * - Si webmapItemId es null/vacío → Usa LeafletMap (mapa general)
 * - Fallback: Si mapType.code incluye "arcgis" → ArcGIS, sino → Leaflet
 *
 * Esta lógica permite flexibilidad para mapas embedidos públicos donde
 * el webmapItemId determina si se usa ArcGIS o un mapa opensource.
 *
 * Soporta capas, settings personalizados y estilos
 */
export function GenericMap({
  map,
  layerIds = [],
  height = "600px",
  className = "",
  showLayersControl = true,
  layerVisibilityOverrides,
  layerOpacityOverrides,
  customGeoJSON,
  customGeoJSONStyle,
  filterBBox,
  filteredGeoJSON,
  onMapLoad,
  onError,
}: GenericMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const mapType = map.mapType;
  const hasWebmapItemId = !!(map.webmapItemId && map.webmapItemId.trim());

  const isArcGIS =
    hasWebmapItemId || mapType?.code.toLowerCase().includes("arcgis") || false;


  useEffect(() => {
    if (isArcGIS && !hasWebmapItemId) {
      const error = "Los mapas ArcGIS requieren un webmapItemId válido";
      setMapError(error);
      onError?.(new Error(error));
    } else if (
      mapError === "Los mapas ArcGIS requieren un webmapItemId válido"
    ) {
      setMapError(null);
    }
  }, [isArcGIS, hasWebmapItemId, onError, mapError]);

  const { zoom, center, basemap } = map.settings;

  if (!isClient ) {
    return (
      <div className={`w-full ${className}`} style={{ height }}>
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (mapError) {
    return (
      <div
        className={`w-full flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{mapError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isArcGIS) {
    const webmapItemId = map.webmapItemId?.trim();
    return (
      <div className={`w-full ${className}`} style={{ height }}>
        <ArcGISWebMap
          mapId={map.id}
          webmapItemId={webmapItemId}
          basemap={basemap}
          center={center}
          zoom={zoom}
          mapData={map}
          widgets={{
            bookmarks: true,
            basemapGallery: true,
            layerList: true, 
          }}
          onMapLoad={onMapLoad}
          onError={onError}
        />
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <LeafletMap
        mapId={map.id}
        mapData={map}
        initialZoom={zoom}
        initialCenter={[center[1], center[0]]}
        basemap={basemap}
        showLayersControl={showLayersControl}
        layerVisibilityOverrides={layerVisibilityOverrides}
        layerOpacityOverrides={layerOpacityOverrides}
        customGeoJSON={customGeoJSON}
        customGeoJSONStyle={customGeoJSONStyle}
        filterBBox={filterBBox}
        filteredGeoJSONProp={filteredGeoJSON}
        onMapLoad={onMapLoad}
      />
      
    </div>
  );
}
