/**
 * ARCGIS WEBMAP COMPONENT
 * Componente reutilizable para mostrar WebMaps de ArcGIS con widgets configurables
 */

"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import Map from "@arcgis/core/Map";
import Bookmarks from "@arcgis/core/widgets/Bookmarks";
import Expand from "@arcgis/core/widgets/Expand";
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
import LayerList from "@arcgis/core/widgets/LayerList";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import { useMap } from "@/hooks/api/use-maps";
import { configureArcGISAPIKey, getArcGISAPIKey } from "@/lib/arcgis-config";

interface LayerConfig {
  type: "geojson" | "feature" | "wms";
  url?: string;
  data?: any;
  title: string;
  visible?: boolean;
  opacity?: number;
  renderer?: any;
  popupTemplate?: any;
  definitionExpression?: string;
}

interface ArcGISWebMapProps {
  mapId: number;
  
  /** WebMap Item ID de ArcGIS (opcional, evita fetch si se proporciona) */
  webmapItemId?: string;
  
  /** Datos del mapa (opcional, evita fetch si se proporciona) */
  mapData?: any;
  
  basemap?: string;
  center?: [number, number];
  
  zoom?: number;
  
  zoomConstraints?: {
    minZoom: number;
    maxZoom: number;
  };
  
  padding?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  
  widgets?: {
    bookmarks?: boolean;
    basemapGallery?: boolean;
    layerList?: boolean;
  };
  
  additionalLayers?: LayerConfig[];
  
  customBookmarks?: Array<{
    name: string;
    longitude: number;
    latitude: number;
    scale: number;
  }>;
  
  containerStyle?: React.CSSProperties;
  
  onMapLoad?: (view: MapView) => void;
  
  onError?: (error: Error) => void;
}

export interface ArcGISWebMapRef {
  view: MapView | null;
  addLayer: (config: LayerConfig) => void;
  removeLayer: (title: string) => void;
  goTo: (target: any, options?: any) => Promise<void>;
  destroy: () => void;
}

const ArcGISWebMap = forwardRef<ArcGISWebMapRef, ArcGISWebMapProps>(({
  mapId,
  webmapItemId: providedWebmapItemId,
  mapData: providedMapData,
  basemap = "streets-vector",
  center = [-90.2308, 15.7835],
  zoom = 7,
  zoomConstraints = { minZoom: 5, maxZoom: 18 },
  padding = { top: 20, bottom: 20, left: 20, right: 20 },
  widgets = { bookmarks: true, basemapGallery: true, layerList: true },
  additionalLayers = [],
  customBookmarks = [],
  containerStyle = {},
  onMapLoad,
  onError
}, ref) => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const [isLoadingLayers, setIsLoadingLayers] = useState(false);
  
  const shouldFetch = !providedMapData;
  const { data: fetchedMapData, isLoading: isLoadingMap } = useMap(mapId, true, shouldFetch);
  
  const mapData = providedMapData ? { data: providedMapData } : fetchedMapData;
  const isLoading = shouldFetch ? isLoadingMap : false;

  const defaultBookmarks = [
    {
      name: "Guatemala Nacional",
      longitude: -90.2308,
      latitude: 15.7835,
      scale: 3000000
    },
    {
      name: "Guatemala City",
      longitude: -90.2308,
      latitude: 15.7835,
      scale: 500000
    },
    {
      name: "Quetzaltenango",
      longitude: -91.5197,
      latitude: 14.8448,
      scale: 500000
    },
    {
      name: "Antigua Guatemala",
      longitude: -90.7346,
      latitude: 14.5586,
      scale: 200000
    }
  ];

  const createLayer = (config: LayerConfig) => {
    switch (config.type) {
      case "geojson":
        const geojsonConfig: any = {
          title: config.title,
          visible: config.visible ?? true,
          opacity: config.opacity ?? 0.7,
          renderer: config.renderer,
          popupTemplate: config.popupTemplate
        };

        if (config.data) {
          const blob = new Blob([JSON.stringify(config.data)], { type: 'application/json' });
          geojsonConfig.url = URL.createObjectURL(blob);
        } else if (config.url) {
          geojsonConfig.url = config.url;
        } else {
          throw new Error('GeoJSON layer requiere url o data');
        }

        return new GeoJSONLayer(geojsonConfig);
      
      case "feature":
        return new FeatureLayer({
          url: config.url,
          title: config.title,
          visible: config.visible ?? true,
          opacity: config.opacity ?? 1,
          renderer: config.renderer,
          popupTemplate: config.popupTemplate,
          definitionExpression: config.definitionExpression
        });
      
      case "wms":
        return new MapImageLayer({
          url: config.url,
          title: config.title,
          visible: config.visible ?? true,
          opacity: config.opacity ?? 0.7
        });
      
      default:
        throw new Error(`Tipo de capa no soportado: ${config.type}`);
    }
  };

  const addLayer = (config: LayerConfig) => {
    if (!viewRef.current?.map) return;
    
    try {
      const layer = createLayer(config);
      viewRef.current.map.add(layer);
      
      layer.when(() => {
        console.log(`🗺️ Capa "${layer.title}" cargada (${(layer as any).source?.features?.length || 0} features)`);
      }, (error: Error) => {
        console.error(`❌ Error cargando capa "${layer.title}":`, error);
      });
    } catch (error) {
      console.error("Error al agregar capa:", error);
      onError?.(error as Error);
    }
  };

  const removeLayer = (title: string) => {
    if (!viewRef.current?.map) return;
    
    const layer = viewRef.current.map.layers.find(l => l.title === title);
    if (layer) {
      viewRef.current.map.remove(layer);
    }
  };

  const loadMapLayers = async () => {
    if (!viewRef.current?.map || !mapData?.data?.mapLayers) return;

    setIsLoadingLayers(true);
    const userStr = localStorage.getItem('zenit-user');
    const token = userStr ? JSON.parse(userStr).token : null;

    for (const mapLayer of mapData.data.mapLayers) {
      try {
        const metadataResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3200/api/v1'}/layers/${mapLayer.layerId}`,
          {
            credentials: 'include',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          }
        );

        const geojsonResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3200/api/v1'}/layers/${mapLayer.layerId}/geojson`,
          {
            credentials: 'include',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          }
        );

        if (geojsonResponse.ok) {
          const geojsonData = await geojsonResponse.json();
          const metadata = metadataResponse.ok ? await metadataResponse.json() : null;
          const layerInfo = metadata?.data;
          
          const firstFeature = geojsonData.data?.features?.[0];
          const geometryType = firstFeature?.geometry?.type?.toLowerCase();
          
          let renderer;
          if (layerInfo?.style) {
            const style = layerInfo.style;
            if (geometryType?.includes('point')) {
              renderer = {
                type: "simple",
                symbol: {
                  type: "simple-marker",
                  color: style.fillColor ? hexToRgba(style.fillColor, style.fillOpacity || 0.8) : [51, 204, 51, 0.8],
                  size: 8,
                  outline: {
                    color: style.color ? hexToRgba(style.color, style.opacity || 1) : "white",
                    width: style.weight || 1
                  }
                }
              };
            } else if (geometryType?.includes('line')) {
              renderer = {
                type: "simple",
                symbol: {
                  type: "simple-line",
                  color: style.color ? hexToRgba(style.color, style.opacity || 0.8) : [51, 51, 204, 0.8],
                  width: style.weight || 2
                }
              };
            } else {
              renderer = {
                type: "simple",
                symbol: {
                  type: "simple-fill",
                  color: style.fillColor ? hexToRgba(style.fillColor, style.fillOpacity || 0.4) : [51, 204, 204, 0.4],
                  outline: {
                    color: style.color ? hexToRgba(style.color, style.opacity || 1) : "white",
                    width: style.weight || 1
                  }
                }
              };
            }
          } else {
            // Estilo por defecto si no hay style en metadata
            if (geometryType?.includes('point')) {
              renderer = {
                type: "simple",
                symbol: {
                  type: "simple-marker",
                  color: [51, 204, 51, 0.8],
                  size: 8,
                  outline: { color: "white", width: 1 }
                }
              };
            } else if (geometryType?.includes('line')) {
              renderer = {
                type: "simple",
                symbol: {
                  type: "simple-line",
                  color: [51, 51, 204, 0.8],
                  width: 2
                }
              };
            } else {
              renderer = {
                type: "simple",
                symbol: {
                  type: "simple-fill",
                  color: [51, 204, 204, 0.4],
                  outline: { color: "white", width: 1 }
                }
              };
            }
          }
          
          let popupTemplate;
          let propertiesCount = 0;
          
          if (firstFeature?.properties && Object.keys(firstFeature.properties).length > 0) {
            const properties = Object.keys(firstFeature.properties);
            propertiesCount = properties.length;
            
            const fieldInfos = properties.map(prop => ({
              fieldName: prop,
              label: prop.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              visible: true
            }));
            
            popupTemplate = {
              title: mapLayer.layer.name,
              content: [
                {
                  type: "fields",
                  fieldInfos: fieldInfos
                }
              ],
              ...(layerInfo?.description && {
                expressionInfos: [{
                  name: "layer-description",
                  title: "Descripción de la capa",
                  expression: `"${layerInfo.description}"`
                }]
              })
            };
          } else {
            popupTemplate = {
              title: mapLayer.layer.name,
              content: layerInfo?.description || "Sin información adicional disponible"
            };
          }
          
          addLayer({
            type: "geojson",
            data: geojsonData.data,
            title: mapLayer.layer.name,
            visible: mapLayer.isVisible,
            opacity: parseFloat(mapLayer.opacity),
            renderer: renderer,
            popupTemplate: popupTemplate
          });
          
          
        } else {
          console.error(`❌ Error cargando capa ${mapLayer.layerId}: HTTP ${geojsonResponse.status}`);
        }
      } catch (error) {
        console.error(`❌ Error cargando capa ${mapLayer.layerId}:`, error);
      }
    }

    setIsLoadingLayers(false);
  };

  const hexToRgba = (hex: string, alpha: number = 1): [number, number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), alpha]
      : [51, 204, 204, alpha];
  };

  const goTo = async (target: any, options?: any) => {
    if (!viewRef.current) return;
    return viewRef.current.goTo(target, options);
  };

  const destroy = () => {
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }
  };

  useImperativeHandle(ref, () => ({
    view: viewRef.current,
    addLayer,
    removeLayer,
    goTo,
    destroy
  }));

  useEffect(() => {
    const initializeAPIKey = async () => {
      const apiKey = getArcGISAPIKey();
      if (!apiKey) {
        console.error("❌ No se encontró una API Key válida para ArcGIS.");
        return;
      }

      const isConfigured = await configureArcGISAPIKey(apiKey);
      if (!isConfigured) {
        console.error("❌ Error al configurar la API Key de ArcGIS.");
      }
    };

    initializeAPIKey();
  }, []);

  useEffect(() => {
    if (!mapDiv.current || isLoading || !mapData?.data) return;

    const initializeMap = async () => {
      try {
        const mapConfig = mapData.data;
        const mapCenter = mapConfig.settings?.center as [number, number] || center;
        const mapZoom = mapConfig.settings?.zoom || zoom;

        let map;
        const webmapId = providedWebmapItemId || mapConfig.webmapItemId;
        
        if (webmapId) {
          console.log("🗺️ Cargando WebMap de ArcGIS:", webmapId);
          map = new WebMap({
            portalItem: { id: webmapId }
          });
        } else {
          console.log("🗺️ Creando mapa base:", basemap);
          map = new Map({ basemap });
        }

        if (additionalLayers.length > 0) {
          const customLayers = additionalLayers.map(createLayer);
          map.addMany(customLayers);
        }

        const view = new MapView({
          container: mapDiv.current,
          map: map as any,
          center: mapCenter,
          zoom: mapZoom,
          constraints: {
            minZoom: zoomConstraints.minZoom,
            maxZoom: zoomConstraints.maxZoom
          },
          padding
        });

        viewRef.current = view;

        if (widgets.bookmarks) {
          const bookmarksData = [
            ...defaultBookmarks,
            ...customBookmarks
          ].map(bookmark => ({
            name: bookmark.name,
            viewpoint: {
              targetGeometry: {
                type: "point",
                longitude: bookmark.longitude,
                latitude: bookmark.latitude
              },
              scale: bookmark.scale
            } as any
          }));

          const bookmarks = new Bookmarks({
            view,
            bookmarks: bookmarksData
          });

          const bookmarksExpand = new Expand({
            view,
            content: bookmarks,
            expanded: false,
            expandIconClass: "esri-icon-bookmark",
            expandTooltip: "Ubicaciones en Guatemala"
          });

          view.ui.add(bookmarksExpand, "top-right");
        }

        if (widgets.basemapGallery) {
          const basemapGallery = new BasemapGallery({
            view,
            container: document.createElement("div")
          });

          const basemapExpand = new Expand({
            view,
            content: basemapGallery,
            expanded: false,
            expandTooltip: "Cambiar Mapa Base"
          });

          view.ui.add(basemapExpand, "top-left");
        }

        if (widgets.layerList) {
          const layerList = new LayerList({
            view,
            listItemCreatedFunction: (event) => {
              const item = event.item;
              if (item.layer && item.layer.type !== "group") {
                item.actionsSections = [[
                  {
                    title: "Aumentar opacidad",
                    className: "esri-icon-up",
                    id: "increase-opacity"
                  },
                  {
                    title: "Reducir opacidad",
                    className: "esri-icon-down",
                    id: "decrease-opacity"
                  },
                  {
                    title: "Información de la capa",
                    className: "esri-icon-description",
                    id: "information"
                  }
                ]];
              }
            }
          });

          layerList.on("trigger-action", (event) => {
            const action = event.action;
            const layer = event.item.layer;

            if (!layer) return;

            switch (action.id) {
              case "increase-opacity":
                if (layer.opacity < 1) layer.opacity += 0.1;
                break;
              case "decrease-opacity":
                if (layer.opacity > 0) layer.opacity -= 0.1;
                break;
              case "information":
                console.log("Información de la capa:", layer.title);
                break;
            }
          });

          const layerListExpand = new Expand({
            view,
            content: layerList,
            expanded: false,
            expandTooltip: "Lista de Capas"
          });

          view.ui.add(layerListExpand, "bottom-left");
        }

        view.when(() => {
          view.goTo({
            center: mapCenter,
            zoom: mapZoom
          }, {
            duration: 2000,
            easing: "ease-in-out"
          });

          if (view.popup) {
            view.popup.defaultPopupTemplateEnabled = true;
            view.popup.dockEnabled = true;
            view.popup.dockOptions = { position: "bottom-right", breakpoint: false };
          }

          loadMapLayers();
          onMapLoad?.(view);
        });

      } catch (error) {
        console.error("Error al inicializar el mapa:", error);
        onError?.(error as Error);
      }
    };

    initializeMap();

    return () => {
      destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId, providedWebmapItemId, basemap, zoom, isLoading]);

  useEffect(() => {
    if (mapDiv.current) {
      const mapContainer = mapDiv.current;
      mapContainer.style.borderRadius = "8px";
      mapContainer.style.overflow = "hidden";
      mapContainer.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
      
      Object.assign(mapContainer.style, containerStyle);
    }
  }, [containerStyle]);

  return (
    <div 
      ref={mapDiv}
      className="w-full h-full"
      style={{ minHeight: "400px" }}
    />
  );
});

ArcGISWebMap.displayName = "ArcGISWebMap";

export default ArcGISWebMap;
