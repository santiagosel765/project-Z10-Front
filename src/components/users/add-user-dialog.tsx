
"use client";

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
import { USER_ROLES, GERENCIAS, type UserRole } from "@/lib/constants";
import { useState, useEffect } from "react";
import type { AppUser } from "@/app/zenit/configuracion/usuarios/page";

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: Omit<AppUser, 'id' | 'status'>) => void;
}

const activeDirectoryMock: {[key: string]: Omit<AppUser, 'id' | 'status' | 'role' | 'employeeCode' | 'contactNumber'>} = {
    "EMP001": { name: "Carlos Rivera", networkUser: "crivera", position: "Gerente de Proyectos", management: "Gerencia Corporativa de Tecnología" },
    "EMP002": { name: "Ana Gomez", networkUser: "agomez", position: "Analista de Negocios", management: "Gerencia Corporativa de Negocios" },
    "EMP003": { name: "Luisa Fernandez", networkUser: "lfernandez", position: "Desarrollador", management: "Gerencia Corporativa de Tecnología" },
    "EMP004": { name: "Jorge Perez", networkUser: "jperez", position: "Analista de Datos", management: "Gerencia Corporativa de Riesgos" },
    "EMP005": { name: "Mariela Solis", networkUser: "msolis", position: "Auditor Interno", management: "Gerencia Corporativa de Auditoria Interna" },
};


export function AddUserDialog({ isOpen, onClose, onAddUser }: AddUserDialogProps) {
  const [employeeCode, setEmployeeCode] = useState("");
  const [name, setName] = useState("");
  const [networkUser, setNetworkUser] = useState("");
  const [position, setPosition] = useState("");
  const [management, setManagement] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [role, setRole] = useState<UserRole | "">("");

  useEffect(() => {
      if (employeeCode && activeDirectoryMock[employeeCode]) {
          const userData = activeDirectoryMock[employeeCode];
          setName(userData.name);
          setNetworkUser(userData.networkUser);
          setPosition(userData.position);
          setManagement(userData.management);
      } else {
          setName("");
          setNetworkUser("");
          setPosition("");
          setManagement("");
      }
  }, [employeeCode]);

  const resetForm = () => {
    setEmployeeCode("");
    setName("");
    setNetworkUser("");
    setPosition("");
    setManagement("");
    setContactNumber("");
    setRole("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (employeeCode && name && networkUser && position && management && contactNumber && role) {
      onAddUser({ employeeCode, name, networkUser, position, management, contactNumber, role: role as UserRole });
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Introduzca el código de empleado para autocompletar sus datos desde Active Directory (simulado).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="employeeCode" className="text-right">
              Código Empl.
            </Label>
            <Input id="employeeCode" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())} className="col-span-3" placeholder="Ej: EMP001" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" readOnly={!!activeDirectoryMock[employeeCode]}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="networkUser" className="text-right">
              Usuario de Red
            </Label>
            <Input id="networkUser" value={networkUser} onChange={(e) => setNetworkUser(e.target.value)} className="col-span-3" readOnly={!!activeDirectoryMock[employeeCode]}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right">
              Puesto
            </Label>
            <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} className="col-span-3" readOnly={!!activeDirectoryMock[employeeCode]}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="management" className="text-right">
              Gerencia
            </Label>
            <Select onValueChange={(value) => setManagement(value)} value={management} disabled={!!activeDirectoryMock[employeeCode]}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar gerencia" />
              </SelectTrigger>
              <SelectContent>
                {GERENCIAS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contactNumber" className="text-right">
              Contacto
            </Label>
            <Input id="contactNumber" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Rol
            </Label>
            <Select onValueChange={(value) => setRole(value as UserRole)} value={role}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar un rol" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button type="submit" onClick={handleSubmit}>Crear Usuario</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
