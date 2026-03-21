import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTelemetryStore } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Terminal, Monitor, Activity, Network, Zap, ChevronLeft,
  RefreshCw, Loader2, ShieldCheck, History, Camera, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeviceMetricsPanel } from '@/components/DeviceMetricsPanel';
import { DeviceViewport } from '@/components/DeviceViewport';
import { toast } from 'sonner';
export function DeviceInspectorPage() {
  const { id } = useParams();
  const devices = useTelemetryStore(s => s.devices);
  const logs = useTelemetryStore(s => s.currentLogs);
  const metrics = useTelemetryStore(s => s.currentMetrics);
  const snapshots = useTelemetryStore(s => s.currentSnapshots);
  const commandHistory = useTelemetryStore(s => s.commandHistory);
  const fetchStats = useTelemetryStore(s => s.fetchDeviceStats);
  const isStatsLoading = useTelemetryStore(s => s.isStatsLoading);
  const resetStats = useTelemetryStore(s => s.resetCurrentStats);
  const device = devices.find(d => d.id === id);
  const [snapshotIdx, setSnapshotIdx] = useState(0);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (id) {
      resetStats();
      fetchStats(id);
      const interval = setInterval(() => fetchStats(id), 5000);
      return () => clearInterval(interval);
    }
  }, [id, fetchStats, resetStats]);
  useEffect(() => {
    // Smooth scroll console to bottom on new logs
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);
  const handleCommand = async (action: string) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/devices/${id}/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) toast.success(`Command '${action}' dispatched`);
    } catch (e) {
      toast.error("Dispatch failed");
    }
  };
  if (!device) return <div className="p-12 text-center text-slate-500 font-mono">NODE_RESOLVE_FAILURE</div>;
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-black overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-950/40">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
            <Link to="/"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white uppercase tracking-tight">{device.name}</h1>
              <Badge className="bg-blue-600/10 text-blue-400 border-blue-500/20 text-[9px] h-4">v2.0 RTP</Badge>
              {!isStatsLoading && (
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-500 uppercase">{device.id} • {device.os} • {device.ip}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-600 uppercase font-bold">Protocol Health</span>
            <span className={cn("text-[10px] font-mono", device.status === 'online' ? "text-emerald-500" : "text-rose-500")}>
              {device.status.toUpperCase()}
            </span>
          </div>
          {isStatsLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
        </div>
      </header>
      <Tabs defaultValue="console" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-slate-950/80 border-b border-white/5 h-9 rounded-none px-4 gap-2">
          <TabsTrigger value="console" className="text-[10px] uppercase font-bold"><Terminal className="h-3 w-3 mr-2" /> Console</TabsTrigger>
          <TabsTrigger value="viewport" className="text-[10px] uppercase font-bold"><Monitor className="h-3 w-3 mr-2" /> Viewport</TabsTrigger>
          <TabsTrigger value="metrics" className="text-[10px] uppercase font-bold"><Activity className="h-3 w-3 mr-2" /> Performance</TabsTrigger>
          <TabsTrigger value="control" className="text-[10px] uppercase font-bold"><Zap className="h-3 w-3 mr-2" /> Control</TabsTrigger>
        </TabsList>
        <TabsContent value="console" className="flex-1 overflow-y-auto p-4 bg-black font-mono text-[11px] scrollbar-thin">
          {logs.map(log => (
            <div key={log.id} className="flex gap-4 group hover:bg-white/5 py-0.5 border-b border-white/[0.02]">
              <span className="text-slate-600 shrink-0 w-20">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
              <span className={cn("font-bold uppercase w-12", log.level === 'error' ? 'text-rose-500' : 'text-blue-400')}>{log.level}</span>
              <span className="text-slate-300 break-all">{log.message}</span>
            </div>
          ))}
          <div ref={consoleEndRef} />
        </TabsContent>
        <TabsContent value="viewport" className="flex-1 p-6 bg-slate-950 m-0 space-y-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Monitor className="h-3 w-3" /> Live Render Engine</h3>
              <DeviceViewport deviceId={device.id} />
            </section>
            <section className="space-y-4 pt-8 border-t border-white/5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Camera className="h-3 w-3" /> Historical Snapshot Buffer</h3>
                <div className="flex gap-1">
                  {snapshots.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSnapshotIdx(i)}
                      className={cn("h-1.5 w-6 rounded-full transition-colors", snapshotIdx === i ? "bg-blue-500" : "bg-slate-800")}
                    />
                  ))}
                </div>
              </div>
              <div className="aspect-video bg-black rounded-xl border border-white/10 overflow-hidden relative shadow-2xl">
                {snapshots.length > 0 ? (
                  <img src={snapshots[snapshotIdx]} className="w-full h-full object-contain" alt="Device Snapshot" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 font-mono text-xs">
                    <RefreshCw className="h-8 w-8 mb-2 animate-pulse" />
                    WAITING_FOR_SENSORY_INPUT
                  </div>
                )}
              </div>
            </section>
          </div>
        </TabsContent>
        <TabsContent value="metrics" className="flex-1 p-6 overflow-y-auto bg-slate-950 m-0">
          {metrics.length > 0 ? (
            <DeviceMetricsPanel metrics={metrics} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-4">
              <Activity className="h-12 w-12 opacity-10" />
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest mb-1">No Performance Metrics</p>
                <p className="text-[10px] font-mono max-w-xs mx-auto">Heartbeat signals have not yet included performance metadata for this node.</p>
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="control" className="flex-1 p-6 bg-slate-950 m-0 grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Sandboxed Operations</h3>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] uppercase"><ShieldCheck className="h-3 w-3 mr-1" /> AUDIT_READY</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col bg-slate-900 border-white/5" onClick={() => handleCommand('reload')}>
                <RefreshCw className="h-5 w-5 mb-2 text-blue-500" /> <span className="text-[10px] font-bold">RELOAD</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-slate-900 border-white/5" onClick={() => handleCommand('clear_cache')}>
                <Zap className="h-5 w-5 mb-2 text-amber-500" /> <span className="text-[10px] font-bold">PURGE_CACHE</span>
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><History className="h-3 w-3" /> Terminal Audit</h3>
            <div className="bg-black/50 rounded-lg p-4 h-64 overflow-y-auto border border-white/5 scrollbar-thin">
              {commandHistory.map(cmd => (
                <div key={cmd.id} className="flex items-center justify-between py-2 border-b border-white/[0.02]">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-300 uppercase">{cmd.action}</span>
                    <span className="text-[9px] text-slate-600 font-mono">{new Date(cmd.timestamp).toLocaleString()}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] h-4 text-emerald-500 border-emerald-500/20">{cmd.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}