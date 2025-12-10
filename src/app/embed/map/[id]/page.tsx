"use client";

import { MapEmbedWidget } from "@/components/map/map-embed-widget";
import { use } from "react";



interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

/**
 * Página para embeder mapas públicos en iframes
 * Ruta: /embed/map/[id]
 * 
 * Ejemplo de uso:
 * <iframe src="http://localhost:9002/embed/map/7" width="100%" height="600"></iframe>
 * 
 * Query params opcionales:
 * - layers: IDs de capas separadas por comas (ej: ?layers=1,2,3)
 * - zoom: Nivel de zoom inicial (ej: ?zoom=10)
 * - hideControls: Ocultar controles (ej: ?hideControls=true)
 * - hideAttribution: Ocultar atribución (ej: ?hideAttribution=true)
 */
export default function MapEmbedPage({ params, searchParams }: PageProps) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  
  const mapId = parseInt(resolvedParams.id);
  
  const layersParam = resolvedSearchParams.layers;
  const layerIds = layersParam
    ? (typeof layersParam === "string" ? layersParam.split(",").map(Number) : [])
    : undefined;
  
  const zoomParam = resolvedSearchParams.zoom;
  const customZoom = zoomParam ? parseInt(zoomParam as string) : undefined;
  
  const hideControls = resolvedSearchParams.hideControls === "true";
  const hideAttribution = resolvedSearchParams.hideAttribution === "true";

  return (
    <MapEmbedWidget
      mapId={mapId}
      layerIds={layerIds}
      customZoom={customZoom}
      hideControls={hideControls}
      hideAttribution={hideAttribution}
    />
  );
}
