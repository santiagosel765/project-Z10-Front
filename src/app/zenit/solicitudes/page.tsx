
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/datepicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GERENCIAS } from "@/lib/constants";
import { ClipboardList, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FORMATOS = [
    { id: "zenit", label: "En Zenit" },
    { id: "geojson", label: "GeoJSON" },
    { id: "pdf", label: "PDF" },
    { id: "powerbi", label: "PowerBI" },
];

export default function SolicitudesPage() {
  const { toast } = useToast();
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);

  const handleFormatChange = (formatId: string) => {
    setSelectedFormats(prev => 
      prev.includes(formatId) 
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
        title: "Solicitud Enviada",
        description: "Tu solicitud de estudio ha sido enviada con éxito.",
    });
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4">
        <ClipboardList className="h-10 w-10 text-accent" />
        <div>
          <h1 className="font-headline text-3xl font-bold">
            Formulario de Solicitud de Análisis Geoespaciales
          </h1>
          <p className="text-muted-foreground">
            Complete todos los campos para iniciar el proceso de su estudio.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 max-w-4xl mx-auto space-y-6">
        
        {/* Sección 1: Datos del Solicitante */}
        <Card>
            <CardHeader>
                <CardTitle>1. Datos del Solicitante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="gerencia">Gerencia solicitante</Label>
                    <Select name="gerencia">
                        <SelectTrigger>
                        <SelectValue placeholder="Seleccione una gerencia" />
                        </SelectTrigger>
                        <SelectContent>
                        {GERENCIAS.map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nombre-solicitante">Nombre solicitante</Label>
                        <Input id="nombre-solicitante" placeholder="Ej: Juan Pérez" />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="correo">Correo de contacto</Label>
                    <Input id="correo" type="email" placeholder="Ej: juan.perez@empresa.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono de contacto</Label>
                        <Input id="telefono" type="tel" placeholder="Ej: 5555-1234" />
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Sección 2: Datos del Estudio */}
        <Card>
            <CardHeader>
                <CardTitle>2. Datos del Estudio de Investigación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="nombre-estudio">Nombre del Estudio</Label>
                  <Input id="nombre-estudio" placeholder="Título descriptivo del estudio" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="objetivo">Objetivo del estudio (descripción)</Label>
                <Textarea id="objetivo" rows={4} placeholder="Describa claramente el propósito y la finalidad del estudio." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preguntas">Preguntas específicas a responder</Label>
                <Textarea id="preguntas" rows={4} placeholder="¿Qué?, ¿Quién?, ¿Cómo?, ¿Cuánto?, ¿Dónde?, ¿Por qué?" />
              </div>
            </CardContent>
        </Card>

        {/* Sección 3, 4, 5 */}
        <Card>
            <CardHeader>
                <CardTitle>3. Audiencia y Enfoque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label className="font-semibold">3. Tipo de Investigación</Label>
                        <RadioGroup defaultValue="mixta">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="cualitativa" id="cualitativa" /><Label htmlFor="cualitativa" className="font-normal">Cualitativa</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="cuantitativa" id="cuantitativa" /><Label htmlFor="cuantitativa" className="font-normal">Cuantitativa</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="mixta" id="mixta" /><Label htmlFor="mixta" className="font-normal">Mixta</Label></div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-3">
                        <Label className="font-semibold">4. Segmento de Mercado</Label>
                         <RadioGroup defaultValue="clientes">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="clientes" id="clientes" /><Label htmlFor="clientes" className="font-normal">Clientes</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="no-clientes" id="no-clientes" /><Label htmlFor="no-clientes" className="font-normal">No Clientes</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="colaboradores" id="colaboradores" /><Label htmlFor="colaboradores" className="font-normal">Colaboradores</Label></div>
                        </RadioGroup>
                    </div>
                </div>
                <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="demograficos" className="font-semibold">5. Datos demográficos del público objetivo</Label>
                    <Textarea id="demograficos" placeholder="Edad, género, ubicación, preferencias, hábitos, etc." />
                </div>
            </CardContent>
        </Card>

        {/* Sección 6, 7, 8 */}
        <Card>
            <CardHeader>
                <CardTitle>4. Recursos y Plazos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <Label htmlFor="presupuesto" className="font-semibold">6. Presupuesto disponible</Label>
                        <Input id="presupuesto" type="number" placeholder="Ej: 5000" />
                    </div>
                    <div className="space-y-3">
                        <Label className="font-semibold">7. Plazo</Label>
                        <div className="flex items-center gap-4">
                            <DatePicker placeholder="Fecha de inicio" />
                            <DatePicker placeholder="Fecha de fin" />
                        </div>
                    </div>
                </div>
                <div className="space-y-3 pt-4 border-t">
                    <Label className="font-semibold">8. Formato de entrega</Label>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {FORMATOS.map((item) => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={item.id}
                            checked={selectedFormats.includes(item.id)}
                            onCheckedChange={() => handleFormatChange(item.id)}
                          />
                          <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                        </div>
                      ))}
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Sección 9, 10 */}
        <Card>
            <CardHeader>
                <CardTitle>5. Resultados y Detalles Adicionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="resultados" className="font-semibold">9. Resultados Esperados</Label>
                    <Textarea id="resultados" placeholder="Métricas a evaluar y uso esperado del estudio" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="comentarios" className="font-semibold">10. Comentarios o detalles adicionales</Label>
                    <Textarea id="comentarios" placeholder="Cualquier otra información relevante" />
                </div>
            </CardContent>
        </Card>
        
        <div className="mt-8 flex justify-end">
            <Button type="submit" size="lg">
                <Send className="mr-2 h-4 w-4"/>
                Enviar Solicitud
            </Button>
        </div>
      </form>
    </div>
  );
}

    
