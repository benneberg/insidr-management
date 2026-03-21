import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Shield, Key, RefreshCw, Database, Lock, Trash2, 
  FileJson, Heartbeat, ShieldAlert, History
} from 'lucide-react';
import { toast } from 'sonner';
import { useTelemetryStore } from '@/lib/store';
export function SettingsPage() {
  const [strictJwt, setStrictJwt] = useState(true);
  const [sandboxReq, setSandboxReq] = useState(true);
  const fetchDevices = useTelemetryStore(s => s.fetchDevices);
  const wipeFleet = useTelemetryStore(s => s.wipeFleet);
  const handleWipe = async () => {
    if (confirm("DANGER: This will permanently purge the entire fleet. Continue?")) {
      await wipeFleet();
      toast.success("Fleet data purged");
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Control Plane Hardening</h1>
            <p className="text-slate-500 text-sm mt-2">Manage security protocols and compliance requests.</p>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
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
                <CardDescription className="text-xs">Enforce strict authentication and execution environments.</CardDescription>
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
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Database className="h-4 w-4 text-amber-500" /> Compliance Center
                </CardTitle>
                <CardDescription className="text-xs">GDPR / CCPA data management tools.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-between h-10 border-white/10 text-[10px] font-bold">
                  <span className="flex items-center gap-2"><FileJson className="h-3 w-3" /> GENERATE FULL FLEET ARCHIVE</span>
                  <Badge variant="outline" className="text-[9px]">JSON</Badge>
                </Button>
                <Button variant="outline" className="w-full justify-between h-10 border-white/10 text-[10px] font-bold text-rose-400">
                  <span className="flex items-center gap-2"><Trash2 className="h-3 w-3" /> REQUEST DATA DELETION</span>
                  <Badge variant="outline" className="text-[9px] border-rose-500/20">RIGHT_TO_FORGET</Badge>
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="bg-slate-900 border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <History className="h-4 w-4 text-emerald-500" /> System Audit Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 overflow-y-auto space-y-2 font-mono text-[9px] text-slate-500 scrollbar-thin">
                  <div className="p-2 border-b border-white/5">
                    <span className="text-blue-400">[AUDIT]</span> KEY_ROTATED by admin@insidr.io
                    <p className="text-[8px] mt-1 opacity-50">2025-05-12 14:22:01</p>
                  </div>
                  <div className="p-2 border-b border-white/5">
                    <span className="text-amber-400">[COMPLIANCE]</span> EXPORT_GENERATED for org_83k
                    <p className="text-[8px] mt-1 opacity-50">2025-05-11 09:15:44</p>
                  </div>
                  <div className="p-2 border-b border-white/5">
                    <span className="text-rose-400">[SECURITY]</span> POLICY_UPDATED (STRICT_JWT: TRUE)
                    <p className="text-[8px] mt-1 opacity-50">2025-05-10 18:30:12</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button onClick={handleWipe} variant="destructive" className="w-full h-12 text-xs font-bold uppercase tracking-widest shadow-lg shadow-rose-900/20">
              <ShieldAlert className="h-4 w-4 mr-2" /> FACTORY_RESET_CONTROL_PLANE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}