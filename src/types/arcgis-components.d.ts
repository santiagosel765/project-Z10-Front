// Global type declarations for ArcGIS Map Components Web Components
import { DOMAttributes } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'arcgis-map': DOMAttributes<HTMLElement> & {
        basemap?: string;
        center?: string;
        zoom?: string | number;
        'item-id'?: string;
        'web-map'?: string;
        'onarcgisViewReadyChange'?: (event: any) => void;
        style?: React.CSSProperties;
        class?: string;
        children?: React.ReactNode;
      };
      'arcgis-zoom': DOMAttributes<HTMLElement> & {
        position?: string;
        slot?: string;
        style?: React.CSSProperties;
        class?: string;
      };
      'arcgis-search': DOMAttributes<HTMLElement> & {
        position?: string;
        slot?: string;
        style?: React.CSSProperties;
        class?: string;
      };
      'arcgis-legend': DOMAttributes<HTMLElement> & {
        position?: string;
        slot?: string;
        style?: React.CSSProperties;
        class?: string;
      };
      'arcgis-layer-list': DOMAttributes<HTMLElement> & {
        position?: string;
        slot?: string;
        style?: React.CSSProperties;
        class?: string;
      };
    }
  }
}

export {};