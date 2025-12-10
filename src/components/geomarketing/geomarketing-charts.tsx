"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ZoneData, PortfolioData } from "@/types"

const zoneData: ZoneData[] = [
  { name: "Zona 1", clientes: 400, cartera: 2400000 },
  { name: "Zona 10", clientes: 300, cartera: 1800000 },
  { name: "Mixco", clientes: 700, cartera: 3500000 },
  { name: "Villa Nueva", clientes: 800, cartera: 4000000 },
  { name: "Carretera a El Salvador", clientes: 200, cartera: 5000000 },
  { name: "Zona 18", clientes: 650, cartera: 1200000 },
];

const chartConfig: ChartConfig = {
  clientes: {
    label: "Clientes",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const portfolioData: PortfolioData[] = [
    { segmento: 'Crédito Personal', valor: 4500000, fill: 'hsl(var(--chart-1))' },
    { segmento: 'Microcrédito', valor: 3000000, fill: 'hsl(var(--chart-2))' },
    { segmento: 'Crédito Vehicular', valor: 2000000, fill: 'hsl(var(--chart-3))' },
    { segmento: 'Crédito Hipotecario', valor: 3000000, fill: 'hsl(var(--chart-4))' },
];

const portfolioChartConfig = {
    valor: {
      label: "Valor",
    },
    ...Object.fromEntries(portfolioData.map(d => [d.segmento, {label: d.segmento, color: d.fill}]))
} satisfies ChartConfig;


export function ZoneAnalysisChart() {
  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle>Concentración de Clientes por Zona</CardTitle>
        <CardDescription>Top 6 de zonas con mayor número de clientes activos.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={zoneData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="clientes" fill="var(--color-clientes)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function PortfolioDistributionChart() {
  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle>Distribución de Cartera</CardTitle>
        <CardDescription>Análisis de la cartera por tipo de crédito.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={portfolioChartConfig} className="mx-auto aspect-square max-h-[300px]">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="segmento" hideLabel />} />
              <Pie data={portfolioData} dataKey="valor" nameKey="segmento" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                 {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
