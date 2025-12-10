# ArcGIS Maps SDK Integration - ZENIT

Esta guía explica cómo integrar y usar el ArcGIS Maps SDK for JavaScript en el proyecto ZENIT.

## Configuración Inicial

### 1. Instalación de Dependencias

Las dependencias ya están instaladas:
```bash
npm install @arcgis/core @types/arcgis-js-api
```

### 2. Configuración de API Key

1. Crear cuenta en [ArcGIS Developers](https://developers.arcgis.com/)
2. Crear un nuevo API Key
3. Configurar las variables de entorno:

```bash
# .env.local
NEXT_PUBLIC_ARCGIS_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_ARCGIS_PORTAL_URL=https://www.arcgis.com
NEXT_PUBLIC_ARCGIS_DEBUG=false
```

## Uso del Componente ArcGISMap

### Ejemplo Básico

```tsx
import ArcGISMap from '@/components/map/arcgis-map';

function MyMapComponent() {
  return (
    <ArcGISMap
      viewType="map"
      basemap="streets-vector"
      center={[-90.2308, 15.7835]} // Guatemala
      zoom={7}
      style={{ height: '400px', width: '100%' }}
    />
  );
}
```

### Ejemplo Avanzado con Capas

```tsx
import ArcGISMap from '@/components/map/arcgis-map';

function AdvancedMapComponent() {
  const featureLayers = [
    {
      url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Countries_(Generalized)/FeatureServer/0",
      definitionExpression: "COUNTRY = 'Guatemala'"
    }
  ];

  const handleMapLoad = (view) => {
    // Agregar gráficos o lógica personalizada
    view.graphics.add({
      geometry: {
        type: "point",
        longitude: -90.2308,
        latitude: 15.7835
      },
      symbol: {
        type: "simple-marker",
        color: "red",
        size: 12
      }
    });
  };

  return (
    <ArcGISMap
      viewType="map"
      basemap="satellite"
      center={[-90.2308, 15.7835]}
      zoom={9}
      featureLayers={featureLayers}
      onMapLoad={handleMapLoad}
      apiKey={process.env.NEXT_PUBLIC_ARCGIS_API_KEY}
      style={{ height: '600px', width: '100%' }}
    />
  );
}
```

### Vista 3D (Scene View)

```tsx
<ArcGISMap
  viewType="scene"
  basemap="satellite"
  center={[-90.2308, 15.7835]}
  zoom={7}
  style={{ height: '500px', width: '100%' }}
/>
```

## Props del Componente ArcGISMap

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `style` | `CSSProperties` | `{ height: '400px', width: '100%' }` | Estilos del contenedor |
| `viewType` | `'map' \| 'scene'` | `'map'` | Tipo de vista (2D o 3D) |
| `basemap` | `string` | `'streets-vector'` | Mapa base |
| `center` | `[number, number]` | `[-90.2308, 15.7835]` | Centro inicial [lng, lat] |
| `zoom` | `number` | `7` | Nivel de zoom inicial |
| `featureLayers` | `any[]` | `[]` | Capas de características |
| `graphics` | `any[]` | `[]` | Gráficos a añadir |
| `apiKey` | `string` | `undefined` | API Key de ArcGIS |
| `onMapLoad` | `(view) => void` | `undefined` | Callback al cargar el mapa |
| `className` | `string` | `''` | Clases CSS adicionales |

## Mapas Base Disponibles

- `streets-vector`
- `streets-navigation-vector`
- `topo-vector`
- `gray-vector`
- `dark-gray-vector`
- `satellite`
- `hybrid`
- `terrain`
- `oceans`
- `osm`

## Ejemplos de Casos de Uso

### 1. Análisis Espacial

```tsx
const spatialAnalysisLayers = [
  {
    url: "your-feature-service-url",
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [255, 0, 0, 0.5],
        outline: { color: [255, 0, 0], width: 1 }
      }
    }
  }
];

<ArcGISMap
  featureLayers={spatialAnalysisLayers}
  // ... otros props
/>
```

### 2. Visualización de Datos en Tiempo Real

```tsx
const handleMapLoad = (view) => {
  // Actualizar datos cada 30 segundos
  setInterval(() => {
    updateRealtimeData(view);
  }, 30000);
};

function updateRealtimeData(view) {
  // Lógica para actualizar gráficos o capas
}
```

### 3. Integración con Servicios Web

```tsx
const wmsLayer = {
  type: "wms",
  url: "http://ideg.segeplan.gob.gt/geoserver/wms",
  sublayers: [
    {
      name: "climate-data",
      title: "Datos Climáticos"
    }
  ]
};
```

## Consideraciones de Rendimiento

1. **Lazy Loading**: El componente carga dinámicamente los módulos de ArcGIS
2. **Cleanup**: Se destruye automáticamente la vista al desmontar el componente
3. **Memory Management**: Evita memory leaks con proper cleanup
4. **SSR Compatibility**: Maneja correctamente el renderizado del lado del servidor

## Troubleshooting

### Error: "Cannot read property of undefined"
- Verificar que la API Key esté configurada correctamente
- Comprobar que los módulos de ArcGIS se carguen correctamente

### Estilos no aplicados
- Verificar que el CSS de ArcGIS se esté cargando
- Comprobar conflictos con estilos de Tailwind

### Performance Issues
- Limitar el número de capas mostradas simultáneamente
- Usar niveles de detalle apropiados para el zoom
- Implementar virtualización para grandes datasets

## Recursos Adicionales

- [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/latest/)
- [API Reference](https://developers.arcgis.com/javascript/latest/api-reference/)
- [Samples](https://developers.arcgis.com/javascript/latest/sample-code/)
- [Tutorials](https://developers.arcgis.com/javascript/latest/tutorials/)
