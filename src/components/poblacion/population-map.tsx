"use client";

import { useState, useEffect } from 'react';
import { MapContainer, GeoJSON, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from "@/components/ui/card";
import { GeosearchControl } from '@/components/map/geosearch-control';
import BaseMapSwitcher from '../map/base-map-switcher';
import type { ActiveThematicLayer } from '@/types';

if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}

const Legend = ({ layers }: { layers: ActiveThematicLayer[] }) => {
    if (layers.length === 0) return null;

    return (
        <div className="leaflet-bottom leaflet-right">
            <div className="leaflet-control leaflet-bar bg-background/80 p-2 rounded-md shadow-lg border max-w-[200px]">
                <h4 className="font-bold text-sm mb-1">Leyenda</h4>
                {layers.map(layer => (
                    <div key={layer.id} className="flex items-center gap-2 text-xs mt-1">
                        <div className="h-3 w-3 border border-foreground" style={{ backgroundColor: layer.color }} />
                        <span className="truncate" title={layer.name}>{layer.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MapFocusController = ({ focusedLayerId, activeLayers, onResetFocus }: { focusedLayerId: string | null; activeLayers: ActiveThematicLayer[]; onResetFocus: () => void; }) => {
    const map = useMap();
    
    useEffect(() => {
        if (focusedLayerId) {
            const layerToFocus = activeLayers.find(l => l.id === focusedLayerId);
            if (layerToFocus && layerToFocus.data) {
                const geoJsonLayer = L.geoJSON(layerToFocus.data);
                const bounds = geoJsonLayer.getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            }
            onResetFocus(); // Reset focus after fitting bounds
        }
    }, [focusedLayerId, activeLayers, map, onResetFocus]);

    return null;
}

interface PopulationMapProps {
    mapId: string;
    activeLayers: ActiveThematicLayer[];
    focusedLayerId: string | null;
    onResetFocus: () => void;
}

const createPopupContent = (properties: any) => {
    if (!properties || Object.keys(properties).length === 0) return "Sin datos";
    return Object.entries(properties)
        .map(([key, value]) => `<b>${key}:</b> ${value}`)
        .join('<br/>');
};

export function PopulationMap({ mapId, activeLayers, focusedLayerId, onResetFocus }: PopulationMapProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="h-full w-full bg-muted rounded-lg flex items-center justify-center">Cargando mapa...</div>;
    }

    return (
        <MapContainer key={mapId} center={[15.7835, -90.2308]} zoom={7} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
            <BaseMapSwitcher />
            
            {activeLayers.map(layer => {
                 if (!layer.data) return null;
                 return (
                     <GeoJSON
                        key={layer.id}
                        data={layer.data}
                        style={{ color: layer.color, weight: 1, opacity: 0.8, fillOpacity: 0.5 }}
                        onEachFeature={(feature, layerInstance) => {
                            layerInstance.bindPopup(createPopupContent(feature.properties));
                        }}
                    />
                 );
            })}
            
            <GeosearchControl />
            <Legend layers={activeLayers} />
            <MapFocusController focusedLayerId={focusedLayerId} activeLayers={activeLayers} onResetFocus={onResetFocus} />
        </MapContainer>
    );
}
