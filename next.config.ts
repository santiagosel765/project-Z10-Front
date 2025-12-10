import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ideg.segeplan.gob.gt',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Optimize ArcGIS modules - exclude from server-side rendering
  serverExternalPackages: ['@arcgis/core'],
  experimental: {
    optimizePackageImports: ['leaflet', 'react-leaflet'],
  },
};

export default nextConfig;
