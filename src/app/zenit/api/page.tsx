
"use client";

import * as React from "react";
import { PlusCircle, MoreHorizontal, KeyRound, Bot, MapPin } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { AddApiKeyDialog } from "@/components/api/add-api-key-dialog";

import { v4 as uuidv4 } from 'uuid';
import { ApiKey } from "@/types";

const initialApiKeys: ApiKey[] = [
  { id: "api_001", name: "Geocoding API", token: "zen_geo_sk_live_a1b2c3d4e5f6g7h8...", category: "Geospatial", status: "Activa", createdAt: "2024-05-10" },
  { id: "api_002", name: "Routing & Directions API", token: "zen_route_sk_live_i9j0k1l2m3n4o5p6...", category: "Geospatial", status: "Activa", createdAt: "2024-04-22" },
  { id: "api_003", name: "AI Notifier Agent (WhatsApp & Email)", token: "zen_agent_sk_live_q7r8s9t0u1v2w3x4...", category: "Agentes de IA", status: "Activa", createdAt: "2024-05-01" },
  { id: "api_004", name: "Spatial Analysis Agent", token: "zen_sa_sk_dev_y5z6a7b8c9d0e1f2...", category: "Agentes de IA", status: "En Desarrollo", createdAt: "2024-06-15" },
  { id: "api_005", name: "Power BI Integration API", token: "zen_pbi_sk_live_g3h4i5j6k7l8m9n0...", category: "Análisis de Datos", status: "Activa", createdAt: "2024-03-18" },
  { id: "api_006", name: "OpenWeatherMap API Key", token: "ext_owm_pk_live_o1p2q3r4s5t6u7v8...", category: "Servicios Externos", status: "Revocada", createdAt: "2023-11-30" },
];

const CATEGORY_ICONS: { [key in ApiKey['category']]: React.ElementType } = {
    "Geospatial": MapPin,
    "Análisis de Datos": KeyRound,
    "Agentes de IA": Bot,
    "Servicios Externos": KeyRound,
};

const CATEGORY_COLORS: { [key in ApiKey['category']]: string } = {
    "Geospatial": "bg-blue-500/20 text-blue-400",
    "Análisis de Datos": "bg-purple-500/20 text-purple-400",
    "Agentes de IA": "bg-teal-500/20 text-teal-400",
    "Servicios Externos": "bg-gray-500/20 text-gray-400",
};


export default function ApiPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>(initialApiKeys);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleGenerateApi = (newApiKeyData: Omit<ApiKey, 'id' | 'token' | 'status' | 'createdAt'>) => {
    const newApiKey: ApiKey = {
      id: `api_${uuidv4().substring(0,8)}`,
      token: `zen_${newApiKeyData.category.slice(0,4).toLowerCase()}_sk_live_${uuidv4().replace(/-/g, '')}...`,
      status: "Activa",
      createdAt: new Date().toISOString().split('T')[0],
      ...newApiKeyData,
    };
    setApiKeys(prev => [newApiKey, ...prev]);
    toast({
      title: "API Generada Exitosamente",
      description: `Se ha creado la nueva API: ${newApiKey.name}`,
    });
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({
        title: "Token Copiado",
        description: "El token de la API ha sido copiado al portapapeles."
    })
  }

  if (user?.role !== "user") {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <KeyRound className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 font-headline text-2xl font-bold">Acceso Denegado</h2>
        <p className="text-muted-foreground">
          No tiene permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
          <div className="flex items-center justify-between">
              <div>
              <h1 className="font-headline text-3xl font-bold">Gestión de API</h1>
              <p className="text-muted-foreground">
                  Cree y gestione tokens de API para integrar ZENIT con otros servicios.
              </p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Generar Nueva API
              </Button>
          </div>

          <Card className="mt-8 bg-muted/30">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre de API</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => {
                    const Icon = CATEGORY_ICONS[apiKey.category];
                    return (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${CATEGORY_COLORS[apiKey.category]}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-bold">{apiKey.name}</span>
                          </div>
                      </TableCell>
                      <TableCell>
                          <Badge variant="outline" className="font-mono">{apiKey.token}</Badge>
                      </TableCell>
                      <TableCell>
                          <Badge variant="secondary">{apiKey.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={apiKey.status === 'Activa' ? 'default' : apiKey.status === 'Revocada' ? 'destructive' : 'secondary'} className={apiKey.status === 'Activa' ? 'bg-green-500/80' : ''}>{apiKey.status}</Badge>
                      </TableCell>
                      <TableCell>{apiKey.createdAt}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleCopyToken(apiKey.token)}>Copiar Token</DropdownMenuItem>
                            <DropdownMenuItem>Revocar</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      <AddApiKeyDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddApiKey={handleGenerateApi}
      />
    </>
  );
}
