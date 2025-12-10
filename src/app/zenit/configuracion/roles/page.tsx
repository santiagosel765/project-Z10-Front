"use client";

import * as React from "react";
import {
  PlusCircle,
  MoreHorizontal,
  Shield,
  Search,
  Eye,
  Edit,
  Trash2,
  ShieldCheck,
  ShieldX,
  FileCheck,
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
import { RoleDialog } from "@/components/roles/role-dialog";
import { RoleDetailsDialog } from "@/components/roles/role-details-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useRoles, useRoleStats, useDeleteRole } from "@/hooks/api/use-roles";
import type { Role } from "@/services/roles.service";

export default function RolesPage() {
  const { user: currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = React.useState<Role | null>(null);
  const [roleDetailsId, setRoleDetailsId] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: rolesResponse, isLoading } = useRoles({ limit: 100 });
  const { data: statsResponse } = useRoleStats();
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();

  const roles = rolesResponse?.data?.data || [];
  const stats = statsResponse?.data;

  const filteredRoles = React.useMemo(() => {
    if (!searchQuery) return roles;

    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [roles, searchQuery]);

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  };

  const handleViewDetails = (role: Role) => {
    setRoleDetailsId(role.id);
  };

  const handleDelete = (role: Role) => {
    setRoleToDelete(role);
  };

  const confirmDelete = () => {
    if (!roleToDelete) return;

    deleteRole(roleToDelete.id, {
      onSuccess: () => {
        setRoleToDelete(null);
      },
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedRole(null);
  };

  const isSuperAdmin = currentUser?.roles?.some(
    (r) => r.name.toLowerCase() === "superadmin"
  );

  if (!isSuperAdmin) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <Shield className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 font-headline text-2xl font-bold">Acceso Denegado</h2>
        <p className="text-muted-foreground">
          Solo los SuperAdmins pueden gestionar roles del sistema.
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
            <h1 className="font-headline text-3xl font-bold">Gestión de Roles</h1>
            <p className="text-muted-foreground">
              Administra roles del sistema y sus permisos
            </p>
          </div>
          <Button className="bg-green-700/80 hover:bg-green-800/80 text-white" onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Rol
          </Button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activos</CardTitle>
                <ShieldCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
                <ShieldX className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inactive}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Más Usado</CardTitle>
                <FileCheck className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">
                  {stats.topRolesByUsers[0]?.name || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.topRolesByUsers[0]?.userCount || 0} usuarios
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
              placeholder="Buscar por nombre o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Roles del Sistema</CardTitle>
            <CardDescription>
              Lista completa de roles y sus permisos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Shield className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">No hay roles</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "No se encontraron roles con ese criterio"
                    : "Comience creando un nuevo rol"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Páginas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          {role.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-xs truncate text-sm text-muted-foreground">
                          {role.description || "Sin descripción"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {role.pages.length} páginas
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={role.isActive ? "default" : "secondary"}
                          className={role.isActive ? "bg-green-500/80" : ""}
                        >
                          {role.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(role.createdAt).toLocaleDateString("es-GT", {
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
                              onClick={() => handleViewDetails(role)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(role)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(role)}
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

      {/* Role Dialog (Create/Edit) */}
      <RoleDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        role={selectedRole}
      />

      {/* Role Details Dialog */}
      <RoleDetailsDialog
        isOpen={!!roleDetailsId}
        onClose={() => setRoleDetailsId(null)}
        roleId={roleDetailsId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!roleToDelete}
        onOpenChange={() => setRoleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rol?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea eliminar el rol{" "}
              <strong>{roleToDelete?.name}</strong>? Esta acción desactivará el
              rol pero no eliminará los datos del sistema (soft delete).
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
