
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WmsLayer } from "@/types";
import { Eye, EyeOff, Trash2, PanelRightClose, Layers, Plus } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


interface WmsLayerPanelProps {
    activeLayers: WmsLayer[];
    onToggleLayer: (layerName: string, title: string) => void;
    onOpacityChange: (layerName: string, opacity: number) => void;
    onDeleteLayer: (layerName: string) => void;
    onClose: () => void;
}

const AVAILABLE_WMS_LAYERS = [
    { name: "ideg:amenaza_deslizamientos_insivumeh_2017", title: "Amenaza Deslizamientos 2017" },
    { name: "ideg:amenaza_inundaciones_conred_2017", title: "Amenaza Inundaciones 2017" },
    { name: "ideg:amenaza_sismica_insivumeh_2017_fallas", title: "Amenaza Sísmica (Fallas)" },
    { name: "ideg:municipios_pda_2018", title: "Municipios Priorizados PDA" },
    { name: "ideg:indice_de_sequia_agosto_2015", title: "Índice de Sequía 2015" },
    { name: "ideg:corredor_seco", title: "Corredor Seco" },
    { name: "ideg:mapa_fisiografico_paisajistico", title: "Mapa Fisiográfico Paisajístico" },
    { name: "ideg:pobreza_total_municipal_2014", title: "Pobreza Total Municipal 2014" },
];

export function WmsLayerPanel({ activeLayers, onToggleLayer, onOpacityChange, onDeleteLayer, onClose }: WmsLayerPanelProps) {

    const isLayerActive = (layerName: string) => activeLayers.some(l => l.name === layerName);

    return (
        <Card className="bg-muted/30 h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                    <Layers />
                    Capas WMS
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <PanelRightClose className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent className="flex-grow p-2 overflow-y-auto">
                {activeLayers.length === 0 && <p className="text-sm p-2 text-muted-foreground">No hay capas WMS activas.</p>}
                <ul className="space-y-2">
                    {activeLayers.map(layer => (
                        <li key={layer.name} className="p-2 bg-background/50 rounded-md text-sm">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold truncate pr-2" title={layer.title}>{layer.title}</span>
                                <div className="flex items-center gap-1">
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onToggleLayer(layer.name, layer.title)}>
                                        {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDeleteLayer(layer.name)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-2">
                                <Slider
                                    value={[layer.opacity]}
                                    max={1}
                                    step={0.1}
                                    onValueChange={(value) => onOpacityChange(layer.name, value[0])}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="p-2 border-t">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Añadir Capa WMS
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[300px]">
                        <ScrollArea className="h-[300px]">
                        {AVAILABLE_WMS_LAYERS.map(layer => (
                            <DropdownMenuItem 
                                key={layer.name} 
                                onSelect={() => onToggleLayer(layer.name, layer.title)}
                                disabled={isLayerActive(layer.name)}
                            >
                                {layer.title}
                            </DropdownMenuItem>
                        ))}
                        </ScrollArea>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
}
