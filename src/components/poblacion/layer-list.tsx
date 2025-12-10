"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Focus } from 'lucide-react';
import type { ThematicLayer, ActiveThematicLayer } from "@/types";

interface LayerListProps {
    layers: ThematicLayer[];
    activeLayers: ActiveThematicLayer[];
    onToggle: (layerId: string, geojsonPath: string) => void;
    onFocus: (layerId: string) => void;
}

export function LayerList({ layers, activeLayers, onToggle, onFocus }: LayerListProps) {
    return (
        <div className="space-y-2 pt-4 border-t">
            <Label>Capas Temáticas</Label>
             <ul className="space-y-2">
                {layers.map(layer => {
                    const isActive = activeLayers.some(al => al.id === layer.id && al.visible);
                    const isLoaded = activeLayers.some(al => al.id === layer.id);

                    return (
                        <li key={layer.id} className="flex items-center justify-between space-x-2 bg-background/50 p-2 rounded-md">
                            <div className="flex items-center space-x-2 truncate">
                                <Checkbox
                                    id={layer.id}
                                    checked={isActive}
                                    onCheckedChange={() => onToggle(layer.id, layer.geojsonPath)}
                                />
                                <Label
                                    htmlFor={layer.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate"
                                    title={layer.name}
                                >
                                    {layer.name}
                                </Label>
                            </div>
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => onFocus(layer.id)}
                                disabled={!isLoaded || !isActive}
                            >
                                <Focus className="h-4 w-4" />
                            </Button>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
