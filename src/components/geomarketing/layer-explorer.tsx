
"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Users, Landmark, UserCheck, Grid } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ActiveLayer } from "@/types";

type LayerType = 'clientes' | 'poblacion' | 'bancos' | 'grid-hexagonal';

const LAYER_CONFIG = {
    clientes: { id: 'clientes', name: 'Clientes', category: 'Clientes', icon: Users },
    poblacion: { id: 'poblacion', name: 'Población', category: 'Demografía', icon: UserCheck },
    bancos: { id: 'bancos', name: 'Bancos', category: 'Competencia', icon: Landmark },
    'grid-hexagonal': { id: 'grid-hexagonal', name: 'Grid Hexagonal', category: 'Análisis', icon: Grid },
} satisfies Record<LayerType, Omit<ActiveLayer, 'visible' | 'opacity' | 'data'>>;

interface LayerExplorerProps {
  onLayerUpload: (layerInfo: Omit<ActiveLayer, 'visible' | 'opacity' | 'data'>, file: File) => void;
}

export function LayerExplorer({ onLayerUpload }: LayerExplorerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentLayerTypeRef = useRef<LayerType | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentLayerTypeRef.current) {
        if (file.type === "application/json" || file.name.endsWith('.geojson')) {
            const layerInfo = LAYER_CONFIG[currentLayerTypeRef.current];
            onLayerUpload(layerInfo, file);
             toast({
                title: "Capa Cargada",
                description: `Se está procesando el archivo para la capa "${layerInfo.name}".`,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Archivo no válido",
                description: "Por favor, seleccione un archivo GeoJSON (.json o .geojson).",
            });
        }
    }
    // Reset input para permitir cargar el mismo archivo de nuevo
    if(event.target) event.target.value = '';
    currentLayerTypeRef.current = null;
  };

  const handleButtonClick = (layerType: LayerType) => {
    currentLayerTypeRef.current = layerType;
    fileInputRef.current?.click();
  }

  return (
    <div className="absolute z-10 w-full max-w-sm rounded-lg border bg-background p-4 shadow-lg">
      <input 
        type="file" 
        accept=".json,.geojson" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
      <h3 className="font-semibold mb-2">Cargar Capas GeoJSON</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Seleccione el tipo de capa que desea subir. Los datos se añadirán al mapa.
      </p>
      <div className="grid grid-cols-2 gap-4">
        {Object.values(LAYER_CONFIG).map(layer => (
            <Button key={layer.id} variant="outline" onClick={() => handleButtonClick(layer.id as LayerType)}>
                <layer.icon className="mr-2" /> {layer.name}
            </Button>
        ))}
      </div>
    </div>
  );
}
