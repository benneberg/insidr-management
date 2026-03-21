import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTelemetryStore } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Terminal, Network, Zap, ChevronLeft, RefreshCw, 
  Trash2, Cpu, Activity, History, ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DeviceMetricsPanel } from '@/components/DeviceMetricsPanel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
export function DeviceInspectorPage() {
  const { id } = useParams();
  const devices = useTelemetryStore(s => s.devices);
  const logs = useTelemetryStore(s => s.currentLogs);
  const metrics = useTelemetryStore(s => s.currentMetrics);
  const network = useTelemetryStore(s => s.currentNetwork);
  const history = useTelemetryStore(s => s.commandHistory);
  const fetchStats = useTelemetryStore(s => s.fetchDeviceStats);
  const device = devices.find(d => d.id === id);
  useEffect(() => {
    if (id) {
      fetchStats(id);
      const interval = setInterval(() => fetchStats(id), 3000);
      return () => clearInterval(interval);
    }
  }, [id, fetchStats]);
  const handleCommand = async (action: string) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/devices/${id}/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) toast.success(`Command '${action}' queued`);
    } catch (e) {
      toast.error("Command failed");
    }
  };
  if (!device) return <div className="p-12 text-center text-slate-500 font-mono">NODE_NOT_FOUND</div>;
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-black">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-950/40">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
            <Link to="/"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white uppercase tracking-tight">{device.name}</h1>
              <Badge variant="outline" className="h-4 text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">LIVE</Badge>
            </div>
            <p className="text-[10px] font-mono text-slate-500 uppercase">{device.id} • {device.ip} • {device.os}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
          <div className="flex flex-col items-end">
            <span className="text-slate-600 uppercase">Uptime</span>
            <span>{device.uptime}</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex flex-col items-end">
            <span className="text-slate-600 uppercase">Agent Version</span>
            <span>v{device.version}</span>
          </div>
        </div>
      </header>
      <Tabs defaultValue="console" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-slate-950/80 border-b border-white/5 h-9 rounded-none justify-start px-4 gap-2">
          <TabsTrigger value="console" className="h-7 text-[10px] uppercase font-bold tracking-wider data-[state=active]:bg-white/10">
            <Terminal className="h-3 w-3 mr-1.5" /> Console
          </TabsTrigger>
          <TabsTrigger value="metrics" className="h-7 text-[10px] uppercase font-bold tracking-wider data-[state=active]:bg-white/10">
            <Activity className="h-3 w-3 mr-1.5" /> Performance
          </TabsTrigger>
          <TabsTrigger value="network" className="h-7 text-[10px] uppercase font-bold tracking-wider data-[state=active]:bg-white/10">
            <Network className="h-3 w-3 mr-1.5" /> Network
          </TabsTrigger>
          <TabsTrigger value="commands" className="h-7 text-[10px] uppercase font-bold tracking-wider data-[state=active]:bg-white/10">
            <Zap className="h-3 w-3 mr-1.5" /> Control
          </TabsTrigger>
        </TabsList>
        <TabsContent value="console" className="flex-1 overflow-hidden p-0 m-0 bg-black">
          <div className="h-full flex flex-col font-mono text-[11px] leading-relaxed">
            <div className="flex-1 overflow-y-auto p-4 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4 group hover:bg-white/5 py-0.5">
                  <span className="text-slate-600 select-none w-20 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}
                  </span>
                  <span className={cn(
                    "shrink-0 w-14 font-bold uppercase text-[9px]",
                    log.level === 'error' ? 'text-rose-500' :
                    log.level === 'warn' ? 'text-amber-500' : 'text-blue-400'
                  )}>
                    {log.level}
                  </span>
                  <span className={cn(
                    "break-all",
                    log.level === 'error' ? 'text-rose-200' :
                    log.level === 'warn' ? 'text-amber-100' : 'text-slate-300'
                  )}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-slate-900/50 px-4 py-1 border-t border-white/5 text-[9px] text-slate-500 flex justify-between">
              <span>Attached to TTY: {device.id}</span>
              <span className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Stream
              </span>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="metrics" className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950 m-0">
          <DeviceMetricsPanel metrics={metrics} />
        </TabsContent>
        <TabsContent value="network" className="flex-1 overflow-hidden p-0 m-0 bg-black">
          <Table>
            <TableHeader className="bg-slate-950 border-white/5">
              <TableRow className="border-white/5">
                <TableHead className="text-[10px] font-mono text-slate-500">Method</TableHead>
                <TableHead className="text-[10px] font-mono text-slate-500">Resource</TableHead>
                <TableHead className="text-[10px] font-mono text-slate-500">Status</TableHead>
                <TableHead className="text-[10px] font-mono text-slate-500">Time</TableHead>
                <TableHead className="text-[10px] font-mono text-slate-500">Waterfall</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {network.map(n => (
                <TableRow key={n.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-mono text-[10px] text-slate-400">{n.method}</TableCell>
                  <TableCell className="font-mono text-[10px] text-slate-200 truncate max-w-xs">{n.url}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "text-[10px] font-mono px-1.5 py-0.5 rounded",
                      n.status < 300 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    )}>{n.status}</span>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-slate-500">{n.duration}ms</TableCell>
                  <TableCell>
                    <div className="w-20 h-1 bg-slate-800 rounded-full relative">
                      <div className="absolute h-full bg-blue-500 left-1/4 w-1/2 rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="commands" className="flex-1 overflow-y-auto p-6 bg-slate-950 m-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Remote Operations</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => handleCommand('reload')} variant="outline" className="h-20 flex-col border-white/5 bg-slate-900 hover:bg-blue-500/10 hover:border-blue-500/30">
                  <RefreshCw className="h-5 w-5 mb-2 text-blue-500" />
                  <span className="text-[10px] font-bold">RELOAD</span>
                </Button>
                <Button onClick={() => handleCommand('clear_cache')} variant="outline" className="h-20 flex-col border-white/5 bg-slate-900 hover:bg-amber-500/10 hover:border-amber-500/30">
                  <Trash2 className="h-5 w-5 mb-2 text-amber-500" />
                  <span className="text-[10px] font-bold">PURGE CACHE</span>
                </Button>
                <Button onClick={() => handleCommand('reboot')} variant="outline" className="h-20 flex-col border-white/5 bg-slate-900 hover:bg-rose-500/10 hover:border-rose-500/30">
                  <Cpu className="h-5 w-5 mb-2 text-rose-500" />
                  <span className="text-[10px] font-bold">REBOOT NODE</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col border-white/5 bg-slate-900 opacity-50 cursor-not-allowed">
                  <ShieldAlert className="h-5 w-5 mb-2 text-slate-500" />
                  <span className="text-[10px] font-bold">MAINTENANCE</span>
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <History className="h-3 w-3" /> Audit Log
              </h3>
              <div className="bg-slate-900 rounded-lg border border-white/5 p-4 h-64 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-[10px] text-slate-600 font-mono italic">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {history.map(c => (
                      <div key={c.id} className="flex justify-between items-start border-b border-white/5 pb-2 last:border-0">
                        <div>
                          <p className="text-[10px] font-bold text-slate-200 uppercase">{c.action}</p>
                          <p className="text-[9px] text-slate-500 font-mono">{new Date(c.timestamp).toLocaleString()}</p>
                        </div>
                        <Badge variant="outline" className={cn(
                          "text-[9px] h-4",
                          c.status === 'executed' ? 'text-emerald-500 border-emerald-500/20' : 'text-blue-500 border-blue-500/20'
                        )}>{c.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}