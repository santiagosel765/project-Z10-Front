
"use client";

import { useState } from "react";
import { MODULES, USER_ROLES } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

type Permissions = {
  [role: string]: {
    modules: {
      [modulePath: string]: {
        visible: boolean;
        create: boolean;
        read: boolean;
        update: boolean;
      };
    };
  };
};

export function PermissionManager() {
  const [permissions, setPermissions] = useState<Permissions>(() => {
    const initialPermissions: Permissions = {};
    USER_ROLES.forEach(role => {
        initialPermissions[role] = { modules: {} };
        MODULES.forEach(module => {
            if (module.path !== '/dashboard/perfil') { // Perfil is always visible
                initialPermissions[role].modules[module.path] = {
                    visible: true,
                    create: role === 'SuperAdmin',
                    read: true,
                    update: role !== 'Pro'
                };
            }
        });
    });
    return initialPermissions;
  });
  
  const { toast } = useToast();

  const handlePermissionChange = (role: string, modulePath: string, perm: 'visible' | 'create' | 'read' | 'update') => {
    setPermissions(prev => {
        const newPerms = JSON.parse(JSON.stringify(prev));
        newPerms[role].modules[modulePath][perm] = !newPerms[role].modules[modulePath][perm];
        return newPerms;
    });
  };

  const handleSaveChanges = () => {
    console.log("Saving permissions:", permissions);
    toast({
      title: "Permisos guardados",
      description: "Los cambios se han guardado correctamente.",
    });
  };

  const visibleModules = MODULES.filter(m => m.path !== '/zenit/perfil' && m.path !== '/zenit');

  return (
    <Card className="bg-muted/30">
        <CardHeader>
            <CardTitle>Matriz de Permisos por Rol</CardTitle>
            <CardDescription>
              Active o desactive módulos y asigne permisos de Crear, Ver y Editar para cada rol.
            </CardDescription>
        </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full whitespace-nowrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-muted/50 w-[200px]">Módulo</TableHead>
                {USER_ROLES.map((role) => (
                  <TableHead key={role} className="text-center min-w-[300px]">
                    {role}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleModules.map((module) => (
                <TableRow key={module.path}>
                  <TableCell className="sticky left-0 bg-muted/50 font-medium">
                     <div className="flex items-center gap-2">
                        <module.icon className="h-4 w-4" />
                        <span>{module.name}</span>
                    </div>
                  </TableCell>
                  {USER_ROLES.map((role) => (
                    <TableCell key={role}>
                        <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center gap-2" title={`Visibilidad para ${role}`}>
                                <Switch
                                    checked={permissions[role]?.modules[module.path]?.visible ?? false}
                                    onCheckedChange={() => handlePermissionChange(role, module.path, 'visible')}
                                    id={`vis-${role}-${module.path}`}
                                />
                                <Label htmlFor={`vis-${role}-${module.path}`} className="text-sm">Visible</Label>
                            </div>
                           <Separator orientation="vertical" className="h-6" />
                           <div className="flex items-center gap-4" title={`Permisos CRUD para ${role}`}>
                                <div className="flex items-center gap-2">
                                    <Checkbox id={`cre-${role}-${module.path}`} 
                                        checked={permissions[role]?.modules[module.path]?.create ?? false}
                                        onCheckedChange={() => handlePermissionChange(role, module.path, 'create')}
                                    />
                                    <Label htmlFor={`cre-${role}-${module.path}`} className="text-sm font-normal">Creator</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox id={`rea-${role}-${module.path}`}
                                        checked={permissions[role]?.modules[module.path]?.read ?? false}
                                        onCheckedChange={() => handlePermissionChange(role, module.path, 'read')}
                                    />
                                    <Label htmlFor={`rea-${role}-${module.path}`} className="text-sm font-normal">Viewer</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox id={`upd-${role}-${module.path}`}
                                        checked={permissions[role]?.modules[module.path]?.update ?? false}
                                        onCheckedChange={() => handlePermissionChange(role, module.path, 'update')}
                                    />
                                    <Label htmlFor={`upd-${role}-${module.path}`} className="text-sm font-normal">Editor</Label>
                                </div>
                           </div>
                        </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
       <div className="flex justify-end border-t p-4">
          <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
      </div>
    </Card>
  );
}
