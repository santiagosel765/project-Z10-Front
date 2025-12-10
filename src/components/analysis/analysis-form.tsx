"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { aiAssistedSpatialAnalysis } from "@/ai/flows/ai-assisted-spatial-analysis";
import type { AiAssistedSpatialAnalysisOutput } from "@/ai/flows/ai-assisted-spatial-analysis";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const analysisSchema = z.object({
  analysisType: z.enum(["overlay", "proximity", "hotspot"]),
  layerData: z.string().min(1, "Layer data is required."),
  parameters: z
    .string()
    .min(1, "Parameters are required.")
    .refine(
      (val) => {
        try {
          JSON.parse(val);
          return true;
        } catch (e) {
          return false;
        }
      },
      { message: "Parameters must be a valid JSON object." }
    ),
  usePublicData: z.boolean(),
  additionalContext: z.string().optional(),
});

type AnalysisFormValues = z.infer<typeof analysisSchema>;

export function AnalysisForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiAssistedSpatialAnalysisOutput | null>(null);
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      analysisType: "proximity",
      layerData: '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[14.64, -90.51]}}]}',
      parameters: '{"distance": 10}',
      usePublicData: true,
      additionalContext: "Analyze proximity to clinics for Genesis Foundation.",
    },
  });

  const onSubmit = async (data: AnalysisFormValues) => {
    setIsLoading(true);
    setResult(null);
    try {
      const parsedParameters = JSON.parse(data.parameters);
      const response = await aiAssistedSpatialAnalysis({
        ...data,
        parameters: parsedParameters,
      });
      setResult(response);
      toast({ title: "Análisis completado", description: "Resultados generados por la IA." });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Error en el análisis",
        description: "No se pudo completar el análisis. Por favor, revise los parámetros.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <Card className="bg-muted/30">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Parámetros de Análisis</CardTitle>
            <CardDescription>
              Configure los detalles para el análisis geoespacial.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="analysisType">Tipo de Análisis</Label>
              <Controller
                name="analysisType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un tipo de análisis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overlay">Superposición (Overlay)</SelectItem>
                      <SelectItem value="proximity">Proximidad (Buffer)</SelectItem>
                      <SelectItem value="hotspot">Puntos Calientes (Hotspot)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="layerData">Datos de Capa (GeoJSON)</Label>
              <Controller
                name="layerData"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} placeholder="Pegue aquí su GeoJSON" rows={5} />
                )}
              />
              {errors.layerData && (
                <p className="text-sm text-destructive">{errors.layerData.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="parameters">Parámetros (JSON)</Label>
              <Controller
                name="parameters"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} placeholder='Ej: {"distance": 10}' rows={3} />
                )}
              />
              {errors.parameters && (
                <p className="text-sm text-destructive">{errors.parameters.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalContext">Contexto Adicional</Label>
              <Controller
                name="additionalContext"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Instrucciones adicionales para la IA"
                    rows={3}
                  />
                )}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Controller
                name="usePublicData"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="usePublicData"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="usePublicData">Usar fuentes de datos públicas (INE, SEGEPLAN, etc.)</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Analizando..." : "Ejecutar Análisis"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>Resultados del Análisis</CardTitle>
          <CardDescription>
            La IA ha generado los siguientes resultados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {result && (
            <div className="space-y-4 text-sm">
              <div>
                <Label className="font-semibold text-accent">Resumen del Análisis</Label>
                <p className="mt-1 text-muted-foreground">{result.analysisSummary}</p>
              </div>
              <div>
                <Label className="font-semibold text-accent">Fuentes de Datos Utilizadas</Label>
                <ul className="mt-1 list-disc list-inside text-muted-foreground">
                  {result.dataSourcesUsed.map((source) => (
                    <li key={source}>{source}</li>
                  ))}
                </ul>
              </div>
              <div>
                <Label className="font-semibold text-accent">Resultado (GeoJSON)</Label>
                <pre className="mt-1 h-48 w-full overflow-auto rounded-md bg-background/50 p-2 text-xs">
                  {JSON.stringify(JSON.parse(result.analysisResult), null, 2)}
                </pre>
              </div>
            </div>
          )}
          {!isLoading && !result && (
            <div className="flex h-full min-h-[300px] items-center justify-center text-center text-muted-foreground">
              <p>Los resultados del análisis aparecerán aquí.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
