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
import { useLayer } from "@/hooks/api/use-layers";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers, Calendar, User, Database, Eye, MapPin } from "lucide-react";

interface LayerDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  layerId: number | null;
}

export function LayerDetailsDialog({
  isOpen,
  onClose,
  layerId,
}: LayerDetailsDialogProps) {
  const { data: layerResponse, isLoading } = useLayer(layerId || 0);
  const layer = layerResponse?.data;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {layer?.name || "Detalles de la Capa"}
          </DialogTitle>
          <DialogDescription>
            Información completa de la capa GeoJSON
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : layer ? (
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
                    <p className="text-base font-semibold">{layer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tipo de Geometría
                    </p>
                    <Badge variant="outline">
                      {layer.layerType.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {layer.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Descripción
                    </p>
                    <p className="text-base">{layer.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total de Features
                    </p>
                    <p className="text-base font-semibold flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      {layer.totalFeatures.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Visibilidad
                    </p>
                    <Badge
                      variant={layer.isPublic ? "default" : "secondary"}
                      className={layer.isPublic ? "bg-green-500/80" : ""}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {layer.isPublic ? "Pública" : "Privada"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Información del Archivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Archivo Original
                    </p>
                    <p className="text-sm font-mono">
                      {layer.originalFilename || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tamaño
                    </p>
                    <p className="text-base font-semibold">
                      {formatBytes(layer.fileSizeBytes)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {layer.style && Object.keys(layer.style).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Estilo de la Capa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {layer.style.color && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Color
                        </p>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: layer.style.color }}
                          />
                          <p className="text-sm font-mono">
                            {layer.style.color}
                          </p>
                        </div>
                      </div>
                    )}
                    {layer.style.fillColor && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Color de Relleno
                        </p>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: layer.style.fillColor }}
                          />
                          <p className="text-sm font-mono">
                            {layer.style.fillColor}
                          </p>
                        </div>
                      </div>
                    )}
                    {layer.style.opacity !== undefined && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Opacidad
                        </p>
                        <p className="text-base">{layer.style.opacity}</p>
                      </div>
                    )}
                    {layer.style.weight !== undefined && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Grosor
                        </p>
                        <p className="text-base">{layer.style.weight}px</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {layer.user && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Propietario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-base font-semibold">
                      {layer.user.firstName} {layer.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {layer.user.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {layer.sharedWith && layer.sharedWith.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Compartida con ({layer.sharedWith.length} usuarios)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {layer.sharedWith.map((userId) => (
                      <Badge key={userId} variant="secondary">
                        Usuario #{userId}
                      </Badge>
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
                    <p className="text-base">
                      {new Date(layer.createdAt).toLocaleString("es-GT", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Última Actualización
                    </p>
                    <p className="text-base">
                      {new Date(layer.updatedAt).toLocaleString("es-GT", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No se encontró la capa</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
