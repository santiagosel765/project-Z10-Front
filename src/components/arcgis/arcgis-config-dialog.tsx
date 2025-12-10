
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  configureArcGISAPIKey, 
  saveAPIKeyToLocal, 
  validateAPIKeyFormat,
  clearSavedAPIKey 
} from "@/lib/arcgis-config";

interface ArcGISConfigDialogProps {
  onConfigured?: () => void;
  triggerText?: string;
}

export default function ArcGISConfigDialog({ 
  onConfigured, 
  triggerText = "Configurar ArcGIS" 
}: ArcGISConfigDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleValidateKey = async () => {
    if (!apiKey.trim()) {
      setIsValid(null);
      return;
    }

    setIsLoading(true);
    
    try {
      const formatValid = validateAPIKeyFormat(apiKey);
      if (!formatValid) {
        setIsValid(false);
        setIsLoading(false);
        return;
      }

      // Configurar y probar
      const success = await configureArcGISAPIKey(apiKey);
      setIsValid(success);
      
      if (success) {
        saveAPIKeyToLocal(apiKey);
        
        setTimeout(() => {
          setIsDialogOpen(false);
          onConfigured?.();
        }, 1000);
      }
    } catch (error) {
      console.error("Error al validar API Key:", error);
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearKey = () => {
    clearSavedAPIKey();
    setApiKey("");
    setIsValid(null);
    // Recargar la página para aplicar cambios
    window.location.reload();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>🔐 Configurar ArcGIS API Key</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Ingresa tu API Key de ArcGIS para acceder a servicios premium y funcionalidades avanzadas.
            </p>
            
            <Alert>
              <AlertDescription>
                <strong>¿Cómo obtener una API Key?</strong><br/>
                1. Ve a <a href="https://developers.arcgis.com/" target="_blank" className="text-blue-600 underline">developers.arcgis.com</a><br/>
                2. Inicia sesión o crea una cuenta<br/>
                3. Ve a Dashboard → API Keys<br/>
                4. Crea una nueva API Key o copia una existente
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-3">
            <Input
              type="password"
              placeholder="AAPK..."
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsValid(null);
              }}
              className="font-mono text-xs"
            />
            
            {isValid === true && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  ✅ API Key válida y configurada correctamente
                </AlertDescription>
              </Alert>
            )}
            
            {isValid === false && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  ❌ API Key inválida. Verifica el formato y permisos.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={handleValidateKey}
                disabled={!apiKey.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? "Validando..." : "Configurar"}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleClearKey}
                size="sm"
              >
                Limpiar
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Formatos soportados:</strong></p>
            <p>• Variable de entorno: <code>NEXT_PUBLIC_ARCGIS_API_KEY</code></p>
            <p>• LocalStorage: guardado automáticamente</p>
            <p>• Configuración manual: este formulario</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}