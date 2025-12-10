"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useDynamicModules } from "@/hooks/use-dynamic-modules";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { MODULES } from "@/lib/constants";
import type { Module } from "@/types";
import { LogOut, ChevronDown } from "lucide-react";
import Image from "next/image";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

interface AppSidebarProps {
  onLogout: () => void;
}

export function AppSidebar({ onLogout }: AppSidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  const { modules: dynamicModules, isLoading: isLoadingModules } = useDynamicModules({
    activeOnly: true,
    userRoles: user?.roles?.map(r => r.name),
  });

  const adminModule = MODULES.find(m => m.path === "/zenit/admin");
  
  const filteredAdminModule = adminModule && user?.roles?.some(r => 
    adminModule.allowedRoles.includes(r.name as any)
  ) ? { ...adminModule, order: 9999 } : null;
  
  const availableModules: Module[] = [
    ...dynamicModules.filter(m => m.path !== "/zenit/admin"),
    ...(filteredAdminModule ? [filteredAdminModule] : []),
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <Image
          src="/images/zenit-logo.png"
          alt="ZENIT Logo"
          width={256}
          height={100}
          className="w-11/12 mx-auto h-auto object-cover data-[collapsed=true]:hidden"
          priority
        />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          {isLoadingModules ? (
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                <span className="truncate">Cargando módulos...</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : availableModules.length === 0 ? (
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                <span className="truncate text-xs text-muted-foreground">No hay módulos disponibles</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            availableModules.map((module) =>
              module.submodules ? (
                <Collapsible key={module.name}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={pathname.startsWith(module.path)}
                        tooltip={module.name}
                        className="justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <module.icon className="shrink-0" />
                          <span>{module.name}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {module.submodules.map((submodule) => (
                        <SidebarMenuSubItem key={submodule.name}>
                          <Link href={submodule.path}>
                            <SidebarMenuSubButton
                              isActive={pathname.startsWith(submodule.path)}
                            >
                                <submodule.icon className="shrink-0" />
                                <span>{submodule.name}</span>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={module.name}>
                    <Link href={module.path}>
                        <SidebarMenuButton
                            isActive={pathname.startsWith(module.path)}
                            tooltip={module.name}
                        >
                            <module.icon className="shrink-0" />
                            <span>{module.name}</span>
                        </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              )
            )
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout} tooltip="Cerrar Sesión">
              <LogOut />
              <span className="truncate">Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
