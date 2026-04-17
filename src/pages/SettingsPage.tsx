import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Shield, Key, Database, Lock, Trash2,
  FileJson, History, ShieldAlert, Loader2,
  Cpu, Network, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { useTelemetryStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
export function SettingsPage() {
  const [strictJwt, setStrictJwt] = useState(true);
  const [sandboxReq, setSandboxReq] = useState(true);
  const [retention, setRetention] = useState([90]);
  const [tokenExpiry, setTokenExpiry] = useState([7]);
  // ZUSTAND ZERO-TOLERANCE COMPLIANCE
  const wipeFleet = useTelemetryStore(s => s.wipeFleet);
  const isExporting = useTelemetryStore(s => s.isExporting);
  const exportToCSV = useTelemetryStore(s => s.exportToCSV);
  const protocolMode = useTelemetryStore(s => s.protocolMode);
  const setProtocolMode = useTelemetryStore(s => s.setProtocolMode);
  const devicesCount = useTelemetryStore(s => s.devices.length);
  const storageUsage = useMemo(() => {
    // Simulated storage metric based on device count and retention
    return Math.min(100, Math.round((devicesCount * retention[0] * 0.1)));
  }, [devicesCount, retention]);
  const handleWipe = async () => {
    const doubleCheck = prompt("DANGER: Type 'PURGE_FLEET' to confirm.");
    if (doubleCheck === 'PURGE_FLEET') {
      await wipeFleet();
      toast.success("Fleet purged");
    } else {
      toast.error("Wipe cancelled");
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">System Hardening</h1>
            <p className="text-slate-500 text-sm mt-2">v2.5 Enterprise Compliance Protocol.</p>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 font-mono uppercase tracking-widest text-[10px]">
            SECURE_ENCLAVE_ACTIVE
          </Badge>
        </header>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <Card className="bg-slate-900 border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" /> Security Policies
                </CardTitle>
                <CardDescription className="text-xs">Configure how agents interact with the Control Plane.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-200">Strict JWT Enforcement</p>
                    <p className="text-[10px] text-slate-500">Reject telemetry without valid enrollment tokens.</p>
                  </div>
                  <Switch checked={strictJwt} onCheckedChange={setStrictJwt} />
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-6">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-blue-500">Low Latency Gateway (WSS)</p>
                    <p className="text-[10px] text-slate-500 font-mono">[EXPERIMENTAL] Simulation Protocol v2.</p>
                  </div>
                  <Switch
                    checked={protocolMode === 'wss'}
                    onCheckedChange={(c) => {
                      setProtocolMode(c ? 'wss' : 'polling');
                      toast.info(`Protocol: ${c ? 'WSS' : 'POLLING'}`);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-500" /> Durable Storage (D.O.)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                    <span>128MB Memory Limit</span>
                    <span className={cn(storageUsage > 80 ? 'text-rose-500' : 'text-emerald-500')}>{storageUsage}%</span>
                  </div>
                  <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={cn("h-full transition-all duration-500", storageUsage > 80 ? 'bg-rose-600' : 'bg-blue-600')} 
                      style={{ width: `${storageUsage}%` }} 
                    />
                  </div>
                  <p className="text-[9px] text-slate-600 italic">Storage utilization is derived from device footprint and retention policy.</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="bg-slate-900 border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Database className="h-4 w-4 text-emerald-500" /> Data Retention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-200">History Horizon</p>
                    <span className="text-[10px] font-mono text-blue-400">{retention[0]} Days</span>
                  </div>
                  <Slider value={retention} onValueChange={setRetention} max={365} step={30} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={async () => { await exportToCSV(); toast.success("Exported"); }}
                    disabled={isExporting}
                    variant="outline"
                    className="border-white/10 text-[10px] font-bold"
                  >
                    {isExporting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <FileJson className="h-3 w-3 mr-2 text-blue-400" />}
                    EXPORT_CSV
                  </Button>
                  <Button onClick={handleWipe} variant="destructive" className="text-[10px] font-bold uppercase tracking-widest">
                    PURGE_FLEET
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-950 border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <History className="h-4 w-4 text-slate-400" /> Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 overflow-y-auto space-y-2 font-mono text-[9px] text-slate-500 scrollbar-thin">
                  <div className="p-2 border-b border-white/5">
                    <span className="text-emerald-400">[SYSTEM]</span> {new Date().toISOString()} | PROTOCOL_HANDSHAKE_STABLE
                  </div>
                  <div className="p-2 border-b border-white/5">
                    <span className="text-blue-400">[SECURITY]</span> POLICY_UPDATED | JWT_STRICT: {strictJwt ? 'ON' : 'OFF'}
                  </div>
                  <div className="p-2 border-b border-white/5">
                    <span className="text-amber-400">[ADMIN]</span> RETENTION_RECONFIGURED | {retention[0]}D
                  </div>
                  {devicesCount > 0 && (
                    <div className="p-2 border-b border-white/5">
                      <span className="text-slate-400">[INFO]</span> FLEET_MAPPING_ACTIVE | {devicesCount} NODES
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}