
"use client";

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker, WMSTileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from "@/components/ui/card";
import BaseMapSwitcher from '@/components/map/base-map-switcher';
import type { ClimateRiskFilters, ClientData, WmsLayer } from '@/types';
import { ALL_CLIENT_DATA } from '@/lib/constants';

interface ClimateRiskMapProps {
    filters: ClimateRiskFilters;
    onClientClick: (clientId: string) => void;
    wmsLayers: WmsLayer[];
}

const filterClients = (clients: ClientData[], filters: ClimateRiskFilters) => {
    return clients.filter(client => 
        (filters.region === "Todas" || client.region === filters.region) &&
        (filters.sector === "Todos" || client.sector === filters.sector)
    );
};

const getRiskColor = (score: number) => {
    if (score > 7) return "#ef4444"; // red-500
    if (score > 4) return "#f97316"; // orange-500
    return "#22c55e"; // green-500
};

const Legend = () => (
    <div className="leaflet-bottom leaflet-right">
        <div className="leaflet-control leaflet-bar bg-background/80 p-2 rounded-md shadow-lg border">
            <h4 className="font-bold text-sm mb-1">Nivel de Riesgo Cliente</h4>
            <div className="flex items-center gap-2 text-xs">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getRiskColor(8) }}/> <span>Alto (7-10)</span>
            </div>
             <div className="flex items-center gap-2 text-xs mt-1">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getRiskColor(5) }}/> <span>Medio (4-6)</span>
            </div>
             <div className="flex items-center gap-2 text-xs mt-1">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getRiskColor(2) }}/> <span>Bajo (0-3)</span>
            </div>
        </div>
    </div>
);

export function ClimateRiskMap({ filters, onClientClick, wmsLayers }: ClimateRiskMapProps) {
  const [isClient, setIsClient] = useState(false);
  const filteredData = useMemo(() => filterClients(ALL_CLIENT_DATA, filters), [filters]);

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
    return <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">Cargando mapa...</div>;
  }

  return (
    <Card className="bg-muted/30 h-full">
        <CardContent className="p-2 relative h-full">
            <MapContainer center={[15.7835, -90.2308]} zoom={7} style={{ height: '100%', minHeight: '500px', width: '100%', borderRadius: '8px' }}>
                <BaseMapSwitcher />
                
                {filteredData.map(client => (
                    <CircleMarker
                        key={client.id}
                        center={[client.lat, client.lng]}
                        radius={6}
                        pathOptions={{ 
                            color: getRiskColor(client.riskScore),
                            fillColor: getRiskColor(client.riskScore),
                            fillOpacity: 0.8
                        }}
                        eventHandlers={{
                            click: () => {
                                onClientClick(client.id);
                            },
                        }}
                    >
                        <Popup>
                            <b>Cliente: {client.id}</b><br/>
                            Sector: {client.sector}<br/>
                            Región: {client.region}<br/>
                            Cartera: Q{client.portfolio.toLocaleString()}<br/>
                            <b>Puntaje Riesgo: {client.riskScore}/10</b><br/>
                            <b>Puntaje Resiliencia: {client.resilienceScore}/10</b>
                        </Popup>
                    </CircleMarker>
                ))}
                
                {wmsLayers.filter(l => l.visible).map(layer => (
                     <WMSTileLayer
                        key={layer.name}
                        url="http://ideg.segeplan.gob.gt/geoserver/wms"
                        params={{
                            layers: layer.name,
                            format: 'image/png',
                            transparent: true,
                            version: '1.1.0',
                        }}
                        opacity={layer.opacity}
                    />
                ))}

                <Legend />
            </MapContainer>
        </CardContent>
    </Card>
  );
}
