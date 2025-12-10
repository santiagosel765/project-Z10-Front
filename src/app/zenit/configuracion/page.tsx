
"use client";

import { PermissionManager } from "@/components/config/permission-manager";
import { useAuth } from "@/hooks/use-auth";
import { Lock } from "lucide-react";

export default function ConfiguracionPage() {
  const { user } = useAuth();

  if (user?.role !== "superadmin") {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center p-6">
        <Lock className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 font-headline text-2xl font-bold">Acceso Denegado</h2>
        <p className="text-muted-foreground">
          No tiene permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-3xl font-bold">Configuración de Permisos</h1>
            <p className="text-muted-foreground">
                Gestione el acceso y las acciones de los diferentes roles en la plataforma.
            </p>
        </div>
      </div>
      <div className="mt-8">
        <PermissionManager />
      </div>
    </div>
  );
}
