"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  configureArcGISAPIKey,
  getArcGISAPIKey,
  type APIKeyStatus,
} from "@/lib/arcgis-config";

import "@arcgis/core/assets/esri/themes/light/main.css";
import { DashboardViewer } from "@/components/arcgis/arcgis-dashboard-viewer";
import { GenericMap } from "@/components/map/generic-map";
import { useMap } from "@/hooks/api/use-maps";
import { UploadLayerDialog } from "@/components/layers/upload-layer-dialog";
import { Skeleton } from "@/components/ui/skeleton";

type View = "open-buildings" | "scene-viewer" | "clima" | "demo" | "demo-dashboard";

export default function GaiaPage() {
  const [activeView, setActiveView] = useState<View>("open-buildings");
  const [apiKeyStatus, setApiKeyStatus] = useState<APIKeyStatus>("loading");
  const { user } = useAuth();

  const MAP_ID = 7;
  const { data: mapResponse, isLoading: isLoadingMap } = useMap(MAP_ID, true, true);
  const map = mapResponse?.data;

  useEffect(() => {
    async function setupArcGIS() {
      const apiKey = getArcGISAPIKey();
      if (apiKey) {
        const success = await configureArcGISAPIKey(apiKey);
        setApiKeyStatus(success ? "configured" : "invalid");
      } else {
        setApiKeyStatus("missing");
        console.warn(
          "⚠️ ArcGIS API Key no encontrada. Algunas funcionalidades pueden estar limitadas."
        );
      }
    }

    setupArcGIS();
  }, []);

  const handleMapLoad = (view: any) => {
    console.log("✅ Mapa cargado exitosamente", view);
  };

  const handleMapError = (error: Error) => {
    console.error("❌ Error en el mapa:", error);
  };

  const views = {
    "open-buildings": {
      title: "Open Buildings",
      src: "https://mmeka-ee.projects.earthengine.app/view/open-buildings-temporal-dataset",
    },
    "scene-viewer": {
      title: "ArcGIS Scene Viewer",
      src: "https://www.arcgis.com/home/webscene/viewer.html",
    },
    clima: {
      title: "Clima",
      src: "https://www.ventusky.com/?p=15.55;-90.63;7&l=rain-3h&t=20250806/0300",
    },
    demo: {
      title: "ArcGIS Demo",
      src: "",
    },
    "demo-dashboard": {
        title: "Demo Dashboard",
        itemId: "989789a06dc640a5880a346e701adecd"
    },
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-shrink-0 p-2 border-b flex items-center justify-between gap-2 bg-muted/30">
        <div className="flex items-center gap-2">
          {(Object.keys(views) as View[]).map((view) => (
            <Button
              key={view}
              variant={activeView === view ? "default" : "ghost"}
              onClick={() => setActiveView(view)}
              className={cn(
                "font-semibold",
                activeView === view
                  ? "bg-active-tab-green text-white"
                  : "text-gray-700"
              )}
            >
              {views[view].title}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Botón para subir capa (solo en demo) */}
          {activeView === "demo" && user && (
            <UploadLayerDialog
              userId={user.id}
              defaultMapId={MAP_ID}
              onSuccess={() => {
                console.log("✅ Capa subida exitosamente, recargando mapa...");
                window.location.reload();
              }}
            />
          )}

          {/* Indicador de estado del API Key */}
          {activeView === "demo" && (
          <div
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-md text-xs",
              apiKeyStatus === "configured"
                ? "bg-green-100 text-green-700"
                : apiKeyStatus === "missing" || apiKeyStatus === "invalid"
                ? "bg-orange-100 text-orange-700"
                : "bg-gray-100 text-gray-700"
            )}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                apiKeyStatus === "configured"
                  ? "bg-green-500"
                  : apiKeyStatus === "missing" || apiKeyStatus === "invalid"
                  ? "bg-orange-500"
                  : "bg-gray-500 animate-pulse"
              )}
            ></div>
            {apiKeyStatus === "configured"
              ? "ArcGIS ✓"
              : apiKeyStatus === "missing"
              ? "API Key requerida"
              : apiKeyStatus === "invalid"
              ? "API Key inválida"
              : "Verificando..."}
          </div>
          )}
        </div>
      </div>
      <div className="flex-grow relative">
        {/* Mostrar el mapa solo cuando activeView === 'demo' */}
        {activeView === 'demo-dashboard' && (
            <DashboardViewer
              itemId={views["demo-dashboard"].itemId}
              theme="light"
              embed={true}
            />
          )}
        {activeView === "demo" && (
          isLoadingMap ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Skeleton className="w-full h-full" />
            </div>
          ) : map ? (
            <GenericMap
              map={map}
              height="100%"
              onMapLoad={() => handleMapLoad(null)}
              onError={handleMapError}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">No se pudo cargar el mapa</p>
            </div>
          )
        )}

        {/* Mostrar iframes para otras vistas */}
        {(Object.keys(views) as View[])
          .filter((view) => (view !== "demo" && view !== "demo-dashboard"))
          .map((view) => (
            <iframe
              key={view}
              src={views[view].src}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              className={cn(
                "absolute inset-0 transition-opacity duration-300",
                activeView === view
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              )}
              allowFullScreen
              title={views[view].title}
            ></iframe>
          ))}
      </div>
    </div>
  );
}
