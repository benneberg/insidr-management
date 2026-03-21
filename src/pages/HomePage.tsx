import React, { useState, useMemo } from 'react';
import { useTelemetryStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Activity, Server, AlertTriangle, ShieldCheck, Zap, Search,
  Filter, Monitor, ArrowUpRight, Clock, FileDown, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
export function HomePage() {
  const devices = useTelemetryStore(s => s.devices);
  const alerts = useTelemetryStore(s => s.alerts);
  const fleetActivity = useTelemetryStore(s => s.fleetActivity);
  const isExporting = useTelemetryStore(s => s.isExporting);
  const exportToCSV = useTelemetryStore(s => s.exportToCSV);
  const [search, setSearch] = useState('');
  const onlineCount = (devices || []).filter(d => d.status === 'online').length;
  const relevantDevices = (devices || []).filter(d => d.status !== 'maintenance');
  const healthScore = relevantDevices.length > 0 ? Math.round(((relevantDevices.filter(d => d.status === 'online').length) / relevantDevices.length) * 100) : 0;
  const filteredDevices = useMemo(() => {
    const list = (devices || []).filter(d =>
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.name.toLowerCase().includes(search.toLowerCase())
    );
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [devices, search]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">v2.0 Control Plane</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Fleet Integrity Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting}
            onClick={() => exportToCSV()}
            className="border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold"
          >
            {isExporting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <FileDown className="h-3 w-3 mr-2 text-blue-400" />}
            Export CSV
          </Button>
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs font-bold uppercase">
            <Link to="/sdk">Enroll Device</Link>
          </Button>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-900 border-white/5 shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-slate-500 uppercase">Nodes Enrolled</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-white">{devices.length}</div></CardContent>
        </Card>
        <Card className="bg-slate-900 border-white/5 shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-slate-500 uppercase">Fleet Health Score</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-emerald-400">{healthScore}%</div></CardContent>
        </Card>
        <Card className="bg-slate-900 border-white/5 shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-slate-500 uppercase">Connectivity Pulse</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-white">{onlineCount}</div></CardContent>
        </Card>
        <Card className="bg-slate-900 border-white/5 shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-slate-500 uppercase">Active Incidents</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-rose-500">{alerts.filter(a => !a.resolved).length}</div></CardContent>
        </Card>
      </div>
      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-white/5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search nodes by identity or IP..."
                className="pl-9 bg-slate-900 border-white/10 text-xs h-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Card className="bg-slate-950 border-white/5 overflow-hidden shadow-2xl">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="border-white/5">
                  <TableHead className="text-[10px] font-mono text-slate-500">Node Identity</TableHead>
                  <TableHead className="text-[10px] font-mono text-slate-500">Last Seen</TableHead>
                  <TableHead className="text-[10px] font-mono text-slate-500">Status</TableHead>
                  <TableHead className="text-[10px] font-mono text-slate-500 text-right">Terminal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map(device => (
                  <TableRow key={device.id} className="border-white/5 hover:bg-blue-500/[0.02]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Monitor className="h-4 w-4 text-slate-500" />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-200">{device.name}</span>
                          <span className="font-mono text-[10px] text-slate-500">{device.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <span className="text-[10px] font-mono text-slate-500">{new Date(device.lastSeen).toLocaleTimeString()}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "text-[9px] uppercase",
                        device.status === 'online' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      )}>{device.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 h-8">
                        <Link to={`/device/${device.id}`}>Inspect <ArrowUpRight className="ml-1.5 h-3 w-3" /></Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
            Global Activity Stream <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
          </h2>
          <div className="space-y-3 h-[500px] overflow-y-auto scrollbar-thin pr-1 overflow-anchor-auto">
            <AnimatePresence mode="popLayout" initial={false}>
              {fleetActivity.length === 0 ? (
                <div className="p-8 text-center text-slate-600 font-mono text-[10px] border border-dashed border-white/5 rounded-lg">
                  WAITING_FOR_DATA_STREAM
                </div>
              ) : (
                fleetActivity.map(act => (
                  <motion.div
                    key={act.id}
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-slate-900 border border-white/5 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[8px] h-3 uppercase bg-white/5">{act.transport || 'v1-STD'}</Badge>
                      <span className="text-[9px] font-mono text-slate-600">{new Date(act.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono truncate">{act.message}</p>
                    <p className="text-[9px] text-slate-600 font-mono mt-1">NODE: {act.deviceId.slice(0, 8)}</p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}