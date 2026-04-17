import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTelemetryStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Terminal, Monitor, Activity, Zap, ChevronLeft,
  RefreshCw, History, Camera, Trash2, Globe, Play, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeviceMetricsPanel } from '@/components/DeviceMetricsPanel';
import { DeviceViewport } from '@/components/DeviceViewport';
import { toast } from 'sonner';
export function DeviceInspectorPage() {
  const { id } = useParams();
  // ZUSTAND ZERO-TOLERANCE PATTERN (v5 useShallow)
  const devices = useTelemetryStore(useShallow(s => s.devices));
  const logs = useTelemetryStore(useShallow(s => s.currentLogs));
  const metrics = useTelemetryStore(useShallow(s => s.currentMetrics));
  const network = useTelemetryStore(useShallow(s => s.currentNetwork));
  const snapshots = useTelemetryStore(useShallow(s => s.currentSnapshots));
  const commandHistory = useTelemetryStore(useShallow(s => s.commandHistory));
  const fetchStats = useTelemetryStore(s => s.fetchDeviceStats);
  const isStatsLoading = useTelemetryStore(s => s.isStatsLoading);
  const resetStats = useTelemetryStore(s => s.resetCurrentStats);
  const clearLocalLogs = useTelemetryStore(s => s.clearLocalLogs);
  const device = useMemo(() => devices.find(d => d.id === id), [devices, id]);
  const [snapshotIdx, setSnapshotIdx] = useState(0);
  const [sandboxCode, setSandboxCode] = useState('// Remote JS Execution\nconsole.log("Hello from Insidr Sandbox");\nreturn { status: "OK", memory: performance.memory?.usedJSHeapSize };');
  const [isExecuting, setIsExecuting] = useState(false);
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
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);
  const handleCommand = async (action: string, payload?: any) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/devices/${id}/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
      });
      if (res.ok) {
        toast.success(`Command '${action}' dispatched`);
        fetchStats(id);
      }
    } catch (e) {
      toast.error("Dispatch failed");
    }
  };
  const runSandbox = async () => {
    setIsExecuting(true);
    try {
      await handleCommand('eval_sandbox', { code: sandboxCode });
    } finally {
      setTimeout(() => setIsExecuting(false), 1000);
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
              <Badge className="bg-blue-600/10 text-blue-400 border-blue-500/20 text-[9px] h-4">v2.6 RTP</Badge>
              <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-slate-800 rounded text-[8px] font-mono text-slate-400">
                SEQ: {logs.length > 0 ? logs.length : '0'}
              </div>
            </div>
            <p className="text-[10px] font-mono text-slate-500 uppercase">{device.id} • {device.os} • {device.ip}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end border-r border-white/5 pr-4">
            <span className="text-[9px] text-slate-600 uppercase font-bold">Buffer Depth</span>
            <span className="text-[10px] font-mono text-blue-400">{logs.length + network.length} Events</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => id && fetchStats(id)}
            disabled={isStatsLoading}
            className="text-slate-400 hover:text-white text-[10px] font-bold"
          >
            <RefreshCw className={cn("h-3 w-3 mr-2", isStatsLoading && "animate-spin")} /> REFRESH
          </Button>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-600 uppercase font-bold">Sync Health</span>
            <span className={cn("text-[10px] font-mono", device.status === 'online' ? "text-emerald-500" : "text-rose-500")}>
              {device.status.toUpperCase()}
            </span>
          </div>
        </div>
      </header>
      <Tabs defaultValue="console" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-slate-950/80 border-b border-white/5 h-9 rounded-none px-4 gap-2">
          <TabsTrigger value="console" className="text-[10px] uppercase font-bold"><Terminal className="h-3 w-3 mr-2" /> Console</TabsTrigger>
          <TabsTrigger value="network" className="text-[10px] uppercase font-bold"><Globe className="h-3 w-3 mr-2" /> Network</TabsTrigger>
          <TabsTrigger value="viewport" className="text-[10px] uppercase font-bold"><Monitor className="h-3 w-3 mr-2" /> Viewport</TabsTrigger>
          <TabsTrigger value="metrics" className="text-[10px] uppercase font-bold"><Activity className="h-3 w-3 mr-2" /> Performance</TabsTrigger>
          <TabsTrigger value="control" className="text-[10px] uppercase font-bold"><Zap className="h-3 w-3 mr-2" /> Control</TabsTrigger>
        </TabsList>
        <TabsContent value="console" className="flex-1 flex flex-col min-h-0 bg-black">
          <div className="p-2 border-b border-white/5 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearLocalLogs}
              className="h-6 text-[9px] text-slate-500 hover:text-rose-400"
            >
              <Trash2 className="h-3 w-3 mr-1" /> CLEAR CONSOLE
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] scrollbar-thin">
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-800 uppercase tracking-widest text-[10px]">Buffer Clean</div>
            ) : (
              logs.map((log: any) => (
                <div key={log.id} className="flex gap-4 group hover:bg-white/5 py-0.5 border-b border-white/[0.02]">
                  <span className="text-slate-600 shrink-0 w-20">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                  <span className={cn("font-bold uppercase w-12", log.level === 'error' ? 'text-rose-500' : 'text-blue-400')}>{log.level}</span>
                  <span className="text-slate-300 break-all">{log.message}</span>
                </div>
              ))
            )}
            <div ref={consoleEndRef} />
          </div>
        </TabsContent>
        <TabsContent value="network" className="flex-1 bg-black overflow-y-auto m-0 p-0">
          <Table>
            <TableHeader className="bg-white/[0.02] sticky top-0 backdrop-blur-md">
              <TableRow className="border-white/5">
                <TableHead className="text-[10px] font-mono text-slate-500 uppercase">Timestamp</TableHead>
                <TableHead className="text-[10px] font-mono text-slate-500 uppercase">Method</TableHead>
                <TableHead className="text-[10px] font-mono text-slate-500 uppercase">URL</TableHead>
                <TableHead className="text-[10px] font-mono text-slate-500 uppercase">Status</TableHead>
                <TableHead className="text-[10px] font-mono text-slate-500 uppercase text-right">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono text-[11px]">
              {network.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center text-slate-800 uppercase text-[10px]">No Network Traffic Detected</TableCell>
                </TableRow>
              ) : (
                [...network].reverse().map((req: any) => (
                  <TableRow key={req.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="text-slate-500">{new Date(req.timestamp).toLocaleTimeString([], { hour12: false })}</TableCell>
                    <TableCell className="font-bold text-blue-400">{req.method}</TableCell>
                    <TableCell className="text-slate-300 truncate max-w-[300px]" title={req.url}>{req.url}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-bold border-none",
                        req.status >= 200 && req.status < 300 ? "bg-emerald-500/10 text-emerald-500" :
                        req.status >= 400 && req.status < 500 ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                      )}>{req.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-slate-500">{req.duration}ms</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
                  {snapshots.map((_: any, i: number) => (
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
                  <img src={snapshots[snapshotIdx]} className="w-full h-full object-cover" alt="Device Snapshot" />
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
              <div className="text-center text-xs font-bold uppercase tracking-widest">No Performance Metadata Available</div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="control" className="flex-1 p-6 bg-slate-950 m-0 grid lg:grid-cols-2 gap-8 overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Remote JS Execution (Sandbox)</h3>
              <div className="relative">
                <Textarea
                  value={sandboxCode}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  className="bg-black border-white/10 font-mono text-[11px] h-48 focus:ring-blue-500/50 resize-none"
                  placeholder="Enter JavaScript to execute in DedicatedWorker..."
                />
                <Button
                  size="sm"
                  onClick={runSandbox}
                  disabled={isExecuting}
                  className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-[10px] font-bold h-8"
                >
                  {isExecuting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 mr-2" />}
                  RUN_IN_SANDBOX
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Device Operations</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col bg-slate-900 border-white/5" onClick={() => handleCommand('reload')}>
                  <RefreshCw className="h-5 w-5 mb-2 text-blue-500" /> <span className="text-[10px] font-bold">RELOAD_PAGE</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-slate-900 border-white/5" onClick={() => handleCommand('clear_cache')}>
                  <Zap className="h-5 w-5 mb-2 text-amber-500" /> <span className="text-[10px] font-bold">PURGE_CACHE</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><History className="h-3 w-3" /> Terminal Audit</h3>
            <div className="bg-black/50 rounded-lg p-4 h-[calc(100%-2rem)] overflow-y-auto border border-white/5 scrollbar-thin">
              {commandHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[9px] font-mono text-slate-700">NO_HISTORY_LOGGED</div>
              ) : (
                commandHistory.map((cmd: any) => (
                  <div key={cmd.id} className="flex items-center justify-between py-2 border-b border-white/[0.02]">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-300 uppercase">{cmd.action}</span>
                      <span className="text-[9px] text-slate-600 font-mono">{new Date(cmd.timestamp).toLocaleString()}</span>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[9px] h-4 border-none",
                      cmd.status === 'executed' ? "text-emerald-500 bg-emerald-500/10" : "text-amber-500 bg-amber-500/10"
                    )}>{cmd.status.toUpperCase()}</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}