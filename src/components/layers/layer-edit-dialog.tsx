"use client";

import { useEffect } from "react";
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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useUpdateLayer } from "@/hooks/api/use-layers";
import { useMaps } from "@/hooks/api/use-maps";
import type { Layer, LayerDetail, LayerType } from "@/services/layers.service";
import type { Map } from "@/services/maps.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const layerSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(200, "El nombre no debe exceder 200 caracteres"),
  description: z.string().optional(),
  mapId: z.string().optional(), // String porque viene del Select component
  // Campos de estilo - para líneas y polígonos
  color: z.string().optional(),
  weight: z.number().min(0).max(10).optional(),
  opacity: z.number().min(0).max(1).optional(),
  fillColor: z.string().optional(),
  fillOpacity: z.number().min(0).max(1).optional(),
  iconUrl: z.string().optional(),
  iconSize: z.tuple([z.number(), z.number()]).optional(),
  iconAnchor: z.tuple([z.number(), z.number()]).optional(),
});

type LayerFormValues = z.infer<typeof layerSchema>;

interface LayerEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  layer: Layer | LayerDetail | null;
}

export function LayerEditDialog({
  isOpen,
  onClose,
  onSuccess,
  layer,
}: LayerEditDialogProps) {
  const { mutate: updateLayer, isPending } = useUpdateLayer();
  const { data: mapsData, isLoading: isLoadingMaps } = useMaps();

  const form = useForm<LayerFormValues>({
    resolver: zodResolver(layerSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3388ff",
      weight: 2,
      opacity: 1,
      fillColor: "#3388ff",
      fillOpacity: 0.2,
    },
  });

  useEffect(() => {
    if (isOpen && layer) {
      // Obtener mapId actual si la capa está asociada a algún mapa
      const currentMapId = 'mapLayers' in layer && Array.isArray(layer.mapLayers) && layer.mapLayers.length > 0
        ? (layer.mapLayers as any)[0].mapId.toString()
        : undefined;
      
      form.reset({
        name: layer.name,
        description: layer.description || "",
        mapId: currentMapId,
        color: layer.style?.color || "#3388ff",
        weight: layer.style?.weight || 2,
        opacity: layer.style?.opacity || 1,
        fillColor: layer.style?.fillColor || "#3388ff",
        fillOpacity: layer.style?.fillOpacity || 0.2,
        iconUrl: layer.style?.iconUrl || "/icons/marker-default.png",
        iconSize: layer.style?.iconSize || [25, 41],
        iconAnchor: layer.style?.iconAnchor || [12, 41],
      });
    }
  }, [isOpen, layer, form]);

  const handleSubmit = (values: LayerFormValues) => {
    if (!layer) return;

    // Construir estilo según tipo de geometría de la capa
    let style: any = {};
    const layerType = layer.layerType;
    
    if (layerType === 'point' || layerType === 'multipoint') {
      style = {
        iconUrl: values.iconUrl,
        iconSize: values.iconSize,
        iconAnchor: values.iconAnchor,
        color: values.color,
      };
    } else if (layerType === 'linestring' || layerType === 'multilinestring') {
      style = {
        color: values.color,
        weight: values.weight,
        opacity: values.opacity,
      };
    } else if (layerType === 'polygon' || layerType === 'multipolygon') {
      style = {
        fillColor: values.fillColor,
        fillOpacity: values.fillOpacity,
        color: values.color,
        weight: values.weight,
      };
    } else {
      style = {
        color: values.color,
        weight: values.weight,
        fillOpacity: values.fillOpacity,
      };
    }

    updateLayer(
      {
        id: layer.id,
        data: {
          name: values.name,
          description: values.description || undefined,
          style,
          mapId: values.mapId ? parseInt(values.mapId) : undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
          form.reset();
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Capa</DialogTitle>
          <DialogDescription>
            Actualiza la información de la capa
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Capa *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mi capa"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción opcional de la capa"
                      rows={3}
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selector de Mapa */}
            <FormField
              control={form.control}
              name="mapId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asociar a un mapa</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
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
                  <FormMessage />
                </FormItem>
              )}
            />

            
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Estilo de la Capa</h3>
                {layer && (
                  <span className="text-xs text-muted-foreground capitalize">
                    Tipo: {layer.layerType.replace('multi', 'multi-')}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Campos para PUNTOS */}
                {layer && (layer.layerType === 'point' || layer.layerType === 'multipoint') && (
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
                {layer && (layer.layerType === 'linestring' || layer.layerType === 'multilinestring') && (
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
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                {layer && (layer.layerType === 'polygon' || layer.layerType === 'multipolygon') && (
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
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                {layer && layer.layerType === 'mixed' && (
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
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
