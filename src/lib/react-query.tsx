/**
 * Configuración de TanStack Query (React Query)
 * Provider y configuración global para manejo de estado del servidor
 */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

/**
 * Configuración por defecto de React Query
 */
const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      
      // Tiempo antes de eliminar los datos del cache
      gcTime: 5 * 60 * 1000, // 5 minutos (antes era cacheTime)
      
      // Reintentos en caso de error
      retry: 1,
      
      refetchOnWindowFocus: false,
      
      refetchOnReconnect: true,
      
      placeholderData: (previousData: any) => previousData,
    },
    mutations: {
      retry: 0,
    },
  },
};

interface ReactQueryProviderProps {
  children: ReactNode;
}

/**
 * Provider de React Query
 * Debe envolver toda la aplicación o secciones que usen queries
 */
export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient(queryClientConfig));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

/**
 * Keys para queries
 * Centralizadas para consistencia y type safety
 */
export const queryKeys = {
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },
  
  users: {
    all: ['users'] as const,
    detail: (id: number) => ['users', 'detail', id] as const,
  },
  
  geodata: {
    all: ['geodata'] as const,
    list: (filters?: Record<string, any>) => ['geodata', 'list', filters] as const,
    detail: (id: string) => ['geodata', 'detail', id] as const,
    layers: ['geodata', 'layers'] as const,
  },
  
  analisis: {
    all: ['analisis'] as const,
    list: (filters?: Record<string, any>) => ['analisis', 'list', filters] as const,
    detail: (id: string) => ['analisis', 'detail', id] as const,
    results: (id: string) => ['analisis', 'results', id] as const,
  },
  
  geomarketing: {
    all: ['geomarketing'] as const,
    clientes: ['geomarketing', 'clientes'] as const,
    poblacion: ['geomarketing', 'poblacion'] as const,
    competencia: ['geomarketing', 'competencia'] as const,
  },
  
  solicitudes: {
    all: ['solicitudes'] as const,
    list: (filters?: Record<string, any>) => ['solicitudes', 'list', filters] as const,
    detail: (id: string) => ['solicitudes', 'detail', id] as const,
  },
  
  apiKeys: {
    all: ['api-keys'] as const,
    list: ['api-keys', 'list'] as const,
    detail: (id: string) => ['api-keys', 'detail', id] as const,
  },
  
  dashboards: {
    all: ['dashboards'] as const,
    insights: ['dashboards', 'insights'] as const,
    stats: (period?: string) => ['dashboards', 'stats', period] as const,
  },
  
  roles: {
    all: ['roles'] as const,
    list: (filters?: Record<string, any>) => ['roles', 'list', filters] as const,
    detail: (id: number) => ['roles', 'detail', id] as const,
    byUser: (userId: number) => ['roles', 'by-user', userId] as const,
    stats: ['roles', 'stats'] as const,
  },
  
  maps: {
    all: ['maps'] as const,
    list: (filters?: Record<string, any>) => ['maps', 'list', filters] as const,
    detail: (id: number, includeLayers?: boolean) => ['maps', 'detail', id, includeLayers] as const,
    default: ['maps', 'default'] as const,
    search: (filters?: Record<string, any>) => ['maps', 'search', filters] as const,
    stats: ['maps', 'stats'] as const,
    types: ['maps', 'types'] as const,
    public: {
      all: ['maps', 'public', 'all'] as const,
      detail: (id: number) => ['maps', 'public', 'detail', id] as const,
    },
  },
  
  layers: {
    all: ['layers'] as const,
    user: ['layers', 'user'] as const,
    public: (page?: number, limit?: number) => ['layers', 'public', page, limit] as const,
    detail: (id: number) => ['layers', 'detail', id] as const,
    geojson: (id: number) => ['layers', 'geojson', id] as const,
    bbox: (id: number, bbox?: Record<string, any>) => ['layers', 'bbox', id, bbox] as const,
    bboxFeatures: (id: number) => ['layers', 'bbox-features', id] as const,
    search: (query?: string, page?: number, limit?: number) => 
      ['layers', 'search', query, page, limit] as const,
    stats: ['layers', 'stats'] as const,
    // Nuevos endpoints para features multipolygon
    featuresCatalog: (id: number) => ['layers', 'features-catalog', id] as const,
    featuresByIds: (id: number, featureIds?: number[]) => 
      ['layers', 'features-by-ids', id, featureIds] as const,
    filteredFeatures: (id: number, filters: Record<string, any>, featureIds?: number[]) => 
      ['layers', 'filtered-features', id, filters, featureIds] as const,
    multiLayerFiltered: (layerIds: number[], filters: Record<string, any>) => 
      ['layers', 'multi-layer-filtered', layerIds, filters] as const,
  },
  
  pages: {
    all: ['pages'] as const,
    list: (filters?: Record<string, any>) => ['pages', 'list', filters] as const,
    detail: (id: number) => ['pages', 'detail', id] as const,
    byRole: (roleId: number, isActive?: boolean) => ['pages', 'by-role', roleId, isActive] as const,
    stats: ['pages', 'stats'] as const,
  },
} as const;
