"use client";

import { useEffect, useRef, useState } from 'react';

const loadArcGISModules = async () => {
  const [
    Map,
    MapView,
    SceneView,
    esriConfig,
    FeatureLayer,
    GraphicsLayer
  ] = await Promise.all([
    import('@arcgis/core/Map'),
    import('@arcgis/core/views/MapView'),
    import('@arcgis/core/views/SceneView'),
    import('@arcgis/core/config'),
    import('@arcgis/core/layers/FeatureLayer'),
    import('@arcgis/core/layers/GraphicsLayer')
  ]);

  console.log('APIKEY: ', process.env.NEXT_PUBLIC_ARCGIS_API_KEY);
  esriConfig.default.apiKey = process.env.NEXT_PUBLIC_ARCGIS_API_KEY;


  return {
    Map: Map.default,
    MapView: MapView.default,
    SceneView: SceneView.default,
    esriConfig: esriConfig.default,
    FeatureLayer: FeatureLayer.default,
    GraphicsLayer: GraphicsLayer.default
  };
};

interface ArcGISMapProps {
  style?: React.CSSProperties;
  viewType?: 'map' | 'scene';
  basemap?: string;
  center?: [number, number];
  zoom?: number;
  featureLayers?: any[];
  graphics?: any[];
  apiKey?: string;
  mapConfig?: {
    portalUrl?: string;
    ground?: string;
  };
  onMapLoad?: (view: any) => void;
  ui?: {
    components?: string[];
    position?: string;
  };
  className?: string;
}

const ArcGISMap: React.FC<ArcGISMapProps> = ({
  style = { height: '400px', width: '100%' },
  viewType = 'map',
  basemap = 'streets-vector',
  center = [-90.2308, 15.7835], // Guatemala
  zoom = 7,
  featureLayers = [],
  graphics = [],
  apiKey,
  mapConfig,
  onMapLoad,
  ui,
  className = ''
}) => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapDiv.current) return;

    let currentView: any;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (typeof document !== 'undefined') {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://js.arcgis.com/4.29/esri/themes/light/main.css';
          document.head.appendChild(link);
        }

        const {
          Map,
          MapView,
          SceneView,
          esriConfig,
          FeatureLayer,
          GraphicsLayer
        } = await loadArcGISModules();

        if (apiKey) {
          esriConfig.apiKey = apiKey;
        }

        if (mapConfig?.portalUrl) {
          esriConfig.portalUrl = mapConfig.portalUrl;
        }

        const map = new Map({
          basemap: basemap as any,
          ground: mapConfig?.ground || 'world-elevation'
        } as any);

        featureLayers.forEach(layerConfig => {
          const layer = new FeatureLayer(layerConfig);
          map.add(layer);
        });

        if (graphics.length > 0) {
          const graphicsLayer = new GraphicsLayer({
            graphics: graphics
          } as any);
          map.add(graphicsLayer);
        }

        const viewConfig = {
          container: mapDiv.current!,
          map: map,
          center: center,
          zoom: zoom
        } as any;

        if (viewType === 'scene') {
          currentView = new SceneView(viewConfig);
        } else {
          currentView = new MapView(viewConfig);
        }

        if (ui?.components) {
          await currentView.when();
          
          currentView.ui.empty('top-left');
          currentView.ui.empty('top-right');
          currentView.ui.empty('bottom-left');
          currentView.ui.empty('bottom-right');

          ui.components.forEach((component: string) => {
            currentView.ui.add(component, ui.position || 'top-left');
          });
        }

        await currentView.when();
        
        setView(currentView);
        setIsLoading(false);
        
        if (onMapLoad) {
          onMapLoad(currentView);
        }

      } catch (error) {
        console.error('Error initializing ArcGIS Map:', error);
        setError(`Error al cargar el mapa: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (currentView) {
        currentView.destroy();
      }
    };
  }, [isClient, basemap, center, zoom, apiKey, viewType]);

  useEffect(() => {
    if (!view) return;

    const updateLayers = async () => {
      try {
        const { FeatureLayer } = await loadArcGISModules();
        
        const map = view.map;
        
        const existingLayers = map.layers.filter((layer: any) => 
          layer.type === 'feature'
        ).toArray();
        
        map.removeMany(existingLayers);

        featureLayers.forEach(layerConfig => {
          const layer = new FeatureLayer(layerConfig);
          map.add(layer);
        });
      } catch (error) {
        console.error('Error updating feature layers:', error);
      }
    };

    updateLayers();
  }, [view, featureLayers]);

  useEffect(() => {
    if (!view) return;

    const updateGraphics = async () => {
      try {
        const { GraphicsLayer } = await loadArcGISModules();
        
        const map = view.map;
        
        let graphicsLayer = map.layers.find((layer: any) => 
          layer.type === 'graphics'
        );

        if (!graphicsLayer && graphics.length > 0) {
          graphicsLayer = new GraphicsLayer();
          map.add(graphicsLayer);
        }

        if (graphicsLayer) {
          graphicsLayer.removeAll();
          graphics.forEach(graphic => {
            graphicsLayer.add(graphic);
          });
        }
      } catch (error) {
        console.error('Error updating graphics:', error);
      }
    };

    updateGraphics();
  }, [view, graphics]);

  if (!isClient) {
    return (
      <div style={style} className={`flex items-center justify-center bg-muted ${className}`}>
        <div className="text-muted-foreground">Inicializando mapa...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={style} className={`flex items-center justify-center bg-muted ${className}`}>
        <div className="text-muted-foreground">Cargando ArcGIS Map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={style} className={`flex items-center justify-center bg-destructive/10 border border-destructive/20 ${className}`}>
        <div className="text-destructive text-sm p-4 text-center">
          <div className="font-semibold mb-2">Error al cargar el mapa</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapDiv} 
      style={style}
      className={`arcgis-map-container ${className}`}
    />
  );
};

export default ArcGISMap;