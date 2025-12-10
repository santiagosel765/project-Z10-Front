"use client";

import { useState, useEffect } from "react";
import { GenericMap } from "@/components/map/generic-map";
import { usePublicMap } from "@/hooks/api/use-maps";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  configureArcGISAPIKey,
  getArcGISAPIKey,
  type APIKeyStatus,
} from "@/lib/arcgis-config";


interface MapEmbedWidgetProps {
  mapId: number;

  layerIds?: number[];

  customZoom?: number;

  hideControls?: boolean;

  hideAttribution?: boolean;

  showOpenLink?: boolean;
}

export function MapEmbedWidget({
  mapId,
  layerIds,
  customZoom,
  hideControls = false,
  hideAttribution = false,
  showOpenLink = true,
}: MapEmbedWidgetProps) {
  const [isClient, setIsClient] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<APIKeyStatus>("loading");
  const { data: publicMapResponse, isLoading, error } = usePublicMap(mapId);
  const publicMap = publicMapResponse?.data;


  // Configurar ArcGIS API Key
  useEffect(() => {
    async function setupArcGIS() {
      const apiKey = getArcGISAPIKey();
      if (apiKey) {
        const success = await configureArcGISAPIKey(apiKey);
        setApiKeyStatus(success ? "configured" : "invalid");
      } else {
        setApiKeyStatus("missing");
      }
    }
    setupArcGIS();
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isArcGISMap = !!(
    publicMap?.webmapItemId && publicMap.webmapItemId.trim()
  );

  // Cargar CSS de ArcGIS solo si es necesario
  useEffect(() => {
    if (isArcGISMap && typeof window !== "undefined") {
      const linkId = "arcgis-theme-css";
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = "https://js.arcgis.com/4.28/esri/themes/light/main.css";
        document.head.appendChild(link);
      }
    }
  }, [isArcGISMap]);

  const isWaitingForArcGIS = isArcGISMap && apiKeyStatus === "loading";
  if (isLoading || !isClient || isWaitingForArcGIS) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <Skeleton className="w-32 h-32 rounded-full mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>
          {isWaitingForArcGIS && (
            <p className="text-xs text-muted-foreground">
              Configurando ArcGIS...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error || !publicMap) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
        <Alert variant="destructive" className="max-w-md shadow-lg">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">
            Mapa no disponible
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>
              {error
                ? "No se pudo cargar el mapa. Es posible que no exista o no esté disponible públicamente."
                : "Mapa no encontrado."}
            </p>
            <p className="text-xs text-muted-foreground">
              ID del mapa: {mapId}
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }


  if (!publicMap.isPublic) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
        <Alert className="max-w-md shadow-lg border-orange-300">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <AlertTitle className="text-lg font-semibold">
            Mapa privado
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p>Este mapa no está disponible públicamente.</p>
            <p className="text-xs text-muted-foreground mt-2">
              Contacta al administrador para obtener acceso.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (
    isArcGISMap &&
    (apiKeyStatus === "invalid" || apiKeyStatus === "missing")
  ) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
        <Alert variant="destructive" className="max-w-md shadow-lg">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">
            Error de configuración de ArcGIS
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>
              {apiKeyStatus === "missing"
                ? "No se ha configurado una API Key de ArcGIS."
                : "La API Key de ArcGIS proporcionada no es válida."}
            </p>
            <p className="text-xs text-muted-foreground">
              Contacta al administrador para configurar el acceso a ArcGIS.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const mapTypeName = isArcGISMap ? "ArcGIS" : "General";

  const effectiveZoom = customZoom || publicMap.settings.zoom;

  const mapWithSettings = {
    ...publicMap,
    settings: {
      ...publicMap.settings,
      zoom: effectiveZoom,
    },
  };

  return (
    <div className="relative w-full h-[600px] flex flex-col">
      {!hideControls && (
        <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-b shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                {publicMap.name}
              </h1>
              {publicMap.description && (
                <p className="text-xs text-gray-600 truncate">
                  {publicMap.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                {mapTypeName}
              </span>

              {showOpenLink && publicMap.embedUrl && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => {
                    // const baseUrl = publicMap.embedUrl.replace(
                    //   "/embed/map/",
                    //   "/maps/"
                    // );
                    window.open(publicMap.embedUrl, "_blank");
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Abrir
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-grow w-full relative">
        <GenericMap
          map={mapWithSettings}
          layerIds={layerIds}
          height="100%"
          onMapLoad={() => {
            console.log(`✅ Mapa público ${mapId} cargado (${mapTypeName})`);
          }}
          onError={(error) => {
            console.error(`❌ Error en mapa público ${mapId}:`, error);
          }}
        />
      </div>

      {!hideAttribution && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm">
          <div className="px-4 py-2 text-center">
            <p className="text-xs text-white/90">
              Powered by <span className="font-semibold">ZENIT GeoAI</span>
              {" • "}
              <span className="text-white/70">{mapTypeName} Map</span>
            </p>
          </div>
        </div>
      )}

      {/* Indicador de capas (solo si hay capas específicas) */}
      {layerIds && layerIds.length > 0 && !hideControls && (
        <div className="absolute top-16 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border px-3 py-2">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">{layerIds.length}</span> capa
            {layerIds.length !== 1 ? "s" : ""} activa
            {layerIds.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}


export function generateEmbedUrl(
  baseUrl: string,
  mapId: number,
  options?: {
    layers?: number[];
    zoom?: number;
    hideControls?: boolean;
    hideAttribution?: boolean;
  }
): string {
  const url = new URL(`${baseUrl}/embed/map/${mapId}`);

  if (options?.layers && options.layers.length > 0) {
    url.searchParams.set("layers", options.layers.join(","));
  }

  if (options?.zoom) {
    url.searchParams.set("zoom", options.zoom.toString());
  }

  if (options?.hideControls) {
    url.searchParams.set("hideControls", "true");
  }

  if (options?.hideAttribution) {
    url.searchParams.set("hideAttribution", "true");
  }

  return url.toString();
}

export function generateIframeCode(
  embedUrl: string,
  options?: {
    width?: string | number;
    height?: string | number;
    title?: string;
  }
): string {
  const width = options?.width || "100%";
  const height = options?.height || "600";
  const title = options?.title || "Mapa ZENIT";

  return `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  title="${title}"
  allowfullscreen
></iframe>`;
}
