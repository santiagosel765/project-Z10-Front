
"use client";

import * as React from 'react';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import type { ClimateRiskFilters, ClientData } from "@/types";
import { ALL_CLIENT_DATA } from "@/lib/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const filterClients = (clients: ClientData[], filters: ClimateRiskFilters) => {
    return clients.filter(client => 
        (filters.region === "Todas" || client.region === filters.region) &&
        (filters.sector === "Todos" || client.sector === filters.sector)
    );
};

const riskLevels = ["Bajo", "Medio", "Alto"];
const resilienceLevels = ["Bajo", "Medio", "Alto"];

const getLevel = (score: number) => {
    if (score <= 3) return "Bajo";
    if (score <= 6) return "Medio";
    return "Alto";
};

const cellColors: {[key: string]: string} = {
    "Bajo-Alto": "bg-green-500/80", // Bajo Riesgo, Alta Resiliencia
    "Medio-Alto": "bg-green-500/50",
    "Alto-Alto": "bg-yellow-500/50",
    "Bajo-Medio": "bg-green-500/50",
    "Medio-Medio": "bg-yellow-500/80", // Riesgo Medio, Resiliencia Media
    "Alto-Medio": "bg-red-500/50",
    "Bajo-Bajo": "bg-yellow-500/50",
    "Medio-Bajo": "bg-red-500/50",
    "Alto-Bajo": "bg-red-500/80", // Alto Riesgo, Baja Resiliencia
};

const cellDescriptions: {[key: string]: string} = {
    "Bajo-Alto": "Ideal: Clientes con bajo riesgo y alta resiliencia.",
    "Medio-Alto": "Favorable: Clientes con riesgo medio pero buena resiliencia.",
    "Alto-Alto": "Atención: Clientes con alto riesgo pero también alta resiliencia. Monitorear.",
    "Bajo-Medio": "Estable: Clientes con bajo riesgo y resiliencia media.",
    "Medio-Medio": "Observación: El grupo promedio. Potencial para mejorar resiliencia.",
    "Alto-Medio": "Vulnerable: Alto riesgo con resiliencia media. Requiere intervención.",
    "Bajo-Bajo": "Potencial: Bajo riesgo pero baja resiliencia. Oportunidad para productos verdes.",
    "Medio-Bajo": "Preocupante: Riesgo medio y baja resiliencia. Prioridad para intervención.",
    "Alto-Bajo": "Crítico: La zona de mayor preocupación. Clientes muy vulnerables.",
};

export function ClimateRiskMatrix({ filters }: { filters: ClimateRiskFilters }) {
    const matrixData = useMemo(() => {
        const filtered = filterClients(ALL_CLIENT_DATA, filters);
        const matrix: number[][] = Array(3).fill(0).map(() => Array(3).fill(0));

        filtered.forEach(client => {
            const riskIndex = riskLevels.indexOf(getLevel(client.riskScore));
            const resilienceIndex = resilienceLevels.indexOf(getLevel(client.resilienceScore));
            if (riskIndex !== -1 && resilienceIndex !== -1) {
                matrix[2 - resilienceIndex][riskIndex]++; // Invert resilience for y-axis (High on top)
            }
        });
        return matrix;
    }, [filters]);

    return (
        <Card className="bg-muted/30">
            <CardHeader>
                <CardTitle>Matriz de Riesgo vs. Resiliencia</CardTitle>
                <CardDescription>Clasificación de clientes según su nivel de riesgo y resiliencia.</CardDescription>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                <div className="flex">
                    <div className="flex items-center justify-center -rotate-90 -ml-4 mr-1">
                        <span className="text-sm font-medium text-muted-foreground tracking-wider">RESILIENCIA</span>
                    </div>
                    <div className="flex-grow">
                        <div className="grid grid-cols-4 gap-1">
                            {/* Y-axis labels */}
                            <div></div>
                            {riskLevels.map(level => (
                                <div key={level} className="text-center font-medium text-sm text-muted-foreground">{level}</div>
                            ))}

                            {resilienceLevels.slice().reverse().map((resilienceLvl, rowIndex) => (
                                <React.Fragment key={rowIndex}>
                                    <div className="text-right font-medium text-sm pr-2 text-muted-foreground">{resilienceLvl}</div>
                                    {riskLevels.map((riskLvl, colIndex) => {
                                        const key = `${riskLvl}-${resilienceLvl}`;
                                        return (
                                        <Tooltip key={key}>
                                            <TooltipTrigger asChild>
                                                <div className={cn(
                                                    "h-24 flex items-center justify-center rounded-md text-white font-bold text-2xl transition-all duration-300",
                                                    cellColors[key] || 'bg-gray-400'
                                                )}>
                                                    {matrixData[rowIndex][colIndex]}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{cellDescriptions[key]}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )})}
                                </React.Fragment>
                            ))}
                        </div>
                         <div className="text-center mt-2 font-medium text-sm text-muted-foreground tracking-wider">RIESGO</div>
                    </div>
                </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}
