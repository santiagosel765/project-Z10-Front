"use client";

import { useEffect, useMemo } from "react";
import type { BBox } from "@/services/layers.service";
import { useLayerFeaturesInBBox, useLayerGeoJSON, useLayer, useLayerIntersect } from "@/hooks/api/use-layers";
import { getLimitedFeaturesMessage } from "@/lib/layer-loading-strategy";

interface LayerDataProviderProps {
  layerId: number;
  isVisible: boolean;
  bbox?: BBox;
  filterBBox?: any;
  filteredGeoJSON?: any;
  onDataLoaded: (data: {
    layerId: number;
    geojsonData: any;
    limitedMessage: string | null;
    loading: boolean;
    layerInfo?: any;
    strategy?: 'bbox' | 'geojson' | 'intersect';
  }) => void;
}


export function LayerDataProvider({
  layerId,
  isVisible,
  bbox,
  filterBBox,
  filteredGeoJSON,
  onDataLoaded,
}: LayerDataProviderProps) {
  
  const { data: layerDetail } = useLayer(layerId, isVisible);
  
  const isMultipolygonLayer = useMemo(() => {
    return layerDetail?.data?.layerType === 'multipolygon';
  }, [layerDetail?.data?.layerType]);
  
  const effectiveBBox = useMemo(() => {
    if (!isMultipolygonLayer && filterBBox) {
      return filterBBox;
    }
    return bbox;
  }, [isMultipolygonLayer, filterBBox, bbox]);

  const shouldUseIntersection = useMemo(() => {
    return !!filteredGeoJSON && !isMultipolygonLayer && isVisible;
  }, [filteredGeoJSON, isMultipolygonLayer, isVisible]);

  const intersectionGeometry = useMemo(() => {
    if (!shouldUseIntersection || !filteredGeoJSON?.features) return null;
    
    if (filteredGeoJSON.features.length === 1) {
      return filteredGeoJSON.features[0].geometry;
    }
    
    return {
      type: "GeometryCollection",
      geometries: filteredGeoJSON.features.map((f: any) => f.geometry)
    };
  }, [shouldUseIntersection, filteredGeoJSON]);
  
  const strategy: 'bbox' | 'geojson' | 'intersect' = useMemo(() => {
    if (shouldUseIntersection && intersectionGeometry) {
      return 'intersect';
    }
    
    const totalFeatures = layerDetail?.data?.totalFeatures || 0;
    return totalFeatures > 5000 ? 'bbox' : 'geojson';
  }, [layerDetail?.data?.totalFeatures, shouldUseIntersection, intersectionGeometry]);

  const { 
    data: geojsonData, 
    isLoading: isLoadingGeoJSON,
    isFetching: isFetchingGeoJSON,
    error: geojsonError,
  } = useLayerGeoJSON(
    layerId, 
    isVisible && strategy === 'geojson'
  );

  const { 
    data: bboxData, 
    isLoading: isLoadingBBox,
    isFetching: isFetchingBBox,
    refetch: refetchBBox,
  } = useLayerFeaturesInBBox({
    id: layerId,
    bbox: effectiveBBox,
    maxFeatures: 5000,
    simplify: true,
    enabled: isVisible && strategy === 'bbox' && !!effectiveBBox,
  });

  const {
    data: intersectionData,
    isLoading: isLoadingIntersection,
    isFetching: isFetchingIntersection,
  } = useLayerIntersect(
    layerId,
    intersectionGeometry,
    {
      maxFeatures: 5000,
      simplify: false,
      enabled: isVisible && strategy === 'intersect' && !!intersectionGeometry
    }
  );

  useEffect(() => {
    if (!isVisible) return;
    if (strategy !== 'bbox') return;
    if (!effectiveBBox) return;
    
    refetchBBox();
  }, [effectiveBBox, isVisible, strategy, refetchBBox]);

  useEffect(() => {
    if (!isVisible) {
      onDataLoaded({
        layerId,
        geojsonData: null,
        limitedMessage: null,
        loading: false,
        layerInfo: layerDetail?.data,
        strategy,
      });
      return;
    }

    let geojson = null;
    let limitedMessage = null;

    if (strategy === 'geojson' && geojsonData) {
      geojson = (geojsonData as any).data;
    } else if (strategy === 'bbox' && bboxData) {
      const actualData = (bboxData as any).data;
      geojson = actualData;
      if (actualData?.metadata) {
        limitedMessage = getLimitedFeaturesMessage(actualData.metadata);
      }
    } else if (strategy === 'intersect' && intersectionData) {
      const actualData = (intersectionData as any).data;
      geojson = actualData;
      if (actualData?.metadata) {
        limitedMessage = `🎯 ${actualData.metadata.totalIntersecting} features intersectadas con filtro activo`;
        if (actualData.metadata.limited) {
          limitedMessage += ` (mostrando ${actualData.metadata.returned})`;
        }
      }
    }

    const loading = !geojson && (
      (strategy === 'geojson' && (isLoadingGeoJSON || isFetchingGeoJSON)) ||
      (strategy === 'bbox' && (isLoadingBBox || isFetchingBBox)) ||
      (strategy === 'intersect' && (isLoadingIntersection || isFetchingIntersection))
    );

    onDataLoaded({
      layerId,
      geojsonData: geojson,
      limitedMessage,
      loading,
      layerInfo: layerDetail?.data,
      strategy,
    });
  }, [
    layerId,
    isVisible,
    strategy,
    geojsonData,
    bboxData,
    intersectionData,
    isLoadingGeoJSON,
    isLoadingBBox,
    isLoadingIntersection,
    isFetchingGeoJSON,
    isFetchingBBox,
    isFetchingIntersection,
    layerDetail?.data,
  ]);

  return null;
}
