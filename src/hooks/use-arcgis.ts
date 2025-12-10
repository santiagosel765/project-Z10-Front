import { useEffect, useState } from 'react';

interface ArcGISConfig {
  apiKey: string | undefined;
  portalUrl: string;
  debug: boolean;
}

interface UseArcGISReturn {
  config: ArcGISConfig;
  isReady: boolean;
  error: string | null;
}

export const useArcGIS = (): UseArcGISReturn => {
  const [config, setConfig] = useState<ArcGISConfig>({
    apiKey: process.env.NEXT_PUBLIC_ARCGIS_API_KEY,
    portalUrl: 'https://www.arcgis.com',
    debug: false
  });
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Load configuration from environment variables
      const apiKey = process.env.NEXT_PUBLIC_ARCGIS_API_KEY;
      const portalUrl = process.env.NEXT_PUBLIC_ARCGIS_PORTAL_URL || 'https://www.arcgis.com';
      const debug = process.env.NEXT_PUBLIC_ARCGIS_DEBUG === 'true';

      if (!apiKey) {
        console.warn('ArcGIS API Key not found. Some features may not work properly.');
      }

      setConfig({
        apiKey,
        portalUrl,
        debug
      });

      setIsReady(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading ArcGIS configuration');
      setIsReady(false);
    }
  }, []);

  return {
    config,
    isReady,
    error
  };
};

export default useArcGIS;