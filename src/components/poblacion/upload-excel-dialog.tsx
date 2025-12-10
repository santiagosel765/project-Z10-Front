"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
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
import type { UploadedFile } from "@/types";

interface UploadExcelDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onFileUpload: (fileData: Omit<UploadedFile, "id" | "uploadDate">) => void;
}

export function UploadExcelDialog({ isOpen, onClose, onFileUpload }: UploadExcelDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [fileName, setFileName] = useState("");
    const [dataDate, setDataDate] = useState<Date>();
    const [coverage, setCoverage] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const resetForm = () => {
        setFileName("");
        setDataDate(undefined);
        setCoverage("");
        setFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.name.endsWith('.xlsx')) {
                setFile(selectedFile);
                setFileName(selectedFile.name);
                setError(null);
            } else {
                setError("Formato no soportado. Use .xlsx.");
                setFile(null);
                setFileName("");
            }
        }
    };

    const handleSubmit = async () => {
        setError(null);
        if (!file || !fileName || !dataDate || !coverage || !user?.username) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'array' });
                    if (workbook.SheetNames.length === 0 || workbook.SheetNames.length > 1) {
                         toast({ variant: "destructive", title: "Error de formato", description: "El archivo Excel debe contener exactamente una hoja."});
                        return;
                    }
                     onFileUpload({
                        fileName,
                        dataDate,
                        coverage,
                        uploadedBy: user.username,
                    });
                    toast({ title: "Carga Exitosa", description: `El archivo ${fileName} se ha cargado.`});
                    handleClose();
                } catch (readError) {
                    console.error(readError);
                    toast({ variant: "destructive", title: "Error de Lectura", description: "No se pudo procesar el archivo Excel."});
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (e) {
            toast({ variant: "destructive", title: "Error Inesperado", description: "Ocurrió un error al procesar el archivo."});
        }
    };
    
    const handleClose = () => {
        resetForm();
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cargar Archivo Excel</DialogTitle>
                    <DialogDescription>
                        Complete la información de la base de datos que desea cargar.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="excel-file">Archivo (.xlsx)</Label>
                        <Input id="excel-file" type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="file-name">Nombre del Archivo</Label>
                        <Input id="file-name" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Ej: Censo Poblacional" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="data-date">Fecha de los Datos</Label>
                        <DatePicker placeholder="Seleccione una fecha" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="coverage">Cobertura</Label>
                         <Select onValueChange={setCoverage} value={coverage}>
                            <SelectTrigger id="coverage">
                                <SelectValue placeholder="Seleccionar cobertura" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Nacional">Nacional</SelectItem>
                                <SelectItem value="Departamental">Departamental</SelectItem>
                                <SelectItem value="Municipal">Municipal</SelectItem>
                                <SelectItem value="Personalizada">Personalizada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="uploadedBy">Usuario de Carga</Label>
                        <Input id="uploadedBy" value={user?.username || ''} readOnly disabled />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit}>Guardar y Cargar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
