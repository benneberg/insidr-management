import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Shield, Key, RefreshCw, Database, Lock, Trash2, 
  FileJson, Activity, ShieldAlert, History, Globe, Loader2,
  Cpu, Network
} from 'lucide-react';
import { toast } from 'sonner';
import { useTelemetryStore } from '@/lib/store';
export function SettingsPage() {
  const [strictJwt, setStrictJwt] = useState(true);
  const [sandboxReq, setSandboxReq] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [retention, setRetention] = useState([90]);
  const [tokenExpiry, setTokenExpiry] = useState([7]); // days
  const wipeFleet = useTelemetryStore(s => s.wipeFleet);
  const isExporting = useTelemetryStore(s => s.isExporting);
  const exportToCSV = useTelemetryStore(s => s.exportToCSV);
  const protocolMode = useTelemetryStore(s => s.protocolMode);
  const setProtocolMode = useTelemetryStore(s => s.setProtocolMode);
  const handleWipe = async () => {
    const doubleCheck = prompt("DANGER: This action is irreversible. Type 'PURGE_FLEET' to confirm.");
    if (doubleCheck === 'PURGE_FLEET') {
      await wipeFleet();
      toast.success("Fleet data purged successfully");
    } else {
      toast.error("Wipe cancelled: Confirmation mismatch");
    }
  };
  const handleExport = async () => {
    try {
      await exportToCSV();
      toast.success("Compliance archive generated");
    } catch (e) {
      toast.error("Export failed");
    }
  };
  const handleProtocolToggle = (checked: boolean) => {
    const newMode = checked ? 'wss' : 'polling';
    setProtocolMode(newMode);
    toast.info(`Protocol set to ${newMode.toUpperCase()}`);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">System Hardening</h1>
            <p className="text-slate-500 text-sm mt-2">v2.5 Enterprise Compliance & Protocol Configuration.</p>
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
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-200">Mandatory Sandbox</p>
                    <p className="text-[10px] text-slate-500">Require DedicatedWorker for remote instructions.</p>
                  </div>
                  <Switch checked={sandboxReq} onCheckedChange={setSandboxReq} />
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-6">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-blue-500">Simulated WebSocket (WSS) Gateway</p>
                    <p className="text-[10px] text-slate-500 font-mono">[EXPERIMENTAL] Opt-in for lower latency.</p>
                  </div>
                  <Switch 
                    checked={protocolMode === 'wss'} 
                    onCheckedChange={handleProtocolToggle} 
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-500" /> Token Policies
                </CardTitle>
                <CardDescription className="text-xs">Manage enrollment life cycles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-200">Standard Token Expiry</p>
                    <span className="text-[10px] font-mono text-blue-400">{tokenExpiry[0]} Days</span>
                  </div>
                  <Slider 
                    value={tokenExpiry} 
                    onValueChange={setTokenExpiry} 
                    max={30} 
                    min={1} 
                    step={1} 
                  />
                </div>
                <Button variant="outline" className="w-full border-white/10 text-[10px] font-bold h-10">
                  ROTATE GLOBAL SIGNING KEY
                </Button>
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
                  <Slider 
                    value={retention} 
                    onValueChange={setRetention} 
                    max={365} 
                    step={30} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={handleExport}
                    disabled={isExporting}
                    variant="outline" 
                    className="border-white/10 text-[10px] font-bold"
                  >
                    {isExporting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <FileJson className="h-3 w-3 mr-2 text-blue-400" />}
                    EXPORT ARCHIVE
                  </Button>
                  <Button asChild variant="outline" className="border-white/10 text-[10px] font-bold">
                    <a href="/api/client-errors" download="logs.json">DIAGNOSTIC DUMP</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-950 border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <History className="h-4 w-4 text-slate-400" /> Audit Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 overflow-y-auto space-y-2 font-mono text-[9px] text-slate-500 scrollbar-thin">
                  <div className="p-2 border-b border-white/5">
                    <span className="text-emerald-400">[SYSTEM]</span> PROTOCOL_UPGRADED to v2.5.0-PROD
                  </div>
                  <div className="p-2 border-b border-white/5">
                    <span className="text-blue-400">[SECURITY]</span> WSS_GATEWAY_{protocolMode === 'wss' ? 'ENABLED' : 'DISABLED'}
                  </div>
                  <div className="p-2 border-b border-white/5">
                    <span className="text-amber-400">[COMPLIANCE]</span> RETENTION_POLICY_SYNCED ({retention[0]}d)
                  </div>
                  <div className="p-2 border-b border-white/5">
                    <span className="text-rose-400">[ADMIN]</span> COMPLIANCE_ARCHIVE_GENERATED
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button onClick={handleWipe} variant="destructive" className="w-full h-12 text-xs font-bold uppercase tracking-widest shadow-lg shadow-rose-900/20 group">
              <ShieldAlert className="h-4 w-4 mr-2 group-hover:animate-bounce" /> FACTORY_RESET_FLEET
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}