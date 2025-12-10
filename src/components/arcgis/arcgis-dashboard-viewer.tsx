'use client';
import { useEffect, useState } from 'react';
import Portal from "@arcgis/core/portal/Portal";
import PortalItem from "@arcgis/core/portal/PortalItem";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import esriId from "@arcgis/core/identity/IdentityManager";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';

interface DashboardViewerProps {
  itemId: string;
  portalUrl?: string;
  theme?: 'light' | 'dark';
  embed?: boolean;
  requireAuth?: boolean; // Si true, usa OAuth; si false, asume que es público
}

export const DashboardViewer = ({ 
  itemId, 
  portalUrl = "https://www.arcgis.com",
  theme = 'light',
  embed = true,
  requireAuth = false
}: DashboardViewerProps) => {
  const [dashboardUrl, setDashboardUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  useEffect(() => {
    const setupAuth = () => {
      if (requireAuth && !isAuthenticated) {
        console.log(process.env.NEXT_PUBLIC_ARCGIS_APP_ID)
        const info = new OAuthInfo({
          appId: process.env.NEXT_PUBLIC_ARCGIS_APP_ID, // Usa tu Client ID aquí
          portalUrl: portalUrl,
          popup: false, // Redireccionamiento completo de página
        });

        esriId.registerOAuthInfos([info]);
      }
    };

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setupAuth();
        
        if (requireAuth && !isAuthenticated) {
          try {
            const credential = await esriId.checkSignInStatus(`${portalUrl}/sharing`);
            setIsAuthenticated(true);
          } catch (err) {
            // No está autenticado, mostrar botón de login
            setNeedsAuth(true);
            setLoading(false);
            return;
          }
        }

        const portal = new Portal({ 
          url: portalUrl,
        });

        
        const portalItem = new PortalItem({
          id: itemId,
          apiKey: process.env.NEXT_PUBLIC_ARCGIS_API_KEY,
          portal: portal,
        });

        try {
          await portalItem.load();
        } catch (err: any) {
          if (err.message?.includes('403') || err.message?.includes('Forbidden')) {
            setNeedsAuth(true);
            setError('Este dashboard requiere autenticación. Por favor, inicia sesión.');
            setLoading(false);
            return;
          }
          throw err;
        }

        // Construir URL del dashboard
        const params = new URLSearchParams();
        if (embed) params.append('embed', 'true');
        if (theme) params.append('theme', theme);
        
        const url = `${portalUrl}/apps/dashboards/${itemId}${params.toString() ? '?' + params.toString() : ''}`;
        setDashboardUrl(url);
        setError(null);
        setNeedsAuth(false);
        
      } catch (err) {
        console.error('Error al cargar dashboard:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar el dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      loadDashboard();
    }
  }, [itemId, portalUrl, theme, embed, requireAuth, isAuthenticated]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Forzar el inicio de sesión
      const credential = await esriId.getCredential(`${portalUrl}/sharing`);
      setIsAuthenticated(true);
      setNeedsAuth(false);
      
    } catch (err) {
      console.error('Error al autenticar:', err);
      setError('No se pudo completar la autenticación. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };

  const openInNewTab = () => {
    window.open(`${portalUrl}/apps/dashboards/${itemId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (needsAuth) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Autenticación Requerida</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error || 'Este dashboard requiere que inicies sesión con tu cuenta de ArcGIS Online.'}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleSignIn} className="gap-2">
              Iniciar Sesión con ArcGIS
            </Button>
            <Button onClick={openInNewTab} variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Abrir en Navegador
            </Button>
          </div>
          <Alert className="text-left">
            <AlertDescription className="text-xs">
              <strong>Nota:</strong> Si el dashboard es de tu organización, necesitarás configurar OAuth2. 
              Contacta al administrador para obtener el Client ID de la aplicación.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (error && !needsAuth) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <p className="text-red-600 font-medium">Error al cargar dashboard</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <Button onClick={openInNewTab} variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Abrir en Navegador
          </Button>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={dashboardUrl}
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen
      title="ArcGIS Dashboard"
      className="rounded-lg"
    />
  );
};