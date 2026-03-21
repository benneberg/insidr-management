import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Terminal, Shield, Key, Copy, Check, RefreshCw,
  Database, BellRing, Webhook, Lock, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTelemetryStore } from '@/lib/store';
export function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [retention, setRetention] = useState('7d');
  const wipeFleet = useTelemetryStore(s => s.wipeFleet);
  const fetchDevices = useTelemetryStore(s => s.fetchDevices);
  const injectionScript = `<script src="https://agent.insidr.io/v2/agent.js" data-node-id="AUTOGEN" async></script>`;
  const copyScript = () => {
    navigator.clipboard.writeText(injectionScript);
    setCopied(true);
    toast.success("Script copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  const regenerateKey = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      toast.success("Master API Key regenerated successfully");
    }, 1500);
  };
  const handleWipeFleet = async () => {
    setIsWiping(true);
    try {
      await wipeFleet();
      await fetchDevices();
      toast.success("Fleet data wiped successfully");
    } catch (e) {
      toast.error("Failed to wipe fleet data");
    } finally {
      setIsWiping(false);
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Configuration</h1>
          <p className="text-slate-500 text-sm mt-2">Manage your telemetry fleet, security policies, and automation webhooks.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full">
          <Lock className="h-3 w-3 text-blue-500" />
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Encrypted Session</span>
        </div>
      </header>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="bg-slate-900 border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Terminal className="h-4 w-4 text-blue-500" /> Agent Enrollment
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs">Inject this script into your signage application to begin telemetry collection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative group">
                <div className="bg-black p-4 rounded-lg font-mono text-[10px] text-blue-400 overflow-x-auto border border-white/10 leading-relaxed">
                  {injectionScript}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={copyScript}
                  className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <p className="text-[9px] text-slate-600 font-mono italic">
                * Note: The "AUTOGEN" placeholder will be replaced by the device's unique identifier automatically if not provided.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Database className="h-4 w-4 text-amber-500" /> Data Retention
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs">Manage how long telemetry and snapshots are stored in the control plane.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex bg-black p-1 rounded-lg border border-white/10">
                {(['24h', '7d', '30d', '90d'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setRetention(period);
                      toast.info(`Retention set to ${period}`);
                    }}
                    className={cn(
                      "flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all",
                      retention === period ? "bg-amber-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="bg-slate-900 border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Key className="h-4 w-4 text-emerald-500" /> API Infrastructure
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs">Generate tokens for CI/CD and external monitoring tools.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input readOnly value="insidr_live_83kdj1..." className="bg-black border-white/10 text-slate-400 font-mono text-xs" />
                  <Button variant="outline" className="border-white/10 text-[10px] font-bold h-9" onClick={regenerateKey}>
                    {isRegenerating ? <RefreshCw className="h-3 w-3 animate-spin" /> : "REVOKE"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-rose-500/5 border-rose-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-rose-400 text-xs uppercase tracking-widest font-bold">Maintenance Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-slate-500 mb-4 font-mono leading-relaxed">
                CAUTION: Deleting fleet data is permanent. All historical telemetry, command logs, and device fingerprints will be purged.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full h-9 text-[10px] font-bold uppercase tracking-wider">
                    <Trash2 className="h-3 w-3 mr-2" /> WIPE ENTIRE FLEET DATA
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      This action cannot be undone. This will permanently delete all nodes, logs, and telemetry from your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-800 border-white/5 text-white hover:bg-slate-700">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleWipeFleet}
                      disabled={isWiping}
                      className="bg-rose-600 text-white hover:bg-rose-700"
                    >
                      {isWiping ? "Wiping..." : "Yes, Wipe Everything"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}