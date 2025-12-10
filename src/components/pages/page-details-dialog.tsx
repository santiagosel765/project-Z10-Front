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
import { usePage } from "@/hooks/api/use-pages";
import {
  FileText,
  Link as LinkIcon,
  Calendar,
  User,
  Activity,
  Shield,
  Hash,
  Image as ImageIcon,
} from "lucide-react";

interface PageDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: number | null;
}

export function PageDetailsDialog({
  isOpen,
  onClose,
  pageId,
}: PageDetailsDialogProps) {
  const { data: pageResponse, isLoading } = usePage(pageId || 0);

  const page = pageResponse?.data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de la Página</DialogTitle>
          <DialogDescription>
            Información completa de la página del sistema
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !page ? (
          <div className="py-8 text-center text-muted-foreground">
            No se encontró la página
          </div>
        ) : (
          <div className="space-y-4">
            {/* General Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-semibold">{page.name}</p>
                </div>
                {page.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Descripción</p>
                    <p className="text-sm">{page.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <LinkIcon className="h-3 w-3" />
                      URL
                    </p>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {page.url}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      Orden
                    </p>
                    <p className="text-sm font-medium">{page.order}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {page.icon && (
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        Icono
                      </p>
                      <p className="text-sm font-mono">{page.icon}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <Badge
                      variant={page.isActive ? "default" : "secondary"}
                      className={page.isActive ? "bg-green-500/80" : ""}
                    >
                      {page.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Roles Asignados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Roles con Acceso
                </CardTitle>
                <CardDescription>
                  Roles que tienen permiso para acceder a esta página
                </CardDescription>
              </CardHeader>
              <CardContent>
                {page.roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay roles asignados a esta página
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {page.roles.map((role) => (
                      <Badge
                        key={role.id}
                        variant={
                          role.name.toLowerCase() === "superadmin"
                            ? "default"
                            : role.name.toLowerCase() === "admin"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {role.name}
                        {role.isActive === false && (
                          <span className="ml-1 text-xs">(inactivo)</span>
                        )}
                      </Badge>
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
                      {new Date(page.createdAt).toLocaleDateString("es-GT", {
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
                      {page.createdByUser.firstName}{" "}
                      {page.createdByUser.lastName}
                    </p>
                  </div>
                </div>

                {page.updatedBy && page.updatedByUser && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Última Actualización
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(page.updatedAt).toLocaleDateString("es-GT", {
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
                        {page.updatedByUser.firstName}{" "}
                        {page.updatedByUser.lastName}
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
