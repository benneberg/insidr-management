import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Cpu, 
  Network, 
  Terminal, 
  Zap,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
export default function AgentSDKPage() {
  const [copied, setCopied] = useState(false);
  const sdkSnippet = `<script 
  src="https://insidr.io/api/agent/sdk" 
  data-node-id="SIGNAGE_NODE_01" 
  async
></script>`;
  const copyToClipboard = () => {
    navigator.clipboard.writeText(sdkSnippet);
    setCopied(true);
    toast.success("Integration snippet copied");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-blue-500">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-widest">v1.0 Reliable Telemetry</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Agent SDK & Integration
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl leading-relaxed">
            Deploy the Insidr Agent to your fleet in seconds. Our zero-dependency SDK handles 
            buffering, sequence tracking, and high-performance metrics out of the box.
          </p>
        </header>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-slate-900 border-white/5 overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-blue-500" /> Quick Start
                  </CardTitle>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">JS SDK</Badge>
                </div>
                <CardDescription className="text-slate-500">
                  Add this script to the <code>&lt;head&gt;</code> of your Chromium-based signage application.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative group">
                  <pre className="p-8 bg-black font-mono text-sm text-blue-400 overflow-x-auto leading-relaxed">
                    {sdkSnippet}
                  </pre>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={copyToClipboard}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white hover:bg-white/10"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-slate-400" /> Protocol Reference (RTP v1.0)
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "IndexedDB Buffering",
                    desc: "Events are locally persisted to handle network drops. Up to 5000 events buffered.",
                    icon: Cpu
                  },
                  {
                    title: "Sequence Acknowledgment",
                    desc: "Every batch is signed with a sequence ID. Server ACKs ensure zero data loss.",
                    icon: Zap
                  },
                  {
                    title: "Exponential Backoff",
                    desc: "Retries intelligently scale from 1s to 60s during outages to preserve device CPU.",
                    icon: ArrowRight
                  },
                  {
                    title: "Lightweight Ingestion",
                    desc: "Gzip-compatible JSON payloads optimized for cellular or low-bandwidth IoT links.",
                    icon: Network
                  }
                ].map((feature, i) => (
                  <Card key={i} className="bg-slate-900/50 border-white/5 hover:border-white/10 transition-colors">
                    <CardContent className="p-6">
                      <feature.icon className="h-8 w-8 text-blue-500 mb-4" />
                      <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          <aside className="space-y-6">
            <Card className="bg-blue-600/5 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-sm text-blue-400 uppercase tracking-widest font-bold">API Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  The Agent uses a standard REST endpoint for ingestion. You can also build custom agents using our Open API spec.
                </p>
                <div className="p-3 bg-black rounded border border-white/5 font-mono text-[10px] text-emerald-400">
                  POST /api/devices/:id/ingest
                </div>
                <Button variant="outline" className="w-full border-blue-500/20 text-blue-400 hover:bg-blue-500/10 h-9 text-xs">
                  View API Documentation
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-white/5">
              <CardHeader>
                <CardTitle className="text-sm text-white uppercase tracking-widest font-bold flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-slate-500" /> Manual Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Custom Log Level:</p>
                  <pre className="p-3 bg-black rounded text-[10px] text-blue-300 font-mono">
                    window.insidr.log('error', 'msg');
                  </pre>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Custom Metrics:</p>
                  <pre className="p-3 bg-black rounded text-[10px] text-blue-300 font-mono">
                    window.insidr.metric(&#123; fps: 60 &#125;);
                  </pre>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}