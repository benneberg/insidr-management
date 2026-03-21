import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Zap,
  Wifi,
  WifiOff,
  Terminal,
  Database,
  History,
  Activity,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
export function AgentSimulatorPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [deviceId] = useState('sim-' + Math.random().toString(36).substring(7));
  const [packetLoss, setPacketLoss] = useState([0]);
  const [buffer, setBuffer] = useState<any[]>([]);
  const [sequence, setSequence] = useState(0);
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const addEvent = (type: 'log' | 'metric', level = 'info', message = '') => {
    const event = {
      type,
      level,
      message: message || `System event at ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString(),
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      fps: 60
    };
    setBuffer(prev => [...prev, event]);
    toast.info(`Event buffered locally`);
  };
  const syncBuffer = useCallback(async () => {
    // We use functional updates or refs for buffer/sequence to keep this callback stable
    // But for the sake of the stable interval fix, we rely on the syncRef
    if (buffer.length === 0 || isSyncing) return;
    if (!isOnline || (Math.random() * 100 < packetLoss[0])) {
      setRetryCount(prev => prev + 1);
      return;
    }
    setIsSyncing(true);
    const nextSeq = sequence + 1;
    const currentBatch = buffer.slice(0, 10);
    const payload = {
      sequence: nextSeq,
      logs: currentBatch.filter(e => e.type === 'log'),
      metrics: currentBatch.filter(e => e.type === 'metric')
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
        seq: nextSeq,
        status: res.status,
        ack: data.acknowledgedSeq
      }, ...prev].slice(0, 10));
      if (data.success && data.acknowledgedSeq === nextSeq) {
        setBuffer(prev => prev.slice(currentBatch.length));
        setSequence(nextSeq);
        setRetryCount(0);
        toast.success(`ACK Received for SEQ ${nextSeq}`);
      }
    } catch (e) {
      setRetryCount(prev => prev + 1);
    } finally {
      setIsSyncing(false);
    }
  }, [buffer, isOnline, deviceId, sequence, isSyncing, packetLoss]);
  // Stable reference pattern to prevent interval resets
  const syncRef = useRef(syncBuffer);
  useEffect(() => {
    syncRef.current = syncBuffer;
  }, [syncBuffer]);
  useEffect(() => {
    const interval = setInterval(() => {
      syncRef.current();
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-500" />
            Reliable Telemetry Simulator
          </h1>
          <p className="text-slate-500 mt-2">Observe RTP v1.0 sequence tracking and persistent buffering in action.</p>
        </div>
        <div className="flex items-center gap-6 bg-slate-900 p-4 rounded-xl border border-white/5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Simulated Packet Loss</Label>
              <span className="text-[10px] font-mono text-blue-400">{packetLoss[0]}%</span>
            </div>
            <Slider
              value={packetLoss}
              onValueChange={setPacketLoss}
              max={100}
              step={5}
              className="w-32"
            />
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            {isOnline ? <Wifi className="h-5 w-5 text-emerald-500" /> : <WifiOff className="h-5 w-5 text-rose-500" />}
            <Switch checked={isOnline} onCheckedChange={setIsOnline} />
          </div>
        </div>
      </header>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6">
          <Card className="bg-slate-900 border-white/5 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Terminal className="h-4 w-4" /> Agent State
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-black/40 rounded border border-white/5 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Sequence</p>
                  <p className="text-xl font-mono text-blue-400 font-bold">{sequence}</p>
                </div>
                <div className="p-3 bg-black/40 rounded border border-white/5 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Retries</p>
                  <p className={cn("text-xl font-mono font-bold", retryCount > 0 ? "text-amber-500" : "text-slate-500")}>
                    {retryCount}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Button onClick={() => addEvent('log')} variant="outline" className="w-full text-xs h-9 bg-white/5 border-white/10">
                  Generate Info Log
                </Button>
                <Button onClick={() => addEvent('log', 'error', 'FATAL: Buffer Overflow')} variant="outline" className="w-full text-xs h-9 bg-rose-500/10 border-rose-500/20 text-rose-400">
                  Generate Error Log
                </Button>
                <Button onClick={() => addEvent('metric')} variant="outline" className="w-full text-xs h-9 bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                  Heartbeat Signal
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Database className="h-4 w-4" /> Local Persistence Buffer
              </CardTitle>
              <CardDescription className="text-[10px]">{buffer.length} events pending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-y-auto space-y-2 font-mono text-[9px] scrollbar-thin scrollbar-thumb-white/10">
                {buffer.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 italic">
                    <History className="h-6 w-6 mb-2 opacity-20" />
                    Everything synced
                  </div>
                ) : (
                  [...buffer].reverse().map((e, i) => (
                    <div key={i} className="p-2 bg-black/40 border border-white/5 rounded flex items-center justify-between">
                      <span className={cn(
                        "font-bold uppercase w-12",
                        e.type === 'log' ? (e.level === 'error' ? 'text-rose-500' : 'text-blue-400') : 'text-emerald-400'
                      )}>{e.type}</span>
                      <span className="text-slate-400 truncate flex-1 ml-2">{e.message}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="bg-slate-950 border-white/5 h-full shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} /> Transport Audit Log
                </CardTitle>
                <Badge variant="outline" className="text-[9px] font-mono tracking-tighter">API_VERSION: 1.0</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {apiLogs.length === 0 ? (
                  <div className="p-20 text-center text-slate-700 italic text-sm">Waiting for transport activity...</div>
                ) : (
                  apiLogs.map((log, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          <span className="text-xs font-bold text-blue-400 uppercase tracking-tighter">BATCH_INGEST</span>
                        </div>
                        <div className="h-6 w-px bg-white/5" />
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 uppercase">Sequence ID</span>
                          <span className="text-xs font-mono text-white">#{log.seq}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 uppercase">Response</span>
                          <p className="text-xs font-mono text-emerald-400">ACK_SEQ_{log.ack}</p>
                        </div>
                        <Badge className={cn(
                          "h-6 font-mono",
                          log.status === 200 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        )}>HTTP {log.status}</Badge>
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