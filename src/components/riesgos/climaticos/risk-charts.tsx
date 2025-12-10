
"use client";

import { useMemo } from 'react';
import { PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ClimateRiskFilters, ClientData } from "@/types";
import { ALL_CLIENT_DATA } from "@/lib/constants";

const filterClients = (clients: ClientData[], filters: ClimateRiskFilters) => {
    return clients.filter(client => 
        (filters.region === "Todas" || client.region === filters.region) &&
        (filters.sector === "Todos" || client.sector === filters.sector)
    );
};

const radarChartConfig = {
  riesgo: { label: "Riesgo", color: "hsl(var(--chart-4))" },
  resiliencia: { label: "Resiliencia", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export function RiskResilienceRadarChart({ filters, selectedClientId }: { filters: ClimateRiskFilters, selectedClientId: string | null }) {
  const radarData = useMemo(() => {
    const dataSet = selectedClientId 
        ? ALL_CLIENT_DATA.filter(c => c.id === selectedClientId)
        : filterClients(ALL_CLIENT_DATA, filters);

    if (dataSet.length === 0) return [];

    const avgRisk = dataSet.reduce((sum, client) => sum + client.riskScore, 0) / dataSet.length;
    const avgResilience = dataSet.reduce((sum, client) => sum + client.resilienceScore, 0) / dataSet.length;
    
    return [
      { category: "Vulnerabilidad Física", riesgo: avgRisk * (0.8 + Math.random() * 0.2), resiliencia: avgResilience * (0.6 + Math.random() * 0.2) },
      { category: "Impacto Económico", riesgo: avgRisk * (0.9 + Math.random() * 0.1), resiliencia: avgResilience * (0.8 + Math.random() * 0.15) },
      { category: "Capacidad Adaptativa", riesgo: 10 - avgResilience * (0.9 + Math.random() * 0.1), resiliencia: avgResilience * (0.95 + Math.random() * 0.05) },
      { category: "Exposición a Sequías", riesgo: avgRisk * (0.7 + Math.random() * 0.25), resiliencia: avgResilience * (0.5 + Math.random() * 0.3) },
      { category: "Exposición a Inundaciones", riesgo: avgRisk * (0.6 + Math.random() * 0.3), resiliencia: avgResilience * (0.7 + Math.random() * 0.2) },
    ].map(d => ({ ...d, riesgo: Math.min(10, d.riesgo), resiliencia: Math.min(10, d.resiliencia)}));

  }, [filters, selectedClientId]);

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle>Perfil de Riesgo vs. Resiliencia</CardTitle>
        <CardDescription>
            {selectedClientId ? `Datos para ${selectedClientId}` : `Promedio para la selección actual.`} (Escala 1-10)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={radarChartConfig} className="mx-auto aspect-square max-h-[300px]">
          <RadarChart data={radarData}>
            <ChartTooltip content={<ChartTooltipContent />} />
            <PolarGrid />
            <PolarAngleAxis dataKey="category" className="text-xs" />
            <PolarRadiusAxis angle={30} domain={[0, 10]} />
            <Radar name="Riesgo" dataKey="riesgo" fill="var(--color-riesgo)" fillOpacity={0.6} />
            <Radar name="Resiliencia" dataKey="resiliencia" fill="var(--color-resiliencia)" fillOpacity={0.6} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const barChartConfig = {
  count: { label: "Nº de Clientes", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

export function ClientRiskDistributionChart({ filters, selectedClientId }: { filters: ClimateRiskFilters, selectedClientId: string | null }) {
  const barData = useMemo(() => {
    const dataSet = selectedClientId
        ? ALL_CLIENT_DATA.filter(c => c.id === selectedClientId)
        : filterClients(ALL_CLIENT_DATA, filters);

    const distribution = { 'Bajo (0-3)': 0, 'Medio (4-6)': 0, 'Alto (7-10)': 0 };
    dataSet.forEach(client => {
      const score = selectedClientId ? client.riskScore : (client.riskScore + (Math.random() - 0.5) * 2);
      if (score <= 3.5) distribution['Bajo (0-3)']++;
      else if (score <= 6.5) distribution['Medio (4-6)']++;
      else distribution['Alto (7-10)']++;
    });
    return Object.entries(distribution).map(([name, count]) => ({ name, count }));
  }, [filters, selectedClientId]);

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle>Distribución de Clientes por Nivel de Riesgo</CardTitle>
        <CardDescription>
            {selectedClientId ? "Nivel de riesgo del cliente seleccionado." : "Distribución de la selección actual."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={barChartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={10} width={80} className="text-xs"/>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
