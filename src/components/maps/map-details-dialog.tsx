"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMap } from "@/hooks/api/use-maps";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, Layers, Calendar, User } from "lucide-react";
import type { Map } from "@/services/maps.service";

interface MapDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mapId: number | null;
}

export function MapDetailsDialog({
  isOpen,
  onClose,
  mapId,
}: MapDetailsDialogProps) {
  const { data: mapResponse, isLoading } = useMap(mapId || 0, true);
  const map = mapResponse?.data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {map?.name || "Detalles del Mapa"}
            {map?.isDefault && (
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            )}
          </DialogTitle>
          <DialogDescription>
            Información completa del mapa y sus capas asociadas
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : map ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Nombre
                    </p>
                    <p className="text-base font-semibold">{map.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tipo de Mapa
                    </p>
                    <Badge
                      variant={
                        map.mapType?.code === "arcgis"
                          ? "default"
                          : map.mapType?.code === "leaflet"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {map.mapType?.name || "Sin tipo"}
                    </Badge>
                  </div>
                </div>

                {map.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Descripción
                    </p>
                    <p className="text-base">{map.description}</p>
                  </div>
                )}

                {map.webmapItemId && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Web Map Item ID
                    </p>
                    <p className="text-base font-mono">{map.webmapItemId}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Configuración del Mapa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Zoom Inicial
                    </p>
                    <p className="text-base font-semibold">
                      {map.settings.zoom}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Latitud
                    </p>
                    <p className="text-base font-mono">
                      {map.settings.center[1].toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Longitud
                    </p>
                    <p className="text-base font-mono">
                      {map.settings.center[0].toFixed(4)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Mapa Base
                  </p>
                  <p className="text-base">{map.settings.basemap}</p>
                </div>
              </CardContent>
            </Card>

            {map.mapLayers && map.mapLayers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Capas Asociadas ({map.mapLayers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {map.mapLayers.map((mapLayer) => (
                      <div
                        key={mapLayer.layerId}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-semibold">
                            {mapLayer.layer.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {mapLayer.layer.totalFeatures} features •{" "}
                            {mapLayer.layer.layerType}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              mapLayer.isVisible ? "default" : "secondary"
                            }
                          >
                            {mapLayer.isVisible ? "Visible" : "Oculta"}
                          </Badge>
                          <Badge variant="outline">
                            Orden: {mapLayer.displayOrder}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Auditoría
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Fecha de Creación
                    </p>
                    <p className="text-base">{map.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Última Actualización
                    </p>
                    <p className="text-base">{map.updatedAt}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No se encontró el mapa</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
