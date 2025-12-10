"use client";

import * as React from "react";
import {
  PlusCircle,
  MoreHorizontal,
  FileText,
  Search,
  Eye,
  Edit,
  Trash2,
  FileCheck,
  FileX,
  Shield,
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
import { Skeleton } from "@/components/ui/skeleton";
import { PageDialog } from "@/components/pages/page-dialog";
import { PageDetailsDialog } from "@/components/pages/page-details-dialog";
import { useAuth } from "@/hooks/use-auth";
import { usePages, usePageStats, useDeletePage } from "@/hooks/api/use-pages";
import type { Page } from "@/services/pages.service";

export default function PagesPage() {
  const { user: currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedPage, setSelectedPage] = React.useState<Page | null>(null);
  const [pageToDelete, setPageToDelete] = React.useState<Page | null>(null);
  const [pageDetailsId, setPageDetailsId] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: pagesResponse, isLoading } = usePages({ limit: 100 });
  const { data: statsResponse } = usePageStats();
  const { mutate: deletePage, isPending: isDeleting } = useDeletePage();

  const pages = pagesResponse?.data?.data || [];
  const stats = statsResponse?.data;

  const filteredPages = React.useMemo(() => {
    if (!searchQuery) return pages;

    return pages.filter(
      (page) =>
        page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pages, searchQuery]);

  const handleEdit = (page: Page) => {
    setSelectedPage(page);
    setIsDialogOpen(true);
  };

  const handleViewDetails = (page: Page) => {
    setPageDetailsId(page.id);
  };

  const handleDelete = (page: Page) => {
    setPageToDelete(page);
  };

  const confirmDelete = () => {
    if (!pageToDelete) return;

    deletePage(pageToDelete.id, {
      onSuccess: () => {
        setPageToDelete(null);
      },
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedPage(null);
  };

  const isSuperAdmin = currentUser?.roles?.some(
    (r) => r.name.toLowerCase() === "superadmin"
  );

  if (!isSuperAdmin) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <FileText className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 font-headline text-2xl font-bold">Acceso Denegado</h2>
        <p className="text-muted-foreground">
          Solo los SuperAdmins pueden gestionar páginas del sistema.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold">Gestión de Páginas</h1>
            <p className="text-muted-foreground">
              Administra páginas del sistema y sus permisos de acceso
            </p>
          </div>
          <Button className="bg-green-700/80 hover:bg-green-800/80 text-white" onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Página
          </Button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Páginas
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activas</CardTitle>
                <FileCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactivas</CardTitle>
                <FileX className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inactive}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Más Usada</CardTitle>
                <Shield className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold truncate">
                  {stats.topPagesByRoles[0]?.name || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.topPagesByRoles[0]?.roleCount || 0} roles
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre, descripción o URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Pages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Páginas del Sistema</CardTitle>
            <CardDescription>
              Lista completa de páginas y sus configuraciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredPages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">No hay páginas</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "No se encontraron páginas con ese criterio"
                    : "Comience creando una nueva página"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Orden</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">{page.name}</p>
                            {page.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-xs">
                                {page.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {page.url}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{page.order}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {page.roles.length} roles
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={page.isActive ? "default" : "secondary"}
                          className={page.isActive ? "bg-green-500/80" : ""}
                        >
                          {page.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(page.createdAt).toLocaleDateString("es-GT", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
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
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(page)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(page)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(page)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
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

      {/* Page Dialog (Create/Edit) */}
      <PageDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        page={selectedPage}
      />

      {/* Page Details Dialog */}
      <PageDetailsDialog
        isOpen={!!pageDetailsId}
        onClose={() => setPageDetailsId(null)}
        pageId={pageDetailsId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!pageToDelete}
        onOpenChange={() => setPageToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar página?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea eliminar la página{" "}
              <strong>{pageToDelete?.name}</strong>? Esta acción desactivará la
              página pero no eliminará los datos del sistema (soft delete).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
