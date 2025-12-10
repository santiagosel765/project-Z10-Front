import type { LucideIcon } from "lucide-react";
import {
  Home,
  PieChart,
  Target,
  AlertTriangle,
  Users,
  Database,
  UserCog,
  Layers,
  ClipboardList,
  Map,
  LayoutDashboard,
  Box,
  Code,
  Settings,
  HelpCircle,
  BrainCircuit,
  Package,
  Wind,
  Waypoints,
  Globe,
  Building2,
  Sprout,
  Map as MapIcon,
  ShieldQuestion,
  Beaker,
} from "lucide-react";
import type { GeodataLayer, ClientData, Region, SectorEconomico } from "../types";

// Roles del sistema: user (básico), admin (administrador), superadmin (super administrador)
export const USER_ROLES = ["user", "admin", "superadmin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type Module = {
  name: string;
  path: string;
  icon: LucideIcon;
  allowedRoles: UserRole[];
  submodules?: Module[];
};

export const MODULES: Module[] = [
  { name: "Inicio", path: "/zenit", icon: Home, allowedRoles: ["superadmin", "admin", "user"] },
  {
    name: "Módulos",
    path: "/zenit/modulos",
    icon: Package,
    allowedRoles: ["superadmin", "admin", "user"],
    submodules: [
      { name: "Business Intelligence", path: "/zenit/zenits", icon: LayoutDashboard, allowedRoles: ["superadmin", "admin", "user"] },
      { name: "Geomarketing", path: "/zenit/geomarketing", icon: Target, allowedRoles: ["superadmin", "admin", "user"] },
      { name: "Datos Nacionales", path: "/zenit/poblacion", icon: Users, allowedRoles: ["superadmin", "admin", "user"] },
      { name: "Sectorización", path: "/zenit/sectorizacion", icon: Layers, allowedRoles: ["superadmin", "admin", "user"] },
    ]
  },
  { name: "Gaia", path: "/zenit/gaia", icon: Globe, allowedRoles: ["superadmin", "admin", "user"] },
  { name: "GeoDB", path: "/zenit/geodata", icon: Database, allowedRoles: ["superadmin", "admin", "user"] },
  { name: "Análisis GeoIA", path: "/zenit/analisis", icon: BrainCircuit, allowedRoles: ["superadmin", "admin", "user"] },
  { name: "Solicitudes", path: "/zenit/solicitudes", icon: ClipboardList, allowedRoles: ["superadmin", "admin", "user"] },
  { name: "API", path: "/zenit/api", icon: Code, allowedRoles: ["superadmin", "admin", "user"] },
  {
    name: "Administración",
    path: "/zenit/admin",
    icon: ShieldQuestion,
    allowedRoles: ["superadmin", "admin", "user"],
    submodules: [
        { name: "Usuarios", path: "/zenit/configuracion/usuarios", icon: UserCog, allowedRoles: ["superadmin", "admin", "user"] },
        { name: "Roles", path: "/zenit/configuracion/roles", icon: Settings, allowedRoles: ["superadmin", "admin", "user"] },
        { name: "Páginas", path: "/zenit/configuracion/pages", icon: Code, allowedRoles: ["superadmin", "admin", "user"] },
        { name: "Mapas", path: "/zenit/configuracion/mapas", icon: MapIcon, allowedRoles: ["superadmin", "admin", "user"] },
        { name: "Capas", path: "/zenit/configuracion/capas", icon: Layers, allowedRoles: ["superadmin", "admin", "user"] },
        { name: "Perfil", path: "/zenit/configuracion/perfil", icon: UserCog, allowedRoles: ["superadmin", "admin", "user"] },
        { name: "Pruebas", path: "/zenit/configuracion/pruebas", icon: Beaker, allowedRoles: ["superadmin", "admin", "user"] },
    ]
  },
  { name: "Ayuda", path: "/zenit/ayuda", icon: HelpCircle, allowedRoles: ["superadmin", "admin", "user"] },
];

export type SectorModule = {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
};

export const SECTOR_MODULES: SectorModule[] = [
  { id: 'distritos', title: 'Distritos', icon: Waypoints, description: "Visualice la organización por distritos." },
  { id: 'regiones', title: 'Regiones', icon: Globe, description: "Explore la división regional del territorio." },
  { id: 'sucursales', title: 'Sucursales', icon: Building2, description: "Ubique todas las sucursales de la red." },
  { id: 'agricolas', title: 'Sectores Agrícolas', icon: Sprout, description: "Analice las zonas de producción agrícola." },
  { id: 'basicos', title: 'Sectores Básicos', icon: MapIcon, description: "Consulte los sectores básicos de operación." },
];

// Placeholder GeoJSON for layers that would be fetched in a real scenario
export const guatemalaDepartmentGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Guatemala", "type": "Departamento" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-90.85, 14.85],
            [-90.20, 14.85],
            [-90.20, 14.40],
            [-90.85, 14.40],
            [-90.85, 14.85]
          ]
        ]
      }
    }
  ]
};

/**
 * Mapea los roles de la base de datos (PageRole) a los roles del sistema (UserRole)
 * @param roleName - Nombre del rol desde la BD
 * @returns UserRole correspondiente o 'user' por defecto
 */
export function mapPageRoleToUserRole(roleName: string): UserRole {
  const normalizedRole = roleName.toLowerCase().trim();
  
  if (normalizedRole === 'superadmin' || normalizedRole === 'super admin') {
    return 'superadmin';
  }
  if (normalizedRole === 'admin' || normalizedRole === 'administrator') {
    return 'admin';
  }
  return 'user';
}

export const GERENCIAS = [
  "Gerencia Comercial PRONET",
  "Gerencia Corporativa de Auditoria Interna",
  "Gerencia Corporativa de Capital Humano",
  "Gerencia Corporativa de Modelos de Desarrollo",
  "Gerencia Corporativa de Negocios",
  "Gerencia Corporativa de Riesgos",
  "Gerencia Corporativa de Tecnología",
  "Gerencia General",
];

export const REGIONES: Region[] = ["Metropolitana", "Norte", "Nororiente", "Suroriente", "Central", "Suroccidente", "Noroccidente", "Petén"];
export const SECTORES_ECONOMICOS: SectorEconomico[] = ["Servicios", "Agrícola", "Comercio", "Vivienda"];

// Generador de datos simulados para clientes
const generateRandomClientData = (count: number): ClientData[] => {
    const data: ClientData[] = [];
    // Bounding box for Guatemala
    const guatemalaBounds = {
        minLat: 13.73, 
        maxLat: 17.82,
        minLng: -92.23, 
        maxLng: -88.2,
    };

    for (let i = 0; i < count; i++) {
        const lat = guatemalaBounds.minLat + Math.random() * (guatemalaBounds.maxLat - guatemalaBounds.minLat);
        const lng = guatemalaBounds.minLng + Math.random() * (guatemalaBounds.maxLng - guatemalaBounds.minLng);
        data.push({
            id: `CLI-${String(i + 1).padStart(4, '0')}`,
            lat,
            lng,
            region: REGIONES[Math.floor(Math.random() * REGIONES.length)],
            sector: SECTORES_ECONOMICOS[Math.floor(Math.random() * SECTORES_ECONOMICOS.length)],
            riskScore: parseFloat((Math.random() * 9 + 1).toFixed(1)), // 1 a 10
            resilienceScore: parseFloat((Math.random() * 9 + 1).toFixed(1)), // 1 a 10
            portfolio: Math.floor(Math.random() * 50000) + 5000,
        });
    }
    return data;
};

export const ALL_CLIENT_DATA = generateRandomClientData(75);
