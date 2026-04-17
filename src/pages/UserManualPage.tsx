import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, BookOpen, Terminal, ShieldCheck, 
  Monitor, Zap, Globe, Cpu, AlertTriangle, 
  Settings, ExternalLink, ArrowRight, Code2
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
            with the Insidr Remote DevTools platform.
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
            {/* Introduction */}
            <section id="intro" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Zap className="h-6 w-6 text-blue-500" /> Introduction
              </h2>
              <div className="prose prose-invert max-w-none text-slate-400 space-y-4">
                <p>
                  In modern digital signage environments, devices are often locked down, behind firewalls, or physically inaccessible. 
                  Standard Chrome DevTools are typically disabled in production mode on platforms like LG webOS and Samsung Tizen, 
                  leaving developers blind when application errors occur.
                </p>
                <p className="font-bold text-slate-200">
                  Insidr bridges this gap by acting as your Remote DevTools.
                </p>
                <div className="grid md:grid-cols-3 gap-4 not-prose mt-8">
                  {[
                    { title: "No DevTools?", desc: "Inject our agent to stream logs, network, and performance data remotely.", icon: Terminal },
                    { title: "Locked Down?", desc: "Commands are executed in a DedicatedWorker sandbox for maximum safety.", icon: ShieldCheck },
                    { title: "Fleet Scale?", desc: "Manage 1 to 10,000 devices from a single centralized Control Plane.", icon: Globe }
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
            {/* Quickstart */}
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
                        <p>The Control Plane is built on Cloudflare Workers and Durable Objects. Deploy it to your Cloudflare account using Wrangler.</p>
                        <pre className="bg-black p-3 rounded border border-white/5 font-mono text-blue-400">wrangler deploy</pre>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="step-2" className="border-white/5">
                      <AccordionTrigger className="text-sm font-bold text-slate-200 hover:no-underline">
                        2. Inject the Agent
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-400 text-xs space-y-3 pt-2">
                        <p>Add the following script tag to the head of your signage application's HTML file:</p>
                        <pre className="bg-black p-3 rounded border border-white/5 font-mono text-emerald-400">
                          {`<script src="https://your-insidr-host.com/api/agent/bundle" async></script>`}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="step-3" className="border-white/5">
                      <AccordionTrigger className="text-sm font-bold text-slate-200 hover:no-underline">
                        3. Verify Enrollment
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-400 text-xs space-y-3 pt-2">
                        <p>Open the Insidr Fleet Dashboard. Your device should appear in the "Fleet Overview" table within seconds of application startup.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>
            {/* Agent Deployment */}
            <section id="agent" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Cpu className="h-6 w-6 text-blue-500" /> Agent Deployment
              </h2>
              <Tabs defaultValue="webos" className="w-full">
                <TabsList className="bg-slate-900 border-white/5 p-1 mb-4 h-11">
                  <TabsTrigger value="webos" className="text-xs font-bold px-6">LG webOS 6.0+</TabsTrigger>
                  <TabsTrigger value="signageos" className="text-xs font-bold px-6">signageOS</TabsTrigger>
                  <TabsTrigger value="android" className="text-xs font-bold px-6">Android TV</TabsTrigger>
                </TabsList>
                <TabsContent value="webos" className="space-y-4">
                  <div className="bg-slate-950 border border-white/5 rounded-xl p-6 space-y-4">
                    <h3 className="text-white font-bold text-sm">Deployment on LG webOS</h3>
                    <ul className="list-disc list-inside text-xs text-slate-400 space-y-2 ml-2">
                      <li>Package your web app using the LG webOS CLI.</li>
                      <li>Ensure <code className="text-blue-400">"trustLevel": "trusted"</code> is set in your <code className="text-blue-400">appinfo.json</code>.</li>
                      <li>Inject the Insidr agent snippet just before the closing body tag.</li>
                      <li>Deploy to the device via the Developer Mode app or your MDM.</li>
                    </ul>
                    <Button asChild size="sm" variant="outline" className="border-white/10 text-[10px] font-bold">
                      <a href="https://webostv.developer.lge.com" target="_blank" rel="noreferrer">
                        LGE Developer Portal <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="signageos" className="space-y-4">
                  <div className="bg-slate-950 border border-white/5 rounded-xl p-6 space-y-4">
                    <h3 className="text-white font-bold text-sm">signageOS Applet Integration</h3>
                    <p className="text-xs text-slate-400">
                      Insidr is fully compatible with signageOS. For the best experience, add the agent to your 
                      main Applet entry point.
                    </p>
                    <div className="p-4 bg-black rounded font-mono text-[10px] text-slate-500">
                      // applet.js<br />
                      sos.onReady().then(() =&gt; &#123;<br />
                      &nbsp;&nbsp;console.log("signageOS ready");<br />
                      &nbsp;&nbsp;// Agent initializes via script injection<br />
                      &#125;);
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="android" className="space-y-4">
                  <div className="bg-slate-950 border border-white/5 rounded-xl p-6 space-y-4 text-center">
                    <Monitor className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 italic">Android TV guide coming soon to Enterprise Tier customers.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </section>
            {/* Device Inspector */}
            <section id="inspector" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Monitor className="h-6 w-6 text-blue-500" /> Device Inspector Overview
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: "Console", desc: "Real-time, color-coded terminal output. Features auto-scroll and level filtering (Info/Warn/Error).", icon: Terminal },
                  { title: "Network", desc: "Waterfall view of all XHR/Fetch requests. Inspect status codes, durations, and protocol health.", icon: Globe },
                  { title: "Performance", desc: "Live graphs for CPU utilization, Memory pressure, and Frame Stability (FPS).", icon: Cpu },
                  { title: "Viewport", desc: "Low-latency render preview and historical snapshot buffer to see exactly what is on-screen.", icon: Monitor }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/5 bg-slate-950">
                    <div className="h-10 w-10 shrink-0 bg-blue-600/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                      <item.icon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-200">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            {/* Troubleshooting */}
            <section id="troubleshoot" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-rose-500" /> Troubleshooting
              </h2>
              <Card className="bg-rose-950/10 border-rose-500/20">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-rose-500 uppercase flex items-center gap-2">
                       No Data in Dashboard?
                    </h4>
                    <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                      <li>Verify the device has public internet access to reach the Control Plane API.</li>
                      <li>Check the browser console on the device (if accessible) for CSP (Content Security Policy) errors.</li>
                      <li>Ensure the <code className="text-rose-400">id</code> parameter in the ingest URL matches your enrollment.</li>
                    </ul>
                  </div>
                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <h4 className="text-sm font-bold text-amber-500 uppercase flex items-center gap-2">
                       "Gap Detected" Alert
                    </h4>
                    <p className="text-xs text-slate-400">
                      This occurs when the sequence numbering is interrupted. It usually indicates intermittent network loss 
                      where the agent buffered data but was unable to transmit it within the heartbeat interval.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
            <footer className="pt-12 border-t border-white/5 text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Need Enterprise Support?</h3>
                <p className="text-sm text-slate-500">Custom protocol implementations and on-premise deployments are available.</p>
              </div>
              <div className="flex justify-center gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700 font-bold px-8 h-12">
                   Contact Fleet Operations
                </Button>
                <Button variant="outline" className="border-white/10 hover:bg-white/5 font-bold px-8 h-12">
                   Developer API Reference
                </Button>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}