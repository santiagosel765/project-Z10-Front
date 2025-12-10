
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Building, Landmark, Banknote } from "lucide-react";

const kpiData = [
  { title: "Total Clientes", value: "7,845", icon: Users, change: "+2.5%", changeType: "increase" },
  { title: "Cartera Activa", value: "Q 12.5M", icon: DollarSign, change: "+5.1%", changeType: "increase" },
  { title: "Sucursales", value: "15", icon: Building, change: "2 nuevas", changeType: "neutral" },
  { title: "Competencia", value: "112", icon: Landmark, description: "Bancos y Microfinancieras" },
  { title: "Puntos de Pago", value: "350", icon: Banknote, description: "Aliados y Cajeros" },
];

export function KpiCards() {
  return (
    <div className="flex flex-wrap gap-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="bg-muted/30 flex-grow min-w-[220px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              {kpi.change ? (
                <p className="text-xs text-muted-foreground">
                  <span className={kpi.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}>{kpi.change}</span> desde el mes pasado
                </p>
              ) : (
                  <p className="text-xs text-muted-foreground h-4">{kpi.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
