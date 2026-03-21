import React, { useEffect } from 'react';
import { useTelemetryStore, startPolling } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, ShieldCheck, Zap, Monitor, MapPin, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
export function DiscoverPage() {
  const publicDevices = useTelemetryStore(s => s.publicDevices);
  const fetchPublic = useTelemetryStore(s => s.fetchPublicDevices);
  useEffect(() => {
    fetchPublic();
    const stop = startPolling();
    return stop;
  }, [fetchPublic]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-12">
      <header className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 font-bold uppercase tracking-widest text-[10px]">
          <Globe className="h-3 w-3" /> Global Public Fleet
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Discover Insidr Network</h1>
        <p className="text-slate-400 text-lg">
          Explore production nodes showcasing our telemetry-first approach to remote debugging and fleet integrity.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {publicDevices.map((device, idx) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-slate-900 border-white/5 overflow-hidden hover:border-blue-500/50 transition-colors group">
              <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60 z-10" />
                <Monitor className="h-12 w-12 text-slate-800" />
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Feed</span>
                </div>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold text-white">{device.name}</CardTitle>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px]">{device.os}</Badge>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <MapPin className="h-3 w-3" /> {device.location || 'Remote Node'}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-black/40 rounded border border-white/5">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Uptime</p>
                    <p className="text-xs font-mono text-slate-300">{device.uptime}</p>
                  </div>
                  <div className="p-2 bg-black/40 rounded border border-white/5">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">CPU Load</p>
                    <p className="text-xs font-mono text-emerald-400">Low (8%)</p>
                  </div>
                </div>
                <Button asChild className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-xs font-bold">
                  <Link to={`/device/${device.id}`}>Inspect Node <ArrowRight className="ml-2 h-3 w-3" /></Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <section className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center space-y-6">
        <h2 className="text-3xl font-bold text-white">Ready to secure your fleet?</h2>
        <p className="text-blue-100 text-lg max-w-2xl mx-auto">
          Enroll your first device in minutes and gain total visibility into your locked-down environments.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8">
            <Link to="/sdk">Start Free Enrollment</Link>
          </Button>
          <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 font-bold px-8">
            Contact Enterprise Sales
          </Button>
        </div>
      </section>
    </div>
  );
}