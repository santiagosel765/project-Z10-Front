"use client";

import * as React from "react";
import {
  PlusCircle,
  MoreHorizontal,
  Map as MapIcon,
  Search,
  Star,
  Eye,
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
import { MapDialog } from "@/components/maps/map-dialog";
import { MapDetailsDialog } from "@/components/maps/map-details-dialog";
import { useMaps, useDeleteMap, useMapStats } from "@/hooks/api/use-maps";
import { useAuth } from "@/hooks/use-auth";
import type { Map } from "@/services/maps.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function MapasPage() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedMap, setSelectedMap] = React.useState<Map | null>(null);
  const [mapToDelete, setMapToDelete] = React.useState<Map | null>(null);
  const [mapDetailsId, setMapDetailsId] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  const { data: mapsResponse, isLoading } = useMaps({
    page: currentPage,
    limit: pageSize,
  });
  const { data: statsResponse } = useMapStats();
  const { mutate: deleteMap, isPending: isDeleting } = useDeleteMap();

  const maps = mapsResponse?.data?.data || [];
  const meta = mapsResponse?.data?.meta;
  const stats = statsResponse?.data;

  const filteredMaps = React.useMemo(() => {
    if (!searchQuery) return maps;

    return maps.filter(
      (map) =>
        map.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        map.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        map.mapType?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        map.mapType?.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [maps, searchQuery]);

  const handleEdit = (map: Map) => {
    setSelectedMap(map);
    setIsDialogOpen(true);
  };

  const handleViewDetails = (map: Map) => {
    setMapDetailsId(map.id);
  };

  const handleDelete = (map: Map) => {
    setMapToDelete(map);
  };

  const confirmDelete = () => {
    if (mapToDelete) {
      deleteMap(mapToDelete.id, {
        onSuccess: () => {
          setMapToDelete(null);
        },
      });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedMap(null);
  };

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <MapIcon className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 font-headline text-2xl font-bold">
          Acceso Denegado
        </h2>
        <p className="text-muted-foreground">
          Debes iniciar sesión para gestionar mapas.
        </p>
      </div>
    );
  }
  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold">
              Gestión de Mapas
            </h1>
            <p className="text-muted-foreground">
              Administra los mapas base de la aplicación
            </p>
          </div>
          <Button
            className="bg-green-700/80 hover:bg-green-800/80 text-white"
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Mapa
          </Button>
        </div>

        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Mapas
                </CardTitle>
                <MapIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMaps}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Mapas Generales
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.generalMaps}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Mapas ArcGIS
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.arcgisMaps}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Mapas por Defecto
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.defaultMaps}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="bg-muted/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mapas</CardTitle>
                <CardDescription>
                  {meta &&
                    `${meta.total} mapa${
                      meta.total !== 1 ? "s" : ""
                    } encontrado${meta.total !== 1 ? "s" : ""}`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar mapas..."
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
            ) : filteredMaps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MapIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg">
                  No se encontraron mapas
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Intenta con otros términos de búsqueda"
                    : "Crea tu primer mapa para comenzar"}
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Web Map ID</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead>
                        <span className="sr-only">Acciones</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaps.map((map) => (
                      <TableRow key={map.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-bold flex items-center gap-2">
                                {map.id}
                                {map.isDefault && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                )}
                              </div>
                              
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-bold flex items-center gap-2">
                                {map.name}
                                {map.isDefault && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                )}
                              </div>
                              {map.description && (
                                <div className="text-sm text-muted-foreground">
                                  {map.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {map.webmapItemId || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={map.isDefault ? "default" : "secondary"}
                            className={map.isDefault ? "bg-green-500/80" : ""}
                          >
                            {map.isDefault ? "Por Defecto" : "Normal"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(map.createdAt).toLocaleDateString("es-GT", {
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
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(map)}
                              >
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(map)}>
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(map)}
                                disabled={map.isDefault}
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

                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-muted-foreground">
                      Página {meta.page} de {meta.totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(meta.totalPages, p + 1)
                          )
                        }
                        disabled={currentPage === meta.totalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <MapDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        map={selectedMap}
      />

      <MapDetailsDialog
        isOpen={!!mapDetailsId}
        onClose={() => setMapDetailsId(null)}
        mapId={mapDetailsId}
      />

      <AlertDialog
        open={!!mapToDelete}
        onOpenChange={() => setMapToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el mapa &quot;{mapToDelete?.name}&quot;.
              {mapToDelete?.isDefault && (
                <span className="block mt-2 text-destructive font-semibold">
                  No se puede eliminar el mapa por defecto.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting || mapToDelete?.isDefault}
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
