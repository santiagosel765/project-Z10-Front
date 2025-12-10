
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
import { useState } from "react";
import type { ApiKey, ApiKeyCategory } from "@/lib/types";

interface AddApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddApiKey: (apiKey: Omit<ApiKey, 'id' | 'token' | 'status' | 'createdAt'>) => void;
}

const API_CATEGORIES: ApiKeyCategory[] = ["Geospatial", "Análisis de Datos", "Agentes de IA", "Servicios Externos"];

export function AddApiKeyDialog({ isOpen, onClose, onAddApiKey }: AddApiKeyDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ApiKeyCategory | "">("");
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setCategory("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!name.trim()) {
        setError("El nombre de la API es obligatorio.");
        return;
    }
    if (!category) {
        setError("Debe seleccionar una categoría para la API.");
        return;
    }
    onAddApiKey({ name, category });
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generar Nueva Clave de API</DialogTitle>
          <DialogDescription>
            Complete los detalles para crear un nuevo token de acceso.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Ej: Mi API de Geocodificación"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Categoría
            </Label>
            <Select onValueChange={(value) => setCategory(value as ApiKeyCategory)} value={category}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
                <SelectContent>
                    {API_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                        {cat}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          {error && <p className="col-span-4 text-center text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button type="submit" onClick={handleSubmit}>Generar API</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
