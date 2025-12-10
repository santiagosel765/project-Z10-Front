"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useCreateRole, useUpdateRole } from "@/hooks/api/use-roles";
import type { Role } from "@/services/roles.service";

const roleSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres").max(100),
  description: z.string().optional().or(z.literal("")),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role | null;
}

export function RoleDialog({ isOpen, onClose, role }: RoleDialogProps) {
  const isEditMode = !!role;

  const { mutate: createRole, isPending: isCreating } = useCreateRole();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  React.useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        description: role.description || "",
      });
    } else {
      reset({
        name: "",
        description: "",
      });
    }
  }, [role, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: RoleFormData) => {
    if (isEditMode && role) {
      updateRole(
        {
          id: role.id,
          data: {
            name: data.name,
            description: data.description || undefined,
          },
        },
        {
          onSuccess: () => {
            handleClose();
          },
        }
      );
    } else {
      createRole(
        {
          name: data.name,
          description: data.description || undefined,
        },
        {
          onSuccess: () => {
            handleClose();
          },
        }
      );
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Rol" : "Crear Nuevo Rol"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Actualice el nombre y descripción del rol."
              : "Complete la información del nuevo rol del sistema."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Nombre del Rol */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre del Rol <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ej: Administrador de Mapas"
                disabled={isPending}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descripción <span className="text-muted-foreground text-xs">(opcional)</span>
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe las responsabilidades y permisos de este rol..."
                rows={4}
                disabled={isPending}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Actualizar" : "Crear Rol"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
