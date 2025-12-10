
"use client";

import { useState, useEffect } from 'react';
import { MapContainer, GeoJSON, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { EyeOff } from 'lucide-react';
import type { ActiveLayer } from '@/types';
import { GeosearchControl } from '@/components/map/geosearch-control';
import BaseMapSwitcher from '../map/base-map-switcher';

interface GeomarketingMapProps {
    activeLayers: ActiveLayer[];
    isContentPanelVisible: boolean;
    isAnalysisPanelVisible: boolean;
    analysisPanelWidth: number;
}

const getLayerStyle = (layer: ActiveLayer): L.PathOptions => {
    switch (layer.id) {
        case 'alianzas': return { color: "#8b5cf6", weight: 1, opacity: layer.opacity, fillOpacity: layer.opacity * 0.7 }; // violet-500
        case 'cajeros': return { color: "#10b981", weight: 1, opacity: layer.opacity, fillOpacity: layer.opacity * 0.7 }; // emerald-500
        case 'clientes': return { color: "#3b82f6", weight: 1, opacity: layer.opacity, fillOpacity: layer.opacity * 0.7 }; // blue-500
        case 'grid-exagonal': return { color: "#a855f7", weight: 1, opacity: layer.opacity, fillOpacity: layer.opacity * 0.2 }; // purple-500
        case 'niveles-ingreso': return { color: "#f59e0b", weight: 1, opacity: layer.opacity, fillOpacity: layer.opacity * 0.7 }; // amber-500
        case 'poblacion': return { color: "#6366f1", weight: 1, opacity: layer.opacity, fillOpacity: layer.opacity * 0.7 }; // indigo-500
        case 'puntos-pago': return { color: "#14b8a6", weight: 1, opacity: layer.opacity, fillOpacity: layer.opacity * 0.7 }; // teal-500
        case 'puntos-pago-competencia': return { color: "#f43f5e", weight: 1, opacity: layer.opacity, fillOpacity: layer.opacity * 0.7 }; // rose-500
        case 'riesgos-climaticos': return { color: "#d946ef", weight: 1, opacity: layer.opacity, fillOpacity: layer.opacity * 0.7 }; // fuchsia-500
        case 'sectores': return { color: "#ec4899", weight: 1, opacity: layer.opacity, fillOpacity: layer.opacity * 0.2 }; // pink-500
        case 'sucursales-competencia': return { color: "#ef4444", weight: 1, opacity: layer.opacity, fillOpacity: layer.opacity * 0.7 }; // red-500
        case 'sucursales': return { color: "#22c55e", weight: 1, opacity: layer.opacity, fillOpacity: layer.opacity * 0.7 }; // green-500
        case 'techos-edificios': return { color: "#84cc16", weight: 1, opacity: layer.opacity, fillOpacity: layer.opacity * 0.2 }; // lime-500
        default: return { color: "#f97316", weight: 1, opacity: layer.opacity, fillOpacity: layer.opacity * 0.7 }; // orange-500 for custom uploads
    }
}

const Legend = ({ layers }: { layers: ActiveLayer[] }) => {
    const [isLegendVisible, setIsLegendVisible] = useState(true);
    const polygonLayers = ['grid-exagonal', 'sectores', 'techos-edificios', 'niveles-ingreso', 'poblacion', 'riesgos-climaticos'];

    const visibleDefaultLayers = layers.filter(l => l.source === 'default');

    if (visibleDefaultLayers.length === 0) return null;

    if (!isLegendVisible) {
        return (
            <div className="leaflet-bottom leaflet-right">
                <div className="leaflet-control leaflet-bar">
                    <Button onClick={() => setIsLegendVisible(true)} size="sm" className="bg-background/80 hover:bg-background/90 text-foreground shadow-lg border">
                         Ver Leyenda
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="leaflet-bottom leaflet-right">
            <div className="leaflet-control leaflet-bar bg-background/80 p-2 rounded-md shadow-lg border max-w-[200px]">
                <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-sm">Leyenda</h4>
                    <Button onClick={() => setIsLegendVisible(false)} variant="ghost" size="icon" className="h-6 w-6">
                        <EyeOff className="h-4 w-4" />
                    </Button>
                </div>
                {visibleDefaultLayers.map(layer => {
                    const style = getLayerStyle(layer);
                    const isPolygon = polygonLayers.includes(layer.id);
                    return (
                        <div key={layer.id} className="flex items-center gap-2 text-xs mt-1">
                            <div className={`h-3 w-3 ${isPolygon ? 'border border-foreground' : 'rounded-full'}`} style={{ backgroundColor: style.color }} />
                            <span className="truncate" title={layer.name}>{layer.name}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
};

const MapResizer = ({ isContentPanelVisible, isAnalysisPanelVisible, analysisPanelWidth }: { isContentPanelVisible: boolean; isAnalysisPanelVisible: boolean; analysisPanelWidth: number }) => {
    const map = useMap();
    useEffect(() => {
        const resizeMap = () => {
            map.invalidateSize();
        };

        // Use a short timeout to allow flexbox transitions to complete
        const timer = setTimeout(resizeMap, 310); 
        
        window.addEventListener('resize', resizeMap);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', resizeMap);
        };
    }, [map, isContentPanelVisible, isAnalysisPanelVisible, analysisPanelWidth]);
    return null;
}

export function GeomarketingMap({ activeLayers, isContentPanelVisible, isAnalysisPanelVisible, analysisPanelWidth }: GeomarketingMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
    }
  }, []);

  if (!isClient) {
    return <div className="h-full w-full bg-muted rounded-lg flex items-center justify-center">Cargando mapa...</div>;
  }

  const createPopupContent = (properties: any) => {
    if (!properties || Object.keys(properties).length === 0) return "Sin datos";
    return Object.entries(properties)
        .map(([key, value]) => `<b>${key}:</b> ${value}`)
        .join('<br/>');
  };

  return (
    <Card className="bg-muted/30 h-full">
        <CardContent className="p-0 h-full relative">
            <MapContainer center={[15.7835, -90.2308]} zoom={7} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
                <BaseMapSwitcher />
                
                {activeLayers.map(layer => {
                    if (!layer.visible || !layer.data) return null;
                    
                    const isPointLayer = layer.data.features && layer.data.features[0]?.geometry.type === 'Point';
                    const style = getLayerStyle(layer);

                    if (isPointLayer) {
                        return (
                            <GeoJSON
                                key={layer.id}
                                data={layer.data}
                                pointToLayer={(feature, latlng) => {
                                    return L.circleMarker(latlng, {
                                        radius: 5,
                                        fillColor: style.color,
                                        color: "#000",
                                        weight: 0.5,
                                        opacity: 1,
                                        fillOpacity: 0.8
                                    });
                                }}
                                onEachFeature={(feature, layerInstance) => {
                                    layerInstance.bindPopup(createPopupContent(feature.properties));
                                }}
                            />
                        )
                    }
                    
                    return (
                        <GeoJSON
                            key={layer.id}
                            data={layer.data}
                            style={() => style}
                            onEachFeature={(feature, layerInstance) => {
                                layerInstance.bindPopup(createPopupContent(feature.properties));
                            }}
                        />
                    )
                })}
                <GeosearchControl />
                <Legend layers={activeLayers}/>
                <MapResizer 
                    isContentPanelVisible={isContentPanelVisible} 
                    isAnalysisPanelVisible={isAnalysisPanelVisible} 
                    analysisPanelWidth={analysisPanelWidth} 
                />
            </MapContainer>
        </CardContent>
    </Card>
  );
}
