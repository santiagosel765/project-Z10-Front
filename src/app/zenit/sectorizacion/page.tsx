"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Upload,
  Eye,
  EyeOff,
  Layers,
  PanelRightClose,
  PanelRightOpen,
  Loader2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { GenericMap } from "@/components/map/generic-map";
import { useMap } from "@/hooks/api";
import { useAuth } from "@/hooks/use-auth";
import { UploadLayerForm } from "@/components/layers/upload-layer-form";
import { useFeaturesCatalog, useFeaturesByIds, useFilterMultipleLayersFeatures, useLayerIntersect } from "@/hooks/api/use-layers";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const MAP_ID = 11;

interface MapLayerState {
  id: number;
  name: string;
  visible: boolean;
  opacity: number;
  description?: string;
  totalFeatures?: number;
  loading: boolean;
  strategy?: string;
  layerType?: string;
  style?: any;
}

export default function SectorizacionPage() {
  const { user } = useAuth();
  const {
    data: mapResponse,
    isLoading: isLoadingMap,
    refetch: refetchMap,
  } = useMap(MAP_ID, true, true);

  const map = mapResponse?.data;

  const [isClient, setIsClient] = useState(false);
  const [mapLayers, setMapLayers] = useState<MapLayerState[]>([]);
  const [isLayersPanelVisible, setIsLayersPanelVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("manage");
  const [mapKey, setMapKey] = useState(0);
  const [layerVisibilityOverrides, setLayerVisibilityOverrides] = useState<
    Record<number, boolean>
  >({});
  const [layerOpacityOverrides, setLayerOpacityOverrides] = useState<
    Record<number, number>
  >({});
  const [selectedLayerForFiltering, setSelectedLayerForFiltering] = useState<number | null>(null);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<number[]>([]);
  const [filteredGeoJSON, setFilteredGeoJSON] = useState<any>(null);
  const [filterMode, setFilterMode] = useState<'selection' | 'properties'>('selection');
  const [multiLayerMode, setMultiLayerMode] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState<number[]>([]);
  const [propertyFilters, setPropertyFilters] = useState<Record<string, string>>({});
  const [availableProperties, setAvailableProperties] = useState<Record<number, { propertyKey: string; values: string[] }[]>>({});
  const [selectedPropertyValues, setSelectedPropertyValues] = useState<Record<string, string[]>>({});
  const [filterBBox, setFilterBBox] = useState<any>(null);
  const [promotorSearchTerm, setPromotorSearchTerm] = useState<Record<number, string>>({});
  const [intersectionMode, setIntersectionMode] = useState(false);
  const [intersectionLayerId, setIntersectionLayerId] = useState<number | null>(null);
  const [intersectionGeometry, setIntersectionGeometry] = useState<any>(null);
  
  const { toast } = useToast();

  const {
    data: catalogResponse,
    isLoading: isLoadingCatalog,
  } = useFeaturesCatalog(selectedLayerForFiltering || 0, !!selectedLayerForFiltering);

  const catalog1 = useFeaturesCatalog(selectedLayers[0] || 0, multiLayerMode && selectedLayers.length > 0 && !!selectedLayers[0]);
  const catalog2 = useFeaturesCatalog(selectedLayers[1] || 0, multiLayerMode && selectedLayers.length > 1 && !!selectedLayers[1]);
  const catalog3 = useFeaturesCatalog(selectedLayers[2] || 0, multiLayerMode && selectedLayers.length > 2 && !!selectedLayers[2]);
  const catalog4 = useFeaturesCatalog(selectedLayers[3] || 0, multiLayerMode && selectedLayers.length > 3 && !!selectedLayers[3]);

  const multiLayerCatalogs = [catalog1, catalog2, catalog3, catalog4].filter((_, index) => index < selectedLayers.length);

  const {
    data: featuresResponse,
    isLoading: isLoadingFeatures,
  } = useFeaturesByIds(
    selectedLayerForFiltering || 0,
    selectedFeatureIds.length > 0 ? selectedFeatureIds : undefined,
    !!selectedLayerForFiltering && selectedFeatureIds.length > 0 && filterMode === 'selection' && !multiLayerMode
  );

  const propertyAliasMap: Record<string, string> = {
    'NO_DISTRIT': 'CODDISTRITO',
    'No_REGIÓN': 'CODREGION',
    'No_REGION': 'CODREGION',
  };

  const activeFilters = Object.entries(selectedPropertyValues)
    .filter(([_, values]) => values.length > 0)
    .reduce((acc, [key, values]) => {
      const mappedKey = propertyAliasMap[key] || key;
      acc[mappedKey] = values.join(',');
      return acc;
    }, {} as Record<string, string>);

  const {
    data: multiLayerResponse,
    isLoading: isLoadingMultiLayer,
  } = useFilterMultipleLayersFeatures(
    selectedLayers,
    activeFilters,
    multiLayerMode && filterMode === 'properties' && Object.keys(activeFilters).length > 0
  );

  const {
    data: intersectionResponse,
    isLoading: isLoadingIntersection,
  } = useLayerIntersect(
    intersectionLayerId || 0,
    intersectionGeometry,
    {
      maxFeatures: 5000,
      simplify: false,
      enabled: intersectionMode && !!intersectionLayerId && !!intersectionGeometry
    }
  );

  // @ts-ignore
  const catalog = catalogResponse?.data as any;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (multiLayerMode && multiLayerCatalogs.length > 0) {
      const properties: Record<number, { propertyKey: string; values: string[] }[]> = {};
      
      selectedLayers.forEach((layerId, index) => {
        const catalogQuery = multiLayerCatalogs[index];
        if (catalogQuery?.data?.data?.features) {
          const catalog = catalogQuery.data.data;
          const propertyMap = new Map<string, Set<string>>();
          
          catalog.features.forEach((feature: any) => {
            Object.entries(feature.properties).forEach(([key, value]) => {
              if (!propertyMap.has(key)) {
                propertyMap.set(key, new Set());
              }
              if (value !== null && value !== undefined) {
                propertyMap.get(key)!.add(String(value));
              }
            });
          });
          
          properties[layerId] = Array.from(propertyMap.entries()).map(([key, values]) => ({
            propertyKey: key,
            values: Array.from(values).sort()
          }));
        }
      });
      
      setAvailableProperties(properties);
    }
  }, [multiLayerMode, selectedLayers, multiLayerCatalogs.map(q => q.data).join(',')]);

  useEffect(() => {
    if (map && "mapLayers" in map && map.mapLayers) {
      const layers: MapLayerState[] = map.mapLayers.map((ml) => ({
        id: ml.layerId,
        name: ml.layer.name,
        visible: false,
        opacity: parseFloat(ml.opacity),
        description: ml.layer.description || undefined,
        totalFeatures: ml.layer.totalFeatures,
        loading: false,
        strategy: undefined,
        layerType: ml.layer.layerType,
        style: ml.layer.style,
      }));
      setMapLayers(layers);
      
      const multipolygonLayers = layers.filter(
        (l) => l.layerType === 'multipolygon' && l.totalFeatures && l.totalFeatures > 0
      );
      
      if (multipolygonLayers.length > 0) {
        if (!selectedLayerForFiltering) {
          setSelectedLayerForFiltering(multipolygonLayers[0].id);
        }
        if (selectedLayers.length === 0) {
          setSelectedLayers(multipolygonLayers.map(l => l.id));
        }
      }
    }
  }, [map]);

  useEffect(() => {
    if (multiLayerMode && multiLayerResponse?.data) {
      const geojsonData = multiLayerResponse.data;
      
      
      if (geojsonData.metadata?.bbox) {
        setFilterBBox(geojsonData.metadata.bbox);
      }
      
      
      // @ts-ignore
      setFilteredGeoJSON(geojsonData);
      
      selectedLayers.forEach(layerId => {
        setLayerVisibilityOverrides(prev => ({
          ...prev,
          [layerId]: false
        }));
      });
    } else if (!multiLayerMode && featuresResponse?.data) {
      const geojsonData = featuresResponse.data;
      
      if (geojsonData.metadata?.bbox) {
        setFilterBBox(geojsonData.metadata.bbox);
      }
      
      // @ts-ignore
      setFilteredGeoJSON(geojsonData);
      
      if (selectedLayerForFiltering) {
        setLayerVisibilityOverrides(prev => ({
          ...prev,
          [selectedLayerForFiltering]: false
        }));
        
        setMapLayers(prev => 
          prev.map(l => 
            l.id === selectedLayerForFiltering 
              ? { ...l, visible: false }
              : l
          )
        );
      }
    } else if (!featuresResponse?.data && !multiLayerResponse?.data) {
      setFilteredGeoJSON(null);
      setFilterBBox(null);
      
      const layersToRestore = multiLayerMode ? selectedLayers : [selectedLayerForFiltering].filter(Boolean) as number[];
      
      layersToRestore.forEach(layerId => {
        const originalLayer = mapLayers.find(l => l.id === layerId);
        if (originalLayer) {
          setLayerVisibilityOverrides(prev => {
            const newOverrides = { ...prev };
            delete newOverrides[layerId];
            return newOverrides;
          });
          
          setMapLayers(prev => 
            prev.map(l => 
              l.id === layerId 
                ? { ...l, visible: originalLayer.visible }
                : l
            )
          );
        }
      });
    }
  }, [featuresResponse, multiLayerResponse, selectedLayerForFiltering, multiLayerMode, selectedLayers]);

  useEffect(() => {
    if (intersectionMode && intersectionResponse?.data) {
      const geojsonData = intersectionResponse.data;
      
      // @ts-ignore
      setFilteredGeoJSON(geojsonData);
      
      // Ocultar la capa de intersección del mapa base
      if (intersectionLayerId) {
        setLayerVisibilityOverrides(prev => ({
          ...prev,
          [intersectionLayerId]: false
        }));
      }
    } else if (!intersectionMode) {
      // Restaurar visibilidad de la capa cuando se desactiva el modo intersección
      if (intersectionLayerId) {
        const originalLayer = mapLayers.find(l => l.id === intersectionLayerId);
        if (originalLayer) {
          setLayerVisibilityOverrides(prev => {
            const newOverrides = { ...prev };
            delete newOverrides[intersectionLayerId];
            return newOverrides;
          });
        }
      }
    }
  }, [intersectionResponse, intersectionMode, intersectionLayerId]);

  const toggleLayerVisibility = (layerId: number) => {
    setMapLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l))
    );
    setLayerVisibilityOverrides((prev) => {
      const current = mapLayers.find((l) => l.id === layerId);
      return { ...prev, [layerId]: !current?.visible };
    });
  };

  const updateLayerOpacity = (layerId: number, opacity: number) => {
    setMapLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, opacity } : l))
    );
    setLayerOpacityOverrides((prev) => ({
      ...prev,
      [layerId]: opacity,
    }));
  };

  const toggleAllLayers = () => {
    const allVisible = mapLayers.every((layer) => layer.visible);
    const newVisibility = !allVisible;
    
    setMapLayers((prev) =>
      prev.map((l) => ({ ...l, visible: newVisibility }))
    );
    
    const overrides: Record<number, boolean> = {};
    mapLayers.forEach((layer) => {
      overrides[layer.id] = newVisibility;
    });
    setLayerVisibilityOverrides(overrides);
  };

  const handleUploadSuccess = async () => {
    toast({
      title: "Capa subida exitosamente",
      description: "Recargando el mapa...",
    });
    
    await refetchMap();
    setMapKey((prev) => prev + 1);
    
    setActiveTab("manage");
  };

  const handleFeatureToggle = (featureId: number, checked: boolean) => {
    setSelectedFeatureIds((prev) => {
      if (checked) {
        return [...prev, featureId];
      } else {
        const newIds = prev.filter((id) => id !== featureId);

        if (newIds.length === 0) {
          setFilteredGeoJSON(null);
          
          if (selectedLayerForFiltering) {
            const originalLayer = mapLayers.find(l => l.id === selectedLayerForFiltering);
            if (originalLayer) {
              setLayerVisibilityOverrides(prevOverrides => {
                const newOverrides = { ...prevOverrides };
                delete newOverrides[selectedLayerForFiltering];
                return newOverrides;
              });
              
              setMapLayers(prevLayers => 
                prevLayers.map(l => 
                  l.id === selectedLayerForFiltering 
                    ? { ...l, visible: originalLayer.visible }
                    : l
                )
              );
            }
          }
          
          setMapKey(prev => prev + 1);
        }
        return newIds;
      }
    });
  };

  const handleSelectAllFeatures = (checked: boolean) => {
    if (checked && catalog?.features) {
      setSelectedFeatureIds(catalog.features.map((f: any) => f.id));
    } else {
      handleClearFilters();
    }
  };

  const getLayerStyle = (layerId: number) => {
    const layer = mapLayers.find(l => l.id === layerId);
    if (layer?.style) {
      return {
        color: layer.style.color || "#0ea5e9",
        weight: layer.style.weight || 3,
        opacity: layer.style.opacity || 0.9,
        fillColor: layer.style.fillColor || layer.style.color || "#0ea5e9",
        fillOpacity: layer.style.fillOpacity || 0.3,
      };
    }
    return {
      color: "#0ea5e9",
      weight: 3,
      opacity: 0.9,
      fillColor: "#0ea5e9",
      fillOpacity: 0.3,
    };
  };

  const getFeatureStyle = (feature: any) => {
    const layerId = feature?.properties?.layerId;
    
    if (layerId) {
      return getLayerStyle(layerId);
    }
    
    if (selectedLayerForFiltering) {
      return getLayerStyle(selectedLayerForFiltering);
    }
    
    return getLayerStyle(0);
  };

  const handleClearFilters = () => {
    setSelectedFeatureIds([]);
    setFilteredGeoJSON(null);
    setPropertyFilters({});
    setSelectedPropertyValues({});
    setFilterBBox(null);
    setIntersectionMode(false);
    setIntersectionLayerId(null);
    setIntersectionGeometry(null);
    
    if (selectedLayerForFiltering) {
      const originalLayer = mapLayers.find(l => l.id === selectedLayerForFiltering);
      if (originalLayer) {
        setLayerVisibilityOverrides(prev => {
          const newOverrides = { ...prev };
          delete newOverrides[selectedLayerForFiltering];
          return newOverrides;
        });
        
        setMapLayers(prev => 
          prev.map(l => 
            l.id === selectedLayerForFiltering 
              ? { ...l, visible: originalLayer.visible }
              : l
          )
        );
      }
    }
    
    const layersToRestore = multiLayerMode ? selectedLayers : [selectedLayerForFiltering].filter(Boolean) as number[];
    
    layersToRestore.forEach(layerId => {
      const originalLayer = mapLayers.find(l => l.id === layerId);
      if (originalLayer) {
        setLayerVisibilityOverrides(prev => {
          const newOverrides = { ...prev };
          delete newOverrides[layerId];
          return newOverrides;
        });
        
        setMapLayers(prev => 
          prev.map(l => 
            l.id === layerId 
              ? { ...l, visible: originalLayer.visible }
              : l
          )
        );
      }
    });
    
    setMapKey(prev => prev + 1);
  };

  const handleLayerToggle = (layerId: number) => {
    setSelectedLayers(prev => {
      if (prev.includes(layerId)) {
        return prev.filter(id => id !== layerId);
      } else {
        return [...prev, layerId];
      }
    });
  };

  const layerHasPromotor = (layerId: number) => {
    const layer = mapLayers.find(l => l.id === layerId);
    return layer ? layer.name.toLowerCase().includes('promotor') : false;
  };

  const handlePropertyValueToggle = (propertyKey: string, value: string) => {
    setSelectedPropertyValues(prev => {
      const currentValues = prev[propertyKey] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      if (newValues.length === 0) {
        const newState = { ...prev };
        delete newState[propertyKey];
        return newState;
      }
      
      return { ...prev, [propertyKey]: newValues };
    });
  };

  const handleClearPropertyFilters = () => {
    setSelectedPropertyValues({});
    setPromotorSearchTerm({});
  };

  const handlePromotorSelect = (layerId: number, propertyKey: string, value: string) => {
    if (value === '__clear__') {
      setSelectedPropertyValues(prev => {
        const newState = { ...prev };
        delete newState[propertyKey];
        return newState;
      });
      return;
    }
    
    setSelectedPropertyValues(prev => ({
      ...prev,
      [propertyKey]: [value]
    }));
  };

  const handleStartIntersection = (targetLayerId: number) => {
    // Usar las features filtradas actuales como geometría de intersección
    if (!filteredGeoJSON || !filteredGeoJSON.features || filteredGeoJSON.features.length === 0) {
      toast({
        title: "Sin features para intersectar",
        description: "Primero aplica filtros para tener features que usar como geometría de intersección.",
        variant: "destructive",
      });
      return;
    }

    // Si hay múltiples features, usar la primera o combinarlas
    // Por simplicidad, usaremos la primera feature
    const geometry = filteredGeoJSON.features.length === 1 
      ? filteredGeoJSON.features[0].geometry
      : {
          type: "GeometryCollection",
          geometries: filteredGeoJSON.features.map((f: any) => f.geometry)
        };

    setIntersectionMode(true);
    setIntersectionLayerId(targetLayerId);
    setIntersectionGeometry(geometry);

    toast({
      title: "Intersección iniciada",
      description: `Buscando features de "${mapLayers.find(l => l.id === targetLayerId)?.name}" que intersectan con el filtro aplicado...`,
    });
  };

  const handleCancelIntersection = () => {
    setIntersectionMode(false);
    setIntersectionLayerId(null);
    setIntersectionGeometry(null);
    
    // Restaurar GeoJSON filtrado original
    if (multiLayerResponse?.data) {
      // @ts-ignore
      setFilteredGeoJSON(multiLayerResponse.data);
    } else if (featuresResponse?.data) {
      // @ts-ignore
      setFilteredGeoJSON(featuresResponse.data);
    }
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <p>Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <Layers className="h-10 w-10 text-accent" />
        <div className="flex-1">
          <h1 className="font-headline text-3xl font-bold">Sectorización</h1>
          <p className="text-muted-foreground">
            Administre las capas geográficas asociadas al mapa de sectorización.
          </p>
        </div>
        {/* <Button
          onClick={() => {
            setIsLayersPanelVisible(true);
            setActiveTab("upload");
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Capa
        </Button> */}
      </div>

      {mapLayers.length > 0 && (
        <div className="mb-4 shrink-0">
          <div className="bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-lg border flex items-center justify-center gap-2 flex-wrap">
            {mapLayers.map((layer) => (
              <Button
                key={layer.id}
                variant={layer.visible ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLayerVisibility(layer.id)}
                className={cn(
                  "flex items-center gap-2 transition-all bg-green-700/80 hover:bg-green-800/80 text-white",
                  layer.visible && "shadow-md"
                )}
                
                title={layer.visible ? "Ocultar capa" : "Mostrar capa"}
              >
                {layer.visible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                <span>{layer.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-grow">
        <div
          className={cn(
            "relative h-[calc(100vh-250px)] md:h-auto transition-all duration-300",
            isLayersPanelVisible ? "md:col-span-3" : "md:col-span-4"
          )}
        >
          {map ? (
            <GenericMap
              key={mapKey}
              map={map}
              height="100%"
              showLayersControl={false}
              layerVisibilityOverrides={layerVisibilityOverrides}
              layerOpacityOverrides={layerOpacityOverrides}
              customGeoJSON={filteredGeoJSON}
              customGeoJSONStyle={getFeatureStyle}
              filterBBox={filterBBox}
              filteredGeoJSON={filteredGeoJSON}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">Cargando mapa...</p>
              {isLoadingMap && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
            </div>
          )}
          {!isLayersPanelVisible && mapLayers.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-1 right-[6px] z-[1000]"
              onClick={() => setIsLayersPanelVisible(true)}
            >
              <PanelRightOpen className="h-5 w-5 mr-2" />
              Capas ({mapLayers.filter((l) => l.visible).length})
            </Button>
          )}
        </div>
        <div
          className={cn(
            "md:col-span-1 flex flex-col transition-all duration-300",
            !isLayersPanelVisible && "hidden"
          )}
        >
          <Card className="flex-grow bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Gestión de Capas</CardTitle>
              <div className="flex items-center gap-2">
                {mapLayers.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleAllLayers}
                    className="h-8 px-2 text-xs"
                    title={mapLayers.every((l) => l.visible) ? "Ocultar todas" : "Mostrar todas"}
                  >
                    {mapLayers.every((l) => l.visible) ? (
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
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLayersPanelVisible(false)}
                >
                  <PanelRightClose className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2 overflow-y-auto max-h-[calc(100vh-350px)]">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="manage">
                    <Layers className="h-4 w-4 mr-2" />
                    Capas
                  </TabsTrigger>
                  <TabsTrigger value="filter">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                    {selectedFeatureIds.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedFeatureIds.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Subir
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="manage" className="space-y-3 mt-0">
              {mapLayers.length === 0 && (
                <p className="text-sm p-2 text-muted-foreground text-center">
                  No hay capas asociadas a este mapa.
                  <br />
                  <span className="text-xs">
                    Agregue una nueva capa usando el botón superior.
                  </span>
                </p>
              )}
              <div className="space-y-3">
                {mapLayers.map((layer) => (
                  <div
                    key={layer.id}
                    className="border rounded-lg p-3 space-y-2 bg-background/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">
                            {layer.name}
                          </p>
                          {layer.loading && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300"
                            >
                              ⏳ Cargando...
                            </Badge>
                          )}
                          {!layer.loading && layer.strategy && (
                            <Badge variant="outline" className="text-xs">
                              {layer.strategy === "geojson" && "📄"}
                              {layer.strategy === "bbox" && "📦"}
                              {layer.strategy === "tiles" && "🗺️"}
                              {layer.strategy === "tiles-only" && "⚡"}
                            </Badge>
                          )}
                        </div>
                        {layer.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {layer.description}
                          </p>
                        )}
                        {layer.totalFeatures && (
                          <p className="text-xs text-muted-foreground">
                            {layer.totalFeatures.toLocaleString()} features
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleLayerVisibility(layer.id)}
                        className="ml-2"
                        title={layer.visible ? "Ocultar capa" : "Mostrar capa"}
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
                          onValueChange={([value]) =>
                            updateLayerOpacity(layer.id, value)
                          }
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
                </TabsContent>

                <TabsContent value="filter" className="space-y-4 mt-0">
                  <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="multi-layer-mode"
                        checked={multiLayerMode}
                        onCheckedChange={(checked) => {
                          setMultiLayerMode(checked as boolean);
                          if (!checked) {
                            setFilterMode('selection');
                            setPropertyFilters({});
                          }
                        }}
                      />
                      <label htmlFor="multi-layer-mode" className="text-sm font-medium cursor-pointer">
                        Modo Múltiples Capas
                      </label>
                    </div>

                    {multiLayerMode && (
                      <div className="space-y-2 pt-2 border-t">
                        <label className="text-xs font-medium text-muted-foreground">
                          Modo de Filtrado
                        </label>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={filterMode === 'selection' ? 'default' : 'outline'}
                            onClick={() => {
                              setFilterMode('selection');
                              setPropertyFilters({});
                            }}
                            className="flex-1"
                          >
                            Selección
                          </Button>
                          <Button
                            size="sm"
                            variant={filterMode === 'properties' ? 'default' : 'outline'}
                            onClick={() => {
                              setFilterMode('properties');
                              setSelectedFeatureIds([]);
                            }}
                            className="flex-1"
                          >
                            Propiedades
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {multiLayerMode && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          Capas a Filtrar
                        </label>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {selectedLayers.length} seleccionadas
                          </Badge>
                          {(Object.keys(selectedPropertyValues).length > 0 || multiLayerResponse) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleClearFilters}
                              className="h-7 text-xs"
                            >
                              Limpiar Todo
                            </Button>
                          )}
                        </div>
                      </div>
                      <ScrollArea className="h-[200px] pr-3">
                        <div className="space-y-2">
                          {mapLayers
                            .filter(layer => layer.layerType === 'multipolygon')
                            .map((layer) => (
                              <div
                                key={layer.id}
                                className={cn(
                                  "flex items-center space-x-2 p-2 border rounded-md transition-colors",
                                  selectedLayers.includes(layer.id)
                                    ? "bg-sky-50 border-sky-300"
                                    : "bg-background/50 hover:bg-muted/50"
                                )}
                              >
                                <Checkbox
                                  id={`layer-${layer.id}`}
                                  checked={selectedLayers.includes(layer.id)}
                                  onCheckedChange={() => handleLayerToggle(layer.id)}
                                />
                                <div
                                  className="w-4 h-4 rounded border border-gray-300"
                                  style={{
                                    backgroundColor: getLayerStyle(layer.id)?.color || '#3b82f6'
                                  }}
                                />
                                <label
                                  htmlFor={`layer-${layer.id}`}
                                  className="flex-1 text-sm cursor-pointer"
                                >
                                  {layer.name} <span className="text-muted-foreground">({layer.totalFeatures})</span>
                                </label>
                              </div>
                            ))}
                        </div>
                      </ScrollArea>

                      {filterMode === 'properties' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                              Filtros por Propiedades
                            </label>
                            {Object.keys(selectedPropertyValues).length > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleClearPropertyFilters}
                                className="h-7 text-xs"
                              >
                                Limpiar Filtros
                              </Button>
                            )}
                          </div>

                          {multiLayerCatalogs.some(q => q.isLoading) && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-lg">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Cargando propiedades...
                            </div>
                          )}

                          <ScrollArea className="h-[350px] pr-3">
                            <div className="space-y-4">
                              {selectedLayers.map(layerId => {
                                const layer = mapLayers.find(l => l.id === layerId);
                                const properties = availableProperties[layerId] || [];
                                
                                if (!layer || properties.length === 0) return null;
                                
                                return (
                                  <div key={layerId} className="border rounded-lg p-3 space-y-3 bg-background/50">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-3 h-3 rounded border border-gray-300"
                                        style={{
                                          backgroundColor: getLayerStyle(layerId)?.color || '#3b82f6'
                                        }}
                                      />
                                      <h4 className="text-sm font-medium">{layer.name}</h4>
                                    </div>
                                    
                                    {properties.map(({ propertyKey, values }) => {
                                      const hasPromotor = layerHasPromotor(layerId);
                                      const isSpecialProperty = hasPromotor && ['PROMOTOR', 'NO_DISTRIT', 'No_REGIÓN', 'No_REGION'].includes(propertyKey);
                                      
                                      if (!isSpecialProperty && hasPromotor && propertyKey !== 'PROMOTOR') {
                                        return null;
                                      }
                                      
                                      if (isSpecialProperty) {
                                        const searchTerm = promotorSearchTerm[layerId] || '';
                                        const filteredValues = searchTerm
                                          ? values.filter(v => v.toLowerCase().includes(searchTerm.toLowerCase()))
                                          : values;
                                        
                                        const displayLabel = propertyKey === 'NO_DISTRIT' ? 'Distrito' : 
                                                           propertyKey === 'No_REGIÓN' || propertyKey === 'No_REGION' ? 'Región' : 
                                                           propertyKey;
                                        
                                        return (
                                          <div key={propertyKey} className="space-y-2">
                                            <Label className="text-xs font-medium text-muted-foreground">
                                              {displayLabel}
                                            </Label>
                                            <div className="space-y-2">
                                              {propertyKey === 'PROMOTOR' && (
                                                <Input
                                                  placeholder="Buscar promotor..."
                                                  value={searchTerm}
                                                  onChange={(e) => setPromotorSearchTerm(prev => ({
                                                    ...prev,
                                                    [layerId]: e.target.value
                                                  }))}
                                                  className="h-8 text-xs"
                                                />
                                              )}
                                              <Select
                                                value={selectedPropertyValues[propertyKey]?.[0] || ''}
                                                onValueChange={(value) => handlePromotorSelect(layerId, propertyKey, value)}
                                              >
                                                <SelectTrigger className="h-8 text-xs">
                                                  <SelectValue placeholder={`Seleccionar ${displayLabel.toLowerCase()}...`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="__clear__" className="text-xs">
                                                    <span className="text-muted-foreground">Limpiar selección</span>
                                                  </SelectItem>
                                                  {filteredValues.slice(0, 100).map(value => (
                                                    <SelectItem key={value} value={value} className="text-xs">
                                                      {value}
                                                    </SelectItem>
                                                  ))}
                                                  {filteredValues.length > 100 && (
                                                    <SelectItem value="__more__" disabled className="text-xs">
                                                      ... y {filteredValues.length - 100} más
                                                    </SelectItem>
                                                  )}
                                                </SelectContent>
                                              </Select>
                                              {selectedPropertyValues[propertyKey]?.[0] && (
                                                <Badge variant="secondary" className="text-xs">
                                                  {selectedPropertyValues[propertyKey][0]}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                      
                                      return (
                                        <div key={propertyKey} className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <Label className="text-xs font-medium text-muted-foreground">
                                              {propertyKey}
                                            </Label>
                                            {selectedPropertyValues[propertyKey]?.length > 0 && (
                                              <Badge variant="secondary" className="text-xs h-5">
                                                {selectedPropertyValues[propertyKey].length}
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="grid grid-cols-1 gap-1.5 pl-2">
                                            {values.slice(0, 5).map(value => (
                                              <div key={value} className="flex items-center space-x-2">
                                                <Checkbox
                                                  id={`${layerId}-${propertyKey}-${value}`}
                                                  checked={selectedPropertyValues[propertyKey]?.includes(value) || false}
                                                  onCheckedChange={() => handlePropertyValueToggle(propertyKey, value)}
                                                />
                                                <label
                                                  htmlFor={`${layerId}-${propertyKey}-${value}`}
                                                  className="text-xs cursor-pointer flex-1 truncate"
                                                  title={value}
                                                >
                                                  {value}
                                                </label>
                                              </div>
                                            ))}
                                            {values.length > 5 && (
                                              <p className="text-xs text-muted-foreground italic pl-6">
                                                ... y {values.length - 5} valores más
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })}
                            </div>
                          </ScrollArea>

                          {isLoadingMultiLayer && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-lg bg-muted/20">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Filtrando capas...
                            </div>
                          )}

                          {multiLayerResponse && (
                            <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-sky-900">
                                  Resultados
                                </span>
                                <Badge className="bg-sky-600">
                                  {multiLayerResponse.data.features.length} features
                                </Badge>
                              </div>
                              {multiLayerResponse.data.metadata.layers && (
                                <div className="space-y-1">
                                  {multiLayerResponse.data.metadata.layers.map(layerInfo => (
                                    <div key={layerInfo.layerId} className="flex items-center justify-between text-xs">
                                      <span className="text-sky-800">{layerInfo.layerName}</span>
                                      <Badge variant="outline" className="bg-white text-xs h-5">
                                        {layerInfo.featuresCount}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Sección de Intersección Espacial */}
                          {(multiLayerResponse || featuresResponse) && !intersectionMode && (
                            <div className="border-t pt-4 space-y-3">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                  <Filter className="h-4 w-4" />
                                  Intersección Espacial
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  Usa las features filtradas como geometría para encontrar features de otra capa que las intersectan
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs">Selecciona capa para intersectar</Label>
                                <Select
                                  value={intersectionLayerId?.toString() || ""}
                                  onValueChange={(value) => {
                                    const layerId = parseInt(value);
                                    handleStartIntersection(layerId);
                                  }}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Elegir capa..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {mapLayers
                                      .filter(layer => {
                                        // Excluir las capas que ya están siendo filtradas
                                        if (multiLayerMode) {
                                          return !selectedLayers.includes(layer.id);
                                        }
                                        return layer.id !== selectedLayerForFiltering;
                                      })
                                      .map((layer) => (
                                        <SelectItem key={layer.id} value={layer.id.toString()}>
                                          {layer.name} ({layer.layerType})
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground italic">
                                  Ej: Encuentra puntos dentro de los polígonos filtrados
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Resultados de Intersección */}
                          {intersectionMode && (
                            <div className="border-t pt-4 space-y-3">
                              {isLoadingIntersection && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-lg bg-muted/20">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Buscando intersecciones...
                                </div>
                              )}

                              {intersectionResponse && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-emerald-900">
                                      Intersección: {mapLayers.find(l => l.id === intersectionLayerId)?.name}
                                    </span>
                                    <Badge className="bg-emerald-600">
                                      {intersectionResponse.data.metadata.totalIntersecting} features
                                    </Badge>
                                  </div>
                                  {intersectionResponse.data.metadata.limited && (
                                    <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                                      {intersectionResponse.data.metadata.message}
                                    </p>
                                  )}
                                  <div className="flex gap-2 mt-3">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancelIntersection}
                                      className="flex-1 h-8"
                                    >
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {!multiLayerMode && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Capa a Filtrar</label>
                      <select
                        value={selectedLayerForFiltering || ""}
                        onChange={(e) => {
                          const layerId = parseInt(e.target.value);
                          setSelectedLayerForFiltering(layerId);
                          setSelectedFeatureIds([]);
                          setFilteredGeoJSON(null);
                          
                          if (selectedLayerForFiltering) {
                            setLayerVisibilityOverrides(prev => {
                              const newOverrides = { ...prev };
                              delete newOverrides[selectedLayerForFiltering];
                              return newOverrides;
                            });
                          }
                        }}
                        className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                      >
                        <option value="">Seleccionar capa...</option>
                        {mapLayers
                          .filter(layer => layer.layerType === 'multipolygon')
                          .map((layer) => (
                            <option key={layer.id} value={layer.id}>
                              {layer.name} ({layer.totalFeatures} features)
                            </option>
                          ))}
                      </select>
                      {mapLayers.filter(l => l.layerType === 'multipolygon').length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No hay capas de tipo multipolygon disponibles para filtrar.
                        </p>
                      )}
                    </div>
                  )}

                  {!multiLayerMode && selectedLayerForFiltering && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="text-sm font-medium">
                            Catálogo de Features
                          </h3>
                          {catalog && (
                            <p className="text-xs text-muted-foreground">
                              {catalog.totalFeatures} features disponibles
                            </p>
                          )}
                        </div>
                        {selectedFeatureIds.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleClearFilters}
                            className="h-8"
                          >
                            Limpiar
                          </Button>
                        )}
                      </div>

                      {isLoadingCatalog && (
                        <div className="space-y-2">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      )}

                      {catalog && (
                        <>
                          {/* Seleccionar Todos */}
                          <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
                            <Checkbox
                              id="select-all"
                              checked={
                                selectedFeatureIds.length ===
                                catalog.features.length
                              }
                              onCheckedChange={handleSelectAllFeatures}
                            />
                            <label
                              htmlFor="select-all"
                              className="text-sm font-medium cursor-pointer"
                            >
                              Seleccionar todos ({catalog.features.length})
                            </label>
                          </div>

                          {/* Lista de Features */}
                          <ScrollArea className="h-[400px] pr-3">
                            <div className="space-y-2">
                              {catalog.features.map((feature: any) => (
                                <div
                                  key={feature.id}
                                  className={cn(
                                    "border rounded-lg p-3 space-y-2 transition-all",
                                    selectedFeatureIds.includes(feature.id)
                                      ? "bg-sky-50 border-sky-300"
                                      : "bg-background/50 hover:bg-muted/50"
                                  )}
                                >
                                  <div className="flex items-start gap-2">
                                    <Checkbox
                                      id={`feature-${feature.id}`}
                                      checked={selectedFeatureIds.includes(
                                        feature.id
                                      )}
                                      onCheckedChange={(checked) =>
                                        handleFeatureToggle(
                                          feature.id,
                                          checked as boolean
                                        )
                                      }
                                      className="mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <label
                                        htmlFor={`feature-${feature.id}`}
                                        className="text-sm font-medium cursor-pointer block"
                                      >
                                        Feature #{feature.featureIndex}
                                      </label>
                                      
                                      {/* Propiedades */}
                                      <div className="mt-2 space-y-1">
                                        {Object.entries(feature.properties)
                                          .slice(0, 3)
                                          .map(([key, value]) => (
                                            <div
                                              key={key}
                                              className="text-xs text-muted-foreground"
                                            >
                                              <span className="font-medium">
                                                {key}:
                                              </span>{" "}
                                              {String(value)}
                                            </div>
                                          ))}
                                      </div>

                                      {/* Metadata */}
                                      <div className="mt-2 flex gap-2 flex-wrap">
                                        {feature.areaKm2 && typeof feature.areaKm2 === 'number' && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            📏 {feature.areaKm2.toFixed(2)} km²
                                          </Badge>
                                        )}
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {feature.geometryType}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>

                          {/* Estadísticas */}
                          {selectedFeatureIds.length > 0 && (
                            <div className="p-3 border rounded-lg bg-sky-50 border-sky-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-sky-900">
                                  Features Seleccionadas
                                </span>
                                <Badge className="bg-sky-600">
                                  {selectedFeatureIds.length}
                                </Badge>
                              </div>
                              {isLoadingFeatures && (
                                <p className="text-xs text-sky-700 flex items-center gap-2">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Cargando geometrías...
                                </p>
                              )}
                              {filteredGeoJSON && (
                                <p className="text-xs text-sky-700">
                                  ✓ Geometrías cargadas en el mapa
                                </p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="upload" className="space-y-4 mt-0">
                  {user && (
                    <UploadLayerForm
                      userId={user.id}
                      defaultMapId={MAP_ID}
                      onSuccess={handleUploadSuccess}
                      showMapSelector={false}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
