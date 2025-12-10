
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Smile,
  LogOut,
  Briefcase,
  AlertCircle,
  Shield,
  Handshake,
  Search,
  FileX2,
  UserCheck,
  MoreHorizontal,
  BarChart3,
  CloudLightning,
  AreaChart,
  Mountain,
  Search as SearchIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const biCategories: { title: string; icon: LucideIcon; description: string, href: string }[] = [
    { title: "NPS", icon: Smile, description: "Mide la lealtad de nuestros clientes.", href: "/dashboard/dashboards/nps" },
    { title: "Deserción", icon: LogOut, description: "Analiza la tasa de abandono de clientes.", href: "#" },
    { title: "SDE", icon: Briefcase, description: "Indicadores del servicio de desarrollo empresarial.", href: "#" },
    { title: "Dificultad de Pago", icon: AlertCircle, description: "Monitorea clientes con problemas de pago.", href: "#" },
    { title: "Seguros", icon: Shield, description: "Análisis del rendimiento de pólizas de seguros.", href: "#" },
    { title: "Akisí", icon: Handshake, description: "Desempeño de los puntos de servicio Akisí.", href: "#" },
    { title: "Investigaciones", icon: Search, description: "Estudios de mercado y análisis cualitativos.", href: "#" },
    { title: "Cancelaciones Anticipadas", icon: FileX2, description: "Analiza las causas de cancelaciones prematuras.", href: "#" },
    { title: "Mystery Shopper", icon: UserCheck, description: "Evaluación de la experiencia del cliente.", href: "#" },
    { title: "Otros", icon: MoreHorizontal, description: "Visualice otros estudios e informes adicionales.", href: "#" },
];

const riskCategories = [
    { 
        title: "Riesgos Climáticos", 
        icon: CloudLightning, 
        description: "Analice y visualice los riesgos asociados al cambio climático.",
        href: "/dashboard/riesgos/climaticos"
    },
    { 
        title: "Riesgos Socioeconómicos", 
        icon: AreaChart, 
        description: "Indicadores y análisis de riesgos sociales y económicos.",
        href: "#"
    },
    { 
        title: "Riesgos Naturales", 
        icon: Mountain, 
        description: "Evalúe la exposición a amenazas como sismos y deslizamientos.",
        href: "#" 
    },
];

function BusinessIntelligenceContent({ searchTerm }: { searchTerm: string }) {
    const filteredCategories = biCategories.filter(category => 
        category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredCategories.map((category) => (
            <Link href={category.href} key={category.title}>
                <Card
                className="group h-full cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary/80 bg-muted/30"
                >
                <CardHeader className="flex flex-col items-center justify-center text-center p-6">
                    <div className="p-5 bg-primary/10 rounded-full mb-4 border-2 border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <category.icon className="h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
                    </div>
                    <CardTitle className="font-headline text-lg">{category.title}</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm mt-1 px-2 h-10">
                    {category.description}
                    </CardDescription>
                </CardHeader>
                </Card>
            </Link>
            ))}
        </div>
    )
}

function RiesgosContent({ searchTerm }: { searchTerm: string }) {
    const filteredCategories = riskCategories.filter(category =>
        category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => (
          <Link href={category.href} key={category.title}>
            <Card
              className="group h-full cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary/80 bg-muted/30"
            >
              <CardHeader className="flex flex-col items-center justify-center text-center p-6">
                <div className="p-5 bg-primary/10 rounded-full mb-4 border-2 border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <category.icon className="h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
                </div>
                <CardTitle className="font-headline text-lg">{category.title}</CardTitle>
                <CardDescription className="text-sm mt-1 px-2">{category.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    )
}

export default function DashboardsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
            <BarChart3 className="h-10 w-10 text-accent" />
            <div>
            <h1 className="font-headline text-3xl font-bold">Business Intelligence</h1>
            <p className="text-muted-foreground">
                Explore las categorías de estudios y visualice sus tableros de Power BI.
            </p>
            </div>
        </div>
        <div className="relative w-full md:w-auto">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                type="search"
                placeholder="Buscar categorías o tableros..."
                className="pl-10 w-full md:w-[300px] lg:w-[400px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>
      
      <Tabs defaultValue="bi" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger 
            value="bi"
            className={cn("data-[state=active]:bg-active-tab-green data-[state=active]:text-white font-semibold text-gray-700")}
          >
            Business Intelligence
          </TabsTrigger>
          <TabsTrigger 
            value="riesgos"
            className={cn("data-[state=active]:bg-active-tab-green data-[state=active]:text-white font-semibold text-gray-700")}
          >
            Módulo de Riesgos
          </TabsTrigger>
        </TabsList>
        <TabsContent value="bi">
          <BusinessIntelligenceContent searchTerm={searchTerm} />
        </TabsContent>
        <TabsContent value="riesgos">
          <RiesgosContent searchTerm={searchTerm} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
