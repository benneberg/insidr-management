import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTelemetryStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Terminal, Network, Zap, ChevronLeft, RefreshCw, Trash2, Cpu } from 'lucide-react';
import { toast } from 'sonner';
export function DeviceInspectorPage() {
  const { id } = useParams();
  const devices = useTelemetryStore(s => s.devices);
  const currentLogs = useTelemetryStore(s => s.currentLogs);
  const fetchLogs = useTelemetryStore(s => s.fetchLogs);
  const device = devices.find(d => d.id === id);
  useEffect(() => {
    if (id) {
      fetchLogs(id);
      const interval = setInterval(() => fetchLogs(id), 2000);
      return () => clearInterval(interval);
    }
  }, [id, fetchLogs]);
  const handleCommand = async (action: string) => {
    try {
      const res = await fetch(`/api/devices/${id}/commands`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        toast.success(`Command '${action}' queued successfully`);
      }
    } catch (e) {
      toast.error("Failed to queue command");
    }
  };
  if (!device) return <div className="p-12 text-center text-muted-foreground">Device not found</div>;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
      <div className="py-6 space-y-6 flex flex-col h-full">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="rounded-full">
              <Link to="/"><ChevronLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">{device.name}</h1>
              <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
                <span>{device.id}</span>
                <span>•</span>
                <span>{device.ip}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] uppercase text-slate-500 font-semibold">Memory Usage</span>
              <div className="flex items-center gap-3 w-32">
                <Progress value={device.memoryUsage} className="h-1.5" />
                <span className="text-xs font-mono text-slate-300">{device.memoryUsage}%</span>
              </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-500 font-semibold block">Uptime</span>
              <span className="text-xs font-mono text-slate-300">{device.uptime}</span>
            </div>
          </div>
        </header>
        <Tabs defaultValue="console" className="flex-1 flex flex-col min-h-0">
          <TabsList className="bg-slate-900 border-b border-white/5 rounded-none justify-start px-2">
            <TabsTrigger value="console" className="data-[state=active]:bg-white/10 gap-2">
              <Terminal className="h-4 w-4" /> Console
            </TabsTrigger>
            <TabsTrigger value="network" className="data-[state=active]:bg-white/10 gap-2">
              <Network className="h-4 w-4" /> Network
            </TabsTrigger>
            <TabsTrigger value="commands" className="data-[state=active]:bg-white/10 gap-2">
              <Zap className="h-4 w-4" /> Commands
            </TabsTrigger>
          </TabsList>
          <TabsContent value="console" className="flex-1 bg-black p-0 border border-white/5 mt-0 overflow-hidden">
            <div className="h-full flex flex-col font-mono text-sm">
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {currentLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 border-b border-white/5 pb-1 last:border-0 group">
                    <span className="text-slate-600 select-none w-20 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                    </span>
                    <span className={cn(
                      "shrink-0 w-12 font-bold uppercase text-[10px] mt-0.5",
                      log.level === 'error' ? 'text-rose-500' :
                      log.level === 'warn' ? 'text-amber-500' : 'text-blue-400'
                    )}>
                      [{log.level}]
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
              <div className="bg-slate-900 px-4 py-2 border-t border-white/10 text-[10px] text-slate-500">
                Streaming live logs from agent...
              </div>
            </div>
          </TabsContent>
          <TabsContent value="commands" className="flex-1 bg-slate-950 p-6 border border-white/5 mt-0">
            <div className="max-w-md space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => handleCommand('reload')} variant="outline" className="h-24 flex-col gap-2 bg-slate-900 hover:bg-slate-800 border-white/10">
                  <RefreshCw className="h-6 w-6 text-blue-400" />
                  Reload Page
                </Button>
                <Button onClick={() => handleCommand('clear_cache')} variant="outline" className="h-24 flex-col gap-2 bg-slate-900 hover:bg-slate-800 border-white/10">
                  <Trash2 className="h-6 w-6 text-amber-400" />
                  Clear Cache
                </Button>
                <Button onClick={() => handleCommand('reboot')} variant="outline" className="h-24 flex-col gap-2 bg-slate-900 hover:bg-slate-800 border-white/10">
                  <Cpu className="h-6 w-6 text-rose-400" />
                  Force Reboot
                </Button>
              </div>
              <Card className="bg-blue-500/5 border-blue-500/20">
                <CardContent className="pt-6">
                  <p className="text-xs text-blue-300/80 leading-relaxed">
                    Commands are queued and delivered to the device on the next check-in (usually within 2-5 seconds).
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="network" className="flex-1 bg-black p-12 text-center text-slate-500 font-mono italic">
            Network capture pending next agent poll...
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}