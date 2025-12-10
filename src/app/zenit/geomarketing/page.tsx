"use client";

import { useState, useRef, useCallback } from "react";
import {
  Layers3,
  Upload,
  PanelRightClose,
  PanelRightOpen,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { GeomarketingMap } from "@/components/geomarketing/geomarketing-map";
import { Button } from "@/components/ui/button";
import { KpiCards } from "@/components/geomarketing/kpi-cards";
import { ActiveLayers } from "@/components/geomarketing/active-layers";
import {
  ZoneAnalysisChart,
  PortfolioDistributionChart,
} from "@/components/geomarketing/geomarketing-charts";
import { GeoJsonUploader } from "@/components/geomarketing/geojson-uploader";
import type { ActiveLayer } from "@/types";
import { cn } from "@/lib/utils";
import {
  alianzasData,
  cajerosData,
  clientesData,
  gridHexagonalData,
  nivelesIngresoData,
  poblacionData,
  puntosPagoData,
  puntosPagoCompetenciaData,
  riesgosClimaticosData,
  sectoresData,
  sucursalesCompetenciaData,
  sucursalesData,
  techosEdificiosData,
} from "@/lib/geomarketing-data";
import { GenericMap } from "@/components/map/generic-map";
import { useMap } from "@/hooks/api";

const MAP_ID = 13;

const LAYER_CONFIG: Omit<ActiveLayer, "visible" | "opacity">[] = [
  {
    id: "alianzas",
    name: "Alianzas",
    category: "Infraestructura",
    source: "default",
    data: alianzasData,
  },
  {
    id: "cajeros",
    name: "Cajeros",
    category: "Infraestructura",
    source: "default",
    data: cajerosData,
  },
  {
    id: "clientes",
    name: "Clientes",
    category: "Clientes",
    source: "default",
    data: clientesData,
  },
  {
    id: "grid-exagonal",
    name: "Grid Hexagonal",
    category: "Análisis",
    source: "default",
    data: gridHexagonalData,
  },
  {
    id: "niveles-ingreso",
    name: "Niveles de Ingreso",
    category: "Demografía",
    source: "default",
    data: nivelesIngresoData,
  },
  {
    id: "poblacion",
    name: "Población",
    category: "Demografía",
    source: "default",
    data: poblacionData,
  },
  {
    id: "puntos-pago",
    name: "Puntos de pago",
    category: "Infraestructura",
    source: "default",
    data: puntosPagoData,
  },
  {
    id: "puntos-pago-competencia",
    name: "Puntos de pago Competencia",
    category: "Competencia",
    source: "default",
    data: puntosPagoCompetenciaData,
  },
  {
    id: "riesgos-climaticos",
    name: "Riesgos climáticos",
    category: "Análisis",
    source: "default",
    data: riesgosClimaticosData,
  },
  {
    id: "sectores",
    name: "Sectores",
    category: "Análisis",
    source: "default",
    data: sectoresData,
  },
  {
    id: "sucursales-competencia",
    name: "Sucurales Competencia",
    category: "Competencia",
    source: "default",
    data: sucursalesCompetenciaData,
  },
  {
    id: "sucursales",
    name: "Sucursales",
    category: "Infraestructura",
    source: "default",
    data: sucursalesData,
  },
  {
    id: "techos-edificios",
    name: "Techos Edificios",
    category: "Análisis",
    source: "default",
    data: techosEdificiosData,
  },
];

const getDefaultActiveLayers = (): ActiveLayer[] => {
  return LAYER_CONFIG.map((layer) => ({
    ...layer,
    visible: true,
    opacity: 0.8,
  }));
};

const MIN_PANEL_WIDTH = 300;
const MAX_PANEL_WIDTH = 800;

export default function GeomarketingPage() {
  const { data: mapResponse, isLoading: isLoadingMap } = useMap(13, true, true);
  
  const map = mapResponse?.data;

  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isAnalysisVisible, setIsAnalysisVisible] = useState(true);
  const [activeLayers, setActiveLayers] = useState<ActiveLayer[]>(
    getDefaultActiveLayers()
  );
  const [analysisPanelWidth, setAnalysisPanelWidth] = useState(450);
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  const gridTemplateColumns = isAnalysisVisible
    ? `1fr 5px ${analysisPanelWidth}px`
    : "1fr 0 0";

  const handleToggleVisibility = (layerId: string) => {
    setActiveLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l))
    );
  };

  const handleToggleAll = () => {
    const areAllDefaultVisible = activeLayers
      .filter((l) => l.source === "default")
      .every((l) => l.visible);
    setActiveLayers((prev) =>
      prev.map((l) =>
        l.source === "default" ? { ...l, visible: !areAllDefaultVisible } : l
      )
    );
  };

  const handleLayerUpload = (geojsonData: any, fileName: string) => {
    const newLayer: ActiveLayer = {
      id: `${fileName}-${Date.now()}`,
      name: fileName,
      category: "Personalizada",
      source: "upload",
      visible: true,
      opacity: 0.8,
      data: geojsonData,
    };
    setActiveLayers((prev) => [...prev, newLayer]);
  };

  const handleDeleteLayer = (layerId: string) => {
    setActiveLayers((prev) => prev.filter((l) => l.id !== layerId));
  };

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing.current && containerRef.current && isAnalysisVisible) {
        const rect = containerRef.current.getBoundingClientRect();
        const newWidth = rect.right - e.clientX;
        const clampedWidth = Math.max(
          MIN_PANEL_WIDTH,
          Math.min(newWidth, MAX_PANEL_WIDTH)
        );
        setAnalysisPanelWidth(clampedWidth);
      }
    },
    [isAnalysisVisible]
  );

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    window.removeEventListener("mousemove", resize);
    window.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "";
  }, [resize]);

  const startResizing = useCallback(
    (e: React.MouseEvent) => {
      isResizing.current = true;
      e.preventDefault();
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "col-resize";
    },
    [resize, stopResizing]
  );

  return (
    <div
      ref={containerRef}
      className="h-full grid"
      style={{ gridTemplateColumns }}
    >
      {/* Columna Izquierda: Mapa y Controles */}
      <div className="relative flex flex-col p-4 gap-4 overflow-hidden">
        <div className="bg-muted/30 p-2 rounded-lg border flex items-center gap-2">
          <Button
            variant={isContentVisible ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setIsContentVisible(!isContentVisible)}
          >
            <Layers3 className="mr-2" />
            Contenido ({activeLayers.filter((l) => l.visible).length})
          </Button>
          <GeoJsonUploader onLayerLoad={handleLayerUpload} />
        </div>

        <div className="flex-grow flex gap-4 overflow-hidden">
          <div
            className={cn(
              "transition-all duration-300 ease-in-out overflow-y-auto",
              isContentVisible ? "w-[300px]" : "w-0 opacity-0"
            )}
          >
            {isContentVisible && (
              <ActiveLayers
                layers={activeLayers}
                onToggleVisibility={handleToggleVisibility}
                onDeleteLayer={handleDeleteLayer}
                onToggleAll={handleToggleAll}
              />
            )}
          </div>

          <div className="flex-grow relative">
            {map ? (
              <GenericMap map={map!} height="100%" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">
                  Cargando mapa...
                </p>
              </div>
            )}
            {!isAnalysisVisible && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 z-[1000] shadow-md"
                onClick={() => setIsAnalysisVisible(true)}
              >
                <PanelLeftOpen className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Divisor */}
      <div
        className={cn(
          "cursor-col-resize w-full h-full resizer-handle",
          !isAnalysisVisible && "hidden"
        )}
        onMouseDown={startResizing}
      />

      {/* Columna Derecha: KPIs y Gráficos */}
      <div
        className={cn(
          "flex-shrink-0 bg-muted/30 border-l p-4 space-y-4 overflow-y-auto relative",
          !isAnalysisVisible && "hidden"
        )}
        style={{ width: isAnalysisVisible ? `${analysisPanelWidth}px` : "0px" }}
      >
        <div className="flex justify-between items-center">
          <h2 className="font-headline text-xl font-bold">Panel de Análisis</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAnalysisVisible(false)}
          >
            <PanelRightClose className="h-5 w-5" />
          </Button>
        </div>
        <KpiCards />
        <ZoneAnalysisChart />
        <PortfolioDistributionChart />
      </div>
    </div>
  );
}
