
"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Smile, CalendarCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

const npsReports: { title: string; icon: LucideIcon; description: string, href: string }[] = [
    { title: "NPS Q1 2024", icon: CalendarCheck, description: "Resultados del primer trimestre de 2024.", href: "#" },
    { title: "NPS Q3 2024", icon: CalendarCheck, description: "Resultados del tercer trimestre de 2024.", href: "#" },
    { title: "NPS Q1 2025", icon: CalendarCheck, description: "Resultados del primer trimestre de 2025.", href: "#" },
    { title: "NPS Q3 2025", icon: CalendarCheck, description: "Resultados del tercer trimestre de 2025.", href: "/dashboard/dashboards/nps/2025-q3" },
];

export default function NpsDashboardsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <Smile className="h-10 w-10 text-accent" />
        <div>
          <h1 className="font-headline text-3xl font-bold">Dashboards de NPS</h1>
          <p className="text-muted-foreground">
            Explore los informes trimestrales de Net Promoter Score.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {npsReports.map((report) => (
          <Link href={report.href} key={report.title}>
            <Card
              className="group h-full cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary/80 bg-muted/30"
            >
              <CardHeader className="flex flex-col items-center justify-center text-center p-6">
                <div className="p-5 bg-primary/10 rounded-full mb-4 border-2 border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <report.icon className="h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
                </div>
                <CardTitle className="font-headline text-lg">{report.title}</CardTitle>
                <CardDescription className="text-muted-foreground text-sm mt-1 px-2 h-10">
                  {report.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
