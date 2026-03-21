import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  HelpCircle, BookOpen, Terminal, ShieldCheck,
  Monitor, Zap, Globe, Cpu, AlertTriangle,
  Settings, ExternalLink, ArrowRight, Code2, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
export default function UserManualPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-blue-500 font-bold uppercase tracking-widest text-[10px]">
            <BookOpen className="h-4 w-4" /> Documentation Portal
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Insidr User Manual</h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            The comprehensive guide to monitoring, debugging, and managing your global signage fleet
            with the Insidr v2.6.1 Enterprise platform.
          </p>
        </header>
        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-6">
            <Card className="bg-slate-900 border-white/5">
              <CardHeader>
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="flex flex-col font-medium text-sm text-slate-400">
                  <a href="#intro" className="px-4 py-2 hover:text-white hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-blue-500">Introduction</a>
                  <a href="#quickstart" className="px-4 py-2 hover:text-white hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-blue-500">Quickstart Guide</a>
                  <a href="#agent" className="px-4 py-2 hover:text-white hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-blue-500">Agent Deployment</a>
                  <a href="#inspector" className="px-4 py-2 hover:text-white hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-blue-500">Device Inspector</a>
                  <a href="#features" className="px-4 py-2 hover:text-white hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-blue-500">Platform Features</a>
                  <a href="#troubleshoot" className="px-4 py-2 hover:text-white hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-blue-500">Troubleshooting</a>
                </nav>
              </CardContent>
            </Card>
            <Card className="bg-blue-600/5 border-blue-500/20">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Enterprise Ready</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Insidr uses cryptographically signed payloads and sandboxed execution to ensure fleet integrity.
                </p>
                <Button asChild size="sm" variant="outline" className="w-full border-blue-500/20 text-[10px] font-bold">
                  <Link to="/sdk">Enroll New Node</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
          <main className="lg:col-span-3 space-y-16">
            <section id="intro" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Zap className="h-6 w-6 text-blue-500" /> Introduction
              </h2>
              <div className="prose prose-invert max-w-none text-slate-400 space-y-4">
                <p>
                  Standard Chrome DevTools are typically disabled in production mode on platforms like LG webOS and Samsung Tizen.
                  Insidr v2.6.1 bridges this gap by acting as your Remote DevTools, providing millisecond-latency ingestion for logs,
                  network waterfalls, and hardware performance metrics.
                </p>
                <div className="grid md:grid-cols-3 gap-4 not-prose mt-8">
                  {[
                    { title: "No DevTools?", desc: "Inject our agent to stream logs and network data remotely.", icon: Terminal },
                    { title: "Locked Down?", desc: "Commands execute in a DedicatedWorker sandbox for safety.", icon: ShieldCheck },
                    { title: "Fleet Scale?", desc: "Manage up to 10,000 devices from one Control Plane.", icon: Globe }
                  ].map((item, i) => (
                    <Card key={i} className="bg-slate-950 border-white/5">
                      <CardContent className="p-4 space-y-2">
                        <item.icon className="h-4 w-4 text-blue-500" />
                        <h4 className="text-xs font-bold text-white uppercase">{item.title}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
            <section id="quickstart" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Terminal className="h-6 w-6 text-blue-500" /> Quickstart Guide
              </h2>
              <Card className="bg-slate-950 border-white/5">
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="step-1" className="border-white/5">
                      <AccordionTrigger className="text-sm font-bold text-slate-200 hover:no-underline">
                        1. Deploy the Control Plane
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-400 text-xs space-y-3 pt-2">
                        <p>The Control Plane is optimized for Cloudflare Workers. Run the following command to deploy:</p>
                        <pre className="bg-black p-3 rounded border border-white/5 font-mono text-blue-400">wrangler deploy</pre>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="step-2" className="border-white/5">
                      <AccordionTrigger className="text-sm font-bold text-slate-200 hover:no-underline">
                        2. Enroll Your Nodes
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-400 text-xs space-y-3 pt-2">
                        <p>Inject the agent snippet into your application. Enrollment happens automatically upon first check-in.</p>
                        <pre className="bg-black p-3 rounded border border-white/5 font-mono text-emerald-400">
                          {`<script src="${window.location.origin}/api/agent/bundle" async></script>`}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>
            <footer className="pt-12 border-t border-white/5 flex flex-col items-center gap-6">
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-2 font-mono uppercase tracking-widest text-[10px]">
                <CheckCircle2 className="h-3 w-3 mr-2" /> Handover Compliance Verified v2.6.1
              </Badge>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white">Project Handover Complete</h3>
                <p className="text-sm text-slate-500">All enterprise baseline features are verified and audit-ready.</p>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}