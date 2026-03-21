import React from "react";
import { Server, Bell, Settings, Terminal, Zap, Search, PlayCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTelemetryStore } from "@/lib/store";
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
  // ZUSTAND ZERO-TOLERANCE COMPLIANCE
  const devices = useTelemetryStore(s => s.devices);
  const alerts = useTelemetryStore(s => s.alerts);
  const onlineCount = (devices ?? []).filter(d => d.status === 'online').length;
  const totalCount = (devices ?? []).length;
  const healthPercent = totalCount > 0 ? Math.round((onlineCount / totalCount) * 100) : 0;
  const alertsCount = (alerts ?? []).length;
  const menuItems = [
    { title: "Fleet Overview", icon: Server, path: "/" },
    { title: "Active Alerts", icon: Bell, path: "/alerts", badge: alertsCount > 0 ? alertsCount : null },
    { title: "Agent Simulator", icon: PlayCircle, path: "/simulator" },
    { title: "System Logs", icon: Terminal, path: "/logs" },
    { title: "Settings", icon: Settings, path: "/settings" },
  ];
  return (
    <Sidebar className="border-r border-white/5 bg-slate-950 text-slate-200">
      <SidebarHeader className="border-b border-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-500/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white uppercase">INSIDR</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Control Plane</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-3 mb-4">
            <button className="flex items-center gap-3 w-full rounded-md bg-white/5 px-3 py-2 text-slate-500 border border-white/5 hover:bg-white/10 transition-colors text-left group">
              <Search className="h-4 w-4 group-hover:text-white transition-colors" />
              <span className="text-xs font-medium">Search fleet...</span>
              <span className="ml-auto text-[10px] font-mono text-slate-600">⌘K</span>
            </button>
          </div>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                  <Link 
                    to={item.path} 
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 transition-colors relative",
                      location.pathname === item.path 
                        ? "bg-white/10 text-white" 
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.badge && (
                      <span className="absolute right-3 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(225,29,72,0.4)]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/5 p-4">
        <div className="rounded-lg bg-white/5 p-3 space-y-3 border border-white/5">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500 mb-2 flex justify-between">
              Fleet Pulse <span className="text-slate-600 font-mono tracking-tighter">ESTB. 2025</span>
            </p>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400">Connectivity</span>
              <span className={cn(
                "text-[10px] font-mono font-bold",
                healthPercent > 80 ? "text-emerald-500" : healthPercent > 50 ? "text-blue-400" : "text-rose-500"
              )}>{healthPercent}%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-1000 bg-gradient-to-r",
                  healthPercent > 80 ? "from-blue-500 to-emerald-500" : "from-rose-500 to-blue-500"
                )}
                style={{ width: `${healthPercent}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">Active Stream</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}