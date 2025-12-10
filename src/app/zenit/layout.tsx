
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useDynamicModules } from "@/hooks/use-dynamic-modules";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Bell, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AiChatPanel } from "@/components/ai/ai-chat-panel";
import { AiSparklesIcon } from "@/components/icons/ai-sparkles";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedSectorTitle, setSelectedSectorTitle] = useState<string | null>(null);

  const { modules: dynamicModules } = useDynamicModules({
    activeOnly: true,
    userRoles: user?.roles?.map(r => r.name),
  });

  const currentModule = dynamicModules.slice()
    .reverse()
    .find((module) => pathname.startsWith(module.path));
    
  const isSectorMapVisible = pathname === '/dashboard/sectorizacion' && selectedSectorTitle;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (pathname !== '/dashboard/sectorizacion') {
      setSelectedSectorTitle(null);
    }
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-white">Cargando...</p>
      </div>
    );
  }

  const userName = user.name || user.username || 'Usuario';
  const avatarSrc = user.avatar || "https://placehold.co/40x40.png";

  return (
    <SidebarProvider>
      <AppSidebar onLogout={handleLogout} />
      <SidebarInset className="flex h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm md:px-8">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="flex md:flex" />
             {isSectorMapVisible ? (
                <>
                  <Button onClick={() => setSelectedSectorTitle(null)} variant="outline" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Volver a Sectores</span>
                  </Button>
                  <h1 className="font-headline text-lg font-bold text-white">
                     Visor de Mapa: {selectedSectorTitle}
                  </h1>
                </>
             ) : (
                currentModule && (
                  <h1 className="font-headline text-lg font-bold text-white">
                    {currentModule.name}
                  </h1>
                )
             )}
          </div>
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 px-2">
                  <span className="font-bold">IA</span>
                  <AiSparklesIcon className="h-12 w-12" />
                  <span className="sr-only">Abrir Asistente IA</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <AiChatPanel />
              </SheetContent>
            </Sheet>

            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Ver Notificaciones</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={avatarSrc}
                      alt={userName}
                      data-ai-hint="man portrait"
                    />
                    <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.roles?.[0]?.name || 'user'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/perfil">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
           {React.Children.map(children, child =>
              React.isValidElement(child)
                ? React.cloneElement(child as React.ReactElement<any>, { setSelectedSectorTitle })
                : child
            )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
