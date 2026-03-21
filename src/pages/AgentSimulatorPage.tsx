import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Activity,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { CDPLiteV2Payload } from '@shared/types';
export function AgentSimulatorPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [deviceId] = useState('sim-' + Math.random().toString(36).substring(7));
  const [packetLoss, setPacketLoss] = useState([0]);
  const [buffer, setBuffer] = useState<any[]>([]);
  const [sequence, setSequence] = useState(0);
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const sessionId = useRef(`sim-session-${crypto.randomUUID().slice(0, 8)}`).current;
  const addEvent = (type: 'log' | 'metric' | 'network', level = 'info', message = '') => {
    const event = {
      type,
      level,
      message: message || `System event at ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString(),
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      fps: 60,
      method: 'GET',
      url: `/api/v1/content/${Math.random().toString(36).slice(2, 6)}.json`,
      status: Math.random() > 0.1 ? 200 : 404,
      duration: Math.floor(Math.random() * 400) + 50
    };
    setBuffer(prev => [...prev, event]);
    toast.info(`${type.toUpperCase()} event buffered`);
  };
  const syncBuffer = useCallback(async () => {
    if (buffer.length === 0 || isSyncing) return;
    if (!isOnline || (Math.random() * 100 < packetLoss[0])) {
      setRetryCount(prev => prev + 1);
      return;
    }
    setIsSyncing(true);
    const nextSeq = sequence + 1;
    const currentBatch = buffer.slice(0, 5);
    // CDP-Lite v2 Protocol Alignment
    const payload: CDPLiteV2Payload = {
      version: "2.6.1",
      sessionId: sessionId,
      sequence: nextSeq,
      ackReq: nextSeq === 1,
      method: "telemetry",
      params: {
        deviceId,
        logs: currentBatch.filter(e => e.type === 'log').map(e => ({
          level: e.level,
          message: e.message,
          timestamp: e.timestamp
        })),
        metrics: currentBatch.filter(e => e.type === 'metric').map(e => ({
          timestamp: e.timestamp,
          cpu: e.cpu,
          memory: e.memory,
          fps: e.fps
        })),
        network: currentBatch.filter(e => e.type === 'network').map(e => ({
          method: e.method,
          url: e.url,
          status: e.status,
          duration: e.duration,
          type: 'fetch',
          timestamp: e.timestamp
        })),
        storageType: "memory",
        timestamp: new Date().toISOString()
      }
    };
    try {
      const res = await fetch(`/api/devices/${deviceId}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      setApiLogs(prev => [{
        timestamp: new Date().toISOString(),
        seq: nextSeq,
        status: res.status,
        ack: json.data?.acknowledgedSeq
      }, ...prev].slice(0, 10));
      if (json.success && json.data?.acknowledgedSeq === nextSeq) {
        setBuffer(prev => prev.slice(currentBatch.length));
        setSequence(nextSeq);
        setRetryCount(0);
        toast.success(`ACK SEQ ${nextSeq}`);
      }
    } catch (e) {
      setRetryCount(prev => prev + 1);
    } finally {
      setIsSyncing(false);
    }
  }, [buffer, isOnline, deviceId, sequence, isSyncing, packetLoss, sessionId]);
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
          <p className="text-slate-500 mt-2">Simulate real-world network conditions and CDP-Lite v2 buffering.</p>
        </div>
        <div className="flex items-center gap-6 bg-slate-900 p-4 rounded-xl border border-white/5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Packet Loss</Label>
              <span className="text-[10px] font-mono text-blue-400">{packetLoss[0]}%</span>
            </div>
            <Slider value={packetLoss} onValueChange={setPacketLoss} max={100} className="w-32" />
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
            <CardHeader><CardTitle className="text-xs font-bold text-slate-500 uppercase">Agent Controls</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-2 bg-black/40 rounded border border-white/5 text-center">
                  <p className="text-[9px] text-slate-500 uppercase font-bold">Seq</p>
                  <p className="text-lg font-mono text-blue-400">{sequence}</p>
                </div>
                <div className="p-2 bg-black/40 rounded border border-white/5 text-center">
                  <p className="text-[9px] text-slate-500 uppercase font-bold">Retry</p>
                  <p className="text-lg font-mono text-amber-500">{retryCount}</p>
                </div>
              </div>
              <Button onClick={() => addEvent('log')} variant="outline" className="w-full text-xs bg-white/5 border-white/10">Log Message</Button>
              <Button onClick={() => addEvent('metric')} variant="outline" className="w-full text-xs bg-emerald-500/10 border-emerald-500/20 text-emerald-400">Heartbeat Metric</Button>
              <Button onClick={() => addEvent('network')} variant="outline" className="w-full text-xs bg-blue-500/10 border-blue-500/20 text-blue-400">Network Request</Button>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-white/5">
            <CardHeader><CardTitle className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Database className="h-4 w-4" /> Local Buffer ({buffer.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64 overflow-y-auto space-y-1 font-mono text-[9px] scrollbar-thin">
                {buffer.length === 0 ? <div className="text-center text-slate-700 py-10">Synced</div> :
                  [...buffer].reverse().map((e, i) => (
                    <div key={i} className="p-1.5 bg-black/40 border border-white/[0.02] flex justify-between">
                      <span className={cn("font-bold uppercase", e.type === 'network' ? "text-blue-500" : "text-emerald-500")}>{e.type}</span>
                      <span className="text-slate-500 truncate ml-2">PENDING_SYNC</span>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="bg-slate-950 border-white/5 h-full overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} /> Transmission Audit
                </CardTitle>
                <Badge variant="outline" className="text-[9px] font-mono uppercase">NODE: {deviceId}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {apiLogs.map((log, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-white/[0.01]">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className="text-xs font-bold text-blue-400 uppercase">CDP_LITE_V2</span>
                      </div>
                      <div className="h-6 w-px bg-white/5" />
                      <div className="text-xs font-mono">SEQ #{log.seq}</div>
                    </div>
                    <Badge variant="outline" className={cn("font-mono", log.status === 200 ? "text-emerald-500 border-emerald-500/20" : "text-rose-500 border-rose-500/20")}>
                      {log.status === 200 ? `ACK_SEQ_${log.ack}` : `FAIL_${log.status}`}
                    </Badge>
                  </div>
                ))}
                {apiLogs.length === 0 && <div className="p-20 text-center text-slate-800 uppercase text-[10px] tracking-widest">Awaiting Transmission...</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}