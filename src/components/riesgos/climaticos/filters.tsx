
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClimateRiskFilters } from "@/types";
import { REGIONES, SECTORES_ECONOMICOS } from "@/lib/constants";

interface ClimateFiltersProps {
    filters: ClimateRiskFilters;
    setFilters: (filters: ClimateRiskFilters) => void;
}

export function ClimateRiskFilters({ filters, setFilters }: ClimateFiltersProps) {
    return (
        <Card className="bg-muted/30">
            <CardContent className="p-4 flex items-center gap-6">
                 <div className="flex items-center gap-3">
                    <Label htmlFor="region-filter" className="text-sm font-medium">Región:</Label>
                    <Select 
                        value={filters.region} 
                        onValueChange={(value) => setFilters({ ...filters, region: value as any })}
                    >
                        <SelectTrigger id="region-filter" className="w-[180px]">
                            <SelectValue placeholder="Seleccionar Región" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Todas">Todas</SelectItem>
                            {REGIONES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="flex items-center gap-3">
                    <Label htmlFor="sector-filter" className="text-sm font-medium">Sector Económico:</Label>
                    <Select 
                        value={filters.sector}
                        onValueChange={(value) => setFilters({ ...filters, sector: value as any })}
                    >
                        <SelectTrigger id="sector-filter" className="w-[180px]">
                            <SelectValue placeholder="Seleccionar Sector" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Todos">Todos</SelectItem>
                            {SECTORES_ECONOMICOS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
            </CardContent>
        </Card>
    )
}
