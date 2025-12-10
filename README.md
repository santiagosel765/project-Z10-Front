# 🌍 ZENIT GeoAI Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900)](https://leafletjs.com/)

**ZENIT** es una plataforma GIS inteligente diseñada para análisis espacial y mapeo en Guatemala, integrando asistencia de IA, control de acceso basado en roles y visualización de datos geoespaciales para Fundación Génesis Empresarial.

![ZENIT Platform Preview](public/images/zenit-preview.png)

## ✨ Características Principales

### 🗺️ **Visualización de Mapas Interactivos**
- Soporte para capas vectoriales (KML, GeoJSON, Shapefile)
- Mapas base intercambiables (OpenStreetMap, Satellite, Terrain)
- Análisis espacial en tiempo real
- Búsqueda geográfica avanzada

### 🤖 **Asistencia de IA (Google Genkit)**
- Análisis espacial asistido por IA
- Flujos de trabajo inteligentes
- Integración con datos públicos (INE, SEGEPLAN, MAGA)
- Chat interactivo para consultas geoespaciales

### 👥 **Sistema de Roles y Permisos**
- **SuperAdmin**: Acceso completo al sistema
- **Admin**: Gestión de módulos y usuarios
- **Pro**: Acceso a funcionalidades básicas
- Control granular de permisos por módulo

### 📊 **Módulos Especializados**
- **Geomarketing**: Análisis de mercado y competencia
- **Datos Nacionales**: Información demográfica y estadística
- **Sectorización**: División territorial y administrativa
- **Business Intelligence**: Dashboards interactivos
- **GeoDB**: Gestión de bases de datos geográficas

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 20.x o superior
- **npm** o **yarn**
- **Git**

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-organizacion/zenit-frontend.git
cd zenit-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones
```

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Google AI (Genkit)
GOOGLE_GENAI_API_KEY=tu_api_key_aqui

# Firebase (opcional)
NEXT_PUBLIC_FIREBASE_API_KEY=tu_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_dominio.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id

# Configuración del entorno
NEXT_PUBLIC_ENV=development
```

### Ejecutar en Desarrollo

```bash
# Servidor de desarrollo (puerto 9002)
npm run dev

# En otra terminal: Servidor AI Genkit
npm run genkit:dev

# Opcional: Genkit con auto-reload
npm run genkit:watch
```

Abre [http://localhost:9002](http://localhost:9002) en tu navegador.

### Credenciales de Prueba

Para acceder al sistema, puedes usar estas credenciales predefinidas:

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| SuperAdmin | `admin@genesis.gt` | `admin123` |
| Admin | `manager@genesis.gt` | `manager123` |
| Pro | `user@genesis.gt` | `user123` |

## 🏗️ Arquitectura del Proyecto

```
src/
├── ai/                     # Flujos de IA con Google Genkit
│   ├── flows/             # Definiciones de flujos de IA
│   ├── genkit.ts         # Configuración de Genkit
│   └── dev.ts            # Servidor de desarrollo AI
├── app/                   # App Router de Next.js 15
│   ├── dashboard/        # Rutas protegidas
│   ├── globals.css       # Estilos globales
│   └── layout.tsx        # Layout principal
├── components/           # Componentes React
│   ├── ui/              # shadcn/ui components
│   ├── geomarketing/    # Módulo geomarketing
│   ├── poblacion/       # Módulo datos nacionales
│   └── map/             # Componentes de mapas
├── context/             # Proveedores de contexto
├── hooks/               # Hooks personalizados
├── lib/                 # Utilidades y constantes
└── types/               # Definiciones TypeScript
```

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor Next.js (puerto 9002)
npm run genkit:dev       # Servidor Genkit AI
npm run genkit:watch     # Genkit con auto-reload

# Producción
npm run build            # Construir aplicación
npm run start            # Servidor de producción

# Utilidades
npm run lint             # Linting con ESLint
npm run typecheck        # Verificación de tipos
```

## 🚀 Optimización de Capas Grandes

ZENIT ahora incluye soporte para cargar capas con **millones de features** de forma eficiente usando **tile serving** y **clustering**.

### Estrategias Automáticas

El sistema selecciona automáticamente la mejor estrategia según el tamaño de la capa:

| Features | Estrategia | Descripción |
|----------|-----------|-------------|
| < 5,000 | **GeoJSON** | Carga completa |
| 5,000 - 20,000 | **BBox** | Solo features visibles (límite 5,000) |
| 20,000 - 100,000 | **Vector Tiles** | Tiles MVT según viewport |
| > 100,000 | **Tiles Only** | Únicamente tiles vectoriales |

### Uso Rápido

```tsx
import { useLayerLoading } from '@/hooks/use-layer-loading';

function MyMap() {
  const { data, useTiles, tileURL, strategyInfo } = useLayerLoading({
    layerId: 123,
    totalFeatures: 50000,
    bbox: mapBounds,
    zoom: mapZoom,
  });
  
  return useTiles ? (
    <VectorTileLayer url={tileURL} />
  ) : (
    <GeoJSONLayer data={data} />
  );
}
```

### Documentación Completa

📚 **[Ver Guía de Optimización de Capas →](docs/layer-optimization-frontend.md)**

Incluye:
- Hooks y componentes listos para usar
- Ejemplos de integración con Leaflet
- API completa del servicio de layers
- Mejores prácticas y troubleshooting

## 🗺️ Uso de la Plataforma

### 1. **Autenticación**
- Inicia sesión con tu rol asignado
- El sistema redirige automáticamente al dashboard

### 2. **Carga de Datos Geoespaciales**
```javascript
// Formatos soportados
const supportedFormats = [
  'KML',      // Google Earth, sistemas gubernamentales
  'GeoJSON',  // Estándar web, APIs modernas
  'Shapefile' // Sistemas GIS tradicionales
];
```

### 3. **Análisis Espacial con IA**
- Accede al chat de IA desde el header
- Solicita análisis de superposición, proximidad o puntos calientes
- La IA determina automáticamente qué fuentes de datos públicos usar

### 4. **Gestión de Capas**
- Controla visibilidad y opacidad
- Organiza por categorías
- Exporta resultados en múltiples formatos

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15**: Framework React con App Router
- **React 18**: Biblioteca de interfaces de usuario
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Framework de estilos utilitarios
- **shadcn/ui**: Componentes UI modernos

### Mapas y Geoespacial
- **Leaflet**: Biblioteca de mapas interactivos
- **React-Leaflet**: Integración React + Leaflet
- **@tmcw/togeojson**: Conversión KML a GeoJSON

### IA y Análisis
- **Google Genkit**: Framework de IA generativa
- **Zod**: Validación de esquemas
- **Recharts**: Gráficos y visualizaciones

## 🚧 Limitaciones Actuales

> **⚠️ Importante**: Esta es una versión frontend-only para demostración.

### Lo que FALTA para producción:
- ❌ Backend API (Express/NestJS)
- ❌ Base de datos PostgreSQL + PostGIS
- ❌ Autenticación real (Firebase Auth)
- ❌ Persistencia de datos geoespaciales
- ❌ Análisis espacial server-side
- ❌ Sistema de archivos para uploads

### Datos Actuales:
- 📁 GeoJSON estáticos en `/public/geodata/`
- 💾 Autenticación en localStorage
- 🤖 Flujos de IA simulados

## 🛣️ Roadmap

### Fase 1: Backend Core (4-6 semanas)
- [ ] API REST con Express/NestJS
- [ ] PostgreSQL + PostGIS setup
- [ ] Sistema de autenticación
- [ ] CRUD de capas geoespaciales

### Fase 2: Funcionalidades Avanzadas (2-3 semanas)
- [ ] Procesamiento de archivos KML/Shapefile
- [ ] Análisis espacial real
- [ ] Sistema de permisos granular
- [ ] Caching con Redis

### Fase 3: Optimización (2-4 semanas)
- [ ] Performance y indexación espacial
- [ ] Testing automatizado
- [ ] Monitoreo y logging
- [ ] Documentación API

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es propiedad de **Fundación Génesis Empresarial**. Todos los derechos reservados.

## 📞 Soporte

Para soporte técnico o consultas:
- 📧 Email: soporte@genesis.gt
- 🌐 Web: [genesis.gt](https://genesis.gt)
- 📱 Teléfono: +502 2XXX-XXXX

---

<div align="center">
  <strong>Desarrollado con ❤️ para Fundación Génesis Empresarial</strong><br>
  <em>Impulsando el desarrollo territorial con tecnología GIS e IA</em>
</div>

