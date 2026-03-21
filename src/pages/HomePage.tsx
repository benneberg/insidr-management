import React, { useEffect, useState } from 'react';
import { useTelemetryStore, startPolling } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Activity, Server, AlertTriangle, ExternalLink, ShieldCheck,
  Zap, Search, Filter, CheckCircle2, Terminal, Clock,
  ArrowUpRight, Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
export function HomePage() {
  const devices = useTelemetryStore(s => s.devices);
  const alerts = useTelemetryStore(s => s.alerts);
  const fleetActivity = useTelemetryStore(s => s.fleetActivity);
  const fetchDevices = useTelemetryStore(s => s.fetchDevices);
  const fetchAlerts = useTelemetryStore(s => s.fetchAlerts);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'error' | 'offline'>('all');
  useEffect(() => {
    const stop = startPolling();
    return stop;
  }, []);
  const filteredDevices = devices.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                         d.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    healthScore: devices.length > 0 ? Math.round((devices.filter(d => d.status === 'online').length / devices.length) * 100) : 100
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Fleet Integrity Plane</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Command Center</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchDevices} className="border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase">
            <Zap className="h-3 w-3 mr-2" /> Sync State
          </Button>
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs font-bold uppercase">
            <Link to="/sdk">Integrate New Agent</Link>
          </Button>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-900 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Server className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fleet Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">Managed endpoints</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="h-16 w-16 text-emerald-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">{stats.healthScore}%</div>
            <div className="h-1 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${stats.healthScore}%` }}
                 className="h-full bg-emerald-500" 
               />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.online}</div>
            <p className="text-[10px] text-emerald-500/80 mt-1 uppercase font-mono flex items-center gap-1">
              <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse" />
              Pulse Active
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-3xl font-bold", stats.critical > 0 ? "text-rose-500" : "text-slate-600")}>
              {stats.critical}
            </div>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">Unresolved issues</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-white/5">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search fleet identity..."
                className="pl-9 bg-slate-900 border-white/10 text-white text-xs h-9 focus-visible:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-white/10">
              {(['all', 'online', 'error'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-4 py-1 text-[10px] font-bold uppercase rounded-md transition-all",
                    statusFilter === status ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <Card className="bg-slate-950 border-white/5 overflow-hidden shadow-2xl">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="border-white/5">
                  <TableHead className="text-slate-500 font-mono text-[10px] uppercase h-10">Node Identity</TableHead>
                  <TableHead className="text-slate-500 font-mono text-[10px] uppercase h-10">Status</TableHead>
                  <TableHead className="text-slate-500 font-mono text-[10px] uppercase h-10 text-right">Terminal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map((device) => (
                  <TableRow key={device.id} className="border-white/5 hover:bg-white/[0.01]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-slate-900 border border-white/10 flex items-center justify-center">
                          <Monitor className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-200">{device.name}</span>
                          <span className="font-mono text-[10px] text-slate-500">{device.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          device.status === 'online' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                          device.status === 'error' ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-slate-600"
                        )} />
                        <span className="text-xs font-mono text-slate-400 capitalize">{device.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-8">
                        <Link to={`/device/${device.id}`}>
                          Inspect <ArrowUpRight className="ml-1.5 h-3 w-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="h-4 w-4" /> Global Stream
            </h2>
            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-none pr-1">
            <AnimatePresence mode="popLayout">
              {fleetActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3 bg-slate-900/50 border border-white/5 rounded-lg group hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn(
                      "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded",
                      activity.type === 'log' ? (activity.level === 'error' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500') : 'bg-emerald-500/10 text-emerald-500'
                    )}>
                      {activity.type}
                    </span>
                    <span className="text-[9px] font-mono text-slate-600 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> {new Date(activity.timestamp).toLocaleTimeString([], { hour12: false })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono leading-tight truncate">
                    {activity.message}
                  </p>
                  <p className="text-[9px] text-slate-600 font-mono mt-2 uppercase tracking-tighter">
                    NODE_ID: {activity.deviceId.slice(0, 8)}...
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
            {fleetActivity.length === 0 && (
              <div className="p-8 text-center border border-dashed border-white/5 rounded-xl">
                <p className="text-[10px] text-slate-600 uppercase font-bold">Waiting for events...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}