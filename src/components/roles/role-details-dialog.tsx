"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/hooks/api/use-roles";
import {
  Shield,
  FileText,
  Calendar,
  User,
  Activity,
  FileCheck,
} from "lucide-react";

interface RoleDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: number | null;
}

export function RoleDetailsDialog({
  isOpen,
  onClose,
  roleId,
}: RoleDetailsDialogProps) {
  const { data: roleResponse, isLoading } = useRole(roleId || 0);

  const role = roleResponse?.data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Rol</DialogTitle>
          <DialogDescription>
            Información completa del rol y sus permisos
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !role ? (
          <div className="py-8 text-center text-muted-foreground">
            No se encontró el rol
          </div>
        ) : (
          <div className="space-y-4">
            {/* General Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-semibold">{role.name}</p>
                </div>
                {role.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Descripción</p>
                    <p className="text-sm">{role.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge
                    variant={role.isActive ? "default" : "secondary"}
                    className={role.isActive ? "bg-green-500/80" : ""}
                  >
                    {role.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Páginas Asignadas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Páginas Asignadas
                </CardTitle>
                <CardDescription>
                  Módulos y páginas a las que este rol tiene acceso
                </CardDescription>
              </CardHeader>
              <CardContent>
                {role.pages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay páginas asignadas a este rol
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {role.pages.map((page) => (
                      <div
                        key={page.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{page.name}</p>
                            {page.description && (
                              <p className="text-sm text-muted-foreground">
                                {page.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {page.url}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={page.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {page.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información de Auditoría */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Auditoría
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Fecha de Creación
                    </p>
                    <p className="text-sm font-medium">
                      {new Date(role.createdAt).toLocaleDateString("es-GT", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Creado Por
                    </p>
                    <p className="text-sm font-medium">
                      {role.createdByUser.firstName}{" "}
                      {role.createdByUser.lastName}
                    </p>
                  </div>
                </div>

                {role.updatedBy && role.updatedByUser && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Última Actualización
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(role.updatedAt).toLocaleDateString("es-GT", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Actualizado Por
                      </p>
                      <p className="text-sm font-medium">
                        {role.updatedByUser.firstName}{" "}
                        {role.updatedByUser.lastName}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
