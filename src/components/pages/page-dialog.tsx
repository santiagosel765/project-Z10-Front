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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useCreatePage, useUpdatePage } from "@/hooks/api/use-pages";
import { useRoles } from "@/hooks/api/use-roles";
import type { Page } from "@/services/pages.service";

const pageSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres").max(100),
  description: z.string().optional().or(z.literal("")),
  url: z.string().min(1, "URL es requerida").regex(/^\//, "URL debe comenzar con /"),
  icon: z.string().optional().or(z.literal("")),
  order: z.number().min(0, "Orden debe ser mayor o igual a 0"),
  isActive: z.boolean().default(true),
  roleIds: z.array(z.number()).optional(),
});

type PageFormData = z.infer<typeof pageSchema>;

interface PageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  page?: Page | null;
}

export function PageDialog({ isOpen, onClose, page }: PageDialogProps) {
  const isEditMode = !!page;

  const { data: rolesResponse, isLoading: isLoadingRoles } = useRoles({ limit: 100 });
  const { mutate: createPage, isPending: isCreating } = useCreatePage();
  const { mutate: updatePage, isPending: isUpdating } = useUpdatePage();

  const roles = rolesResponse?.data?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      name: "",
      description: "",
      url: "",
      icon: "",
      order: 0,
      isActive: true,
      roleIds: [],
    },
  });

  const selectedRoleIds = watch("roleIds") || [];
  const isActive = watch("isActive");

  React.useEffect(() => {
    if (page) {
      reset({
        name: page.name,
        description: page.description || "",
        url: page.url,
        icon: page.icon || "",
        order: page.order,
        isActive: page.isActive,
        roleIds: page.roles.map((r) => r.id),
      });
    } else {
      reset({
        name: "",
        description: "",
        url: "",
        icon: "",
        order: 0,
        isActive: true,
        roleIds: [],
      });
    }
  }, [page, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleRole = (roleId: number) => {
    const currentIds = selectedRoleIds;
    if (currentIds.includes(roleId)) {
      setValue(
        "roleIds",
        currentIds.filter((id) => id !== roleId)
      );
    } else {
      setValue("roleIds", [...currentIds, roleId]);
    }
  };

  const onSubmit = (data: PageFormData) => {
    if (isEditMode && page) {
      updatePage(
        {
          id: page.id,
          data: {
            name: data.name,
            description: data.description || undefined,
            url: data.url,
            icon: data.icon || undefined,
            order: data.order,
            isActive: data.isActive,
            roleIds: data.roleIds,
          },
        },
        {
          onSuccess: () => {
            handleClose();
          },
        }
      );
    } else {
      createPage(
        {
          name: data.name,
          description: data.description || undefined,
          url: data.url,
          icon: data.icon || undefined,
          order: data.order,
          isActive: data.isActive,
          roleIds: data.roleIds,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Página" : "Crear Nueva Página"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Actualice la información de la página del sistema."
              : "Complete la información de la nueva página y asigne roles."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ej: Dashboard Principal"
                disabled={isPending}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="url">
                URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="url"
                {...register("url")}
                placeholder="/dashboard/example"
                disabled={isPending}
              />
              {errors.url && (
                <p className="text-sm text-destructive">{errors.url.message}</p>
              )}
            </div>

            {/* Descripción e Icono en dos columnas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">
                  Icono <span className="text-muted-foreground text-xs">(opcional)</span>
                </Label>
                <Input
                  id="icon"
                  {...register("icon")}
                  placeholder="home"
                  disabled={isPending}
                />
                {errors.icon && (
                  <p className="text-sm text-destructive">
                    {errors.icon.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">
                  Orden <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="order"
                  type="number"
                  {...register("order", { valueAsNumber: true })}
                  disabled={isPending}
                />
                {errors.order && (
                  <p className="text-sm text-destructive">
                    {errors.order.message}
                  </p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descripción <span className="text-muted-foreground text-xs">(opcional)</span>
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe el propósito de esta página..."
                rows={3}
                disabled={isPending}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Estado Activo */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue("isActive", !!checked)}
                disabled={isPending}
              />
              <Label
                htmlFor="isActive"
                className="text-sm font-normal cursor-pointer"
              >
                Página activa
              </Label>
            </div>

            {/* Roles Asignados */}
            <div className="space-y-2">
              <Label>
                Roles con Acceso <span className="text-muted-foreground text-xs">(opcional)</span>
              </Label>
              {isLoadingRoles ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                  {roles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay roles disponibles
                    </p>
                  ) : (
                    roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={selectedRoleIds.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                          disabled={isPending}
                        />
                        <Label
                          htmlFor={`role-${role.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {role.name}
                          {role.description && (
                            <span className="text-muted-foreground ml-2">
                              - {role.description}
                            </span>
                          )}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              )}
              {errors.roleIds && (
                <p className="text-sm text-destructive">
                  {errors.roleIds.message}
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
              {isEditMode ? "Actualizar" : "Crear Página"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
