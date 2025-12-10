"use client";

import { ThemedMapCard } from "@/components/poblacion/themed-map-card";
import { Users, Database } from "lucide-react";
import type { MapCardConfig } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { SourceDatabaseManager } from "@/components/poblacion/source-database-manager";
import { GenericMap } from "@/components/map/generic-map";
import { useMap } from "@/hooks/api";

const populationLayers = [
  { id: "poblacion_por_pueblo", name: "Población total por pueblo" },
  {
    id: "comunidad_linguistica",
    name: "Población total por comunidad lingüística",
  },
  {
    id: "servicio_sanitario",
    name: "Hogares por tipo y uso de servicio sanitario",
  },
  { id: "equipamiento_hogar", name: "Equipamiento del hogar" },
  { id: "tipologia_hogar", name: "Tipología de hogar por pueblo" },
  { id: "proyecciones", name: "Proyecciones de población (2020–2050)" },
];

const populationMapConfig: MapCardConfig = {
  title: "Población",
  icon: Users,
  studies: ["Censo 2024 (Simulado)", "ENCOVI 2023", "Proyecciones INE"],
  layers: populationLayers.map((l) => ({
    ...l,
    geojsonPath: `/geodata/population/${l.id}.geojson`,
  })),
  downloads: populationLayers.map((l) => ({
    name: `${l.name}.xlsx`,
    url: `/data-download/${l.id}.xlsx`,
  })),
};

const emptyMapConfig = (title: string, icon: any): MapCardConfig => ({
  title,
  icon,
  studies: [],
  layers: [],
  downloads: [],
});

const MAP_ID = 12;

export default function PoblacionPage() {
  const { data: mapResponse, isLoading: isLoadingMap } = useMap(MAP_ID, true, true);

  const map = mapResponse?.data;

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <Users className="h-10 w-10 text-accent" />
        <div>
          <h1 className="font-headline text-3xl font-bold">Datos Nacionales</h1>
          <p className="text-muted-foreground">
            Explore los diferentes indicadores y estadísticas poblacionales en
            mapas interactivos.
          </p>
        </div>
      </div>

      <Tabs defaultValue="datos-nacionales">
        <TabsList className="mb-4">
          <TabsTrigger value="datos-nacionales">Datos Nacionales</TabsTrigger>
          <TabsTrigger value="bases-fuente">Bases Fuente</TabsTrigger>
        </TabsList>

        <TabsContent value="datos-nacionales">
          <div className="space-y-6">
            {map ? (
              <GenericMap map={map} height="100%" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">Cargando mapa...</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bases-fuente">
          <SourceDatabaseManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
