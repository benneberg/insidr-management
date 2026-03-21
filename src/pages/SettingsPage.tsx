import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Terminal, Shield, Key, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
export function SettingsPage() {
  const [copied, setCopied] = React.useState(false);
  const injectionScript = `<script src="https://agent.insidr.io/v2/agent.js" data-node-id="AUTOGEN" async></script>`;
  const copyScript = () => {
    navigator.clipboard.writeText(injectionScript);
    setCopied(true);
    toast.success("Script copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">System Configuration</h1>
        <p className="text-slate-500 text-sm mt-2">Manage your telemetry endpoints and security tokens.</p>
      </header>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="bg-slate-900 border-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-blue-500" /> Agent Enrollment
              </CardTitle>
              <CardDescription className="text-slate-500">Inject this script into your signage application to begin telemetry collection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative group">
                <div className="bg-black p-4 rounded-lg font-mono text-xs text-blue-400 overflow-x-auto border border-white/10">
                  {injectionScript}
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={copyScript}
                  className="absolute top-2 right-2 text-slate-500 hover:text-white"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-slate-600">
                * Note: Replace "AUTOGEN" with a unique device identifier if not using automatic MAC-based enrollment.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" /> Compliance & Safety
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">PII Redaction</p>
                  <p className="text-xs text-slate-500">Automatically mask emails/passwords in logs.</p>
                </div>
                <div className="h-5 w-9 bg-emerald-500 rounded-full relative p-1 cursor-pointer">
                  <div className="h-3 w-3 bg-white rounded-full ml-auto" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Snapshot Consent</p>
                  <p className="text-xs text-slate-500">Requires local device permission for screenshots.</p>
                </div>
                <div className="h-5 w-9 bg-slate-700 rounded-full relative p-1 cursor-pointer">
                  <div className="h-3 w-3 bg-white rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="bg-slate-900 border-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-500" /> API Access Tokens
              </CardTitle>
              <CardDescription className="text-slate-500">Generate tokens for CI/CD integration and external monitoring.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input readOnly value="insidr_live_83kdj1..." className="bg-black border-white/10 text-slate-400 font-mono" />
                  <Button variant="outline" className="border-white/10 shrink-0">Revoke</Button>
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">CREATE NEW TOKEN</Button>
            </CardContent>
          </Card>
          <Card className="bg-rose-500/5 border-rose-500/10">
            <CardHeader>
              <CardTitle className="text-rose-400 text-sm">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 mb-4">Deleting fleet data is permanent and cannot be undone.</p>
              <Button variant="destructive" className="w-full h-8 text-[10px] font-bold">WIPE FLEET TELEMETRY</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}