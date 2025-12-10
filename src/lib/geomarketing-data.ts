

// Helper function to generate random points within Guatemala's bounds
const getRandomCoordsInGuatemala = () => {
    const minLat = 13.73;
    const maxLat = 17.82;
    const minLng = -92.23;
    const maxLng = -88.2;
    const lat = minLat + Math.random() * (maxLat - minLat);
    const lng = minLng + Math.random() * (maxLng - minLng);
    return [lng, lat];
};

// Helper function to generate random polygons within a region of Guatemala
const getRandomPolygonInGuatemala = (numVertices = 4) => {
    const [startLng, startLat] = getRandomCoordsInGuatemala();
    const size = 0.05; // Size of the polygon
    const coordinates = [[]];
    for (let i = 0; i < numVertices; i++) {
        const angle = (i / numVertices) * 2 * Math.PI;
        const lng = startLng + Math.cos(angle) * size;
        const lat = startLat + Math.sin(angle) * size;
        (coordinates[0] as any[]).push([lng, lat]);
    }
    coordinates[0].push(coordinates[0][0]); // Close the polygon
    return coordinates;
}

// --- Point Data ---

export const alianzasData = {
    type: "FeatureCollection",
    features: Array.from({ length: 15 }, (_, i) => ({
        type: "Feature",
        properties: { name: `Alianza Comercial ${i + 1}`, type: "Supermercado" },
        geometry: { type: "Point", coordinates: getRandomCoordsInGuatemala() },
    })),
};

export const cajerosData = {
    type: "FeatureCollection",
    features: Array.from({ length: 50 }, (_, i) => ({
        type: "Feature",
        properties: { name: `Cajero #${i + 1}`, network: "5B" },
        geometry: { type: "Point", coordinates: getRandomCoordsInGuatemala() },
    })),
};

export const clientesData = {
    type: "FeatureCollection",
    features: Array.from({ length: 100 }, (_, i) => ({
        type: "Feature",
        properties: { cliente_id: `C${1000 + i}`, score: Math.floor(Math.random() * 100) },
        geometry: { type: "Point", coordinates: getRandomCoordsInGuatemala() },
    })),
};

export const puntosPagoData = {
    type: "FeatureCollection",
    features: Array.from({ length: 30 }, (_, i) => ({
        type: "Feature",
        properties: { name: `Punto de Pago ${i + 1}`, category: "Tienda de conveniencia" },
        geometry: { type: "Point", coordinates: getRandomCoordsInGuatemala() },
    })),
};

export const puntosPagoCompetenciaData = {
    type: "FeatureCollection",
    features: Array.from({ length: 40 }, (_, i) => ({
        type: "Feature",
        properties: { competitor: `Competidor X - Punto ${i}`, type: "Farmacia" },
        geometry: { type: "Point", coordinates: getRandomCoordsInGuatemala() },
    })),
};

export const sucursalesCompetenciaData = {
    type: "FeatureCollection",
    features: Array.from({ length: 25 }, (_, i) => ({
        type: "Feature",
        properties: { banco: `Banco Competidor ${String.fromCharCode(65 + (i % 5))}`, sucursal: `Agencia ${i}` },
        geometry: { type: "Point", coordinates: getRandomCoordsInGuatemala() },
    })),
};

export const sucursalesData = {
    type: "FeatureCollection",
    features: Array.from({ length: 10 }, (_, i) => ({
        type: "Feature",
        properties: { name: `Sucursal Central ${i + 1}`, region: "Metropolitana" },
        geometry: { type: "Point", coordinates: getRandomCoordsInGuatemala() },
    })),
};

// --- Polygon Data ---

export const gridHexagonalData = {
    type: "FeatureCollection",
    features: Array.from({ length: 20 }, (_, i) => ({
        type: "Feature",
        properties: { grid_id: i, density: Math.random() },
        geometry: { type: "Polygon", coordinates: getRandomPolygonInGuatemala(6) },
    })),
};

export const nivelesIngresoData = {
    type: "FeatureCollection",
    features: Array.from({ length: 10 }, (_, i) => ({
        type: "Feature",
        properties: { zone_id: `Z${i}`, income_level: ['Bajo', 'Medio', 'Alto'][i % 3] },
        geometry: { type: "Polygon", coordinates: getRandomPolygonInGuatemala() },
    })),
};

export const poblacionData = {
    type: "FeatureCollection",
    features: Array.from({ length: 15 }, (_, i) => ({
        type: "Feature",
        properties: { sector: `S${i}`, population: Math.floor(Math.random() * 5000) + 1000 },
        geometry: { type: "Polygon", coordinates: getRandomPolygonInGuatemala() },
    })),
};

export const riesgosClimaticosData = {
    type: "FeatureCollection",
    features: Array.from({ length: 8 }, (_, i) => ({
        type: "Feature",
        properties: { risk_id: i, type: ['Inundación', 'Sequía', 'Deslizamiento'][i % 3], level: 'Alto' },
        geometry: { type: "Polygon", coordinates: getRandomPolygonInGuatemala(5) },
    })),
};

export const sectoresData = {
    type: "FeatureCollection",
    features: Array.from({ length: 12 }, (_, i) => ({
        type: "Feature",
        properties: { sector_id: `SEC-${i}`, name: `Sector Económico ${i}` },
        geometry: { type: "Polygon", coordinates: getRandomPolygonInGuatemala(4) },
    })),
};

export const techosEdificiosData = {
    type: "FeatureCollection",
    features: Array.from({ length: 30 }, (_, i) => ({
        type: "Feature",
        properties: { building_id: `B${i}`, area: Math.random() * 100 },
        geometry: { type: "Polygon", coordinates: getRandomPolygonInGuatemala(4) },
    })),
};
