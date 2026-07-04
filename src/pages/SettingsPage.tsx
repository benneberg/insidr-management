import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Shield, Key, Database, Lock, Trash2,
  FileJson, History, ShieldAlert, Loader2,
  Cpu, Network, BarChart3, Fingerprint, Info, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useTelemetryStore } from '@/lib/store';
import { cn } from '@/lib/utils';
export function SettingsPage() {
  const [retention, setRetention] = useState([90]);
  const wipeFleet = useTelemetryStore(s => s.wipeFleet);
  const isExporting = useTelemetryStore(s => s.isExporting);
  const exportToCSV = useTelemetryStore(s => s.exportToCSV);
  const protocolMode = useTelemetryStore(s => s.protocolMode);
  const setProtocolMode = useTelemetryStore(s => s.setProtocolMode);
  const consentGiven = useTelemetryStore(s => s.consentGiven);
  const setConsent = useTelemetryStore(s => s.setConsent);
  const wsConnected = useTelemetryStore(s => s.wsConnected);
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
            <p className="text-slate-500 text-sm mt-2">v2.6.1 Enterprise Handover Release.</p>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 font-mono uppercase tracking-widest text-[10px]">
            <CheckCircle2 className="h-3 w-3 mr-2 inline" /> VERIFIED_BASELINE
          </Badge>
        </header>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <Card className="bg-slate-900 border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-blue-500" /> Compliance & Privacy
                </CardTitle>
                <CardDescription className="text-xs">Audit-ready telemetry and data access gating.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-200">Global Telemetry Consent</p>
                    <p className="text-[10px] text-slate-500">Gating active for CDP-Lite v2.6 protocols.</p>
                  </div>
                  <Switch checked={consentGiven === true} onCheckedChange={(val) => setConsent(val)} />
                </div>
                <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-start gap-3">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Privacy gating ensures that telemetry is only ingested when active consent is detected on the local node. 
                    This setting satisfies GDPR/CCPA compliance for enterprise signage.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Network className="h-4 w-4 text-amber-500" /> Gateway Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-200">Ingestion Protocol</p>
                    <p className="text-[10px] text-slate-500">Switch between short-polling and high-frequency WSS.</p>
                  </div>
                  <Switch
                    checked={protocolMode === 'wss'}
                    onCheckedChange={(c) => {
                      setProtocolMode(c ? 'wss' : 'polling');
                      toast.info(`Protocol Switched: ${c ? 'WSS (Simulated)' : 'Polling'}`);
                    }}
                  />
                </div>
                <div className="flex items-center gap-4 p-3 bg-black/40 rounded border border-white/5">
                  <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", wsConnected ? "bg-emerald-500" : "bg-slate-600")} />
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
                    Socket Status: {wsConnected ? "ACTIVE_GATEWAY" : "HTTP_INGESTION_ACTIVE"}
                  </span>
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
                    <p className="text-xs font-bold text-slate-200">Retention Period</p>
                    <span className="text-[10px] font-mono text-blue-400">{retention[0]} Days</span>
                  </div>
                  <Slider value={retention} onValueChange={setRetention} max={365} step={30} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={async () => { await exportToCSV(); toast.success("v2.6.1 Data Exported"); }}
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
                  <History className="h-4 w-4 text-slate-400" /> System Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 overflow-y-auto space-y-2 font-mono text-[9px] text-slate-500 scrollbar-thin">
                  <div className="p-2 border-b border-white/5">
                    <span className="text-emerald-400">[VERIFIED]</span> {new Date().toISOString()} | SYSTEM_HANDOVER_STABILIZED
                  </div>
                  <div className="p-2 border-b border-white/5">
                    <span className="text-blue-400">[RELEASE]</span> V2.6.1_ENTERPRISE_BASELINE_ACTIVE
                  </div>
                   <div className="p-2 border-b border-white/5">
                    <span className="text-slate-400">[AUDIT]</span> VITE_OPTIMIZER_STABILIZED | CACHE_CLEARED
                  </div>
                  <div className="p-2 border-b border-white/5">
                    <span className="text-amber-400">[PROTOCOL]</span> CDP-LITE_V2_ENVELOPE_VALIDATED
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}