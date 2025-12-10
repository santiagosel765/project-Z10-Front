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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCreateUser, useUpdateUser } from "@/hooks/api/use-users";
import { useRoles } from "@/hooks/api/use-roles";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@/services/user.service";
import type { Role } from "@/services/roles.service";

const userSchema = z.object({
  firstName: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "Apellido debe tener al menos 2 caracteres"),
  employeeCode: z.string().min(3, "Código de empleado requerido"),
  phone: z.string().min(8, "Teléfono debe tener al menos 8 dígitos"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
  birthdate: z.string().optional().or(z.literal("")),
  roleId: z.number().min(1, "Debe seleccionar un rol"),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

export function UserDialog({ isOpen, onClose, user }: UserDialogProps) {
  const { user: currentUser } = useAuth();
  const isEditMode = !!user;

  const { data: rolesResponse, isLoading: isLoadingRoles } = useRoles({ limit: 100 });
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const roles: Role[] = rolesResponse?.data?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      employeeCode: "",
      phone: "",
      email: "",
      password: "",
      birthdate: "",
      roleId: 0,
    },
  });

  const selectedRoleId = watch("roleId");

  React.useEffect(() => {
    if (user) {
      let formattedBirthdate = "";
      if (user.birthdate) {
        try {
          const date = new Date(user.birthdate);
          if (!isNaN(date.getTime())) {
            formattedBirthdate = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error("Error parsing birthdate:", e);
        }
      }

      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        employeeCode: user.employeeCode,
        phone: user.phone,
        email: user.email,
        password: "",
        birthdate: formattedBirthdate,
        roleId: user.userRoles[0]?.role.id || 0,
      });
    } else {
      reset({
        firstName: "",
        lastName: "",
        employeeCode: "",
        phone: "",
        email: "",
        password: "",
        birthdate: "",
        roleId: 0,
      });
    }
  }, [user, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: UserFormData) => {
    if (!currentUser?.id) return;

    if (isEditMode && user) {
      const updateData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        employeeCode: data.employeeCode,
        phone: data.phone,
        email: data.email,
        birthdate: data.birthdate || undefined,
        roleId: data.roleId,
        updatedBy: currentUser.id,
      };

      if (data.password && data.password.length >= 6) {
        updateData.password = data.password;
      }

      updateUser(
        { id: user.id, data: updateData },
        {
          onSuccess: () => {
            handleClose();
          },
        }
      );
    } else {
      createUser(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          employeeCode: data.employeeCode,
          phone: data.phone,
          email: data.email,
          password: data.password || "password123", // Password por defecto si no se proporciona
          birthdate: data.birthdate || undefined,
          roleId: data.roleId,
          createdBy: currentUser.id,
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Usuario" : "Crear Nuevo Usuario"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Actualice la información del usuario. Deje la contraseña en blanco para mantener la actual."
              : "Complete los datos del nuevo usuario. Todos los campos son requeridos."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Primera Fila: Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  placeholder="Carlos"
                  disabled={isPending}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Apellido <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  placeholder="Rivera"
                  disabled={isPending}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Segunda Fila: Código de Empleado y Teléfono */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeCode">
                  Código de Empleado <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="employeeCode"
                  {...register("employeeCode")}
                  placeholder="EMP001"
                  disabled={isPending}
                />
                {errors.employeeCode && (
                  <p className="text-sm text-destructive">
                    {errors.employeeCode.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Teléfono <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="5555-1234"
                  disabled={isPending}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Tercera Fila: Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="carlos.rivera@empresa.com"
                disabled={isPending}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Cuarta Fila: Contraseña y Fecha de Nacimiento */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Contraseña {!isEditMode && <span className="text-destructive">*</span>}
                  {isEditMode && <span className="text-muted-foreground text-xs">(opcional)</span>}
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder={isEditMode ? "Dejar en blanco para no cambiar" : "Mínimo 6 caracteres"}
                  disabled={isPending}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthdate">
                  Fecha de Nacimiento <span className="text-muted-foreground text-xs">(opcional)</span>
                </Label>
                <Input
                  id="birthdate"
                  type="date"
                  {...register("birthdate")}
                  disabled={isPending}
                />
                {errors.birthdate && (
                  <p className="text-sm text-destructive">
                    {errors.birthdate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Quinta Fila: Rol */}
            <div className="space-y-2">
              <Label htmlFor="roleId">
                Rol <span className="text-destructive">*</span>
              </Label>
              {isLoadingRoles ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <Select
                  value={selectedRoleId?.toString() || ""}
                  onValueChange={(value) => setValue("roleId", parseInt(value))}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.roleId && (
                <p className="text-sm text-destructive">
                  {errors.roleId.message}
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
              {isEditMode ? "Actualizar" : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
