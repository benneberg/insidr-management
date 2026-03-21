import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Zap, 
  Wifi, 
  WifiOff, 
  Terminal, 
  Database, 
  Send, 
  PlusCircle, 
  Activity,
  History,
  Info,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
export function AgentSimulatorPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [deviceId, setDeviceId] = useState('sim-' + Math.random().toString(36).substring(7));
  const [buffer, setBuffer] = useState<any[]>([]);
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const generateEvent = (type: 'log' | 'metric', level: string = 'info', message: string = '') => {
    const event = type === 'log' 
      ? { type: 'log', level, message: message || `Log message generated at ${new Date().toLocaleTimeString()}`, timestamp: new Date().toISOString() }
      : { type: 'metric', cpu: Math.floor(Math.random() * 100), memory: Math.floor(Math.random() * 100), fps: 60, timestamp: new Date().toISOString() };
    setBuffer(prev => [...prev, event].slice(-50));
    toast.info(`Event generated: ${type}`);
  };
  const syncBuffer = useCallback(async () => {
    if (!isOnline || buffer.length === 0 || isSyncing) return;
    setIsSyncing(true);
    const payload = {
      logs: buffer.filter(e => e.type === 'log').map(({ type, ...rest }) => rest),
      metrics: buffer.filter(e => e.type === 'metric').map(({ type, ...rest }) => rest),
    };
    try {
      const res = await fetch(`/api/devices/${deviceId}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setApiLogs(prev => [{
        timestamp: new Date().toISOString(),
        payload: payload,
        response: data,
        status: res.status
      }, ...prev].slice(0, 10));
      if (data.success) {
        setBuffer([]);
        toast.success("Telemetry synced successfully");
      }
    } catch (e) {
      toast.error("Failed to sync telemetry");
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, buffer, deviceId, isSyncing]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline) syncBuffer();
    }, 5000);
    return () => clearInterval(interval);
  }, [isOnline, syncBuffer]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="h-8 w-8 text-blue-500" />
            Agent SDK Simulator
          </h1>
          <p className="text-slate-500 mt-2">Test telemetry buffering, network resilience, and batching logic.</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-lg border border-white/5">
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-4 w-4 text-emerald-500" /> : <WifiOff className="h-4 w-4 text-rose-500" />}
            <Label htmlFor="network-mode" className="text-xs font-bold text-slate-300 uppercase">
              {isOnline ? "Network: Online" : "Network: Offline"}
            </Label>
            <Switch 
              id="network-mode" 
              checked={isOnline} 
              onCheckedChange={setIsOnline}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>
        </div>
      </header>
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Device Controls */}
        <div className="space-y-6">
          <Card className="bg-slate-900 border-white/5">
            <CardHeader>
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-blue-500" /> Virtual Node config
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-slate-500 font-bold">Simulated Device ID</Label>
                <div className="flex gap-2">
                  <input 
                    value={deviceId} 
                    onChange={e => setDeviceId(e.target.value)}
                    className="flex-1 bg-black border border-white/10 rounded px-3 py-1.5 text-xs text-blue-400 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => generateEvent('log', 'info')} variant="outline" className="text-[10px] h-8 border-white/5 bg-slate-800 hover:bg-slate-700">
                  <PlusCircle className="h-3 w-3 mr-1.5" /> Log Info
                </Button>
                <Button onClick={() => generateEvent('log', 'error', 'CRITICAL_AUTH_FAILURE')} variant="outline" className="text-[10px] h-8 border-white/5 bg-slate-800 hover:bg-slate-700 text-rose-400">
                  <ShieldAlert className="h-3 w-3 mr-1.5" /> Log Error
                </Button>
                <Button onClick={() => generateEvent('metric')} variant="outline" className="text-[10px] h-8 border-white/5 bg-slate-800 hover:bg-slate-700 text-emerald-400">
                  <Activity className="h-3 w-3 mr-1.5" /> Heartbeat
                </Button>
                <Button onClick={syncBuffer} disabled={!isOnline || buffer.length === 0 || isSyncing} className="text-[10px] h-8 bg-blue-600 hover:bg-blue-700">
                  <Send className="h-3 w-3 mr-1.5" /> Force Sync
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Database className="h-4 w-4 text-amber-500" /> Local Buffer (IndexedDB Simulation)
              </CardTitle>
              <CardDescription className="text-[10px]">Queue length: {buffer.length} events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-y-auto space-y-2 font-mono text-[9px] scrollbar-thin scrollbar-thumb-white/10">
                {buffer.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 italic">
                    <History className="h-6 w-6 mb-2 opacity-20" />
                    Buffer empty
                  </div>
                ) : (
                  [...buffer].reverse().map((e, i) => (
                    <div key={i} className="p-2 bg-black/40 border border-white/5 rounded flex justify-between">
                      <span className={cn(
                        "font-bold uppercase",
                        e.type === 'log' ? (e.level === 'error' ? 'text-rose-500' : 'text-blue-400') : 'text-emerald-400'
                      )}>{e.type}</span>
                      <span className="text-slate-500 truncate ml-2 flex-1 text-right">
                        {e.type === 'log' ? e.message : `CPU: ${e.cpu}% MEM: ${e.memory}%`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* API Communication Log */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-950 border-white/5 h-full">
            <CardHeader>
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Info className="h-4 w-4 text-slate-400" /> Network Activity & API Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiLogs.length === 0 ? (
                  <div className="p-20 text-center text-slate-600 border border-dashed border-white/5 rounded-lg">
                    No API traffic detected yet.
                  </div>
                ) : (
                  apiLogs.map((log, i) => (
                    <div key={i} className="bg-black border border-white/5 rounded-lg overflow-hidden">
                      <div className="bg-white/5 px-3 py-1.5 flex justify-between items-center text-[10px] font-mono">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          <span className="text-blue-400 font-bold">POST /ingest</span>
                        </div>
                        <Badge variant="outline" className={cn(
                          "text-[9px] h-4",
                          log.status === 200 ? "text-emerald-400 border-emerald-400/20" : "text-rose-400 border-rose-400/20"
                        )}>HTTP {log.status}</Badge>
                      </div>
                      <div className="p-3 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-slate-500 mb-1">Payload sent</p>
                          <pre className="text-[9px] text-blue-300 font-mono bg-slate-900/50 p-2 rounded max-h-32 overflow-y-auto">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-bold text-slate-500 mb-1">Response from worker</p>
                          <pre className="text-[9px] text-emerald-300 font-mono bg-slate-900/50 p-2 rounded max-h-32 overflow-y-auto">
                            {JSON.stringify(log.response, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}