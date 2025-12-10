
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/datepicker";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { GeodataLayer } from "@/types";

interface UploadGeoJsonDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onFileUpload: (fileData: Omit<GeodataLayer, "id" | 'source'>, geoJson: any) => void;
    categories: string[];
}

export function UploadGeoJsonDialog({ isOpen, onClose, onFileUpload, categories }: UploadGeoJsonDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [dataDate, setDataDate] = useState<Date>();
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const resetForm = () => {
        setTitle("");
        setCategory("");
        setDataDate(undefined);
        setFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type === "application/json" || selectedFile.name.endsWith('.geojson')) {
                setFile(selectedFile);
                setTitle(selectedFile.name.replace(/\.(geojson|json)$/, ''));
                setError(null);
            } else {
                setError("Formato no soportado. Use .geojson o .json.");
                setFile(null);
                setTitle("");
            }
        }
    };

    const handleSubmit = () => {
        setError(null);
        if (!file || !title || !category || !dataDate || !user?.username) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const geoJson = JSON.parse(text);
                
                // Basic GeoJSON validation
                if (geoJson.type !== 'FeatureCollection' || !Array.isArray(geoJson.features)) {
                     toast({ variant: "destructive", title: "Error de formato", description: "El archivo debe ser un GeoJSON FeatureCollection válido."});
                     return;
                }

                onFileUpload({
                    title,
                    category,
                    dataDate,
                    uploadedBy: user.username,
                }, geoJson);

                toast({ title: "Carga Exitosa", description: `La capa ${title} se ha añadido.`});
                handleClose();

            } catch (readError) {
                console.error(readError);
                toast({ variant: "destructive", title: "Error de Lectura", description: "No se pudo procesar el archivo GeoJSON."});
            }
        };
        reader.readAsText(file);
    };
    
    const handleClose = () => {
        resetForm();
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cargar Capa GeoJSON</DialogTitle>
                    <DialogDescription>
                        Cargue un archivo en formato GeoJSON (.json, .geojson) para visualizarlo en el mapa.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="geojson-file">Archivo (.geojson, .json)</Label>
                        <Input id="geojson-file" type="file" ref={fileInputRef} onChange={handleFileChange} accept=".geojson,.json,application/json" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="layer-name">Nombre de la capa</Label>
                        <Input id="layer-name" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Puntos de Interés" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                         <Select onValueChange={setCategory} value={category}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                <SelectItem value="Nueva Categoría">... Nueva Categoría</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="data-date">Fecha de los Datos</Label>
                        <DatePicker placeholder="Seleccione una fecha" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="uploadedBy">Usuario de Carga</Label>
                        <Input id="uploadedBy" value={user?.username || ''} readOnly disabled />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={!file}>Guardar y Cargar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
