
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Map, BrainCircuit, LayoutDashboard, Lightbulb, Newspaper, RefreshCw, Volume2, LoaderCircle } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { textToSpeech, TTSInput } from "@/ai/flows/tts-flow";
import { Button } from "@/components/ui/button";

type InsightCategory = "tips" | "news";

const InsightContent = ({ content }: { content: string }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);

  return (
    <p className="text-sm text-muted-foreground">
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
              {part}
            </a>
          );
        }
        return part;
      })}
    </p>
  );
};


export default function DashboardPage() {
  const { user } = useAuth();
  const [insights] = useState({
    tips: "Al superponer datos de ventas con mapas de densidad de población, puede identificar mercados sin explotar y optimizar la ubicación de nuevas sucursales.",
    news: "La aseguradora 'Geospatial Insure' ha lanzado pólizas basadas en la ubicación en tiempo real del cliente, usando tecnología de geofencing para micro-seguros. (Fuente: TechCrunch - https://techcrunch.com/geospatial-insurance)",
  });
  const [audioState, setAudioState] = useState({
    tips: { playing: false, loading: false },
    news: { playing: false, loading: false },
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayAudio = useCallback(async (category: InsightCategory) => {
    if (audioState[category].loading || audioState[category].playing) return;
    
    setAudioState(prev => ({ ...prev, [category]: { ...prev[category], loading: true }}));

    try {
        let textToSay = insights[category];

        if (category === 'news') {
            const sourceIndex = textToSay.indexOf('(Fuente:');
            if (sourceIndex !== -1) {
                textToSay = textToSay.substring(0, sourceIndex).trim() + " Para saber más, da clic al enlace.";
            }
        }
        
        const input: TTSInput = { text: textToSay };
        const response = await textToSpeech(input);

        if (audioRef.current) {
            Object.values(audioState).forEach(s => s.playing = false);
            audioRef.current.pause();
        }
        
        audioRef.current = new Audio(response.audio);
        audioRef.current.play();

        setAudioState(prev => ({ ...prev, tips: { playing: false, loading: false }, news: { playing: false, loading: false }, [category]: { playing: true, loading: false }}));

        audioRef.current.onended = () => {
             setAudioState(prev => ({ ...prev, [category]: { ...prev[category], playing: false }}));
        };

    } catch (err) {
        console.error('Failed to play audio:', err);
        setAudioState(prev => ({ ...prev, [category]: { ...prev[category], loading: false }}));
    }
  }, [insights, audioState]);

  return (
    <div className="p-6">
      <h1 className="mb-4 font-headline text-3xl font-bold">
        Bienvenido a ZENIT, {user?.username}
      </h1>
      <p className="mb-8 text-muted-foreground">
        Su plataforma inteligente para análisis geoespacial.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="text-accent" />
              Visualización de Mapas
            </CardTitle>
            <CardDescription>
              Cargue y visualice capas KML, GeoJSON y Shapefiles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Explore datos geográficos de Guatemala de forma interactiva.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="text-accent" />
              Análisis con IA
            </CardTitle>
            <CardDescription>
              Utilice el poder de la IA para análisis espaciales complejos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Realice análisis de superposición, proximidad y puntos calientes asistidos por IA.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="text-accent" />
              Dashboards Dinámicos
            </CardTitle>
            <CardDescription>
              Integre sus tableros de Power BI para una vista unificada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Combine la potencia de sus datos de negocio con el análisis geoespacial.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
         <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="text-accent" />
              Consejos de Análisis Espacial
            </CardTitle>
            <CardDescription>
                Recomendaciones generadas por IA para sacar el máximo provecho a sus datos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
             <InsightContent content={insights.tips} />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" disabled>
              <RefreshCw className="mr-2 h-4 w-4" />
              Siguiente Consejo
            </Button>
            <Button variant="outline" size="icon" onClick={() => handlePlayAudio("tips")} disabled={audioState.tips.loading}>
                {audioState.tips.loading ? <LoaderCircle className="h-5 w-5 animate-spin"/> : <Volume2 className={`h-5 w-5 ${audioState.tips.playing ? 'text-primary' : ''}`} />}
            </Button>
          </CardFooter>
        </Card>
         <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Newspaper className="text-accent" />
                Novedades en GIS y Finanzas
            </CardTitle>
             <CardDescription>
                Últimas noticias y tendencias en el sector, seleccionadas por IA.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
             <InsightContent content={insights.news} />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" disabled>
              <RefreshCw className="mr-2 h-4 w-4" />
              Siguiente Noticia
            </Button>
            <Button variant="outline" size="icon" onClick={() => handlePlayAudio("news")} disabled={audioState.news.loading}>
                 {audioState.news.loading ? <LoaderCircle className="h-5 w-5 animate-spin"/> : <Volume2 className={`h-5 w-5 ${audioState.news.playing ? 'text-primary' : ''}`} />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
