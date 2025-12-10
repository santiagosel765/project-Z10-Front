"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadCloud, MoreVertical } from "lucide-react";
import { UploadExcelDialog } from "./upload-excel-dialog";
import type { UploadedFile } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function SourceDatabaseManager() {
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

    const handleAddFile = (newFile: Omit<UploadedFile, "id" | "uploadDate">) => {
        const fileWithId: UploadedFile = {
            ...newFile,
            id: `file-${Date.now()}`,
            uploadDate: new Date(),
        };
        setUploadedFiles(prev => [fileWithId, ...prev]);
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">Bases Fuente</CardTitle>
                        <CardDescription>
                            Administre las bases de datos fuente para los análisis.
                        </CardDescription>
                    </div>
                    <Button onClick={() => setIsUploadDialogOpen(true)}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Cargar Archivo
                    </Button>
                </CardHeader>
                <CardContent>
                    {uploadedFiles.length === 0 ? (
                         <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">No se han cargado archivos de Excel.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre del Archivo</TableHead>
                                    <TableHead>Fecha de Datos</TableHead>
                                    <TableHead>Cobertura</TableHead>
                                    <TableHead>Usuario de Carga</TableHead>
                                    <TableHead>Fecha de Carga</TableHead>
                                    <TableHead><span className="sr-only">Acciones</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {uploadedFiles.map(file => (
                                    <TableRow key={file.id}>
                                        <TableCell className="font-medium">{file.fileName}</TableCell>
                                        <TableCell>{format(file.dataDate, "dd 'de' LLLL 'de' yyyy", { locale: es })}</TableCell>
                                        <TableCell>{file.coverage}</TableCell>
                                        <TableCell>{file.uploadedBy}</TableCell>
                                        <TableCell>{format(file.uploadDate, "dd/MM/yyyy HH:mm")}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <UploadExcelDialog 
                isOpen={isUploadDialogOpen}
                onClose={() => setIsUploadDialogOpen(false)}
                onFileUpload={handleAddFile}
            />
        </>
    );
}
