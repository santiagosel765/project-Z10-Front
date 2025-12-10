"use client";

/**
 * EJEMPLO DE USO DEL COMPONENTE GenericMap
 * 
 * Este archivo muestra cómo usar el componente GenericMap
 * con diferentes tipos de mapas (ArcGIS y General/Leaflet)
 */

import { GenericMap } from "@/components/map/generic-map";
import { useMap } from "@/hooks/api/use-maps";
import { usePublicMap } from "@/hooks/api/use-maps";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Ejemplo 1: Cargar un mapa por ID (requiere autenticación)
 */
export function MapExample1() {
  const { data: mapResponse, isLoading, error } = useMap(7, true, true);
  const map = mapResponse?.data;

  if (isLoading) {
    return <Skeleton className="w-full h-[600px]" />;
  }

  if (error || !map) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error al cargar el mapa</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{map.name}</h2>
        <p className="text-muted-foreground">{map.description}</p>
        <p className="text-sm text-muted-foreground">
          Tipo: {map.mapType?.name} ({map.mapType?.code})
        </p>
      </div>
      
      <GenericMap
        map={map}
        layerIds={[1, 2, 3]} // IDs de capas opcionales
        height="100%"
        className="rounded-lg border shadow-md"
        onMapLoad={() => console.log("Mapa cargado!")}
        onError={(error) => console.error("Error en el mapa:", error)}
      />
    </div>
  );
}

/**
 * Ejemplo 2: Cargar un mapa público (sin autenticación)
 */
export function MapExample2() {
  const { data: publicMapResponse, isLoading, error } = usePublicMap(7);
  const publicMap = publicMapResponse?.data;

  if (isLoading) {
    return <Skeleton className="w-full h-[600px]" />;
  }

  if (error || !publicMap) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error al cargar el mapa público</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{publicMap.name}</h2>
        <p className="text-muted-foreground">{publicMap.description}</p>
        <p className="text-sm text-muted-foreground">
          Tipo: {publicMap.mapType.name} ({publicMap.mapType.code})
        </p>
        {publicMap.embedUrl && (
          <p className="text-sm font-mono text-primary">
            Embed URL: {publicMap.embedUrl}
          </p>
        )}
      </div>
      
      <GenericMap
        map={publicMap}
        height="600px"
        className="rounded-lg border shadow-md"
        onMapLoad={() => console.log("Mapa público cargado!")}
      />
    </div>
  );
}

/**
 * Ejemplo 3: Mapa con altura personalizada y capas específicas
 */
export function MapExample3() {
  const { data: mapResponse } = useMap(10, false); // Mapa General
  const map = mapResponse?.data;

  if (!map) return null;

  return (
    <GenericMap
      map={map}
      layerIds={[5, 10, 15]} // Capas específicas
      height="400px"
      className="w-full"
      onMapLoad={() => {
        console.log("Mapa tipo General/Leaflet cargado");
      }}
      onError={(error) => {
        console.error("Error:", error.message);
      }}
    />
  );
}

/**
 * Ejemplo 4: Grid de múltiples mapas
 */
export function MapGridExample() {
  const { data: map1Response } = useMap(7, false);
  const { data: map2Response } = useMap(10, false);
  
  const map1 = map1Response?.data;
  const map2 = map2Response?.data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {map1 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Mapa ArcGIS</h3>
          <GenericMap
            map={map1}
            height="400px"
            className="rounded-lg border"
          />
        </div>
      )}
      
      {map2 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Mapa General (Leaflet)</h3>
          <GenericMap
            map={map2}
            height="400px"
            className="rounded-lg border"
          />
        </div>
      )}
    </div>
  );
}

/**
 * NOTAS DE USO:
 * 
 * 1. El componente GenericMap detecta automáticamente el tipo de mapa:
 *    - Si mapType.code incluye "arcgis" → Usa ArcGISWebMap
 *    - Si mapType.code es "general" u otro → Usa LeafletMap
 * 
 * 2. Props requeridos:
 *    - map: objeto Map, MapDetail o PublicMap con mapType y settings
 * 
 * 3. Props opcionales:
 *    - layerIds: array de IDs de capas a mostrar
 *    - height: altura del contenedor (default: "600px")
 *    - className: clases CSS adicionales
 *    - onMapLoad: callback cuando el mapa carga
 *    - onError: callback para errores
 * 
 * 4. El componente maneja automáticamente:
 *    - Carga client-side (SSR safe)
 *    - Validación de webmapItemId para mapas ArcGIS
 *    - Conversión de coordenadas entre ArcGIS y Leaflet
 *    - Settings del mapa (zoom, center, basemap)
 *    - Estilos de capas
 * 
 * 5. Mapas ArcGIS vs General:
 *    - ArcGIS: Requiere webmapItemId, usa ArcGIS JS API
 *    - General: Usa Leaflet con OpenStreetMap u otros basemaps
 */
