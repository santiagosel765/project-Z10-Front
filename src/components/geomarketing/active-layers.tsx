
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { ActiveLayer } from "@/types";

interface ActiveLayersProps {
  layers: ActiveLayer[];
  onToggleVisibility: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  onToggleAll: () => void;
}

export function ActiveLayers({ layers, onToggleVisibility, onDeleteLayer, onToggleAll }: ActiveLayersProps) {
  if (layers.length === 0) {
    return (
      <Card className="h-full bg-muted/30">
        <CardHeader>
          <CardTitle>Capas Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">No hay capas cargadas.</p>
        </CardContent>
      </Card>
    );
  }

  const areAllDefaultVisible = layers.filter(l => l.source === 'default').every(l => l.visible);

  return (
    <Card className="h-full bg-muted/30">
      <CardHeader>
        <CardTitle>Capas Disponibles</CardTitle>
        <Button variant="link" size="sm" onClick={onToggleAll} className="p-0 h-auto justify-start">
          {areAllDefaultVisible ? "Deseleccionar Todo" : "Seleccionar Todo"}
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
            {layers.map(layer => (
                <li key={layer.id} className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={layer.id}
                            checked={layer.visible}
                            onCheckedChange={() => onToggleVisibility(layer.id)}
                        />
                        <Label
                            htmlFor={layer.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate"
                            title={layer.name}
                        >
                            {layer.name}
                        </Label>
                    </div>
                    {layer.source === 'upload' && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-destructive"
                            onClick={() => onDeleteLayer(layer.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </li>
            ))}
        </ul>
      </CardContent>
    </Card>
  );
}
