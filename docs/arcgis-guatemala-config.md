# Guía de Estilos y Configuración - ArcGIS Maps SDK

## 🎨 **Estilos Personalizados Implementados**

### Configuración del Mapa para Guatemala

```javascript
// Centrado en Guatemala City con configuraciones optimizadas
const view = new MapView({
  container: mapDiv.current,
  map: webmap,
  center: [-90.2308, 15.7835], // Guatemala City
  zoom: 7, // Vista completa de Guatemala
  constraints: {
    minZoom: 5,  // Contexto regional 
    maxZoom: 18  // Detalle urbano
  },
  padding: {
    top: 20,
    bottom: 20, 
    left: 20,
    right: 20
  }
});
```

### Bookmarks Predefinidos

```javascript
const guatemalaBookmarks = [
  {
    name: "Guatemala Nacional",
    center: [-90.2308, 15.7835],
    scale: 3000000 // Vista país completo
  },
  {
    name: "Guatemala City", 
    center: [-90.2308, 15.7835],
    scale: 500000 // Vista metropolitana
  },
  {
    name: "Quetzaltenango",
    center: [-91.5197, 14.8448], 
    scale: 500000 // Segunda ciudad
  },
  {
    name: "Antigua Guatemala",
    center: [-90.7346, 14.5586],
    scale: 200000 // Ciudad histórica
  }
];
```

## 🌟 **Configuraciones Avanzadas**

### Basemaps Recomendados para Guatemala

```javascript
// Opciones según la documentación oficial
const basemaps = {
  "streets-vector": "Ideal para navegación urbana",
  "satellite": "Perfecto para análisis territorial", 
  "hybrid": "Combina satelital + etiquetas",
  "topo-vector": "Excelente para topografía",
  "gray-vector": "Neutral para overlays",
  "dark-gray-vector": "Modo nocturno",
  "osm": "OpenStreetMap gratuito"
};
```

### Controles UI Personalizados

```javascript
// Widget de Expand personalizado
const bkExpand = new Expand({
  view,
  content: bookmarks,
  expanded: false, // Empieza cerrado
  expandIconClass: "esri-icon-bookmark",
  expandTooltip: "Ubicaciones en Guatemala",
  group: "top-right" // Agrupa widgets
});
```

### Animaciones y Transiciones

```javascript
// Navegación suave a ubicaciones
view.goTo({
  center: [-90.2308, 15.7835],
  zoom: 7
}, {
  duration: 2000, // 2 segundos
  easing: "ease-in-out" // Animación suave
});
```

## 🎯 **Estilos CSS Personalizados**

### Contenedor del Mapa

```css
.mapDiv {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
```

### Widgets de ArcGIS

```css
/* Personalizar widgets para que coincidan con tu tema */
.esri-ui-corner .esri-component {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

/* Botones de zoom */
.esri-zoom .esri-widget--button {
  background-color: white;
  transition: all 0.2s ease;
}

.esri-zoom .esri-widget--button:hover {
  background-color: #f3f4f6;
  transform: scale(1.05);
}
```

## 📍 **Coordenadas Importantes de Guatemala**

```javascript
const guatemalaLocations = {
  // Centros urbanos principales
  "Guatemala City": [-90.2308, 15.7835],
  "Quetzaltenango": [-91.5197, 14.8448], 
  "Escuintla": [-90.7850, 14.3050],
  "Puerto Barrios": [-88.5950, 15.7294],
  "Cobán": [-90.3706, 15.4697],
  
  // Sitios turísticos
  "Antigua Guatemala": [-90.7346, 14.5586],
  "Flores (Tikal)": [-89.8986, 16.9268],
  "Livingston": [-88.7500, 15.8272],
  
  // Fronteras importantes  
  "Frontera México": [-92.2292, 14.5392],
  "Frontera Belice": [-89.2264, 16.4897],
  "Frontera Honduras": [-89.5708, 14.4422],
  "Frontera El Salvador": [-90.1058, 14.2466]
};
```

## 🔧 **Configuraciones de Popup Optimizadas**

```javascript
// Configuración del popup para mejor UX
if (view.popup) {
  view.popup.defaultPopupTemplateEnabled = true;
  view.popup.dockEnabled = true;
  view.popup.dockOptions = {
    position: "bottom-right",
    breakpoint: false
  };
  view.popup.collapseEnabled = false;
  view.popup.highlightEnabled = true;
}
```

## 🌍 **Proyecciones y Sistemas de Coordenadas**

```javascript
// Guatemala usa predominantemente:
const guatemalaProjections = {
  "WGS84": "EPSG:4326", // Estándar internacional
  "GTM": "EPSG:21097",  // Guatemala Transverse Mercator
  "UTM_15N": "EPSG:32615", // UTM Zona 15 Norte
  "UTM_16N": "EPSG:32616"  // UTM Zona 16 Norte
};
```

## 📱 **Configuración Responsive**

```css
/* Adaptaciones para móvil */
@media (max-width: 768px) {
  .esri-ui-corner {
    margin: 8px;
  }
  
  .esri-expand__content {
    max-width: calc(100vw - 32px);
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .esri-ui-corner {
    margin: 12px;
  }
}
```

## 🎨 **Temas Personalizados**

```javascript
// Tema oscuro personalizado
const darkThemeConfig = {
  basemap: "dark-gray-vector",
  backgroundColor: "#1f2937",
  textColor: "#f9fafb"
};

// Tema claro personalizado  
const lightThemeConfig = {
  basemap: "streets-vector", 
  backgroundColor: "#ffffff",
  textColor: "#374151"
};
```

## 🔄 **Gestión de Memoria Optimizada**

```javascript
// Cleanup apropiado para evitar memory leaks
const cleanup = () => {
  if (viewRef.current) {
    viewRef.current.destroy();
    viewRef.current = null;
  }
};

// En useEffect return
return cleanup;
```

## 📊 **Próximos Pasos Sugeridos**

1. **Capas de Datos Guatemaltecos**
   - Departamentos y municipios
   - Datos demográficos del INE
   - Capas de SEGEPLAN

2. **Widgets Adicionales**
   - LayerList para gestión de capas
   - Legend para leyendas dinámicas
   - Search para búsqueda de lugares

3. **Funcionalidades Avanzadas**
   - Medición de distancias y áreas
   - Análisis de rutas
   - Herramientas de dibujo

4. **Integración con Backend**
   - Servicios de características propios
   - Autenticación con tokens
   - Cacheo de tiles personalizado

Esta configuración está optimizada específicamente para Guatemala y sigue las mejores prácticas de la documentación oficial de ArcGIS Maps SDK for JavaScript.