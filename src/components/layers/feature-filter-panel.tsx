"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Filter, 
  Layers, 
  MapPin, 
  X, 
  Info,
  Loader2 
} from "lucide-react";
import {
  useFeaturesCatalog,
  useFeaturesByIds,
  useFilterFeatures,
  useFilterMultipleLayersFeatures,
} from "@/hooks/api/use-layers";
import type { FilterParams } from "@/services/layers.service";

interface FeatureFilterPanelProps {
  layerId: number;
  onFeaturesLoaded?: (geojson: any) => void;
  multiLayerMode?: boolean;
  layerIds?: number[];
}

/**
 * Panel para filtrar features de capas multipolygon
 * 
 * Flujo de uso:
 * 1. Carga el catálogo de features (sin geometrías)
 * 2. Usuario selecciona features o aplica filtros
 * 3. Carga solo las geometrías necesarias
 * 
 * @example
 * ```tsx
 * // Modo single layer
 * <FeatureFilterPanel 
 *   layerId={18} 
 *   onFeaturesLoaded={(geojson) => renderInMap(geojson)}
 * />
 * 
 * // Modo multi-layer
 * <FeatureFilterPanel 
 *   layerId={18}
 *   multiLayerMode
 *   layerIds={[18, 19, 20, 21]}
 *   onFeaturesLoaded={(geojson) => renderInMap(geojson)}
 * />
 * ```
 */
export function FeatureFilterPanel({
  layerId,
  onFeaturesLoaded,
  multiLayerMode = false,
  layerIds = [],
}: FeatureFilterPanelProps) {
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<number[]>([]);
  const [filters, setFilters] = useState<FilterParams>({});
  const [filterMode, setFilterMode] = useState<'selection' | 'properties'>('selection');

  // Hook 1: Catálogo (listado sin geometrías)
  const {
    data: catalog,
    isLoading: catalogLoading,
    error: catalogError,
  } = useFeaturesCatalog(layerId);

  // Hook 2: Features por IDs seleccionados
  const {
    data: selectedFeatures,
    isLoading: selectedLoading,
  } = useFeaturesByIds(
    layerId,
    selectedFeatureIds,
    filterMode === 'selection' && selectedFeatureIds.length > 0
  );

  // Hook 3: Features filtradas por propiedades (single layer)
  const {
    data: filteredFeatures,
    isLoading: filteredLoading,
  } = useFilterFeatures(
    layerId,
    filters,
    undefined,
    filterMode === 'properties' && Object.keys(filters).length > 0 && !multiLayerMode
  );

  // Hook 4: Features filtradas en múltiples capas
  const {
    data: multiLayerFeatures,
    isLoading: multiLayerLoading,
  } = useFilterMultipleLayersFeatures(
    multiLayerMode ? layerIds : [],
    filters,
    filterMode === 'properties' && Object.keys(filters).length > 0 && multiLayerMode
  );

  // Determinar qué data mostrar
  const currentData = multiLayerMode 
    ? multiLayerFeatures 
    : filterMode === 'selection' 
      ? selectedFeatures 
      : filteredFeatures;

  const isLoading = catalogLoading || selectedLoading || filteredLoading || multiLayerLoading;

  // Toggle de selección de feature
  const toggleFeatureSelection = (featureId: number) => {
    setSelectedFeatureIds(prev => 
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  // Aplicar filtro por propiedad
  const applyFilter = (property: string, value: string) => {
    if (!value.trim()) {
      const newFilters = { ...filters };
      delete newFilters[property];
      setFilters(newFilters);
    } else {
      setFilters(prev => ({ ...prev, [property]: value }));
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({});
    setSelectedFeatureIds([]);
  };

  // Callback cuando hay datos
  if (currentData && onFeaturesLoaded) {
    onFeaturesLoaded(currentData);
  }

  if (catalogError) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Error al cargar el catálogo: {(catalogError as any).message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg border">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Filtro de Features</h3>
          </div>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filterMode === 'selection' ? 'default' : 'outline'}
            onClick={() => setFilterMode('selection')}
            className="flex-1"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Selección Manual
          </Button>
          <Button
            size="sm"
            variant={filterMode === 'properties' ? 'default' : 'outline'}
            onClick={() => setFilterMode('properties')}
            className="flex-1"
          >
            <Filter className="h-4 w-4 mr-2" />
            Por Propiedades
          </Button>
        </div>

        {/* Multi-layer indicator */}
        {multiLayerMode && (
          <Badge className="mt-2" variant="secondary">
            <Layers className="h-3 w-3 mr-1" />
            Modo multi-capa ({layerIds.length} capas)
          </Badge>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        {catalogLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filterMode === 'selection' ? (
          // Modo Selección Manual
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {catalog?.data?.totalFeatures} features disponibles
              </p>
              <Badge variant="outline">
                {selectedFeatureIds.length} seleccionadas
              </Badge>
            </div>

            {catalog?.data?.features.map((feature) => (
              <div
                key={feature.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedFeatureIds.includes(feature.id)
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => toggleFeatureSelection(feature.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {feature.properties.NOMBRE || 
                       feature.properties.NAME || 
                       `Feature #${feature.featureIndex}`}
                    </p>
                    <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                      {feature.properties.CODDISTRITO && (
                        <span>Distrito: {feature.properties.CODDISTRITO}</span>
                      )}
                      {feature.properties.CODREGION && (
                        <span>Región: {feature.properties.CODREGION}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Área: {parseFloat(feature.areaKm2).toFixed(2)} km²
                    </p>
                  </div>
                  {selectedFeatureIds.includes(feature.id) && (
                    <Badge className="ml-2">✓</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Modo Filtrado por Propiedades
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Soporta aliases automáticos (CODDISTRITO = NO_DISTRIT).
                Múltiples valores con comas: "5,10,15" (OR logic).
              </AlertDescription>
            </Alert>

            {/* Campos de filtro dinámicos basados en propiedades del catálogo */}
            {catalog?.data?.features[0] && (
              <>
                {Object.keys(catalog.data.features[0].properties)
                  .filter(key => 
                    !['NOMBRE', 'NAME', 'GEOM', 'GEOMETRY', 'ID'].includes(key.toUpperCase())
                  )
                  .slice(0, 5) // Mostrar solo las primeras 5 propiedades
                  .map((property) => (
                    <div key={property}>
                      <Label htmlFor={property} className="text-xs">
                        {property}
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id={property}
                          placeholder={`Ej: 5 o 5,10,15`}
                          value={String(filters[property] || '')}
                          onChange={(e) => applyFilter(property, e.target.value)}
                          className="text-sm"
                        />
                        {filters[property] && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => applyFilter(property, '')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                {/* Campo custom adicional */}
                <div>
                  <Label htmlFor="custom-property" className="text-xs">
                    Propiedad personalizada
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="custom-property-name"
                      placeholder="Nombre propiedad"
                      className="text-sm flex-1"
                      onBlur={(e) => {
                        if (e.target.value && e.target.nextElementSibling) {
                          const valueInput = e.target.nextElementSibling as HTMLInputElement;
                          if (valueInput.value) {
                            applyFilter(e.target.value, valueInput.value);
                          }
                        }
                      }}
                    />
                    <Input
                      id="custom-property-value"
                      placeholder="Valor"
                      className="text-sm flex-1"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-muted-foreground">
            {currentData && (
              <>
                {currentData.data?.metadata?.totalFeatures || currentData.data?.features?.length || 0} features cargadas
                {multiLayerMode && (currentData.data?.metadata as any)?.totalLayers && (
                  <> de {(currentData.data.metadata as any).totalLayers} capas</>
                )}
              </>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={clearFilters}
            disabled={selectedFeatureIds.length === 0 && Object.keys(filters).length === 0}
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        </div>

        {/* Metadata de capas en multi-layer mode */}
        {multiLayerMode && multiLayerFeatures?.data?.metadata?.layers && (
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium">Distribución por capa:</p>
            {multiLayerFeatures.data.metadata.layers.map((layer: any) => (
              <div key={layer.layerId} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{layer.layerName}</span>
                <Badge variant="secondary" className="text-xs">
                  {layer.featuresCount}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
