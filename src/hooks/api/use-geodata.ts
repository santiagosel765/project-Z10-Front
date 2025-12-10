/**
 * Custom hooks para GeoData con TanStack Query
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';
import { 
  geodataService, 
  type UploadGeodataDTO, 
  type GeodataFilters,
  type GeodataAnalysisRequest 
} from '@/services/geodata.service';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para obtener todas las capas
 */
export function useGeodataLayers(filters?: GeodataFilters) {
  return useQuery({
    queryKey: queryKeys.geodata.list(filters),
    queryFn: () => geodataService.getLayers(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para obtener una capa específica
 */
export function useGeodataLayer(id: string) {
  return useQuery({
    queryKey: queryKeys.geodata.detail(id),
    queryFn: () => geodataService.getLayerById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener datos GeoJSON de una capa
 */
export function useLayerData(id: string) {
  return useQuery({
    queryKey: [...queryKeys.geodata.detail(id), 'data'],
    queryFn: () => geodataService.getLayerData(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos (los datos geoespaciales cambian poco)
  });
}

/**
 * Hook para subir una capa
 */
export function useUploadLayer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UploadGeodataDTO) => geodataService.uploadLayer(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.geodata.all });
      
      toast({
        title: 'Capa cargada',
        description: `${response.data.title} ha sido cargada exitosamente.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al cargar capa',
        description: error.response?.data?.message || 'El archivo no pudo ser procesado',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para eliminar una capa
 */
export function useDeleteLayer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => geodataService.deleteLayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.geodata.all });
      
      toast({
        title: 'Capa eliminada',
        description: 'La capa ha sido eliminada exitosamente.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al eliminar capa',
        description: error.response?.data?.message || 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para realizar análisis espacial
 */
export function useGeodataAnalysis() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: GeodataAnalysisRequest) => geodataService.performAnalysis(request),
    onSuccess: (response) => {
      toast({
        title: 'Análisis completado',
        description: 'Los resultados están listos para visualizar.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error en el análisis',
        description: error.response?.data?.message || 'No se pudo completar el análisis',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para exportar una capa
 */
export function useExportLayer() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: 'geojson' | 'kml' | 'shapefile' }) => 
      geodataService.exportLayer(id, format),
    onSuccess: (blob, variables) => {
      // Descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Capa exportada',
        description: `Archivo ${variables.format.toUpperCase()} descargado exitosamente.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al exportar',
        description: error.response?.data?.message || 'No se pudo exportar la capa',
        variant: 'destructive',
      });
    },
  });
}
