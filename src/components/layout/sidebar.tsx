
"use client";

import { useAuth } from "@/hooks/use-auth";
import { type Module } from "@/lib/constants";
import { useDynamicModules } from "@/hooks/use-dynamic-modules";
import { LogOut, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useState } from "react";

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);

  const { modules: dynamicModules, isLoading } = useDynamicModules({
    activeOnly: true,
    userRoles: user?.roles?.map(r => r.name),
  });


  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isSubmoduleActive = (module: Module) => {
    return module.submodules?.some(sub => pathname.startsWith(sub.path)) ?? false;
  }

  const availableModules = dynamicModules.filter(
    (module) => user && user.roles?.some(r => module.allowedRoles.includes(r.name as any))
  );

  return (
    <aside className="hidden w-64 flex-col border-r bg-background/50 backdrop-blur-sm md:flex dark:bg-background/80">
      <div className="flex items-center justify-center">
        <Image
          src="/imagenes/logo-greenbg.png"
          alt="ZENIT Logo"
          width={256}
          height={100}
          className="w-full h-auto object-cover"
          priority
        />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : availableModules.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            No hay módulos disponibles
          </div>
        ) : (
          <>
            {availableModules.map((module) => (
          module.submodules ? (
            <Collapsible key={module.name} open={openCollapsible === module.name || isSubmoduleActive(module)} onOpenChange={() => setOpenCollapsible(openCollapsible === module.name ? null : module.name)}>
              <CollapsibleTrigger asChild>
                <Button
                  variant={"ghost"}
                  className={cn(
                    "w-full justify-between hover:bg-sidebar-accent-hover hover:text-sidebar-accent-hover-foreground",
                    (pathname.startsWith(module.path) || isSubmoduleActive(module)) && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <div className="flex items-center">
                    <module.icon className="mr-2 h-4 w-4" />
                    {module.name}
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="py-1 pl-6">
                <div className="space-y-1">
                {module.submodules.map((submodule) => (
                   <Link href={submodule.path} key={submodule.name}>
                    <Button
                      variant={"ghost"}
                      className={cn(
                        "w-full justify-start hover:bg-sidebar-accent-hover hover:text-sidebar-accent-hover-foreground",
                        pathname.startsWith(submodule.path) && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                    >
                      <submodule.icon className="mr-2 h-4 w-4" />
                      {submodule.name}
                    </Button>
                  </Link>
                ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <Link href={module.path} key={module.name}>
              <Button
                variant={"ghost"}
                className={cn(
                  "w-full justify-start hover:bg-sidebar-accent-hover hover:text-sidebar-accent-hover-foreground",
                  pathname.startsWith(module.path) && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <module.icon className="mr-2 h-4 w-4" />
                {module.name}
              </Button>
            </Link>
          )
            ))}
          </>
        )}
      </nav>
      <div className="mt-auto p-4 pt-0">
        <Button variant="ghost" className="w-full justify-start hover:bg-sidebar-accent-hover hover:text-sidebar-accent-hover-foreground" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}
