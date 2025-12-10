import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import "leaflet/dist/leaflet.css";
import { ThemeProvider } from '@/context/theme-context';
import { ReactQueryProvider } from '@/lib/react-query';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'ZENIT - Plataforma GIS Inteligente',
  description: 'Plataforma para poder visualizar Capas Vectoriales y Raster en Fundación Génesis Empresarial.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased', inter.variable, spaceGrotesk.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
        >
          <ReactQueryProvider>
            <AuthProvider>
              <div className="relative flex min-h-screen flex-col">
                <main className="flex-1 flex flex-col">{children}</main>
                <footer className="py-1 px-4 shrink-0">
                  <div className="flex items-center justify-center">
                    <p className="text-balance text-center text-xs leading-loose text-muted-foreground">
                      ©2025 ZENIT MAC Génesis
                    </p>
                  </div>
                </footer>
              </div>
              <Toaster />
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
