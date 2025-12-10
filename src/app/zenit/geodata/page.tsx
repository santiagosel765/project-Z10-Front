
"use client";

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, GeoJSON } from 'react-leaflet';
import { ICONS } from './icons';
import 'leaflet/dist/leaflet.css';
import BaseMapSwitcher from '@/components/map/base-map-switcher';
import { UploadGeoJsonDialog } from '@/components/geodata/upload-geojson-dialog';
import type { GeodataLayer } from '@/types';

const initialGeodataLayers: GeodataLayer[] = [
    { id: 'covid', title: 'Semáforo COVID', category: 'Salud', source: 'system' },
    { id: 'mapa_base', title: 'Mapa Base República de Guatemala', category: 'Límites', source: 'system' },
    { id: 'lim_dept', title: 'Límites departamentales', category: 'Límites', source: 'system' },
    { id: 'lim_muni', title: 'Límites municipales 340', category: 'Límites', source: 'system' },
    { id: 'cabeceras', title: 'Cabeceras municipales', category: 'Límites', source: 'system' },
    { id: 'deslizamientos', title: 'Amenaza Deslizamientos', category: 'Amenazas', source: 'system' },
    { id: 'inundaciones', title: 'Amenaza Inundaciones - CONRED', category: 'Amenazas', source: 'system' },
    { id: 'escuelas', title: 'Escuelas MINEDUC', category: 'Educación', source: 'system' },
    { id: 'flujo_piro', title: 'Flujo Piroclástico y Ceniza, Volcán Fuego 2018', category: 'Amenazas', source: 'system' },
    { id: 'lim_muni_ign', title: 'Límites Municipales IGN', category: 'Límites', source: 'system' },
    { id: 'ortofotos', title: 'Ortofotos 2006', category: 'Imágenes', source: 'system' },
    { id: 'plan_alianza', title: 'Plan Alianza para la Prosperidad', category: 'Social', source: 'system' },
    { id: 'pob_joven_rezago', title: 'Población joven de 13 a 30 años con rezago edu.', category: 'Social', source: 'system' },
    { id: 'alerta_covid', title: 'Sistema de Alerta COVID', category: 'Salud', source: 'system' },
    { id: 'uso_tic', title: 'Uso de TIC población joven 13-30 años', category: 'Social', source: 'system' },
    { id: 'violencia_mujer', title: 'Violencia en contra de mujeres jóvenes 13-30 años', category: 'Social', source: 'system' },
    { id: 'agri_sequia', title: 'Agricultura con Amenaza de Sequía', category: 'Agricultura', source: 'system' },
    { id: 'granos_basicos', title: 'Agricultura Granos Básicos (maíz y frijol)', category: 'Agricultura', source: 'system' },
    { id: 'area_agricola', title: 'Área de Uso Agrícola', category: 'Agricultura', source: 'system' },
    { id: 'sismica_agies', title: 'Amenaza Sísmica AGIES - Beta', category: 'Amenazas', source: 'system' },
];

interface ActiveLayer {
    id: string;
    title: string;
    category: string;
    color: string;
    visible: boolean;
    opacity: number;
    geoJsonLayer: L.GeoJSON;
    data: any; // GeoJSON data
}

const GeodataPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('explorer');
    const [allGeodataLayers, setAllGeodataLayers] = useState<GeodataLayer[]>(initialGeodataLayers);
    const [activeLayers, setActiveLayers] = useState<ActiveLayer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('TODAS');
    const [currentPage, setCurrentPage] = useState(1);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const mapRef = useRef<L.Map | null>(null);

    const ITEMS_PER_PAGE = 8;

    const categories = ['TODAS', ...Array.from(new Set(allGeodataLayers.map(l => l.category)))];

    const filteredLayers = allGeodataLayers.filter(layer => 
        (category === 'TODAS' || layer.category === category) &&
        layer.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedLayers = filteredLayers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filteredLayers.length / ITEMS_PER_PAGE);

    const getRandomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

    useEffect(() => {
        if (typeof window === 'undefined') return;
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
    }, []);
    
    useEffect(() => {
        if (mapRef.current) {
            L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(mapRef.current);
        }
    }, [mapRef.current])

    const handleAddLayer = (layerInfo: GeodataLayer, geoJsonData: any) => {
        if (!activeLayers.find(l => l.id === layerInfo.id) && mapRef.current) {
            const geoJsonLayer = L.geoJSON(geoJsonData, {
                style: { 
                    fillColor: getRandomColor(), 
                    weight: 1, 
                    color: 'white', 
                    fillOpacity: 0.6, 
                    opacity: 0.6 
                }
            }).bindPopup(`Capa: ${layerInfo.title}`);
            
            const newLayer: ActiveLayer = { 
                ...layerInfo, 
                color: (geoJsonLayer.options.style as L.PathOptions).fillColor as string,
                visible: true, 
                opacity: 0.6,
                geoJsonLayer: geoJsonLayer,
                data: geoJsonData
            };

            geoJsonLayer.addTo(mapRef.current);
            setActiveLayers(prev => [newLayer, ...prev]);
        }
    };
    
    const handleRemoveLayer = (layerId: string) => {
        const layerToRemove = activeLayers.find(l => l.id === layerId);
        if (layerToRemove && mapRef.current) {
            mapRef.current.removeLayer(layerToRemove.geoJsonLayer);
            setActiveLayers(prev => prev.filter(l => l.id !== layerId));
        }
    };
    
    const handleLayerVisibility = (layerId: string) => {
        const layerToToggle = activeLayers.find(l => l.id === layerId);
        if (layerToToggle && mapRef.current) {
            const newVisibility = !layerToToggle.visible;
            if (newVisibility) {
                layerToToggle.geoJsonLayer.addTo(mapRef.current);
            } else {
                mapRef.current.removeLayer(layerToToggle.geoJsonLayer);
            }
            setActiveLayers(prev => prev.map(l => l.id === layerId ? {...l, visible: newVisibility } : l));
        }
    }
    
    const handleLayerOpacity = (layerId: string, opacity: string) => {
        const layerToUpdate = activeLayers.find(l => l.id === layerId);
        const newOpacity = parseFloat(opacity);
        if(layerToUpdate) {
            layerToUpdate.geoJsonLayer.setStyle({ fillOpacity: newOpacity * 0.7, opacity: newOpacity });
            setActiveLayers(prev => prev.map(l => l.id === layerId ? {...l, opacity: newOpacity} : l));
        }
    }

    const handleGeoJsonUpload = (newLayerData: Omit<GeodataLayer, 'id' | 'source'>, geoJson: any) => {
        const newLayer: GeodataLayer = {
            ...newLayerData,
            id: `user-${Date.now()}`,
            source: 'user',
        };
        setAllGeodataLayers(prev => [newLayer, ...prev]);
        handleAddLayer(newLayer, geoJson);
    };

    return (
        <div className="geodata-layout">
            <div className="geodata-panel">
                <nav className="geodata-tabs">
                    <button onClick={() => setActiveTab('explorer')} className={activeTab === 'explorer' ? 'active' : ''}>Explorador</button>
                    <button onClick={() => setActiveTab('content')} className={activeTab === 'content' ? 'active' : ''}>Contenido</button>
                    <button onClick={() => setIsUploadDialogOpen(true)}><ICONS.Add />Cargar Datos</button>
                </nav>

                {activeTab === 'explorer' && (
                    <div className="geodata-content">
                        <div className="geodata-controls">
                             <label htmlFor="category-select">Categoría:</label>
                            <select id="category-select" value={category} onChange={e => {setCategory(e.target.value); setCurrentPage(1);}}>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <div className="search-box">
                                <ICONS.Search/>
                                <input type="text" placeholder="Ingrese el título y presione Enter" value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}}/>
                            </div>
                        </div>
                        <ul className="layer-list">
                            <li className="layer-list-header"><span>Título</span></li>
                            {paginatedLayers.map(layer => (
                                <li key={layer.id} className="layer-item">
                                    <span>{layer.title}</span>
                                    <div className="layer-actions">
                                        <button title="Información"><ICONS.Help/></button>
                                        <button title="Descargar"><ICONS.Download/></button>
                                        <button title="Añadir a mapa" onClick={() => handleAddLayer(layer, { type: 'FeatureCollection', features: [] })}><ICONS.Add/></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="pagination-controls">
                           <span>Página {currentPage} de {totalPages}</span>
                            <div className="pagination-buttons">
                                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ICONS.ChevronDoubleLeft/></button>
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ICONS.ChevronLeft/></button>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ICONS.ChevronRight/></button>
                                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ICONS.ChevronDoubleRight/></button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="geodata-content">
                        <h3 className="content-title">Capas Activas</h3>
                        <ul className="active-layers-list">
                            {activeLayers.length === 0 && <p className="no-layers-msg">No hay capas activas. Añade capas desde el Explorador.</p>}
                            {activeLayers.map((layer) => (
                                <li key={layer.id} className="active-layer-item">
                                    <div className="active-layer-header">
                                        <span style={{borderLeftColor: layer.color}}>{layer.title}</span>
                                        <div className="active-layer-actions">
                                            <button onClick={() => handleLayerVisibility(layer.id)} title={layer.visible ? "Ocultar capa" : "Mostrar capa"}>{layer.visible ? <ICONS.Eye/> : <ICONS.EyeSlash/>}</button>
                                            <button onClick={() => handleRemoveLayer(layer.id)} title="Eliminar capa"><ICONS.Trash/></button>
                                        </div>
                                    </div>
                                    <div className="opacity-control">
                                        <label>Opacidad:</label>
                                        <input type="range" min="0" max="1" step="0.1" value={layer.opacity} onChange={(e) => handleLayerOpacity(layer.id, e.target.value)} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <div className="geodata-map-area">
                {typeof window !== 'undefined' && (
                     <MapContainer 
                        center={[15.7835, -90.2308]} 
                        zoom={7} 
                        style={{ height: '100%', width: '100%', backgroundColor: '#f0f0f0' }}
                        whenReady={({ target }) => { mapRef.current = target; }}
                     >
                        <BaseMapSwitcher />
                     </MapContainer>
                )}
            </div>
             <UploadGeoJsonDialog
                isOpen={isUploadDialogOpen}
                onClose={() => setIsUploadDialogOpen(false)}
                onFileUpload={handleGeoJsonUpload}
                categories={categories.filter(c => c !== 'TODAS')}
            />
        </div>
    );
};

export default GeodataPage;
