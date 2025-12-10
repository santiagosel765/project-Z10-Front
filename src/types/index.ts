
import type { LucideIcon } from "lucide-react";

// General - Roles del sistema: user (básico), admin (administrador), superadmin (super administrador)
export const USER_ROLES = ["user", "admin", "superadmin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// User - Estructura del backend
export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  phone: string;
  email: string;
  profilePhotoUrl: string | null;
  isActive: boolean;
  birthdate: string | null;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  roles: Role[];
  // Campos computados para compatibilidad con UI existente
  name?: string; // firstName + lastName
  role?: UserRole; // Derivado de roles[0].name
  avatar?: string; // Alias de profilePhotoUrl
}

// Geodata & Maps
export type GeodataLayer = {
  id: string;
  title: string;
  category: string;
  source: 'system' | 'user';
  dataDate?: Date;
  uploadedBy?: string;
};

export type ActiveGeodataLayer = GeodataLayer & {
  color: string;
  visible: boolean;
  opacity: number;
};

// API Keys
export type ApiKeyCategory = "Geospatial" | "Análisis de Datos" | "Agentes de IA" | "Servicios Externos";

export type ApiKey = {
  id: string;
  name: string;
  token: string;
  category: ApiKeyCategory;
  status: "Activa" | "Revocada" | "En Desarrollo";
  createdAt: string;
};

// Geomarketing
export interface LayerInfo {
    id: string;
    name: string;
    category: 'Infraestructura' | 'Clientes' | 'Competencia' | 'Demografía' | 'Análisis' | 'Personalizada';
    source: 'default' | 'upload';
}

export interface ActiveLayer extends LayerInfo {
    visible: boolean;
    opacity: number;
    data: any; // GeoJSON data
}

export interface PointOfInterest {
    id: string;
    name: string;
    type: 'Comercio' | 'Recreación' | 'Transporte' | 'Servicio';
    lat: number;
    lng: number;
}

export interface GeomarketingData {
    sucursal: string;
    clientes: number;
    cartera: number;
    lat: number;
lng: number;
}

export interface CompetitorData {
    name: string;
    type: 'Banco' | 'Microfinanciera' | 'Punto de Pago';
    lat: number;
lng: number;
}

export type ZoneData = {
    name: string;
    clientes: number;
    cartera: number;
};

export type PortfolioData = {
    segmento: string;
    valor: number;
    fill: string;
}

// Climate Risk
export type Region = "Metropolitana" | "Norte" | "Nororiente" | "Suroriente" | "Central" | "Suroccidente" | "Noroccidente" | "Petén";
export type SectorEconomico = "Servicios" | "Agrícola" | "Comercio" | "Vivienda";

export interface ClientData {
    id: string;
    lat: number;
    lng: number;
    region: Region;
    sector: SectorEconomico;
    riskScore: number;
    resilienceScore: number;
    portfolio: number;
}

export interface ClimateRiskFilters {
    region: Region | "Todas";
    sector: SectorEconomico | "Todos";
}

export interface WmsLayer {
    name: string;
    title: string;
    visible: boolean;
    opacity: number;
}


// Layout
export type Module = {
  id?: number;           // ID de la página en BD (opcional para módulos estáticos)
  name: string;
  description?: string;  // Descripción de la página desde BD
  path: string;
  icon: LucideIcon;
  order?: number;        // Orden de visualización desde BD
  allowedRoles: UserRole[];
  isActive?: boolean;    // Estado activo desde BD
  submodules?: Module[];
};

// Datos Nacionales Module
export interface ThematicLayer {
  id: string;
  name: string;
  geojsonPath: string;
}

export interface DownloadableFile {
    name: string;
    url: string;
}

export interface MapCardConfig {
    title: string;
    icon: LucideIcon;
    studies: string[];
    layers: ThematicLayer[];
    downloads: DownloadableFile[];
}

export interface ActiveThematicLayer {
    id: string;
    name: string;
    data: any; // GeoJSON data
    color: string;
    visible: boolean;
}

export interface UploadedFile {
  id: string;
  fileName: string;
  dataDate: Date;
  coverage: string;
  uploadedBy: string;
  uploadDate: Date;
}
