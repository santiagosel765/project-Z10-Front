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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCreateMap, useUpdateMap, useMapTypes } from "@/hooks/api/use-maps";
import type { Map, MapSettings } from "@/services/maps.service";

const mapSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(200, "El nombre no debe exceder 200 caracteres"),
  description: z.string().optional(),
  webmapItemId: z.string().optional(),
  mapTypeId: z.number({
    required_error: "Seleccione un tipo de mapa",
    invalid_type_error: "Seleccione un tipo de mapa válido",
  }),
  isDefault: z.boolean().default(false),
  zoom: z.number().min(1).max(20).default(8),
  centerLat: z.number().min(-90).max(90).default(15.7835),
  centerLng: z.number().min(-180).max(180).default(-90.2308),
  basemap: z.string().default("streets-vector"),
}).superRefine((data, ctx) => {
  // If webmapItemId is provided, validate it
  if (data.webmapItemId && data.webmapItemId.trim()) {
    if (!/^[a-zA-Z0-9]+$/.test(data.webmapItemId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Solo se permiten caracteres alfanuméricos",
        path: ["webmapItemId"],
      });
    }
  }
});

type MapFormValues = z.infer<typeof mapSchema>;

interface MapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  map?: Map | null;
}

export function MapDialog({ isOpen, onClose, onSuccess, map }: MapDialogProps) {
  const isEditing = !!map;
  const { mutate: createMap, isPending: isCreating } = useCreateMap();
  const { mutate: updateMap, isPending: isUpdating } = useUpdateMap();
  const { data: mapTypesResponse, isLoading: isLoadingMapTypes } = useMapTypes();
  
  const isPending = isCreating || isUpdating;
  const mapTypes = mapTypesResponse?.data || [];

  const form = useForm<MapFormValues>({
    resolver: zodResolver(mapSchema),
    defaultValues: {
      name: "",
      description: "",
      webmapItemId: "",
      mapTypeId: undefined,
      isDefault: false,
      zoom: 8,
      centerLat: 15.7835,
      centerLng: -90.2308,
      basemap: "streets-vector",
    },
  });

  const watchedMapTypeId = form.watch("mapTypeId");
  const selectedMapType = mapTypes.find((mt) => mt.id === watchedMapTypeId);
  const isArcGISMap = selectedMapType?.code.toLowerCase().includes("arcgis") || false;

  useEffect(() => {
    if (isOpen && map) {
      form.reset({
        name: map.name,
        description: map.description || "",
        webmapItemId: map.webmapItemId || "",
        mapTypeId: map.mapTypeId,
        isDefault: map.isDefault,
        zoom: map.settings.zoom,
        centerLat: map.settings.center[1],
        centerLng: map.settings.center[0],
        basemap: map.settings.basemap,
      });
    } else if (isOpen && !map) {
      form.reset({
        name: "",
        description: "",
        webmapItemId: "",
        mapTypeId: undefined,
        isDefault: false,
        zoom: 8,
        centerLat: 15.7835,
        centerLng: -90.2308,
        basemap: "streets-vector",
      });
    }
  }, [isOpen, map, form]);

  const handleSubmit = (values: MapFormValues) => {
    // Validate webmapItemId is required for ArcGIS map types
    if (isArcGISMap && (!values.webmapItemId || !values.webmapItemId.trim())) {
      form.setError("webmapItemId", {
        type: "manual",
        message: "El Web Map Item ID es requerido para mapas ArcGIS",
      });
      return;
    }

    const settings: MapSettings = {
      zoom: values.zoom,
      center: [values.centerLng, values.centerLat],
      basemap: values.basemap,
    };

    const mapData = {
      name: values.name,
      description: values.description || undefined,
      webmapItemId: values.webmapItemId?.trim() || undefined,
      mapTypeId: values.mapTypeId,
      isDefault: values.isDefault,
      settings,
    };

    if (isEditing && map) {
      updateMap(
        { id: map.id, data: mapData },
        {
          onSuccess: () => {
            onClose();
            form.reset();
            onSuccess?.();
          },
        }
      );
    } else {
      createMap(mapData, {
        onSuccess: () => {
          onClose();
          form.reset();
          onSuccess?.();
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Mapa" : "Crear Nuevo Mapa"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza los detalles del mapa"
              : "Completa el formulario para crear un nuevo mapa"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Mapa *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mapa de Guatemala"
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
                        placeholder="Descripción opcional del mapa"
                        rows={3}
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
                name="mapTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Mapa *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                      disabled={isPending || isLoadingMapTypes}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingMapTypes ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          mapTypes
                            .filter((mt) => mt.isActive)
                            .map((mapType) => (
                              <SelectItem
                                key={mapType.id}
                                value={mapType.id.toString()}
                              >
                                {mapType.name}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecciona el tipo de tecnología de mapas a utilizar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isArcGISMap && (
                <FormField
                  control={form.control}
                  name="webmapItemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Web Map Item ID *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="abc123def456"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        ID del elemento de ArcGIS Online (requerido para mapas ArcGIS)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Mapa por Defecto</FormLabel>
                      <FormDescription>
                        Este mapa se cargará por defecto en la aplicación
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

              <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-medium">Configuración Inicial</h4>

                <FormField
                  control={form.control}
                  name="zoom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel de Zoom</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription>Valor entre 1 (alejado) y 20 (cercano)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="centerLat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitud Central</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.0001"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="centerLng"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitud Central</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.0001"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="basemap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mapa Base</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="streets-vector"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        ID del basemap de ArcGIS (ej: streets-vector, topo-vector)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
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
                {isEditing ? "Guardar Cambios" : "Crear Mapa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
