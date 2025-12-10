"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Beaker } from "lucide-react";
import { MapEmbedExamples } from "@/components/map/map-embed-examples";
import { GenericMapDemo } from "@/components/map/generic-map-demo";

export default function PruebasPage() {
  return (
    <div className="h-full w-full overflow-auto">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Beaker className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-headline">Pruebas & Ejemplos</h1>
              <p className="text-muted-foreground">
                Componentes de ejemplo para desarrollo y testing
              </p>
            </div>
          </div>
        </div>

        {/* Tabs de Ejemplos */}
        <Card>
          <CardHeader>
            <CardTitle>Componentes de Ejemplo</CardTitle>
            <CardDescription>
              Explora diferentes componentes y sus funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="generic-map" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generic-map">GenericMap Component</TabsTrigger>
                <TabsTrigger value="map-embed">Map Embed Widget</TabsTrigger>
              </TabsList>

              <TabsContent value="generic-map" className="mt-6">
                <GenericMapDemo />
              </TabsContent>

              <TabsContent value="map-embed" className="mt-6">
                <MapEmbedExamples />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
