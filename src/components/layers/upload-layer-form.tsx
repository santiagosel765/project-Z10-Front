"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useUploadGeoJSONLayer } from "@/hooks/api/use-layers";
import { useMaps } from "@/hooks/api/use-maps";
import type { Map } from "@/services/maps.service";
import { Upload, Loader2 } from "lucide-react";
import type { LayerType } from "@/services/layers.service";
import { Badge } from "@/components/ui/badge";

const uploadLayerSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(200, "El nombre no debe exceder 200 caracteres"),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  file: z.instanceof(File).refine((file) => file.size > 0, "Debes seleccionar un archivo"),
  mapId: z.string().optional(),
  color: z.string().optional(),
  weight: z.number().min(0).max(10).optional(),
  opacity: z.number().min(0).max(1).optional(),
  fillColor: z.string().optional(),
  fillOpacity: z.number().min(0).max(1).optional(),
});

type UploadLayerFormData = z.infer<typeof uploadLayerSchema>;

interface UploadLayerFormProps {
  userId: number;
  defaultMapId?: number;
  onSuccess?: () => void;
  showMapSelector?: boolean;
}

export function UploadLayerForm({
  userId,
  defaultMapId,
  onSuccess,
  showMapSelector = true,
}: UploadLayerFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedGeometryType, setDetectedGeometryType] = useState<LayerType | null>(null);
  const { toast } = useToast();
  const { mutate: uploadLayer, isPending } = useUploadGeoJSONLayer();
  const { data: mapsData, isLoading: isLoadingMaps } = useMaps();

  const form = useForm<UploadLayerFormData>({
    resolver: zodResolver(uploadLayerSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: false,
      mapId: defaultMapId?.toString() || "",
      color: "#3388ff",
      weight: 2,
      opacity: 1,
      fillColor: "#3388ff",
      fillOpacity: 0.2,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".geojson") && !file.name.endsWith(".json")) {
        toast({
          title: "Archivo inválido",
          description: "Solo se permiten archivos .geojson o .json",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 200 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El archivo no debe superar 200MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      form.setValue("file", file);
      
      if (!form.getValues("name")) {
        const fileName = file.name.replace(/\.(geo)?json$/i, "");
        form.setValue("name", fileName);
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const geojson = JSON.parse(e.target?.result as string);
          const features = geojson.features || [];
          
          if (features.length > 0) {
            const geometryTypes = new Set(
              features.map((f: any) => f.geometry?.type?.toLowerCase()).filter(Boolean)
            );
            
            let detectedType: LayerType = 'mixed';
            if (geometryTypes.size === 1) {
              const type = Array.from(geometryTypes)[0] as string;
              detectedType = type as LayerType;
            } else if (geometryTypes.size > 1) {
              detectedType = 'mixed';
            }
            
            setDetectedGeometryType(detectedType);
            
            // Configurar valores por defecto según tipo
            if (detectedType === 'point' || detectedType === 'multipoint') {
              form.setValue('color', '#3388ff');
            } else if (detectedType === 'linestring' || detectedType === 'multilinestring') {
              form.setValue('color', '#3388ff');
              form.setValue('weight', 3);
              form.setValue('opacity', 0.8);
            } else if (detectedType === 'polygon' || detectedType === 'multipolygon') {
              form.setValue('fillColor', '#3388ff');
              form.setValue('fillOpacity', 0.2);
              form.setValue('color', '#3388ff');
              form.setValue('weight', 2);
            }
          }
        } catch (error) {
          console.error('Error al leer GeoJSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const onSubmit = (data: UploadLayerFormData) => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Debes seleccionar un archivo GeoJSON",
        variant: "destructive",
      });
      return;
    }

    let style: any = {
      color: data.color || "#3388ff",
      weight: data.weight || 2,
      opacity: data.opacity || 1,
      fillColor: data.fillColor || "#3388ff",
      fillOpacity: data.fillOpacity || 0.2,
    };

    const formData = {
      name: data.name,
      description: data.description,
      isPublic: data.isPublic,
      userId: userId,
      createdBy: userId,
      mapId: data.mapId ? parseInt(data.mapId) : undefined,
      displayOrder: 0,
      style,
    };

    uploadLayer(
      { file: selectedFile, data: formData },
      {
        onSuccess: (response) => {
          toast({
            title: "¡Capa subida exitosamente!",
            description: `La capa "${data.name}" se ha creado correctamente`,
          });
          
          form.reset();
          setSelectedFile(null);
          setDetectedGeometryType(null);
          onSuccess?.();
        },
        onError: (error: any) => {
          toast({
            title: "Error al subir la capa",
            description: error?.response?.data?.message || "Ocurrió un error inesperado",
            variant: "destructive",
          });
        },
      }
    );
  };

  const maps = Array.isArray(mapsData?.data) ? mapsData.data : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* File Upload */}
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Archivo GeoJSON *</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".geojson,.json"
                    onChange={handleFileChange}
                    disabled={isPending}
                  />
                  {selectedFile && (
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedFile && (
          <>
            {/* Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la capa *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Distritos de Guatemala"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el contenido de esta capa..."
                      disabled={isPending}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selector de mapa */}
            {showMapSelector && (
              <FormField
                control={form.control}
                name="mapId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mapa (opcional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending || isLoadingMaps}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un mapa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Sin asignar</SelectItem>
                        {maps.map((map: Map) => (
                          <SelectItem key={map.id} value={map.id.toString()}>
                            {map.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Asocia esta capa a un mapa específico
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Visibilidad pública */}
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Capa Pública</FormLabel>
                    <FormDescription>
                      Permitir que otros usuarios vean esta capa
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Sección de Estilo */}
            {detectedGeometryType && (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Estilo de la Capa</h3>
                  <span className="text-xs text-muted-foreground capitalize">
                    Tipo: {detectedGeometryType.replace("multi", "multi-")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Campos para PUNTOS */}
                  {(detectedGeometryType === "point" ||
                    detectedGeometryType === "multipoint") && (
                    <>
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Color del Marcador</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  {...field}
                                  disabled={isPending}
                                  className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  disabled={isPending}
                                  placeholder="#3388ff"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Campos para LÍNEAS */}
                  {(detectedGeometryType === "linestring" ||
                    detectedGeometryType === "multilinestring") && (
                    <>
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color de Línea</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  {...field}
                                  disabled={isPending}
                                  className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  disabled={isPending}
                                  placeholder="#3388ff"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grosor de Línea</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="10"
                                step="0.5"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="opacity"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Opacidad</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Campos para POLÍGONOS */}
                  {(detectedGeometryType === "polygon" ||
                    detectedGeometryType === "multipolygon") && (
                    <>
                      <FormField
                        control={form.control}
                        name="fillColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color de Relleno</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  {...field}
                                  disabled={isPending}
                                  className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  disabled={isPending}
                                  placeholder="#3388ff"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fillOpacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Opacidad de Relleno</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color de Borde</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  {...field}
                                  disabled={isPending}
                                  className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  disabled={isPending}
                                  placeholder="#3388ff"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grosor de Borde</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="10"
                                step="0.5"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Campos para MIXED */}
                  {detectedGeometryType === "mixed" && (
                    <>
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Color General</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  {...field}
                                  disabled={isPending}
                                  className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  disabled={isPending}
                                  placeholder="#3388ff"
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Se aplicará a todas las geometrías
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Capa
                </>
              )}
            </Button>
          </>
        )}

        {!selectedFile && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Selecciona un archivo GeoJSON para comenzar</p>
          </div>
        )}
      </form>
    </Form>
  );
}
