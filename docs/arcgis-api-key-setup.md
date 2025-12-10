# 🔐 Guía Completa: Configuración de ArcGIS API Key en ZENIT

## 📋 Tabla de Contenidos
1. [¿Qué es una ArcGIS API Key?](#qué-es-una-arcgis-api-key)
2. [¿Por qué es necesaria?](#por-qué-es-necesaria)
3. [Cómo obtener una API Key](#cómo-obtener-una-api-key)
4. [Métodos de configuración](#métodos-de-configuración)
5. [Resolución de problemas](#resolución-de-problemas)
6. [Seguridad y mejores prácticas](#seguridad-y-mejores-prácticas)

## 🎯 ¿Qué es una ArcGIS API Key?

Una **ArcGIS API Key** es un token de autenticación que permite a tu aplicación acceder a los servicios y recursos de ArcGIS Online. Es como una "llave" digital que identifica y autoriza tu aplicación.

### Formato típico:
```
AAPK1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7
```

## 🚀 ¿Por qué es necesaria?

### ✅ **Con API Key configurada:**
- ✅ Acceso a basemaps premium (satélite, topográfico, etc.)
- ✅ Servicios de geocodificación ilimitados
- ✅ Análisis espaciales avanzados
- ✅ Servicios de routing y direcciones
- ✅ Datos demográficos y de negocio
- ✅ Mayor límite de requests por día

### ❌ **Sin API Key:**
- ❌ Solo basemaps básicos públicos
- ❌ Geocodificación limitada (2,000 requests/mes)
- ❌ Funcionalidades reducidas
- ❌ Algunas capas pueden no cargar

## 🔑 Cómo obtener una API Key

### Paso 1: Crear cuenta en ArcGIS Developer
1. Ve a [**developers.arcgis.com**](https://developers.arcgis.com/)
2. Haz clic en **"Sign Up"** o **"Sign In"**
3. Crea una cuenta gratuita con tu email

### Paso 2: Acceder al Dashboard
1. Una vez autenticado, ve a **"Dashboard"**
2. En el menú lateral, selecciona **"API Keys"**

### Paso 3: Crear nueva API Key
1. Haz clic en **"+ New API Key"**
2. Asigna un nombre descriptivo: `ZENIT-GeoAI-Production`
3. **Configura los scopes necesarios:**
   ```
   ✅ Basemaps
   ✅ Geocoding
   ✅ Routing
   ✅ Demographics
   ✅ Spatial Analysis
   ✅ Places
   ```
4. **Configurar Referrers (importante para seguridad):**
   ```
   localhost:*
   *.tu-dominio.com
   zenit-frontend.vercel.app
   ```
5. Haz clic en **"Create API Key"**

### Paso 4: Copiar la API Key
1. **¡IMPORTANTE!** Copia la API Key inmediatamente
2. Guárdala en un lugar seguro
3. Una vez que salgas de la página, no podrás ver la key completa

## ⚙️ Métodos de configuración

### 🥇 **Método 1: Variable de entorno (.env.local) [RECOMENDADO]**

Crea o edita el archivo `.env.local` en la raíz del proyecto:

```bash
# .env.local
NEXT_PUBLIC_ARCGIS_API_KEY=AAPK1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7
```

**Ventajas:**
- ✅ Seguro y privado
- ✅ No se sube a repositorio
- ✅ Fácil de cambiar
- ✅ Funciona en todos los entornos

### 🥈 **Método 2: Configuración desde la UI**

1. En ZENIT, ve a **GAIA → Demo**
2. Si no hay API Key, verás un botón **"🔧 Configurar"**
3. Haz clic e ingresa tu API Key
4. Se guardará automáticamente en localStorage

**Ventajas:**
- ✅ No requiere acceso a archivos
- ✅ Interfaz amigable
- ✅ Validación automática

### 🥉 **Método 3: localStorage manual**

En la consola del navegador:
```javascript
localStorage.setItem('zenit_arcgis_api_key', 'TU_API_KEY_AQUI');
window.location.reload();
```

## 🔧 Resolución de problemas

### ❌ "API Key requerida"
**Causa:** No se encontró ninguna API Key configurada
**Solución:**
1. Verifica que `.env.local` existe y tiene la variable
2. Reinicia el servidor de desarrollo (`npm run dev`)
3. Usa la configuración desde UI como alternativa

### ❌ "API Key inválida" 
**Causa:** La API Key no es válida o está mal configurada
**Soluciones:**
1. **Verifica el formato:** Debe empezar con `AAPK`
2. **Revisa los scopes:** Asegúrate de tener permisos para basemaps
3. **Checa los referrers:** Agrega `localhost:*` en la configuración
4. **Verifica que esté activa:** En el dashboard de ArcGIS

### ❌ "Error al cargar basemaps"
**Causa:** Problemas de permisos o configuración
**Soluciones:**
1. Verifica que la API Key tenga scope de "Basemaps"
2. Revisa la consola del navegador para errores específicos
3. Prueba con una API Key diferente

### ❌ "Request failed" o errores CORS
**Causa:** Problemas de configuración de referrers
**Solución:**
1. En el dashboard de ArcGIS, edita tu API Key
2. En "Referrers", agrega:
   ```
   localhost:*
   *.localhost:*
   http://localhost:*
   https://localhost:*
   ```

## 🛡️ Seguridad y mejores prácticas

### ✅ **Hacer:**
- ✅ Usar variables de entorno para producción
- ✅ Configurar referrers específicos
- ✅ Limitar scopes solo a lo necesario
- ✅ Rotar API Keys regularmente
- ✅ Monitorear uso en el dashboard
- ✅ Usar diferentes keys para dev/staging/prod

### ❌ **No hacer:**
- ❌ Hardcodear API Keys en el código
- ❌ Subir `.env.local` al repositorio
- ❌ Compartir API Keys públicamente
- ❌ Usar la misma key para múltiples proyectos
- ❌ Dar permisos innecesarios

## 📊 Monitoreo y límites

### Dashboard de uso:
1. Ve a [developers.arcgis.com](https://developers.arcgis.com/)
2. Dashboard → API Keys → [Tu Key] → "Usage"

### Límites típicos (cuenta gratuita):
- **Basemaps:** 1,000,000 tiles/mes
- **Geocoding:** 20,000 requests/mes  
- **Routing:** 5,000 requests/mes
- **Places:** 1,000 requests/mes

## 🆘 Soporte adicional

### Recursos oficiales:
- [ArcGIS Developers Documentation](https://developers.arcgis.com/documentation/)
- [API Reference](https://developers.arcgis.com/javascript/latest/api-reference/)
- [Community Forum](https://community.esri.com/t5/arcgis-api-for-javascript/ct-p/arcgis-api-for-javascript)

### En ZENIT:
- El componente detecta automáticamente el estado de la API Key
- Indicador visual muestra: ✅ Configurada | ⚠️ Requerida | ❌ Inválida
- Botón de configuración aparece automáticamente cuando es necesario

---

> **💡 Tip:** Siempre mantén una copia de respaldo de tus API Keys en un gestor de contraseñas seguro.