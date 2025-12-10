
"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GeoJsonUploaderProps {
    onLayerLoad: (geojsonData: any, fileName: string) => void;
}

export function GeoJsonUploader({ onLayerLoad }: GeoJsonUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type === "application/json" || file.name.endsWith('.geojson')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const jsonText = e.target?.result as string;
                        const geojsonData = JSON.parse(jsonText);
                        onLayerLoad(geojsonData, file.name);
                        toast({
                            title: "Capa Cargada",
                            description: `Se ha añadido la capa "${file.name}".`,
                        });
                    } catch (error) {
                        toast({
                            variant: "destructive",
                            title: "Error de formato",
                            description: "El archivo no es un GeoJSON válido.",
                        });
                    }
                };
                reader.readAsText(file);
            } else {
                 toast({
                    variant: "destructive",
                    title: "Archivo no válido",
                    description: "Por favor, seleccione un archivo GeoJSON (.json o .geojson).",
                });
            }
        }
        if (event.target) event.target.value = '';
    };

    return (
        <>
            <input 
                type="file" 
                accept=".json,.geojson" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
            />
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Cargar GeoJSON
            </Button>
        </>
    );
}
