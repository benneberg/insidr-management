import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Code2, Copy, Check, Lock, Zap, ArrowRight, Download, Terminal } from 'lucide-react';
import { toast } from 'sonner';
export default function AgentSDKPage() {
  const [copied, setCopied] = useState(false);
  const snippet = `<script src="${window.location.origin}/api/agent/sdk" async></script>`;
  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success("Snippet copied");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-blue-500 font-bold uppercase tracking-widest text-xs">
          <ShieldCheck className="h-4 w-4" /> v2.0 Sandbox Protocol
        </div>
        <h1 className="text-4xl font-extrabold text-white">SDK & Integration</h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Deploy the next generation of remote debugging. Our v2.0 agent utilizes MessagePack 
          for low-bandwidth transport and a non-eval sandbox for enterprise security.
        </p>
      </header>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-slate-900 border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Code2 className="h-5 w-5 text-blue-500" /> Quick Ingress
              </CardTitle>
              <CardDescription className="text-slate-500">Universal loader for signage & IoT devices.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t border-white/5 relative">
              <pre className="p-8 bg-black text-blue-400 font-mono text-sm overflow-x-auto">
                {snippet}
              </pre>
              <Button size="icon" variant="ghost" onClick={handleCopy} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-500" /> Security & Sandboxing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-400 text-sm leading-relaxed">
              <p>
                Insidr v2.0 strictly forbids <code>eval()</code> and <code>new Function()</code>. All commands 
                dispatched from the Control Plane are received via a MessageChannel proxy.
              </p>
              <div className="bg-black/50 p-4 rounded-lg border border-white/5 font-mono text-xs">
                Allowed Contexts: ["reload", "clear_cache", "heartbeat"]
              </div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2"><Zap className="h-5 w-5 text-emerald-500" /> v2.0 Features</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: "MessagePack Support", d: "60% smaller payloads for cellular signage." },
                { t: "Viewport Snapshots", d: "Differential canvas updates under 250KB." },
                { t: "Sequence Auditing", d: "Zero-data-loss RTP sequence enforcement." },
                { t: "PII Redaction", d: "Automatic scrubbing of sensitive input fields." }
              ].map((f, i) => (
                <div key={i} className="p-4 bg-slate-900 border border-white/5 rounded-lg">
                  <h4 className="text-white font-bold text-sm mb-1">{f.t}</h4>
                  <p className="text-xs text-slate-500">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <aside className="space-y-6">
          <Card className="bg-blue-600/5 border-blue-500/20">
            <CardHeader><CardTitle className="text-xs font-bold text-blue-500 uppercase">Artifacts</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-xs border-white/10" onClick={() => toast.success("Download started")}>
                <Download className="h-3 w-3 mr-2" /> Minified JS (4.2KB)
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs border-white/10">
                <Terminal className="h-3 w-3 mr-2" /> CLI Enrollment Tool
              </Button>
            </CardContent>
          </Card>
          <div className="p-4 rounded-xl border border-dashed border-white/10 text-center space-y-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Migrating from v1?</p>
            <Button variant="ghost" className="text-xs text-blue-400 hover:text-blue-300 h-8">View Migration Guide <ArrowRight className="h-3 w-3 ml-2" /></Button>
          </div>
        </aside>
      </div>
    </div>
  );
}