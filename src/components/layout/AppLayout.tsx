import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ConsentBanner } from "@/components/ConsentBanner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { startPolling } from "@/lib/store";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  const location = useLocation();
  useEffect(() => {
    const stop = startPolling();
    return () => {
      stop();
    };
  }, []);
  const breadcrumb = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return "Fleet Console";
    return parts[parts.length - 1].replace(/-/g, ' ').toUpperCase();
  }, [location.pathname]);
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-slate-950 text-slate-200 overflow-hidden relative">
        <AppSidebar />
        <SidebarInset className={cn("relative flex-1 bg-slate-950 flex flex-col min-w-0", className)}>
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-white/5 bg-slate-950/80 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <div className="h-4 w-px bg-white/10" />
            <nav className="flex flex-1 items-center space-x-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span className="hover:text-white cursor-default transition-colors">Control Plane</span>
              <span className="text-slate-800">/</span>
              <span className="text-white flex items-center gap-2">
                {breadcrumb}
                <Badge variant="outline" className="h-4 px-1.5 text-[8px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                  v2.6 Enterprise
                </Badge>
              </span>
            </nav>
            <div className="flex items-center gap-4">
              <ThemeToggle className="relative top-0 right-0 h-8 w-8 text-slate-400 hover:text-white transition-colors" />
            </div>
          </header>
          <main className={cn(
            "relative flex-1 overflow-y-auto scrollbar-gutter-stable",
            container && "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12",
            contentClassName
          )}>
            {children}
          </main>
        </SidebarInset>
        <ConsentBanner />
      </div>
    </SidebarProvider>
  );
}