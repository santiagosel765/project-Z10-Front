"use client";

import * as React from "react";
import {
  PlusCircle,
  MoreHorizontal,
  Layers as LayersIcon,
  Search,
  Eye,
  Database,
  HardDrive,
  Download,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LayerEditDialog } from "@/components/layers/layer-edit-dialog";
import { LayerDetailsDialog } from "@/components/layers/layer-details-dialog";
import { UploadLayerDialog } from "@/components/layers/upload-layer-dialog";
import {
  useDeleteGeoJSONLayer,
  useUserLayerStats,
  useAllLayers,
} from "@/hooks/api/use-layers";
import { useAuth } from "@/hooks/use-auth";
import type { Layer } from "@/services/layers.service";
import { Skeleton } from "@/components/ui/skeleton";
import { layersService } from "@/services/layers.service";

export default function CapasPage() {
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedLayer, setSelectedLayer] = React.useState<Layer | null>(null);
  const [layerToDelete, setLayerToDelete] = React.useState<Layer | null>(null);
  const [layerDetailsId, setLayerDetailsId] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: layersResponse, isLoading, refetch } = useAllLayers();
  const { data: statsResponse, refetch: refetchStats } = useUserLayerStats();
  const { mutate: deleteLayer, isPending: isDeleting } = useDeleteGeoJSONLayer();

  const layers = layersResponse?.data || [];
  const meta = layersResponse?.meta;
  const stats = statsResponse?.data;

  const filteredLayers = React.useMemo(() => {
    if (!searchQuery) return layers;

    return layers.filter(
      (layer) =>
        layer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        layer.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        layer.layerType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [layers, searchQuery]);

  const handleEdit = (layer: Layer) => {
    setSelectedLayer(layer);
    setIsEditDialogOpen(true);
  };

  const handleViewDetails = (layer: Layer) => {
    setLayerDetailsId(layer.id);
  };

  const handleDelete = (layer: Layer) => {
    setLayerToDelete(layer);
  };

  const handleDownload = async (layer: Layer) => {
    try {
      await layersService.downloadLayerGeoJSON(layer.id);
    } catch (error) {
      console.error("Error al descargar la capa:", error);
    }
  };

  const confirmDelete = () => {
    if (layerToDelete) {
      deleteLayer(layerToDelete.id, {
        onSuccess: () => {
          setLayerToDelete(null);
        },
      });
    }
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedLayer(null);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <LayersIcon className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 font-headline text-2xl font-bold">Acceso Denegado</h2>
        <p className="text-muted-foreground">
          Debes iniciar sesión para gestionar capas.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold">Gestión de Capas</h1>
            <p className="text-muted-foreground">
              Administra tus capas GeoJSON y sus datos espaciales
            </p>
          </div>
          <UploadLayerDialog
            userId={user?.id || 0}
            onSuccess={() => {
              refetch();
              refetchStats();
            }}
            trigger={
              <Button className="bg-green-700/80 hover:bg-green-800/80 text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                Subir Capa
              </Button>
            }
          />
        </div>

        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Capas</CardTitle>
                <LayersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLayers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Features</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalFeatures.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tamaño Total</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalSizeMB.toFixed(2)} MB
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Capas Públicas</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.publicLayers}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="bg-muted/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Capas GeoJSON</CardTitle>
                <CardDescription>
                  {layers.length} capa{layers.length !== 1 ? "s" : ""} disponible
                  {layers.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar capas..."
                    className="pl-8 w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredLayers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <LayersIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg">No se encontraron capas</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Intenta con otros términos de búsqueda"
                    : "Sube tu primera capa GeoJSON para comenzar"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead>Visibilidad</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLayers.map((layer) => (
                    <TableRow key={layer.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-bold">{layer.name}</div>
                          {layer.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {layer.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {layer.layerType.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Database className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {layer.totalFeatures.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatBytes(layer.fileSizeBytes)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={layer.isPublic ? "default" : "secondary"}
                          className={layer.isPublic ? "bg-green-500/80" : ""}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          {layer.isPublic ? "Pública" : "Privada"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(layer.createdAt).toLocaleDateString("es-GT", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(layer)}>
                              Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(layer)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(layer)}>
                              <Download className="h-4 w-4 mr-2" />
                              Descargar GeoJSON
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(layer)}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <LayerEditDialog
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        layer={selectedLayer}
      />

      <LayerDetailsDialog
        isOpen={!!layerDetailsId}
        onClose={() => setLayerDetailsId(null)}
        layerId={layerDetailsId}
      />

      <AlertDialog open={!!layerToDelete} onOpenChange={() => setLayerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la capa &quot;{layerToDelete?.name}&quot; y todos
              sus datos asociados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
