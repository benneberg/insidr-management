import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { cn } from "@/lib/utils";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-slate-950 text-slate-200">
        <AppSidebar />
        <SidebarInset className={cn("relative flex-1 bg-slate-950", className)}>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-white/5 bg-slate-950/80 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <div className="h-4 w-px bg-white/10" />
            <nav className="flex items-center space-x-4 text-xs font-medium text-slate-500">
              <span className="hover:text-white cursor-default">Fleet Console</span>
              <span>/</span>
              <span className="text-white">Active Session</span>
            </nav>
          </header>
          <main className={cn(
            "relative min-h-[calc(100vh-3.5rem)]",
            container && "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12",
            contentClassName
          )}>
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}