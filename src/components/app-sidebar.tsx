import React from "react";
import { LayoutDashboard, Server, Bell, Settings, Terminal, Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "Fleet Management", icon: Server, path: "/" },
    { title: "Active Alerts", icon: Bell, path: "#" },
    { title: "Command Center", icon: Zap, path: "#" },
    { title: "System Logs", icon: Terminal, path: "#" },
    { title: "Settings", icon: Settings, path: "#" },
  ];
  return (
    <Sidebar className="border-r border-white/5 bg-slate-950 text-slate-200">
      <SidebarHeader className="border-b border-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-500/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white">INSIDR</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Telemetry Control</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                  <Link to={item.path} className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                    location.pathname === item.path ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}>
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/5 p-4">
        <div className="rounded-lg bg-white/5 p-3">
          <p className="text-[10px] font-semibold uppercase text-slate-500">System Status</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-300">All Systems Operational</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}