import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ShieldCheck, Code2, Copy, Check, Zap,
  Download, Terminal, Settings2, Loader2,
  Package, Rocket, CheckCircle2, FileJson
} from 'lucide-react';
import { toast } from 'sonner';
import { useTelemetryStore } from '@/lib/store';
export default function AgentSDKPage() {
  const [copied, setCopied] = useState(false);
  const [redactKeys, setRedactKeys] = useState("password, token, secret, cc_number");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTarballDownloading, setIsTarballDownloading] = useState(false);
  const downloadSDK = useTelemetryStore(s => s.downloadAgentSDK);
  const exportAgentTarball = useTelemetryStore(s => s.exportAgentTarball);
  const protocolMode = useTelemetryStore(s => s.protocolMode);
  const snippet = `<script
  src="${window.location.origin}/api/agent/bundle"
  data-redact="${redactKeys}"
  async
></script>`;
  const payloadPreview = useMemo(() => ({
    sequence: 124,
    nodeId: "nyc-billboard-01",
    timestamp: new Date().toISOString(),
    metrics: [{ cpu: 12, mem: 42, fps: 60 }],
    logs: [{ level: "info", message: "Content loop initialized" }],
    redacted_fields: redactKeys.split(',').map(k => k.trim())
  }), [redactKeys]);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Code snippet copied");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 lg:py-16 space-y-16">
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-blue-500 font-bold uppercase tracking-widest text-xs">
            <ShieldCheck className="h-4 w-4" /> v2.5.0-PROD Enterprise Protocol
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">SDK Distribution</h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Distribute the telemetry layer across your global fleet. Featuring
            binary-efficient transport and cryptographic enrollment.
          </p>
        </header>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-slate-900 border-white/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-blue-500" /> Integration Snippet
                  </CardTitle>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase text-[9px]">Production Grade</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Settings2 className="h-3 w-3" /> PII Redaction Rules (CSV)
                  </label>
                  <Input
                    value={redactKeys}
                    onChange={(e) => setRedactKeys(e.target.value)}
                    className="bg-black border-white/10 text-blue-400 font-mono text-xs"
                  />
                </div>
                <div className="relative group">
                  <pre className="p-6 bg-black text-slate-400 font-mono text-xs overflow-x-auto rounded-lg border border-white/5">
                    {snippet}
                  </pre>
                  <Button size="icon" variant="ghost" onClick={() => handleCopy(snippet)} className="absolute top-2 right-2 text-slate-500 hover:text-white">
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-950 border-white/5">
              <CardHeader>
                <CardTitle className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                  <FileJson className="h-4 w-4 text-amber-500" /> Ingestion Payload Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-black rounded-lg text-[10px] font-mono text-slate-400 overflow-x-auto border border-white/5">
                  {JSON.stringify(payloadPreview, null, 2)}
                </pre>
              </CardContent>
            </Card>
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Rocket className="h-6 w-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-white">Signage Hardening Checklist</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { title: "CSP Settings", desc: "Ensure your Content-Security-Policy allows fetch/connect to the Insidr API endpoint.", icon: ShieldCheck },
                  { title: "LG webOS 6.0+", desc: "Add 'trustLevel': 'trusted' in appinfo.json to enable DedicatedWorker metrics.", icon: Zap },
                  { title: "Network Isolation", desc: "Allow outbound HTTPS traffic on port 443 for agent heartbeat synchronization.", icon: Package },
                  { title: "Audit Trail", desc: "Enable 'Sandbox Mode' in Settings to ensure all remote commands are executed in a sub-thread.", icon: Rocket }
                ].map((item, i) => (
                  <Card key={i} className="bg-slate-950 border-white/5">
                    <CardContent className="p-6 space-y-3">
                      <item.icon className="h-4 w-4 text-blue-500" />
                      <h3 className="text-white font-bold text-sm">{item.title}</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
          <aside className="space-y-6">
            <Card className="bg-blue-600/5 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-xs font-bold text-blue-500 uppercase">Handshake Protocol</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-black/40 rounded border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Mode</span>
                  <Badge variant="outline" className="h-5 text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase">
                    {protocolMode.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/40 rounded border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Check-in</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-white">30s Interval</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-white/5">
              <CardHeader><CardTitle className="text-xs font-bold text-slate-500 uppercase">Binary Distribution</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={async () => {
                    setIsDownloading(true);
                    try { await downloadSDK(); toast.success("Bundle downloaded"); } 
                    finally { setIsDownloading(false); }
                  }}
                  disabled={isDownloading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-xs font-bold h-11"
                >
                  {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Download Bundle (.js)
                </Button>
                <Button
                  onClick={async () => {
                    setIsTarballDownloading(true);
                    try { await exportAgentTarball(); toast.success("Tarball downloaded"); } 
                    finally { setIsTarballDownloading(false); }
                  }}
                  disabled={isTarballDownloading}
                  variant="outline"
                  className="w-full border-white/10 text-xs font-bold h-11"
                >
                  {isTarballDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4 mr-2 text-amber-500" />}
                  Export NPM Tarball (.tgz)
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-slate-950 border-white/5">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-10 w-10 bg-emerald-500/10 rounded flex items-center justify-center border border-emerald-500/20">
                   <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Auto Enrollment</h4>
                  <p className="text-[10px] text-slate-500">Nodes check-in automatically upon injection.</p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}