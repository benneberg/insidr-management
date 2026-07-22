import React, { useMemo } from "react";
import { Server, Bell, Settings, Terminal, Zap, Search, PlayCircle, Code2, Globe, HelpCircle, Activity } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  // ZUSTAND ZERO-TOLERANCE COMPLIANCE
  const devicesCount = useTelemetryStore(s => s.devices.length);
  const onlineCount = useTelemetryStore(s => s.devices.filter(d => d.status === 'online').length);
  const alertsCount = useTelemetryStore(s => s.alerts.filter(a => !a.resolved).length);
  const criticalAlerts = useTelemetryStore(s => s.alerts.filter(a => !a.resolved && a.severity === 'critical').length);
  const lastUpdated = useTelemetryStore(s => s.lastUpdated);
  const pollingError = useTelemetryStore(s => s.pollingError);
  const healthPercent = useMemo(() => 
    devicesCount > 0 ? Math.round((onlineCount / devicesCount) * 100) : 0
  , [onlineCount, devicesCount]);
  const syncStatus = useMemo(() => {
    if (pollingError) return 'error';
    if (!lastUpdated) return 'idle';
    const diff = (Date.now() - new Date(lastUpdated).getTime()) / 1000;
    if (diff > 30) return 'stale';
    return 'healthy';
  }, [lastUpdated, pollingError]);
  const menuItems = [
    { title: "Fleet Overview", icon: Server, path: "/" },
    { title: "Public Discover", icon: Globe, path: "/discover" },
    { title: "SDK Distribution", icon: Code2, path: "/sdk" },
    { title: "Active Alerts", icon: Bell, path: "/alerts", badge: alertsCount > 0 ? alertsCount : null },
    { title: "Interactive Demo", icon: PlayCircle, path: "/simulator" },
    { title: "System Logs", icon: Terminal, path: "/logs" },
    { title: "Settings", icon: Settings, path: "/settings" },
    { title: "User Manual", icon: HelpCircle, path: "/manual" },
  ];
  return (
    <Sidebar className="border-r border-white/5 bg-slate-950 text-slate-200">
      <SidebarHeader className="border-b border-white/5 p-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-3 cursor-help">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-500/20">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white uppercase">INSIDR</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Control Plane</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-slate-900 border-white/10 text-[10px] font-mono py-2">
            v2.6.1-enterprise Protocol
          </TooltipContent>
        </Tooltip>
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
                <SidebarMenuButton asChild isActive={location.pathname === item.path || (item.path === '/' && location.pathname.startsWith('/device/'))}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 transition-colors relative",
                      (location.pathname === item.path || (item.path === '/' && location.pathname.startsWith('/device/')))
                        ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.badge && (
                      <span className={cn(
                        "absolute right-3 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full text-[9px] font-bold text-white",
                        criticalAlerts > 0 ? "bg-rose-600 animate-pulse shadow-rose-600/50" : "bg-blue-600 shadow-blue-600/50"
                      )}>
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
              Fleet Pulse <Activity className="h-3 w-3" />
            </p>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 uppercase">Health</span>
              <span className={cn(
                "text-[10px] font-mono font-bold",
                healthPercent > 80 ? "text-emerald-500" : healthPercent > 50 ? "text-blue-400" : "text-rose-500"
              )}>{healthPercent}%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-1000",
                  healthPercent > 80 ? "bg-emerald-500" : "bg-rose-500"
                )}
                style={{ width: `${healthPercent}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-1.5 w-1.5 rounded-full animate-pulse",
              syncStatus === 'healthy' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" :
              syncStatus === 'stale' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
            )} />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">
              {syncStatus === 'error' ? 'Sync Failure' : syncStatus === 'stale' ? 'Sync Stale' : 'Active Stream'}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}