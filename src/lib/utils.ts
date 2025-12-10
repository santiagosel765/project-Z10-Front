import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Mapea un string de nombre de ícono a su componente correspondiente de Lucide React
 * @param iconName - Nombre del ícono en formato PascalCase (ej: "Home", "Users", "Database")
 * @returns Componente de ícono de Lucide o ícono por defecto (HelpCircle)
 * 
 * @example
 * const IconComponent = mapIconStringToLucide("Home");
 * <IconComponent className="h-4 w-4" />
 */
export function mapIconStringToLucide(iconName: string | null | undefined): LucideIcon {
  if (!iconName) {
    return LucideIcons.HelpCircle;
  }

  // Mapeo de nombres comunes a sus equivalentes en Lucide
  const iconMappings: Record<string, string> = {
    // Nombres alternativos comunes
    "dashboard": "LayoutDashboard",
    "home": "Home",
    "users": "Users",
    "user": "User",
    "settings": "Settings",
    "database": "Database",
    "map": "Map",
    "chart": "PieChart",
    "analytics": "BarChart3",
    "reports": "FileText",
    "api": "Code",
    "help": "HelpCircle",
    "search": "Search",
    "bell": "Bell",
    "mail": "Mail",
    "calendar": "Calendar",
    "folder": "Folder",
    "file": "File",
    "download": "Download",
    "upload": "Upload",
    "edit": "Edit",
    "delete": "Trash2",
    "add": "Plus",
    "close": "X",
    "check": "Check",
    "alert": "AlertCircle",
    "info": "Info",
    "warning": "AlertTriangle",
    "error": "XCircle",
    "success": "CheckCircle",
    "lock": "Lock",
    "unlock": "Unlock",
    "eye": "Eye",
    "eyeOff": "EyeOff",
    "menu": "Menu",
    "more": "MoreHorizontal",
    "dots": "MoreVertical",
    "arrow-right": "ArrowRight",
    "arrow-left": "ArrowLeft",
    "arrow-up": "ArrowUp",
    "arrow-down": "ArrowDown",
    "chevron-right": "ChevronRight",
    "chevron-left": "ChevronLeft",
    "chevron-up": "ChevronUp",
    "chevron-down": "ChevronDown",
    "layers": "Layers",
    "target": "Target",
    "globe": "Globe",
    "building": "Building2",
    "clipboard": "ClipboardList",
    "brain": "BrainCircuit",
    "package": "Package",
    "box": "Box",
    "shield": "ShieldQuestion",
    "beaker": "Beaker",
    "sprout": "Sprout",
    "wind": "Wind",
    "waypoints": "Waypoints",
  };

  // Normalizar el nombre del ícono (lowercase para comparación)
  const normalizedName = iconName.trim().toLowerCase();
  
  // Buscar en el mapeo primero
  const mappedName = iconMappings[normalizedName];
  
  // Si existe en el mapeo, usar ese nombre, sino usar el original
  const iconKey = mappedName || iconName;

  // Intentar obtener el ícono de Lucide
  const IconComponent = (LucideIcons as any)[iconKey];

  // Si existe el componente, retornarlo, sino retornar ícono por defecto
  return IconComponent || LucideIcons.HelpCircle;
}
