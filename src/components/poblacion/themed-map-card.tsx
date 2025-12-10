"use client";

import { useState, useCallback, useId } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PopulationMap } from '@/components/poblacion/population-map';
import { ControlPanel } from '@/components/poblacion/control-panel';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { MapCardConfig, ActiveThematicLayer } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ThemedMapCardProps {
    config: MapCardConfig;
}

const getColorForLayer = (layerId: string) => {
    let hash = 0;
    for (let i = 0; i < layerId.length; i++) {
        hash = layerId.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

export function ThemedMapCard({ config }: ThemedMapCardProps) {
    const [isPanelVisible, setIsPanelVisible] = useState(true);
    const [activeLayers, setActiveLayers] = useState<ActiveThematicLayer[]>([]);
    const [focusedLayer, setFocusedLayer] = useState<string | null>(null);
    const { toast } = useToast();
    const mapId = useId();

    const fetchGeoJSON = async (url: string): Promise<any> => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        return response.json();
    };

    const handleToggleLayer = useCallback(async (layerId: string, geojsonPath: string) => {
        const existingLayer = activeLayers.find(l => l.id === layerId);

        if (existingLayer) {
            setActiveLayers(prev => prev.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l));
            if (!existingLayer.visible) {
                 setFocusedLayer(layerId);
            }
            return;
        }

        toast({ title: "Cargando capa...", description: `Se está cargando la capa ${layerId}.` });
        try {
            const geojsonData = await fetchGeoJSON(geojsonPath);
            const newLayer: ActiveThematicLayer = {
                id: layerId,
                name: config.layers.find(l => l.id === layerId)?.name || 'Capa sin nombre',
                data: geojsonData,
                visible: true,
                color: getColorForLayer(layerId),
            };
            setActiveLayers(prev => [...prev, newLayer]);
            setFocusedLayer(layerId);
            toast({ title: "Capa cargada", description: `La capa ${layerId} se ha añadido al mapa.` });
        } catch (error) {
            console.error("Error loading layer:", error);
            toast({ variant: "destructive", title: "Error de Carga", description: `No se pudo cargar la capa ${layerId}.` });
        }

    }, [activeLayers, config.layers, toast]);

    const handleFocusLayer = (layerId: string) => {
        const layer = activeLayers.find(l => l.id === layerId);
        if(layer && layer.visible) {
            setFocusedLayer(layerId);
        }
    };
    
    const handleResetFocus = () => {
        setFocusedLayer(null);
    }

    return (
        <Card className="bg-muted/30 overflow-hidden">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <config.icon className="h-6 w-6" />
                    <span>{config.title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div className={cn(
                        "md:col-span-1 flex flex-col transition-all duration-300 ease-in-out",
                        isPanelVisible ? "opacity-100" : "opacity-0 w-0 h-0 p-0 m-0 border-0"
                     )}>
                         {isPanelVisible && <ControlPanel config={config} activeLayers={activeLayers} onToggleLayer={handleToggleLayer} onFocusLayer={handleFocusLayer}/>}
                    </div>
                    <div className={cn(
                        "relative h-[600px] transition-all duration-300 ease-in-out",
                        isPanelVisible ? "md:col-span-3" : "md:col-span-4"
                    )}>
                        <PopulationMap 
                            mapId={mapId}
                            activeLayers={activeLayers.filter(l => l.visible)}
                            focusedLayerId={focusedLayer}
                            onResetFocus={handleResetFocus}
                        />
                         <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-2 left-2 z-[1000] shadow-md"
                            onClick={() => setIsPanelVisible(!isPanelVisible)}
                        >
                            {isPanelVisible ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
