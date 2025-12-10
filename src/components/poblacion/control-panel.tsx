"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayerList } from './layer-list';
import { DownloadList } from './download-list';
import type { MapCardConfig, ActiveThematicLayer } from '@/types';

interface ControlPanelProps {
    config: MapCardConfig;
    activeLayers: ActiveThematicLayer[];
    onToggleLayer: (layerId: string, geojsonPath: string) => void;
    onFocusLayer: (layerId: string) => void;
}

export function ControlPanel({ config, activeLayers, onToggleLayer, onFocusLayer }: ControlPanelProps) {

    if(config.layers.length === 0) {
        return (
            <Card className="h-full bg-transparent border-0 shadow-none">
                <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground text-center">Sin datos disponibles para esta categoría.</p>
                </CardContent>
            </Card>
        );
    }

    return (
         <Card className="h-full bg-transparent border-0 shadow-none">
            <CardContent className="p-0">
                 <Tabs defaultValue="layers">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="layers">Capas</TabsTrigger>
                        <TabsTrigger value="downloads">Descargas</TabsTrigger>
                    </TabsList>
                    <TabsContent value="layers" className="mt-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="study-select">Estudio</Label>
                            <Select defaultValue={config.studies[0]}>
                                <SelectTrigger id="study-select">
                                    <SelectValue placeholder="Seleccionar estudio" />
                                </SelectTrigger>
                                <SelectContent>
                                    {config.studies.map(study => <SelectItem key={study} value={study}>{study}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="year-select">Año</Label>
                                <Select defaultValue="2024">
                                    <SelectTrigger id="year-select">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2024">2024</SelectItem>
                                        <SelectItem value="2023">2023</SelectItem>
                                        <SelectItem value="2022">2022</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="coverage-select">Cobertura</Label>
                                <Select defaultValue="Nacional">
                                    <SelectTrigger id="coverage-select">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Nacional">Nacional</SelectItem>
                                        <SelectItem value="Departamental">Departamental</SelectItem>
                                        <SelectItem value="Municipal">Municipal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <LayerList 
                            layers={config.layers} 
                            activeLayers={activeLayers} 
                            onToggle={onToggleLayer}
                            onFocus={onFocusLayer}
                        />

                    </TabsContent>
                    <TabsContent value="downloads" className="mt-4">
                        <DownloadList files={config.downloads} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
