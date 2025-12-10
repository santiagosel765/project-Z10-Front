import esriConfig from "@arcgis/core/config.js";

export type APIKeyStatus = 'loading' | 'configured' | 'missing' | 'invalid';

/**
 * Configura la API Key de ArcGIS de manera centralizada
 * @param apiKey - El token de ArcGIS
 * @returns Promise<boolean> - true si se configuró correctamente
 */
export async function configureArcGISAPIKey(apiKey: string): Promise<boolean> {
  try {
    if (!apiKey || apiKey.length < 20) {
      console.error("❌ API Key de ArcGIS inválida: formato incorrecto");
      return false;
    }

    // Configurar la API Key
    esriConfig.apiKey = apiKey;

    if (esriConfig.request?.interceptors) {
      esriConfig.request.interceptors.push({
        urls: ["https://services.arcgisonline.com", "https://services.arcgis.com"],
        before: function(params) {
          // ? Headers de autorización
          params.requestOptions.headers = {
            ...params.requestOptions.headers,
            "X-Esri-Authorization": `Bearer ${apiKey}`,
            "User-Agent": "ZENIT-GeoAI/1.0"
          };
        }
      });
    }

    // Configurar timeout para requests
    esriConfig.request.timeout = 30000; // 30 segundos

    console.log("✅ ArcGIS API Key configurada correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error al configurar ArcGIS API Key:", error);
    return false;
  }
}

/**
 * Obtiene la API Key desde diferentes fuentes
 * @returns string | null - La API Key o null si no se encuentra
 */
export function getArcGISAPIKey(): string | null {
  
  const envKey = process.env.NEXT_PUBLIC_ARCGIS_API_KEY;
  if (envKey) {
    return envKey;
  }

  
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('zenit_arcgis_api_key');
    if (localKey) {
      return localKey;
    }
  }

  // Prioridad 3: sessionStorage (para sesión actual)
  if (typeof window !== 'undefined') {
    const sessionKey = sessionStorage.getItem('arcgis_session_key');
    if (sessionKey) {
      return sessionKey;
    }
  }

  return null;
}

/**
 * Valida si una API Key tiene el formato correcto
 * @param apiKey - La API Key a validar
 * @returns boolean - true si es válida
 */
export function validateAPIKeyFormat(apiKey: string): boolean {
  const arcgisKeyPattern = /^AAPK[a-zA-Z0-9_-]{50,}$/;
  return arcgisKeyPattern.test(apiKey);
}

/**
 * Guarda la API Key en localStorage para uso posterior
 * @param apiKey - La API Key a guardar
 */
export function saveAPIKeyToLocal(apiKey: string): void {
  if (typeof window !== 'undefined' && validateAPIKeyFormat(apiKey)) {
    localStorage.setItem('zenit_arcgis_api_key', apiKey);
    console.log("💾 API Key guardada en localStorage");
  }
}

export function clearSavedAPIKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('zenit_arcgis_api_key');
    sessionStorage.removeItem('arcgis_session_key');
    console.log("🗑️ API Key eliminada del storage");
  }
}


export async function testAPIKeyValidity(): Promise<boolean> {
  try {
    // Hacer una request simple para verificar la validez
    const testUrl = "https://services.arcgisonline.com/arcgis/rest/info?f=json";
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${esriConfig.apiKey}`
      }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error("❌ Error al validar API Key:", error);
    return false;
  }
}

/**
 * Obtiene información de uso de la API Key
 * @returns Promise<object> - Información de uso si está disponible
 */
export async function getAPIKeyUsage(): Promise<any> {
  try {
    // Nota: Esto requiere endpoints específicos de ArcGIS para obtener estadísticas
    // Por ahora devolvemos un objeto básico
    return {
      status: 'active',
      requestsUsed: 0,
      requestsRemaining: 'unlimited'
    };
  } catch (error) {
    console.error("❌ Error al obtener uso de API Key:", error);
    return null;
  }
}