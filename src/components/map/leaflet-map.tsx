"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Map, MapDetail, PublicMap } from "@/services/maps.service";
import type { BBox } from "@/services/layers.service";
import { Button } from "@/components/ui/button";
import { Layers, Eye, EyeOff, Info, Map as MapIcon, Bookmark, Loader2, Filter, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { LayerDataProvider } from "./layer-data-provider";
import { FeatureFilterPanel } from "@/components/layers/feature-filter-panel";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const BASEMAPS: Record<string, { url: string; attribution: string }> = {
  "streets-vector": {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
  "topo-vector": {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
};

const GUATEMALA_DEPARTMENTS = [
  { name: "Guatemala", center: [14.6349, -90.5069] as [number, number], zoom: 14},
  { name: "Alta Verapaz", center: [15.5667, -90.3333] as [number, number], zoom:15},
  { name: "Baja Verapaz", center: [15.1667, -90.3167] as [number, number], zoom:15},
  { name: "Chimaltenango", center: [14.6631, -90.8192] as [number, number], zoom: 15},
  { name: "Chiquimula", center: [14.8000, -89.5333] as [number, number], zoom:16},
  { name: "El Progreso", center: [14.8500, -90.0667] as [number, number], zoom: 16},
  { name: "Escuintla", center: [14.3053, -90.7850] as [number, number], zoom:16},
  { name: "Huehuetenango", center: [15.3197, -91.4711] as [number, number], zoom:14},
  { name: "Izabal", center: [15.5333, -88.7500] as [number, number], zoom:16},
  { name: "Jalapa", center: [14.6333, -89.9833] as [number, number], zoom: 16},
  { name: "Jutiapa", center: [14.2667, -89.8833] as [number, number], zoom:16},
  { name: "Petén", center: [16.9167, -90.0833] as [number, number], zoom:14},
  { name: "Quetzaltenango", center: [14.8333, -91.5167] as [number, number], zoom:16},
  { name: "Quiché", center: [15.0333, -91.1500] as [number, number], zoom:16},
  { name: "Retalhuleu", center: [14.5333, -91.6833] as [number, number], zoom: 16},
  { name: "Sacatepéquez", center: [14.5589, -90.7350] as [number, number], zoom: 16},
  { name: "San Marcos", center: [14.9667, -91.7833] as [number, number], zoom:16},
  { name: "Santa Rosa", center: [14.3333, -90.3000] as [number, number], zoom:16},
  { name: "Sololá", center: [14.7722, -91.1853] as [number, number], zoom:16},
  { name: "Suchitepéquez", center: [14.4000, -91.4167] as [number, number], zoom:16},
  { name: "Totonicapán", center: [14.9167, -91.3611] as [number, number], zoom: 16},
  { name: "Zacapa", center: [14.9667, -89.5333] as [number, number], zoom:16},
];

function MapInvalidator({ onMapReady }: { onMapReady?: (map: L.Map) => void }) {
  const map = useMap();
  const readyCalledRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      if (!readyCalledRef.current) {
        onMapReady?.(map);
        readyCalledRef.current = true;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

function layerStyleToLeaflet(style?: any, opacity: number = 1): L.PathOptions {
  if (!style) {
    return {
      color: "#3388ff",
      weight: 2,
      opacity: 0.8 * opacity,
      fillColor: "#3388ff",
      fillOpacity: 0.4 * opacity,
    };
  }

  return {
    color: style.color || "#3388ff",
    weight: style.weight || 2,
    opacity: (style.opacity !== undefined ? style.opacity : 0.8) * opacity,
    fillColor: style.fillColor || style.color || "#3388ff",
    fillOpacity: (style.fillOpacity !== undefined ? style.fillOpacity : 0.4) * opacity,
  };
}

function createCustomIcon(style?: any): L.Icon | L.DivIcon {
  if (style?.iconUrl) {
    return L.icon({
      iconUrl: style.iconUrl,
      iconSize: style.iconSize || [25, 41],
      iconAnchor: style.iconAnchor || [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      shadowSize: [41, 41],
    });
  }

  const color = style?.color || "#3388ff";
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    className: "custom-div-icon",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
}

function createPopupContent(properties: Record<string, any>): string {
  if (!properties || Object.keys(properties).length === 0) {
    return "<p>Sin datos</p>";
  }

  let content = '<div class="leaflet-popup-content-custom">';
  for (const [key, value] of Object.entries(properties)) {
    if (key.toLowerCase() === "geom" || key.toLowerCase() === "geometry") continue;
    content += `<div class="popup-row"><strong>${key}:</strong> ${value || "N/A"}</div>`;
  }
  content += "</div>";
  return content;
}

interface LeafletMapProps {
  mapId: number;
  mapData?: Map | MapDetail | PublicMap;
  layerIds?: number[];
  initialZoom?: number;
  initialCenter?: [number, number];
  basemap?: string;
  showLayersControl?: boolean;
  layerVisibilityOverrides?: Record<number, boolean>;
  layerOpacityOverrides?: Record<number, number>;
  onMapLoad?: () => void;
  onError?: (error: Error) => void;
  
  // Feature Filtering props
  showFeatureFilter?: boolean;
  featureFilterLayerId?: number;
  featureFilterLayerIds?: number[];
  featureFilterMultiLayer?: boolean;
  customGeoJSON?: any;
  customGeoJSONStyle?: L.PathOptions | ((feature?: any) => L.PathOptions);
  onFilteredFeaturesChange?: (geojson: any) => void;
  filterBBox?: any;
  filteredGeoJSONProp?: any;
}

interface LayerState {
  id: number;
  visible: boolean;
  opacity: number;
  geojsonData: any;
  layerInfo: any;
  loading: boolean;
  strategy?: 'bbox' | 'geojson' | 'tiles' | 'intersect';
  useTiles?: boolean;
  tileURL?: string;
  limitedMessage?: string | null;
}

export function LeafletMap({
  mapId,
  mapData,
  layerIds = [],
  initialZoom = 7,
  initialCenter = [15.7835, -90.2308],
  basemap = "streets-vector",
  showLayersControl = true,
  layerVisibilityOverrides,
  layerOpacityOverrides,
  onMapLoad,
  onError,
  showFeatureFilter = false,
  featureFilterLayerId,
  featureFilterLayerIds,
  featureFilterMultiLayer = false,
  customGeoJSON,
  customGeoJSONStyle,
  onFilteredFeaturesChange,
  filterBBox,
  filteredGeoJSONProp,
}: LeafletMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showBookmarksPanel, setShowBookmarksPanel] = useState(false);
  const [showFeatureFilterPanel, setShowFeatureFilterPanel] = useState(false);
  const [filteredGeoJSON, setFilteredGeoJSON] = useState<any>(customGeoJSON || null);
  const [layers, setLayers] = useState<LayerState[]>([]);
  const [isLoadingLayers, setIsLoadingLayers] = useState(false);
  const [currentBasemap, setCurrentBasemap] = useState(basemap);
  const [currentBBox, setCurrentBBox] = useState<BBox | null>(null);
  const [currentZoom, setCurrentZoom] = useState(initialZoom);
  const mapRef = useRef<L.Map | null>(null);
  const layersInitializedRef = useRef(false);
  const mapDataIdRef = useRef<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sincronizar customGeoJSON externo con estado interno
  useEffect(() => {
    if (customGeoJSON) {
      setFilteredGeoJSON(customGeoJSON);
    }
  }, [customGeoJSON]);

  // Callback para manejar features filtradas desde el panel
  const handleFilteredFeaturesLoaded = useCallback((geojson: any) => {
    setFilteredGeoJSON(geojson);
    onFilteredFeaturesChange?.(geojson);
  }, [onFilteredFeaturesChange]);

  const handleMapReady = useRef<((map: L.Map) => void) | null>(null);
  
  if (!handleMapReady.current) {
    handleMapReady.current = (map: L.Map) => {
      if (mapRef.current) return;
      
      mapRef.current = map;
      
      const bounds = map.getBounds();
      setCurrentBBox({
        minLon: bounds.getWest(),
        minLat: bounds.getSouth(),
        maxLon: bounds.getEast(),
        maxLat: bounds.getNorth(),
      });
      setCurrentZoom(map.getZoom());

      map.on('moveend', () => {
        const newBounds = map.getBounds();
        setCurrentBBox({
          minLon: newBounds.getWest(),
          minLat: newBounds.getSouth(),
          maxLon: newBounds.getEast(),
          maxLat: newBounds.getNorth(),
        });
        setCurrentZoom(map.getZoom());
      });
    };
  }

  const handleLayerDataLoaded = useCallback((data: {
    layerId: number;
    geojsonData: any;
    limitedMessage: string | null;
    loading: boolean;
    layerInfo?: any;
    strategy?: 'bbox' | 'geojson' | 'intersect';
  }) => {
    setLayers(prev => prev.map(l => {
      if (l.id !== data.layerId) return l;
      
      let mergedGeoJSON = data.geojsonData;
      
      if (data.strategy === 'bbox' && data.geojsonData && l.geojsonData) {
        const existingFeatures = l.geojsonData.features || [];
        const newFeatures = data.geojsonData.features || [];
        
        const featureMap = new Map();
        existingFeatures.forEach((f: any) => {
          const id = f.id || JSON.stringify(f.geometry);
          featureMap.set(id, f);
        });
        
        newFeatures.forEach((f: any) => {
          const id = f.id || JSON.stringify(f.geometry);
          featureMap.set(id, f);
        });
        
        mergedGeoJSON = {
          type: 'FeatureCollection',
          features: Array.from(featureMap.values()),
        };
      }
      
      return {
        ...l,
        geojsonData: mergedGeoJSON,
        limitedMessage: data.limitedMessage,
        loading: data.loading,
        layerInfo: data.layerInfo || l.layerInfo,
        strategy: data.strategy || l.strategy,
      };
    }));
  }, []);

  useEffect(() => {
    if (!mapData) return;
    
    if (layersInitializedRef.current && mapDataIdRef.current === mapData.id) return;
    
    if (!('mapLayers' in mapData) || !mapData.mapLayers || mapData.mapLayers.length === 0) {
      if (!layersInitializedRef.current) {
        layersInitializedRef.current = true;
        mapDataIdRef.current = mapData.id;
        setIsLoadingLayers(false);
      }
      return;
    }

    layersInitializedRef.current = true;
    mapDataIdRef.current = mapData.id;
    setIsLoadingLayers(true);

    const initializedLayers: LayerState[] = mapData.mapLayers.map(mapLayer => ({
      id: mapLayer.layerId,
      visible: false,
      opacity: parseFloat(mapLayer.opacity),
      geojsonData: null,
      layerInfo: mapLayer.layer,
      loading: false,
      strategy: undefined,
      useTiles: false,
      limitedMessage: null,
    }));

    setLayers(initializedLayers);
    setIsLoadingLayers(false);
  }, [mapData]);

  useEffect(() => {
    if (mapRef.current && !isLoadingLayers && layers.length >= 0) {
      onMapLoad?.();
    }
  }, [isLoadingLayers, onMapLoad, layers.length]);

  const toggleLayerVisibility = (layerId: number) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const toggleAllLayers = () => {
    const allVisible = layers.every(layer => layer.visible);
    setLayers(prev => prev.map(layer => ({ ...layer, visible: !allVisible })));
  };

  const flyToDepartment = (center: [number, number], zoom: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.25
      });
      setShowBookmarksPanel(false);
    }
  };

  const updateLayerOpacity = (layerId: number, opacity: number) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, opacity } : layer
    ));
  };

  if (!isClient) {
    return null;
  }

  const basemapConfig = BASEMAPS[currentBasemap] || BASEMAPS["streets-vector"];

  return (
    <div className="relative w-full h-full">
      {layers.map(layer => {
        const effectiveVisible = layerVisibilityOverrides?.[layer.id] ?? layer.visible;
        return (
          <LayerDataProvider
            key={layer.id}
            layerId={layer.id}
            isVisible={effectiveVisible}
            bbox={currentBBox || undefined}
            filterBBox={filterBBox}
            filteredGeoJSON={filteredGeoJSONProp}
            onDataLoaded={handleLayerDataLoaded}
          />
        );
      })}

      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: "100%", width: "100%" }}
      >
        <MapInvalidator onMapReady={handleMapReady.current || undefined} />

        <TileLayer key={currentBasemap} url={basemapConfig.url} attribution={basemapConfig.attribution} />

        {layers.map((layer) => {
          const effectiveVisible = layerVisibilityOverrides?.[layer.id] ?? layer.visible;
          const effectiveOpacity = layerOpacityOverrides?.[layer.id] ?? layer.opacity;
          return effectiveVisible && !layer.loading && layer.geojsonData && (
            <LayerGeoJSON 
              key={`${layer.id}-${effectiveOpacity}-${effectiveVisible}`}
              layerState={{ ...layer, visible: effectiveVisible, opacity: effectiveOpacity }}
            />
          );
        })}

        {/* GeoJSON Personalizado desde Filtros */}
        {filteredGeoJSON && (
          <GeoJSON
            key={`filtered-${Date.now()}`}
            data={filteredGeoJSON.data || filteredGeoJSON}
            style={(feature) => {
              if (typeof customGeoJSONStyle === 'function') {
                return customGeoJSONStyle(feature);
              }
              return customGeoJSONStyle || {
                color: "#0ea5e9",
                weight: 3,
                opacity: 0.9,
                fillColor: "#0ea5e9",
                fillOpacity: 0.3,
              };
            }}
            onEachFeature={(feature, leafletLayer) => {
              if (feature.properties) {
                const popupContent = createPopupContent(feature.properties);
                leafletLayer.bindPopup(popupContent);
              }
            }}
          />
        )}
      </MapContainer>

      <div className="absolute top-4 left-4 z-[1000] space-y-2 max-w-sm">
        {layers.filter(l => l.loading).length > 0 && (
          <div className="bg-sky-500 border-2 border-sky-600 rounded-lg shadow-2xl p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
              <div>
                <div className="text-white font-bold text-base">
                  Cargando {layers.filter(l => l.loading).length} {layers.filter(l => l.loading).length === 1 ? 'capa' : 'capas'}...
                </div>
                <div className="text-sky-100 text-xs mt-1">
                  {layers.filter(l => l.loading).map((layer, idx) => (
                    <span key={layer.id}>
                      {idx > 0 && ', '}{layer.layerInfo.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {layers.filter(l => l.visible && l.limitedMessage).map(layer => (
          <Alert 
            key={`alert-${layer.id}`}
            className="bg-blue-500/10 border-blue-500/50 backdrop-blur-sm"
          >
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              <div>
                <strong>{layer.layerInfo.name}</strong>
                <br />
                <span className="text-xs">{layer.limitedMessage}</span>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </div>

      <div className="absolute top-4 right-4 z-[1000] flex gap-2">
        <div className="bg-white rounded-lg shadow-lg p-1 flex gap-1">
          <Button
            onClick={() => setCurrentBasemap("streets")}
            size="sm"
            variant={currentBasemap === "streets" ? "default" : "ghost"}
            className={`h-9 w-9 p-0 ${currentBasemap === "streets" ? "" : "hover:bg-gray-100 text-gray-700"}`}
            title="Vista de Calle"
          >
            <MapIcon className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setCurrentBasemap("satellite")}
            size="sm"
            variant={currentBasemap === "satellite" ? "default" : "ghost"}
            className={`h-9 w-9 p-0 ${currentBasemap === "satellite" ? "" : "hover:bg-gray-100 text-gray-700"}`}
            title="Vista Satelital"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-[1000] flex gap-2">
        <div className="bg-white rounded-lg shadow-lg p-1 flex gap-1">
          <Button
            onClick={() => setCurrentBasemap("streets")}
            size="sm"
            variant={currentBasemap === "streets" ? "default" : "ghost"}
            className={`h-9 w-9 p-0 ${currentBasemap === "streets" ? "" : "hover:bg-gray-100 text-gray-700"}`}
            title="Vista de Calle"
          >
            <MapIcon className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setCurrentBasemap("satellite")}
            size="sm"
            variant={currentBasemap === "satellite" ? "default" : "ghost"}
            className={`h-9 w-9 p-0 ${currentBasemap === "satellite" ? "" : "hover:bg-gray-100 text-gray-700"}`}
            title="Vista Satelital"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </Button>
        </div>
      </div>

      <Button
        size="sm"
        variant="secondary"
        className="absolute bottom-4 left-4 z-[1000] shadow-lg"
        onClick={() => setShowBookmarksPanel(!showBookmarksPanel)}
      >
        <Bookmark className="h-4 w-4 mr-2" />
        Departamentos
      </Button>

      {showBookmarksPanel && (
        <div className="absolute bottom-16 left-4 z-[1000] bg-white rounded-lg shadow-xl border p-3 max-w-xs w-72 max-h-[500px] overflow-y-auto">
          <h3 className="font-semibold text-sm mb-3">Ir a Departamento</h3>
          <div className="grid grid-cols-2 gap-2">
            {GUATEMALA_DEPARTMENTS.map((dept) => (
              <Button
                key={dept.name}
                size="sm"
                variant="outline"
                onClick={() => flyToDepartment(dept.center, dept.zoom)}
                className="h-8 text-xs justify-start"
              >
                {dept.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {showFeatureFilter && featureFilterLayerId && (
        <>
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-16 right-4 z-[1000] shadow-lg"
            onClick={() => setShowFeatureFilterPanel(!showFeatureFilterPanel)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrar Features
            {filteredGeoJSON?.data?.metadata?.totalFeatures && (
              <Badge variant="outline" className="ml-2">
                {filteredGeoJSON.data.metadata.totalFeatures}
              </Badge>
            )}
          </Button>

          {showFeatureFilterPanel && (
            <div className="absolute top-28 right-4 z-[1000] bg-white rounded-lg shadow-xl border max-w-md w-96 max-h-[600px] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-3 border-b bg-gray-50">
                <h3 className="font-semibold text-sm">Filtrado de Features</h3>
                <div className="flex gap-2">
                  {filteredGeoJSON && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setFilteredGeoJSON(null);
                        onFilteredFeaturesChange?.(null);
                      }}
                      className="h-7 px-2"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Limpiar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowFeatureFilterPanel(false)}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <FeatureFilterPanel
                  layerId={featureFilterLayerId}
                  multiLayerMode={featureFilterMultiLayer}
                  layerIds={featureFilterLayerIds}
                  onFeaturesLoaded={handleFilteredFeaturesLoaded}
                />
              </div>
            </div>
          )}
        </>
      )}

      {showLayersControl && layers.length > 0 && (
        <>
          <Button
            size="sm"
            variant="secondary"
            className={`absolute ${showFeatureFilter ? 'top-28' : 'top-16'} right-4 z-[1000] shadow-lg`}
            onClick={() => setShowLayerPanel(!showLayerPanel)}
          >
            <Layers className="h-4 w-4 mr-2" />
            Capas ({layers.filter(l => l.visible).length}/{layers.length})
          </Button>

          {showLayerPanel && (
            <div className={`absolute ${showFeatureFilter ? 'top-40' : 'top-28'} right-4 z-[1000] bg-white rounded-lg shadow-xl border p-4 max-w-xs w-80 max-h-[500px] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Control de Capas</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleAllLayers}
                  className="h-7 px-2 text-xs"
                  title={layers.every(l => l.visible) ? "Ocultar todas" : "Mostrar todas"}
                >
                  {layers.every(l => l.visible) ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Mostrar
                    </>
                  )}
                </Button>
              </div>

              {isLoadingLayers ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  {layers.map((layer) => (
                    <div key={layer.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium truncate">
                              {layer.layerInfo.name}
                            </p>
                            {layer.loading && (
                              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                                ⏳ Cargando...
                              </Badge>
                            )}
                            {!layer.loading && layer.strategy === 'bbox' && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                                📦 BBox optimizado
                              </Badge>
                            )}
                            {!layer.loading && layer.strategy === 'geojson' && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                ✅ Carga completa
                              </Badge>
                            )}
                          </div>
                          {layer.layerInfo.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {layer.layerInfo.description}
                            </p>
                          )}
                          {layer.layerInfo.totalFeatures && (
                            <p className="text-xs text-muted-foreground">
                              {layer.layerInfo.totalFeatures.toLocaleString()} features
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleLayerVisibility(layer.id)}
                          className="ml-2"
                        >
                          {layer.visible ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>

                      {layer.visible && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Opacidad</span>
                            <span>{Math.round(layer.opacity * 100)}%</span>
                          </div>
                          <Slider
                            value={[layer.opacity]}
                            min={0}
                            max={1}
                            step={0.1}
                            onValueChange={([value]) => updateLayerOpacity(layer.id, value)}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {filteredGeoJSON && filteredGeoJSON.data?.metadata && !showFeatureFilterPanel && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow-xl border p-4 max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Features Filtradas
            </h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setFilteredGeoJSON(null);
                onFilteredFeaturesChange?.(null);
              }}
              className="h-6 w-6 p-0"
              title="Limpiar filtros"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total:</span>
              <Badge variant="secondary">
                {filteredGeoJSON.data.metadata.totalFeatures} features
              </Badge>
            </div>

            
            {filteredGeoJSON.data.metadata.appliedFilters && 
             Object.keys(filteredGeoJSON.data.metadata.appliedFilters).length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Filtros activos:</p>
                {Object.entries(filteredGeoJSON.data.metadata.appliedFilters).map(([key, value]) => (
                  <div key={key} className="text-xs flex justify-between">
                    <span className="font-medium">{key}:</span>
                    <span className="text-muted-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}

            
            {featureFilterMultiLayer && filteredGeoJSON.data.metadata.layers && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Distribución por capa:</p>
                {filteredGeoJSON.data.metadata.layers.map((layer: any) => (
                  <div key={layer.layerId} className="text-xs flex justify-between">
                    <span className="truncate">{layer.layerName}</span>
                    <Badge variant="outline" className="text-xs ml-2">
                      {layer.featuresCount}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFeatureFilterPanel(true)}
            className="w-full mt-3 h-8"
          >
            <Filter className="h-3 w-3 mr-2" />
            Modificar Filtros
          </Button>
        </div>
      )}
    </div>
  );
}

interface LayerGeoJSONProps {
  layerState: LayerState;
}

function LayerGeoJSON({ layerState }: LayerGeoJSONProps) {
  console.log({layerState})
  if (!layerState.geojsonData) {
    return null;
  }

  const style = layerStyleToLeaflet(layerState.layerInfo.style, layerState.opacity);
  const isPoint =
    layerState.layerInfo.layerType === "point" || 
    layerState.layerInfo.layerType === "multipoint";

  const featuresCount = layerState.geojsonData.features?.length || 0;
  const coordsHash = layerState.geojsonData.features
    ?.slice(0, 3)
    .map((f: any) => JSON.stringify(f.geometry?.coordinates?.slice(0, 2)))
    .join('|') || '';
  const dataKey = `${layerState.id}-${featuresCount}-${coordsHash}-${Date.now()}`;

  return (
    <GeoJSON
      key={dataKey}
      data={layerState.geojsonData.data || layerState.geojsonData}
      style={style}
      pointToLayer={
        isPoint
          ? (feature, latlng) => {
              const layerStyle = layerState.layerInfo.style;
              const color = layerStyle?.color || "#3388ff";
              const radius = layerStyle?.radius || 6;
              
              return L.circleMarker(latlng, {
                radius: radius,
                fillColor: color,
                color: color,
                weight: 2,
                opacity:  1,
                fillOpacity:  1,
              });
            }
          : undefined
      }
      onEachFeature={(feature, leafletLayer) => {
        if (feature.properties) {
          const popupContent = createPopupContent(feature.properties);
          leafletLayer.bindPopup(popupContent);
        }
      }}
    />
  );
}
