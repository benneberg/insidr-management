import React, { useState, useMemo, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTelemetryStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Activity, Server, ShieldCheck, Search,
  Monitor, ArrowUpRight, FileDown, Loader2, CheckCircle2,
  Clock, MapPin, Database, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { LogEvent, Device } from '@shared/types';
export function HomePage() {
  const devices = useTelemetryStore(useShallow(s => s.devices));
  const alerts = useTelemetryStore(useShallow(s => s.alerts));
  const fleetActivity = useTelemetryStore(useShallow(s => s.fleetActivity));
  const isExporting = useTelemetryStore(s => s.isExporting);
  const exportToCSV = useTelemetryStore(s => s.exportToCSV);
  const lastUpdated = useTelemetryStore(s => s.lastUpdated);
  const pollingStatus = useTelemetryStore(s => s.pollingStatus);
  const [search, setSearch] = useState('');
  useEffect(() => {
    document.title = "Insidr Control | Fleet Health v2.6.1";
  }, []);
  const alertsCount = useMemo(() => (alerts || []).filter(a => !a.resolved).length, [alerts]);
  const stats = useMemo(() => {
    const online = devices.filter(d => d.status === 'online').length;
    const avgMem = devices.length > 0 ? Math.round(devices.reduce((acc, d) => acc + (d.memoryUsage || 0), 0) / devices.length) : 0;
    const health = devices.length > 0 ? Math.round((online / devices.length) * 100) : 0;
    return { online, avgMem, health };
  }, [devices]);
  const filteredDevices = useMemo(() => {
    const list = devices.filter((d: Device) =>
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.ip.includes(search)
    );
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [devices, search]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-blue-500">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">v2.6.1-enterprise Protocol</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-bold text-emerald-500 uppercase">
              <CheckCircle2 className="h-3 w-3" />
              Ingestion: {String(pollingStatus).toUpperCase()}
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Fleet Integrity Console</h1>
          {lastUpdated && (
            <p className="text-[10px] font-mono text-muted-foreground uppercase">Last Sync: {new Date(lastUpdated).toLocaleTimeString()} • REAL-TIME MAPPING ACTIVE</p>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting}
            onClick={() => exportToCSV()}
            className="border-input bg-secondary hover:bg-accent text-xs font-bold"
          >
            {isExporting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <FileDown className="h-3 w-3 mr-2 text-blue-500" />}
            Export Fleet Data
          </Button>
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:opacity-90 text-xs font-bold uppercase shadow-sm">
            <Link to="/sdk">Enroll Node</Link>
          </Button>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Active Nodes', value: devices.length, color: 'text-foreground', icon: Server },
          { label: 'Fleet Health', value: `${stats.health}%`, color: 'text-emerald-500', icon: Activity },
          { label: 'Avg. Load', value: `${stats.avgMem}%`, color: 'text-blue-500', icon: Database },
          { label: 'Total Incidents', value: alertsCount, color: 'text-destructive', icon: Zap }
        ].map((stat, i) => (
          <Card key={i} className="bg-secondary/40 border-input shadow-sm hover:bg-secondary/60 transition-colors group">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-center">
                {stat.label}
                <stat.icon className="h-3 w-3 opacity-50" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-3xl font-bold font-mono tracking-tighter group-hover:translate-x-1 transition-transform origin-left", stat.color)}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4 bg-secondary p-4 rounded-xl border border-input">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter fleet by system ID, location or node IP address..."
              className="pl-9 bg-background border-input text-xs h-10 focus:ring-1 focus:ring-primary/50 transition-colors"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6 px-4 shrink-0">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Network Latency</span>
              <span className="text-[10px] font-mono text-emerald-500">28ms AVG</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Fleet Uptime</span>
              <span className="text-[10px] font-mono text-blue-500">99.98%</span>
            </div>
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-4 items-start">
          <div className="lg:col-span-3">
            <Card className="bg-background border-input overflow-hidden shadow-md">
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow className="border-input">
                    <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Node / ID</TableHead>
                    <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Location / IP</TableHead>
                    <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Status / Uptime</TableHead>
                    <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Memory</TableHead>
                    <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider text-right">Console</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevices.map((device: Device) => (
                    <TableRow key={device.id} className="border-input hover:bg-accent transition-colors group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Monitor className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground">{device.name}</span>
                            <span className="font-mono text-[9px] text-muted-foreground tracking-tighter uppercase">{device.id}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-2 w-2" /> {device.location || 'Remote'}
                          </span>
                          <span className="font-mono text-[9px] text-muted-foreground">{device.ip}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className={cn(
                            "text-[8px] uppercase font-bold w-fit px-1.5 py-0 border-none",
                            device.status === 'online' ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                          )}>{device.status}</Badge>
                          <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                            <Clock className="h-2 w-2" /> {device.uptime}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="w-24">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-muted-foreground">MEM</span>
                            <span className="text-foreground">{device.memoryUsage}%</span>
                          </div>
                          <Progress value={device.memoryUsage} className="h-1" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="ghost" className="text-primary hover:text-primary/80 h-8 font-bold text-[10px] uppercase">
                          <Link to={`/device/${device.id}`}>Inspect <ArrowUpRight className="ml-1.5 h-3 w-3" /></Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredDevices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground uppercase text-[10px] font-mono">No nodes match criteria</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
          <div className="space-y-4 lg:sticky lg:top-20">
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
              Activity Stream <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </h2>
            <div className="space-y-3 h-auto max-h-[600px] lg:h-[calc(100vh-32rem)] overflow-y-auto pr-2 scrollbar-thin">
              <AnimatePresence mode="popLayout" initial={false}>
                {(fleetActivity || []).length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground font-mono text-[10px] border border-dashed border-input rounded-lg flex flex-col items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin opacity-10" />
                    AWAITING_INGESTION...
                  </div>
                ) : (
                  fleetActivity.map((act: LogEvent) => (
                    <motion.div
                      key={act.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-secondary/50 border border-input rounded-lg hover:border-primary/20 transition-colors shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Badge variant="outline" className="text-[8px] h-3.5 uppercase bg-background border-input text-muted-foreground font-mono">RTP_V2</Badge>
                        <span className="text-[9px] font-mono text-muted-foreground">{new Date(act.timestamp).toLocaleTimeString([], {hour12: false})}</span>
                      </div>
                      <p className="text-[11px] text-foreground font-mono leading-tight mb-1 break-words">{act.message}</p>
                      <p className="text-[8px] text-muted-foreground font-mono uppercase tracking-tighter">ID: {act.deviceId.slice(0, 8)}</p>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}