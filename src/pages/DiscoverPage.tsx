import React, { useEffect, useMemo } from 'react';
import { useTelemetryStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Monitor, MapPin, ArrowRight, Activity, Zap, BarChart3, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
export function DiscoverPage() {
  const publicDevices = useTelemetryStore(s => s.publicDevices);
  const fetchPublic = useTelemetryStore(s => s.fetchPublicDevices);
  useEffect(() => {
    fetchPublic();
  }, [fetchPublic]);
  // Simulated fleet grid of 60 nodes
  const fleetPips = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      status: Math.random() > 0.1 ? 'online' : 'offline',
      latency: Math.floor(Math.random() * 150) + 20
    }));
  }, []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-16">
      <header className="text-center space-y-4 max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 font-bold uppercase tracking-widest text-[10px]"
        >
          <Globe className="h-3 w-3" /> Global Discovery Network
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Discover the Insidr Fleet</h1>
        <p className="text-slate-400 text-lg">
          Live visualization of our global signage telemetry network. 
          Monitor hundreds of nodes in real-time across multiple continents.
        </p>
      </header>
      {/* Fleet Scale Visualization */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" /> Global Topology <span className="text-slate-700 font-mono">(Live Mesh)</span>
          </h2>
          <Badge variant="outline" className="bg-slate-900 text-slate-400 border-white/5 text-[9px] uppercase">
            642 Cumulative Nodes Enrolled
          </Badge>
        </div>
        <Card className="bg-slate-950 border-white/5 p-8 shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 gap-2">
            {fleetPips.map(pip => (
              <div 
                key={pip.id}
                className={cn(
                  "h-3 w-3 rounded-sm transition-all duration-500",
                  pip.status === 'online' 
                    ? "bg-emerald-500/40 hover:bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.2)]" 
                    : "bg-slate-800"
                )}
                title={`Node ${pip.id}: ${pip.latency}ms`}
              />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-8 items-center justify-center border-t border-white/5 pt-8">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Avg Latency</p>
                <p className="text-sm font-mono text-white">42ms</p>
              </div>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Throughput</p>
                <p className="text-sm font-mono text-white">8.4 GB/hr</p>
              </div>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Uptime (SLA)</p>
                <p className="text-sm font-mono text-white">99.98%</p>
              </div>
            </div>
          </div>
        </Card>
      </section>
      <section className="space-y-8">
         <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Monitor className="h-4 w-4" /> Featured Public Nodes
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publicDevices.map((device, idx) => (
              <motion.div 
                key={device.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-slate-900 border-white/5 overflow-hidden hover:border-blue-500/50 transition-all group hover:-translate-y-1">
                  <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60 z-10" />
                    <Monitor className="h-12 w-12 text-slate-800" />
                    <div className="absolute top-4 right-4 z-20">
                      <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/20 text-[9px] uppercase font-bold">
                        {device.protocol}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Traffic Stream</span>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold text-white">{device.name}</CardTitle>
                      <Badge variant="outline" className="bg-slate-800 text-slate-300 border-white/10 text-[9px]">{device.os}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <MapPin className="h-3 w-3" /> {device.location || 'Remote Node'}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-black/40 rounded border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Session Integrity</p>
                        <p className="text-xs font-mono text-emerald-400">100%</p>
                      </div>
                      <div className="p-2 bg-black/40 rounded border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Ingest Queue</p>
                        <p className="text-xs font-mono text-slate-300">Clean</p>
                      </div>
                    </div>
                    <Button asChild className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-xs font-bold h-10 group">
                      <Link to={`/device/${device.id}`}>
                        Enter Remote Debugger <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
      </section>
      <section className="bg-blue-600 rounded-2xl p-8 md:p-16 text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-extrabold text-white">Scale your fleet visibility today</h2>
          <p className="text-blue-100 text-xl max-w-2xl mx-auto">
            Zero-dependency agents. Cryptographic security. Millisecond latency.
            Insidr is the telemetry layer your signage deserves.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-10 h-14 text-md">
              <Link to="/sdk">Enroll Your First Node</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 font-bold px-10 h-14 text-md backdrop-blur-sm">
              Talk to Engineering
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}