/**
 * Servicio de GeoData
 * Maneja capas geoespaciales, uploads y análisis
 */
import api from '@/lib/api-client';
import type { GeodataLayer } from '@/types';

export interface UploadGeodataDTO {
  file: File;
  title: string;
  category: string;
  description?: string;
}

export interface GeodataFilters {
  category?: string;
  source?: 'system' | 'user';
  search?: string;
  page?: number;
  limit?: number;
}

export interface GeodataAnalysisRequest {
  layerId: string;
  analysisType: 'overlay' | 'proximity' | 'hotspot';
  parameters: Record<string, any>;
}

/**
 * Servicio de GeoData
 */
export const geodataService = {
  /**
   * Obtener todas las capas geoespaciales
   */
  getLayers: async (filters?: GeodataFilters) => {
    const response = await api.get<GeodataLayer[]>('/geodata/layers', { params: filters });
    return response.data;
  },

  /**
   * Obtener una capa por ID
   */
  getLayerById: async (id: string) => {
    const response = await api.get<GeodataLayer>(`/geodata/layers/${id}`);
    return response.data;
  },

  /**
   * Obtener datos GeoJSON de una capa
   */
  getLayerData: async (id: string) => {
    const response = await api.get<any>(`/geodata/layers/${id}/data`);
    return response.data;
  },

  /**
   * Subir un archivo GeoJSON/KML/Shapefile
   */
  uploadLayer: async ({ file, title, category, description }: UploadGeodataDTO) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('category', category);
    if (description) formData.append('description', description);

    const response = await api.upload<GeodataLayer>('/geodata/upload', formData);
    return response.data;
  },

  /**
   * Eliminar una capa
   */
  deleteLayer: async (id: string) => {
    const response = await api.delete<void>(`/geodata/layers/${id}`);
    return response.data;
  },

  /**
   * Realizar análisis espacial
   */
  performAnalysis: async (request: GeodataAnalysisRequest) => {
    const response = await api.post<any>('/geodata/analysis', request);
    return response.data;
  },

  /**
   * Exportar capa en formato específico
   */
  exportLayer: async (id: string, format: 'geojson' | 'kml' | 'shapefile') => {
    const response = await api.download(`/geodata/layers/${id}/export?format=${format}`);
    return response.data;
  },
};
