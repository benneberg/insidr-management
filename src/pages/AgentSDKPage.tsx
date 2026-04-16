import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShieldCheck, Code2, Copy, Check, Lock, Zap, 
  ArrowRight, Download, Terminal, Settings2, Loader2,
  Package, Fingerprint, Globe, RefreshCcw
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
  const jwtSnippet = `// Server-Side Authorization Example
const INSIDR_PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----...-----END PUBLIC KEY-----";
const isValid = jwt.verify(telemetryToken, INSIDR_PUBLIC_KEY, { algorithms: ['RS256'] });`;
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Code snippet copied");
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
  const handleTarballDownload = async () => {
    setIsTarballDownloading(true);
    try {
      await exportAgentTarball();
      toast.success("NPM Tarball generated and downloaded");
    } catch (e) {
      toast.error("Tarball export failed");
    } finally {
      setIsTarballDownloading(false);
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-blue-500 font-bold uppercase tracking-widest text-xs">
            <ShieldCheck className="h-4 w-4" /> v2.5.0-PROD Enterprise Protocol
          </div>
          <h1 className="text-4xl font-extrabold text-white">SDK Distribution</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
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
                    <Code2 className="h-5 w-5 text-blue-500" /> Web Integration Snippet
                  </CardTitle>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase text-[9px]">Production Grade</Badge>
                </div>
                <CardDescription className="text-slate-500">Inject the agent into Chromium-based signage apps via a simple script tag.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Settings2 className="h-3 w-3" /> PII Redaction Rules
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
            <Card className="bg-slate-900 border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Fingerprint className="h-5 w-5 text-amber-500" /> JWT Secret Rotation
                </CardTitle>
                <CardDescription className="text-slate-500">Ensure all incoming telemetry is signed by an enrolled node.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative group">
                  <pre className="p-6 bg-black text-slate-500 font-mono text-xs overflow-x-auto rounded-lg border border-white/5">
                    {jwtSnippet}
                  </pre>
                  <Button size="icon" variant="ghost" onClick={() => handleCopy(jwtSnippet)} className="absolute top-2 right-2 text-slate-400">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <aside className="space-y-6">
            <Card className="bg-blue-600/5 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-xs font-bold text-blue-500 uppercase">Protocol Handshake</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-black/40 rounded border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Mode</span>
                  <Badge variant="outline" className="h-5 text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                    {protocolMode === 'wss' ? 'WEBSOCKET' : 'REST_POLLING'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/40 rounded border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Heartbeat</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-white">30s Interval</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-white/5">
              <CardHeader><CardTitle className="text-xs font-bold text-slate-500 uppercase">Distribution Methods</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleDownload} 
                  disabled={isDownloading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-xs font-bold"
                >
                  {isDownloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                  Download Bundle (.js)
                </Button>
                <Button 
                  onClick={handleTarballDownload}
                  disabled={isTarballDownloading}
                  variant="outline" 
                  className="w-full border-white/10 text-xs font-bold"
                >
                  {isTarballDownloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Package className="h-4 w-4 mr-2 text-amber-500" />}
                  Export NPM Tarball (.tgz)
                </Button>
                <div className="pt-2 text-[9px] text-slate-600 italic text-center">
                  v2.5.0 Compatible with Node 18+ and Chrome 90+
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}