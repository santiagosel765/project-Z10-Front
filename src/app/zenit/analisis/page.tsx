import { AnalysisForm } from "@/components/analysis/analysis-form";
import { BrainCircuit } from "lucide-react";

export default function AnalisisPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4">
        <BrainCircuit className="h-10 w-10 text-accent" />
        <div>
            <h1 className="font-headline text-3xl font-bold">Análisis Geoespacial con IA</h1>
            <p className="text-muted-foreground">
                Potencie sus datos con análisis geoespaciales asistidos por inteligencia artificial.
            </p>
        </div>
      </div>
      <div className="mt-8">
        <AnalysisForm />
      </div>
    </div>
  );
}
