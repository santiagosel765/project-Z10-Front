
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, ShieldCheck, DollarSign } from "lucide-react";
import type { ClimateRiskFilters, ClientData } from "@/types";
import { ALL_CLIENT_DATA } from "@/lib/constants";

interface ClimateKpiCardsProps {
    filters: ClimateRiskFilters;
    selectedClientId: string | null;
}

const filterClients = (clients: ClientData[], filters: ClimateRiskFilters) => {
    return clients.filter(client => 
        (filters.region === "Todas" || client.region === filters.region) &&
        (filters.sector === "Todos" || client.sector === filters.sector)
    );
};

export function ClimateKpiCards({ filters, selectedClientId }: ClimateKpiCardsProps) {

  const filteredData = useMemo(() => {
    const baseFiltered = filterClients(ALL_CLIENT_DATA, filters);
    if(selectedClientId) {
      const selectedClient = ALL_CLIENT_DATA.find(c => c.id === selectedClientId);
      return selectedClient ? [selectedClient] : [];
    }
    return baseFiltered;
  }, [filters, selectedClientId]);

  const totalClients = filteredData.length;
  const clientsInHighRisk = filteredData.filter(c => c.riskScore > 7).length;
  const avgResilience = totalClients > 0 
    ? filteredData.reduce((acc, c) => acc + c.resilienceScore, 0) / totalClients
    : 0;
  const totalPortfolio = filteredData.reduce((acc, c) => acc + c.portfolio, 0);

  const kpiData = [
    { title: "Total Clientes Analizados", value: totalClients.toLocaleString(), icon: Users },
    { title: "Clientes en Riesgo Alto", value: clientsInHighRisk.toLocaleString(), icon: AlertTriangle, description: `${(totalClients > 0 ? (clientsInHighRisk / totalClients) * 100 : 0).toFixed(1)}% del total` },
    { title: "Resiliencia Promedio", value: `${avgResilience.toFixed(1)} / 10`, icon: ShieldCheck, description: "Basado en la escala de resiliencia" },
    { title: "Cartera Expuesta", value: `Q ${(totalPortfolio / 1000000).toFixed(1)}M`, icon: DollarSign, description: "Suma de cartera de clientes analizados" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi) => (
        <Card key={kpi.title} className="bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            {kpi.description && (
                <p className="text-xs text-muted-foreground">{kpi.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
