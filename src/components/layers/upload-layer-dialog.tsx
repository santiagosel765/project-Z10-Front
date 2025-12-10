"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const uploadLayerSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(200, "El nombre no debe exceder 200 caracteres"),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Debes seleccionar un archivo"),
  mapId: z.string().optional(),
  color: z.string().optional(),
  weight: z.number().min(0).max(10).optional(),
  opacity: z.number().min(0).max(1).optional(),
  fillColor: z.string().optional(),
  fillOpacity: z.number().min(0).max(1).optional(),
  iconUrl: z.string().optional(),
  iconSize: z.tuple([z.number(), z.number()]).optional(),
  iconAnchor: z.tuple([z.number(), z.number()]).optional(),
});

type UploadLayerFormData = z.infer<typeof uploadLayerSchema>;

interface UploadLayerDialogProps {
  userId: number;
  defaultMapId?: number;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function UploadLayerDialog({
  userId,
  defaultMapId,
  onSuccess,
  trigger,
}: UploadLayerDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedGeometryType, setDetectedGeometryType] =
    useState<LayerType | null>(null);
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
              features
                .map((f: any) => f.geometry?.type?.toLowerCase())
                .filter(Boolean)
            );

            let detectedType: LayerType = "mixed";
            if (geometryTypes.size === 1) {
              const type = Array.from(geometryTypes)[0] as string;
              detectedType = type as LayerType;
            } else if (geometryTypes.size > 1) {
              detectedType = "mixed";
            }

            setDetectedGeometryType(detectedType);

            if (detectedType === "point" || detectedType === "multipoint") {
              form.setValue("iconUrl", "/icons/marker-default.png");
              form.setValue("iconSize", [25, 41]);
              form.setValue("iconAnchor", [12, 41]);
              form.setValue("color", "#3388ff");
            } else if (
              detectedType === "linestring" ||
              detectedType === "multilinestring"
            ) {
              form.setValue("color", "#3388ff");
              form.setValue("weight", 3);
              form.setValue("opacity", 0.8);
            } else if (
              detectedType === "polygon" ||
              detectedType === "multipolygon"
            ) {
              form.setValue("fillColor", "#3388ff");
              form.setValue("fillOpacity", 0.2);
              form.setValue("color", "#3388ff");
              form.setValue("weight", 2);
            } else {
              form.setValue("color", "#3388ff");
              form.setValue("weight", 2);
              form.setValue("fillOpacity", 0.2);
            }
          }
        } catch (error) {
          console.error("Error al leer GeoJSON:", error);
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

    let style: any = {};

    if (
      detectedGeometryType === "point" ||
      detectedGeometryType === "multipoint"
    ) {
      style = {
        iconUrl: data.iconUrl,
        iconSize: data.iconSize,
        iconAnchor: data.iconAnchor,
        color: data.color,
      };
    } else if (
      detectedGeometryType === "linestring" ||
      detectedGeometryType === "multilinestring"
    ) {
      style = {
        color: data.color,
        weight: data.weight,
        opacity: data.opacity,
      };
    } else if (
      detectedGeometryType === "polygon" ||
      detectedGeometryType === "multipolygon"
    ) {
      style = {
        fillColor: data.fillColor,
        fillOpacity: data.fillOpacity,
        color: data.color,
        weight: data.weight,
      };
    } else {
      style = {
        color: data.color,
        weight: data.weight,
        fillOpacity: data.fillOpacity,
      };
    }

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

          setOpen(false);
          form.reset();
          setSelectedFile(null);
          onSuccess?.();
        },
        onError: (error: any) => {
          toast({
            title: "Error al subir la capa",
            description:
              error?.response?.data?.message || "Ocurrió un error inesperado",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <>
      <Button 
        className="bg-green-700/80 hover:bg-green-800/80 text-white"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        type="button"
      >
        <Upload className="mr-2 h-4 w-4" />
        Subir Capa
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Subir Capa GeoJSON</DialogTitle>
            <DialogDescription>
              Sube un archivo GeoJSON para crear una nueva capa en el sistema
            </DialogDescription>
          </DialogHeader>

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
                        <span className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Solo archivos .geojson o .json (máx. 200MB). Archivos
                    grandes pueden tardar varios minutos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Puntos de Interés - Zona 10"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Nombre descriptivo de la capa (3-200 caracteres)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Puntos de interés relevantes en la Zona 10 de Guatemala"
                      {...field}
                      disabled={isPending}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Descripción opcional de la capa
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Map Selection */}
            <FormField
              control={form.control}
              name="mapId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asociar a un mapa</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? ""}
                    disabled={isPending || isLoadingMaps}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un mapa (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Ninguno</SelectItem>
                      {mapsData?.data.data?.map((map: Map) => (
                        <SelectItem key={map.id} value={map.id.toString()}>
                          {map.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecciona un mapa para asociar esta capa automáticamente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* IsPublic */}
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Capa pública</FormLabel>
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
                      {/* <FormField
                        control={form.control}
                        name="iconUrl"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>URL del Ícono</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isPending}
                                placeholder="/icons/marker-default.png"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      /> */}

                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
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
                          <FormItem>
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
                          <FormItem>
                            <FormLabel>Color</FormLabel>
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
                            <FormLabel>Grosor</FormLabel>
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
                    </>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || !selectedFile}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Subir Capa
              </Button>
            </DialogFooter>
          </form>
        </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
