"use client";

/**
 * DEMO MEJORADO DEL COMPONENTE GenericMap
 * 
 * Muestra las capacidades del sistema de mapas unificado
 * con ejemplos interactivos de ArcGIS y Leaflet
 */

import { useState } from "react";
import { GenericMap } from "@/components/map/generic-map";
import { useMap } from "@/hooks/api/use-maps";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  Map as MapIcon, 
  Layers, 
  Zap,
  Globe,
  Info,
  CheckCircle2,
  Eye
} from "lucide-react";

export function GenericMapDemo() {
  const [selectedMapId, setSelectedMapId] = useState(7);
  
  const { data: arcgisMapResponse, isLoading: loadingArcGIS } = useMap(7, true, true); // Mapa ArcGIS
  const { data: leafletMapResponse, isLoading: loadingLeaflet } = useMap(10, true, true); // Mapa Leaflet
  
  const arcgisMap = arcgisMapResponse?.data;
  const leafletMap = leafletMapResponse?.data;
  const currentMap = selectedMapId === 7 ? arcgisMap : leafletMap;
  const isLoading = selectedMapId === 7 ? loadingArcGIS : loadingLeaflet;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapIcon className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">GenericMap Component</CardTitle>
              </div>
              <CardDescription className="text-base">
                Sistema unificado de mapas que detecta automáticamente el tipo y renderiza
                con ArcGIS JS API o Leaflet según corresponda
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Auto-detect
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Detección Automática</h4>
                <p className="text-xs text-muted-foreground">
                  Identifica el tipo de mapa por webmapItemId y mapType
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
              <Layers className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Control de Capas</h4>
                <p className="text-xs text-muted-foreground">
                  Panel interactivo con visibilidad y opacidad por capa
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
              <Globe className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Dual Engine</h4>
                <p className="text-xs text-muted-foreground">
                  ArcGIS JS API 4.28 + Leaflet con React-Leaflet
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Interactivo */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Interactivo</CardTitle>
          <CardDescription>
            Prueba el componente con diferentes tipos de mapas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selector de Mapa */}
          <div className="flex gap-2">
            <Button
              variant={selectedMapId === 7 ? "default" : "outline"}
              onClick={() => setSelectedMapId(7)}
              className="flex-1"
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Mapa ArcGIS
              {arcgisMap?.webmapItemId && (
                <Badge variant="secondary" className="ml-2">WebMap</Badge>
              )}
            </Button>
            <Button
              variant={selectedMapId === 10 ? "default" : "outline"}
              onClick={() => setSelectedMapId(10)}
              className="flex-1"
            >
              <Globe className="h-4 w-4 mr-2" />
              Mapa Leaflet
              <Badge variant="secondary" className="ml-2">OSM</Badge>
            </Button>
          </div>

          {/* Información del Mapa Actual */}
          {isLoading ? (
            <Skeleton className="w-full h-32" />
          ) : currentMap ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle className="font-semibold">{currentMap.name}</AlertTitle>
              <AlertDescription className="space-y-2">
                <p className="text-sm">{currentMap.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">
                    Tipo: {currentMap.mapType?.name}
                  </Badge>
                  <Badge variant="outline">
                    Zoom: {currentMap.settings.zoom}
                  </Badge>
                  <Badge variant="outline">
                    Basemap: {currentMap.settings.basemap}
                  </Badge>
                  {currentMap.mapLayers && (
                    <Badge variant="outline">
                      <Layers className="h-3 w-3 mr-1" />
                      {currentMap.mapLayers.length} capas
                    </Badge>
                  )}
                  {currentMap.webmapItemId && (
                    <Badge variant="outline" className="font-mono text-xs">
                      {currentMap.webmapItemId.substring(0, 8)}...
                    </Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No se pudo cargar el mapa</AlertDescription>
            </Alert>
          )}

          {/* Mapa */}
          {isLoading ? (
            <Skeleton className="w-full h-[600px] rounded-lg" />
          ) : currentMap ? (
            <div className="relative">
              <GenericMap
                map={currentMap}
                height="600px"
                className="rounded-lg border-2 shadow-lg"
                onMapLoad={() => {
                  console.log(`✅ ${currentMap.name} cargado exitosamente`);
                }}
                onError={(error) => {
                  console.error("❌ Error en el mapa:", error);
                }}
              />
              
              {/* Indicador flotante */}
              <div className="absolute top-4 left-4 z-[999] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border px-3 py-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold">
                    {selectedMapId === 7 ? "ArcGIS WebMap" : "Leaflet + OSM"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Error al cargar el mapa</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Características Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle>Características Técnicas</CardTitle>
          <CardDescription>
            Funcionalidades implementadas en el componente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="features">Características</TabsTrigger>
              <TabsTrigger value="props">Props</TabsTrigger>
              <TabsTrigger value="examples">Uso</TabsTrigger>
            </TabsList>

            <TabsContent value="features" className="space-y-3 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">🎯 Detección Automática</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Analiza webmapItemId para ArcGIS</li>
                    <li>• Fallback a mapType.code</li>
                    <li>• Sin configuración manual</li>
                  </ul>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">🗺️ Soporte Dual</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• ArcGIS JS API 4.28</li>
                    <li>• Leaflet + React-Leaflet</li>
                    <li>• Basemaps configurables</li>
                  </ul>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">📊 Control de Capas</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Toggle visibilidad</li>
                    <li>• Control de opacidad</li>
                    <li>• Carga desde mapLayers</li>
                  </ul>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">⚡ Performance</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Client-side only (SSR safe)</li>
                    <li>• Lazy loading de capas</li>
                    <li>• Cache de GeoJSON</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="props" className="mt-4">
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4 text-sm border-b pb-2 font-semibold">
                  <div>Prop</div>
                  <div>Tipo</div>
                  <div>Descripción</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm border-b pb-2">
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded">map</code>
                  <span className="text-muted-foreground text-xs">Map | MapDetail</span>
                  <span className="text-xs">Objeto de mapa con mapType y settings</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm border-b pb-2">
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded">layerIds</code>
                  <span className="text-muted-foreground text-xs">number[]?</span>
                  <span className="text-xs">IDs de capas específicas (opcional)</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm border-b pb-2">
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded">height</code>
                  <span className="text-muted-foreground text-xs">string?</span>
                  <span className="text-xs">Altura del mapa (default: 600px)</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm border-b pb-2">
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded">className</code>
                  <span className="text-muted-foreground text-xs">string?</span>
                  <span className="text-xs">Clases CSS adicionales</span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm border-b pb-2">
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded">onMapLoad</code>
                  <span className="text-muted-foreground text-xs">() =&gt; void?</span>
                  <span className="text-xs">Callback al cargar el mapa</span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded">onError</code>
                  <span className="text-muted-foreground text-xs">(err) =&gt; void?</span>
                  <span className="text-xs">Callback para errores</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="examples" className="mt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Ejemplo Básico</h4>
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs">
{`import { GenericMap } from "@/components/map/generic-map";
import { useMap } from "@/hooks/api/use-maps";

function MyComponent() {
  const { data } = useMap(7, true, true);
  
  if (!data?.data) return null;
  
  return (
    <GenericMap
      map={data.data}
      height="600px"
      onMapLoad={() => console.log("Loaded!")}
    />
  );
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Con Control de Capas</h4>
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs">
{`<GenericMap
  map={mapData}
  layerIds={[1, 2, 3]}  // Capas específicas
  height="800px"
  className="rounded-lg shadow-xl"
  onMapLoad={() => {
    console.log("Mapa listo con capas");
  }}
/>`}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Notas Importantes */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Notas de Implementación</AlertTitle>
        <AlertDescription className="space-y-2 text-sm">
          <ul className="list-disc list-inside space-y-1">
            <li>El componente requiere que el mapa tenga <code className="bg-slate-100 px-1 rounded">mapType</code> y <code className="bg-slate-100 px-1 rounded">settings</code></li>
            <li>Para mapas ArcGIS se requiere <code className="bg-slate-100 px-1 rounded">webmapItemId</code> o mapType.code que incluya "arcgis"</li>
            <li>Las capas se cargan automáticamente desde <code className="bg-slate-100 px-1 rounded">mapLayers</code> si existe</li>
            <li>El panel de control de capas aparece automáticamente si hay capas disponibles</li>
            <li>Compatible con mapas públicos y autenticados</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
