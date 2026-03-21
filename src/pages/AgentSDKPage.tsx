import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Code2, Copy, Check, Lock, Zap, ArrowRight, Download, Terminal, Settings2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTelemetryStore } from '@/lib/store';
export default function AgentSDKPage() {
  const [copied, setCopied] = useState(false);
  const [redactKeys, setRedactKeys] = useState("password, token, secret, cc_number");
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadSDK = useTelemetryStore(s => s.downloadAgentSDK);
  const snippet = `<script
  src="${window.location.origin}/api/agent/bundle"
  data-redact="${redactKeys}"
  async
></script>`;
  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success("Enterprise snippet copied");
    setTimeout(() => setCopied(false), 2000);
  };
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadSDK();
      toast.success("Production bundle downloaded");
    } catch (e) {
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-blue-500 font-bold uppercase tracking-widest text-xs">
            <ShieldCheck className="h-4 w-4" /> v2.5 Enterprise Protocol
          </div>
          <h1 className="text-4xl font-extrabold text-white">SDK Distribution</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Configure your enterprise telemetry agent. Integrated with PII masking,
            JWT-based enrollment, and binary-efficient transport.
          </p>
        </header>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-slate-900 border-white/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-blue-500" /> Bundle Configuration
                  </CardTitle>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase text-[9px]">Production Grade</Badge>
                </div>
                <CardDescription className="text-slate-500">Customize PII redaction rules for compliance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Settings2 className="h-3 w-3" /> Sensitive Keys (Comma Separated)
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
                  <Button size="icon" variant="ghost" onClick={handleCopy} className="absolute top-2 right-2 text-slate-500 hover:text-white">
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="bg-slate-900 border-white/5">
                <CardHeader><CardTitle className="text-white text-sm">PII Masking Preview</CardTitle></CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="p-2 bg-black rounded font-mono">
                    <p className="text-slate-500 opacity-50">// Original</p>
                    <p className="text-blue-400">{"{ password: '123' }"}</p>
                    <p className="text-slate-500 opacity-50 mt-2">// Transmitted</p>
                    <p className="text-emerald-400">{"{ password: '[REDACTED]' }"}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-white/5">
                <CardHeader><CardTitle className="text-white text-sm">Transport Efficiency</CardTitle></CardHeader>
                <CardContent className="text-xs text-slate-400 leading-relaxed">
                  MessagePack simulation reduces telemetry overhead by up to 45% compared to standard JSON strings.
                </CardContent>
              </Card>
            </div>
          </div>
          <aside className="space-y-6">
            <Card className="bg-blue-600/5 border-blue-500/20">
              <CardHeader><CardTitle className="text-xs font-bold text-blue-500 uppercase">Production Assets</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-black p-3 rounded font-mono text-[10px] text-white">
                  bun add @insidr/agent
                </div>
                <Button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-xs font-bold"
                >
                  {isDownloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                  Download Bundle (.js)
                </Button>
                <Button variant="outline" className="w-full border-white/10 text-xs font-bold">
                  View TypeScript Defs
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}