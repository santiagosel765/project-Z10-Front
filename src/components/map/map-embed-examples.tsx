"use client";

/**
 * EJEMPLOS DE USO DEL MAP EMBED WIDGET
 *
 * Este archivo documenta cómo usar el sistema de mapas embedidos
 * para compartir mapas en aplicaciones externas mediante iframes
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, Code, Share2 } from "lucide-react";
import {
  generateEmbedUrl,
  generateIframeCode,
} from "@/components/map/map-embed-widget";

export function MapEmbedExamples() {
  const [mapId, setMapId] = useState(7);
  const [layers, setLayers] = useState("1,2,3");
  const [zoom, setZoom] = useState(7);
  const [hideControls, setHideControls] = useState(false);
  const [hideAttribution, setHideAttribution] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:9002";

  const embedUrl = generateEmbedUrl(baseUrl, mapId, {
    layers: layers ? layers.split(",").map(Number) : undefined,
    zoom,
    hideControls,
    hideAttribution,
  });

  const iframeCode = generateIframeCode(embedUrl, {
    width: "100%",
    height: 600,
    title: `Mapa ZENIT ${mapId}`,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Mapas Embedidos - ZENIT GeoAI</h1>
        <p className="text-muted-foreground">
          Sistema para compartir y embeder mapas públicos en aplicaciones
          externas
        </p>
      </div>

      {/* Configurador de Embed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Configurador de Embed
          </CardTitle>
          <CardDescription>
            Personaliza los parámetros del mapa embedido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mapId">ID del Mapa</Label>
              <Input
                id="mapId"
                type="number"
                value={mapId}
                onChange={(e) => setMapId(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="layers">Capas (IDs separados por comas)</Label>
              <Input
                id="layers"
                placeholder="1,2,3"
                value={layers}
                onChange={(e) => setLayers(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zoom">Zoom Inicial</Label>
              <Input
                id="zoom"
                type="number"
                min={1}
                max={20}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Opciones de Visualización</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hideControls}
                    onChange={(e) => setHideControls(e.target.checked)}
                  />
                  Ocultar controles
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hideAttribution}
                    onChange={(e) => setHideAttribution(e.target.checked)}
                  />
                  Ocultar atribución
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultado */}
      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="code">Código Iframe</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa del Mapa</CardTitle>
              <CardDescription>
                Así se verá el mapa embedido en tu aplicación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="600"
                  style={{ border: 0 }}
                  title={`Mapa ZENIT ${mapId}`}
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>URL de Embed</CardTitle>
              <CardDescription>
                Usa esta URL en tu aplicación o iframe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={embedUrl}
                  className="font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(embedUrl)}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <Alert>
                <Code className="h-4 w-4" />
                <AlertDescription>
                  Esta URL puede ser usada directamente en un navegador o dentro
                  de un iframe
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Código Iframe</CardTitle>
              <CardDescription>
                Copia este código HTML para embeder el mapa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{iframeCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(iframeCode)}
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>

              <Alert>
                <Code className="h-4 w-4" />
                <AlertDescription>
                  Pega este código en tu aplicación web, blog o CMS
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ejemplos de Uso */}
      <Card>
        <CardHeader>
          <CardTitle>Ejemplos de Uso</CardTitle>
          <CardDescription>
            Casos de uso comunes para mapas embedidos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Mapa ArcGIS Básico</h3>
              <pre className="bg-slate-100 p-3 rounded text-sm overflow-x-auto">
                {`<iframe 
  src="${baseUrl}/embed/map/7" 
  width="100%" 
  height="600"
  frameborder="0"
></iframe>`}
              </pre>
              <p className="text-xs text-muted-foreground mt-2">
                Mapa con webmapItemId → Se renderiza con ArcGIS
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Mapa General (Leaflet)</h3>
              <pre className="bg-slate-100 p-3 rounded text-sm overflow-x-auto">
                {`<iframe 
  src="${baseUrl}/embed/map/10" 
  width="100%" 
  height="600"
  frameborder="0"
></iframe>`}
              </pre>
              <p className="text-xs text-muted-foreground mt-2">
                Mapa sin webmapItemId → Se renderiza con Leaflet
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                3. Mapa con Capas Específicas
              </h3>
              <pre className="bg-slate-100 p-3 rounded text-sm overflow-x-auto">
                {`<iframe 
  src="${baseUrl}/embed/map/7?layers=1,2,3" 
  width="100%" 
  height="600"
  frameborder="0"
></iframe>`}
              </pre>
              <p className="text-xs text-muted-foreground mt-2">
                Solo muestra las capas con IDs 1, 2 y 3
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                4. Mapa Sin Controles (Minimal)
              </h3>
              <pre className="bg-slate-100 p-3 rounded text-sm overflow-x-auto">
                {`<iframe 
  src="${baseUrl}/embed/map/7?hideControls=true&hideAttribution=true" 
  width="100%" 
  height="600"
  frameborder="0"
></iframe>`}
              </pre>
              <p className="text-xs text-muted-foreground mt-2">
                Vista minimalista sin header ni footer
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentación */}
      <Card>
        <CardHeader>
          <CardTitle>Parámetros de Query String</CardTitle>
          <CardDescription>
            Personaliza el comportamiento del mapa con estos parámetros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-sm border-b pb-2 font-semibold">
              <div>Parámetro</div>
              <div>Tipo</div>
              <div>Descripción</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm border-b pb-2">
              <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                layers
              </code>
              <span className="text-muted-foreground">string</span>
              <span>IDs de capas separados por comas (ej: 1,2,3)</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm border-b pb-2">
              <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                zoom
              </code>
              <span className="text-muted-foreground">number</span>
              <span>Nivel de zoom inicial (1-20)</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm border-b pb-2">
              <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                hideControls
              </code>
              <span className="text-muted-foreground">boolean</span>
              <span>Ocultar header con información del mapa</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                hideAttribution
              </code>
              <span className="text-muted-foreground">boolean</span>
              <span>Ocultar footer con atribución</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notas Importantes */}
      <Alert>
        <AlertDescription className="space-y-2">
          <p className="font-semibold">📝 Notas Importantes:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              Solo mapas marcados como{" "}
              <code className="bg-slate-100 px-1 rounded">isPublic=true</code>{" "}
              pueden ser embedidos
            </li>
            <li>No se requiere autenticación para ver mapas públicos</li>
            <li>
              Si <code className="bg-slate-100 px-1 rounded">webmapItemId</code>{" "}
              existe → Se usa ArcGIS WebMap
            </li>
            <li>
              Si <code className="bg-slate-100 px-1 rounded">webmapItemId</code>{" "}
              es null → Se usa Leaflet (mapa general)
            </li>
            <li>
              La URL de embed se encuentra en la propiedad{" "}
              <code className="bg-slate-100 px-1 rounded">embedUrl</code> del
              mapa
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
