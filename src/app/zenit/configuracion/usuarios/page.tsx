
"use client";

import * as React from "react";
import {
  PlusCircle,
  MoreHorizontal,
  UserCog,
  Search,
  Users,
  UserCheck,
  UserX,
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
import { Skeleton } from "@/components/ui/skeleton";
import { UserDialog } from "@/components/users/user-dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  useUsers,
  useDisableUser,
  useEnableUser,
} from "@/hooks/api/use-users";
import type { User } from "@/services/user.service";

export default function UsuariosPage() {
  const { user: currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [userToToggle, setUserToToggle] = React.useState<User | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: usersResponse, isLoading } = useUsers();
  const { mutate: disableUser, isPending: isDisabling } = useDisableUser();
  const { mutate: enableUser, isPending: isEnabling } = useEnableUser();

  const users = usersResponse?.data || [];

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return users;

    return users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const stats = React.useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      inactive: users.filter((u) => !u.isActive).length,
    };
  }, [users]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (user: User) => {
    setUserToToggle(user);
  };

  const confirmToggleStatus = () => {
    if (!userToToggle || !currentUser?.id) return;

    if (userToToggle.isActive) {
      disableUser(
        { id: userToToggle.id, updatedBy: currentUser.id },
        {
          onSuccess: () => {
            setUserToToggle(null);
          },
        }
      );
    } else {
      enableUser(
        { id: userToToggle.id, updatedBy: currentUser.id },
        {
          onSuccess: () => {
            setUserToToggle(null);
          },
        }
      );
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
  };

  const isSuperAdmin = currentUser?.roles?.some(
    (r) => r.name.toLowerCase() === "superadmin" // TODO: cambiar a superadmin
  );

  if (!isSuperAdmin) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <UserCog className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 font-headline text-2xl font-bold">Acceso Denegado</h2>
        <p className="text-muted-foreground">
          Solo los SuperAdmins pueden gestionar usuarios.
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
            <h1 className="font-headline text-3xl font-bold">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">
              Administra usuarios, roles y permisos del sistema
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre, código, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios del Sistema</CardTitle>
            <CardDescription>
              Lista completa de usuarios registrados y sus roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <UserCog className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">No hay usuarios</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "No se encontraron usuarios con ese criterio"
                    : "Comience agregando un nuevo usuario"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Código Empleado</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="font-semibold">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.phone}
                        </div>
                      </TableCell>
                      <TableCell>{user.employeeCode}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.userRoles.map((ur) => (
                          <Badge
                            key={ur.role.id}
                            variant={
                              ur.role.name.toLowerCase() === "superadmin"
                                ? "default"
                                : ur.role.name.toLowerCase() === "admin"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {ur.role.name}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                          className={
                            user.isActive ? "bg-green-500/80" : ""
                          }
                        >
                          {user.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.createdAt}
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
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(user)}
                            >
                              {user.isActive ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activar
                                </>
                              )}
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

      {/* User Dialog (Create/Edit) */}
      <UserDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        user={selectedUser}
      />

      {/* Toggle Status Alert Dialog */}
      <AlertDialog
        open={!!userToToggle}
        onOpenChange={() => setUserToToggle(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToToggle?.isActive ? "Desactivar" : "Activar"} Usuario
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea{" "}
              {userToToggle?.isActive ? "desactivar" : "activar"} al usuario{" "}
              <strong>
                {userToToggle?.firstName} {userToToggle?.lastName}
              </strong>
              ?
              {userToToggle?.isActive &&
                " El usuario no podrá acceder al sistema hasta que sea reactivado."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDisabling || isEnabling}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggleStatus}
              disabled={isDisabling || isEnabling}
            >
              {userToToggle?.isActive ? "Desactivar" : "Activar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
