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
  RefreshCw, History, Camera, Trash2, Globe, Play, Loader2, AlertCircle, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeviceMetricsPanel } from '@/components/DeviceMetricsPanel';
import { DeviceViewport } from '@/components/DeviceViewport';
import { toast } from 'sonner';
import type { LogEvent, NetworkDetail, Command } from '@shared/types';
export function DeviceInspectorPage() {
  const { id } = useParams();
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
  const pollingStatus = useTelemetryStore(s => s.pollingStatus);
  const lastUpdated = useTelemetryStore(s => s.lastUpdated);
  const device = useMemo(() => devices.find(d => d.id === id), [devices, id]);
  const [snapshotIdx, setSnapshotIdx] = useState(0);
  const [sandboxCode, setSandboxCode] = useState('// Remote JS Execution\nconsole.log("Hello from Insidr Sandbox");\nreturn { status: "OK", memory: performance.memory?.usedJSHeapSize };');
  const [isExecuting, setIsExecuting] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (id) {
      resetStats();
      fetchStats(id);
      const interval = setInterval(() => {
        const loading = useTelemetryStore.getState().isStatsLoading;
        if (!loading) {
          fetchStats(id);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [id, fetchStats, resetStats]);
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);
  const handleCommand = async (action: Command['action'], payload?: any) => {
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
      toast.error("Command dispatch failed");
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
  if (!device) {
    const isSyncing = pollingStatus === 'syncing' || !lastUpdated;
    if (isSyncing) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-background p-12 text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">Synchronizing Node Integrity</h2>
            <p className="text-[10px] font-mono text-muted-foreground uppercase">Target ID: {id} • Querying global durable storage...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background p-12 text-center space-y-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">Node ID Not Found</h2>
          <p className="text-[10px] font-mono text-muted-foreground uppercase">Target identifier {id} is not enrolled in the current fleet.</p>
        </div>
        <Button asChild variant="outline" size="sm" className="text-[10px] font-bold uppercase">
          <Link to="/">Back to Fleet Overview</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-input bg-secondary/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent">
            <Link to="/"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-foreground uppercase tracking-tight">{device.name}</h1>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] h-4 uppercase font-bold">v2.6.1-enterprise</Badge>
              <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-accent rounded text-[8px] font-mono text-muted-foreground">
                <ShieldCheck className="h-2.5 w-2.5 text-blue-500" /> AUTH_RTP
              </div>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase">{device.id} • {device.os} • {device.ip}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end border-r border-input pr-4">
            <span className="text-[9px] text-muted-foreground uppercase font-bold">Session Integrity</span>
            <span className={cn(
              "text-[10px] font-mono font-bold uppercase flex items-center gap-1.5",
              pollingStatus === 'idle' ? "text-emerald-500" : "text-blue-400"
            )}>
              <div className={cn("h-1 w-1 rounded-full", pollingStatus === 'syncing' ? "bg-blue-400 animate-ping" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]")} />
              STREAMING
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => id && fetchStats(id)}
            disabled={isStatsLoading}
            className="text-muted-foreground hover:text-foreground text-[10px] font-bold"
          >
            <RefreshCw className={cn("h-3 w-3 mr-2", isStatsLoading && "animate-spin")} /> FORCE_SYNC
          </Button>
          <div className="h-8 w-px bg-input" />
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-muted-foreground uppercase font-bold">Heartbeat</span>
            <span className={cn("text-[10px] font-mono font-bold uppercase", device.status === 'online' ? "text-emerald-500" : "text-destructive")}>
              {device.status}
            </span>
          </div>
        </div>
      </header>
      <Tabs defaultValue="console" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-secondary/50 border-b border-input h-10 rounded-none px-4 gap-2">
          <TabsTrigger value="console" className="text-[10px] uppercase font-bold"><Terminal className="h-3 w-3 mr-2" /> Console</TabsTrigger>
          <TabsTrigger value="network" className="text-[10px] uppercase font-bold"><Globe className="h-3 w-3 mr-2" /> Network</TabsTrigger>
          <TabsTrigger value="viewport" className="text-[10px] uppercase font-bold"><Monitor className="h-3 w-3 mr-2" /> Viewport</TabsTrigger>
          <TabsTrigger value="metrics" className="text-[10px] uppercase font-bold"><Activity className="h-3 w-3 mr-2" /> Perf</TabsTrigger>
          <TabsTrigger value="control" className="text-[10px] uppercase font-bold"><Zap className="h-3 w-3 mr-2" /> Control</TabsTrigger>
        </TabsList>
        <TabsContent value="console" className="flex-1 flex flex-col min-h-0 bg-background m-0">
          <div className="p-2 border-b border-input flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearLocalLogs} className="h-6 text-[9px] text-muted-foreground hover:text-destructive">
              <Trash2 className="h-3 w-3 mr-1" /> CLEAR_BUFFER
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] scrollbar-thin bg-black/5">
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground uppercase tracking-widest text-[10px]">Awaiting Ingestion...</div>
            ) : (
              logs.map((log: LogEvent) => (
                <div key={log.id} className="flex gap-4 group hover:bg-accent py-0.5 border-b border-input/10">
                  <span className="text-muted-foreground shrink-0 w-20">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                  <span className={cn("font-bold uppercase w-12", log.level === 'error' ? 'text-rose-500' : 'text-blue-500')}>{log.level}</span>
                  <span className={cn("break-all", log.level === 'error' ? 'text-rose-200' : 'text-foreground')}>{log.message}</span>
                </div>
              ))
            )}
            <div ref={consoleEndRef} />
          </div>
        </TabsContent>
        <TabsContent value="network" className="flex-1 bg-background overflow-y-auto m-0 p-0">
          <Table>
            <TableHeader className="bg-secondary/50 sticky top-0 backdrop-blur-md z-10">
              <TableRow className="border-input">
                <TableHead className="text-[10px] font-mono text-muted-foreground uppercase">Timestamp</TableHead>
                <TableHead className="text-[10px] font-mono text-muted-foreground uppercase">Method</TableHead>
                <TableHead className="text-[10px] font-mono text-muted-foreground uppercase">URL</TableHead>
                <TableHead className="text-[10px] font-mono text-muted-foreground uppercase">Status</TableHead>
                <TableHead className="text-[10px] font-mono text-muted-foreground uppercase text-right">Dur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono text-[11px]">
              {network.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center text-muted-foreground uppercase text-[10px]">No Network Traffic Captured</TableCell>
                </TableRow>
              ) : (
                [...network].reverse().map((req: NetworkDetail) => (
                  <TableRow key={req.id} className="border-input hover:bg-accent transition-colors">
                    <TableCell className="text-muted-foreground">{new Date(req.timestamp).toLocaleTimeString([], { hour12: false })}</TableCell>
                    <TableCell className="font-bold text-blue-600 uppercase">{req.method}</TableCell>
                    <TableCell className="text-foreground truncate max-w-[300px]" title={req.url}>{req.url}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-bold border-none",
                        req.status >= 200 && req.status < 300 ? "bg-emerald-500/10 text-emerald-500" :
                        req.status >= 400 && req.status < 500 ? "bg-amber-500/10 text-amber-500" : "bg-destructive/10 text-destructive"
                      )}>{req.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{req.duration}ms</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="viewport" className="flex-1 p-6 bg-secondary/20 m-0 space-y-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2"><Monitor className="h-3 w-3" /> Live Render Preview</h3>
              <DeviceViewport deviceId={device.id} />
            </section>
            <section className="space-y-4 pt-8 border-t border-input">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2"><Camera className="h-3 w-3" /> Snapshot Buffer</h3>
                <div className="flex gap-1">
                  {snapshots.map((_, i) => (
                    <button key={i} onClick={() => setSnapshotIdx(i)} className={cn("h-1.5 w-6 rounded-full transition-colors", snapshotIdx === i ? "bg-primary" : "bg-muted")} />
                  ))}
                </div>
              </div>
              <div className="aspect-video bg-black rounded-xl border border-input overflow-hidden relative shadow-lg">
                {snapshots.length > 0 ? (
                  <img src={snapshots[snapshotIdx]} className="w-full h-full object-cover" alt="Node Snapshot" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground font-mono text-xs">
                    <RefreshCw className="h-8 w-8 mb-2 animate-pulse" />
                    ACQUIRING_FRAME...
                  </div>
                )}
              </div>
            </section>
          </div>
        </TabsContent>
        <TabsContent value="metrics" className="flex-1 p-6 overflow-y-auto bg-background m-0">
          {metrics.length > 0 ? (
            <DeviceMetricsPanel metrics={metrics} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
              <Activity className="h-12 w-12 opacity-10" />
              <div className="text-center text-xs font-bold uppercase tracking-widest">No Performance Metadata Received</div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="control" className="flex-1 p-6 bg-background m-0 grid lg:grid-cols-2 gap-8 overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase">Remote Eval (Sandbox Environment)</h3>
              <div className="relative">
                <Textarea
                  value={sandboxCode}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  className="bg-secondary border-input font-mono text-[11px] h-48 focus:ring-primary/50 resize-none"
                  placeholder="Enter JS for remote execution..."
                />
                <Button size="sm" onClick={runSandbox} disabled={isExecuting} className="absolute bottom-4 right-4 bg-primary text-primary-foreground text-[10px] font-bold h-8">
                  {isExecuting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 mr-2" />} EXECUTE
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase">Node Operations</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col bg-secondary border-input" onClick={() => handleCommand('reload')}>
                  <RefreshCw className="h-5 w-5 mb-2 text-blue-500" /> <span className="text-[10px] font-bold">RELOAD_PAGE</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-secondary border-input" onClick={() => handleCommand('clear_cache')}>
                  <Zap className="h-5 w-5 mb-2 text-amber-500" /> <span className="text-[10px] font-bold">PURGE_CACHE</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2"><History className="h-3 w-3" /> Operational Audit</h3>
            <div className="bg-secondary/40 rounded-lg p-4 h-[calc(100%-2rem)] overflow-y-auto border border-input scrollbar-thin">
              {commandHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[9px] font-mono text-muted-foreground italic">NO_AUDIT_LOGS</div>
              ) : (
                commandHistory.map((cmd: Command) => (
                  <div key={cmd.id} className="flex items-center justify-between py-2 border-b border-input/20">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-foreground uppercase">{cmd.action}</span>
                      <span className="text-[9px] text-muted-foreground font-mono">{new Date(cmd.timestamp).toLocaleString()}</span>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[9px] h-4 border-none font-bold",
                      cmd.status === 'executed' ? "text-emerald-500 bg-emerald-500/10" :
                      cmd.status === 'failed' ? "text-destructive bg-destructive/10" : "text-amber-500 bg-amber-500/10"
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