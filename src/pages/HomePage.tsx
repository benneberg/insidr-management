import React, { useEffect } from 'react';
import { useTelemetryStore, startPolling } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Server, AlertTriangle, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
export function HomePage() {
  const devices = useTelemetryStore(s => s.devices);
  const alerts = useTelemetryStore(s => s.alerts);
  const fetchDevices = useTelemetryStore(s => s.fetchDevices);
  useEffect(() => {
    const stop = startPolling();
    return stop;
  }, []);
  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    critical: alerts.filter(a => a.severity === 'critical').length
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Fleet Integrity</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Command Center</h1>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDevices} className="border-white/10 bg-white/5 hover:bg-white/10">
          <Zap className="h-4 w-4 mr-2" /> Force Sync
        </Button>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono text-slate-500 uppercase">Fleet Capacity</CardTitle>
            <Server className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.total} <span className="text-sm font-normal text-slate-500">Nodes</span></div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono text-slate-500 uppercase">Live Sessions</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">{stats.online} <span className="text-sm font-normal text-slate-500">Online</span></div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono text-slate-500 uppercase">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-500">{stats.critical} <span className="text-sm font-normal text-slate-500">Active</span></div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Provisioned Fleet</h2>
          </div>
          <Card className="bg-slate-950 border-white/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5">
                  <TableHead className="text-slate-500 font-mono text-[10px] uppercase">Identity</TableHead>
                  <TableHead className="text-slate-500 font-mono text-[10px] uppercase">State</TableHead>
                  <TableHead className="text-slate-500 font-mono text-[10px] uppercase">Architecture</TableHead>
                  <TableHead className="text-slate-500 font-mono text-[10px] uppercase">Memory</TableHead>
                  <TableHead className="text-slate-500 font-mono text-[10px] uppercase">Heartbeat</TableHead>
                  <TableHead className="text-right text-slate-500 font-mono text-[10px] uppercase">Terminal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id} className="border-white/5 hover:bg-white/[0.02]">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-200">{device.name}</span>
                        <span className="font-mono text-[10px] text-slate-500">{device.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full animate-pulse",
                          device.status === 'online' ? "bg-emerald-500" :
                          device.status === 'error' ? "bg-rose-500" : "bg-slate-600"
                        )} />
                        <span className="text-xs font-medium text-slate-300 capitalize">{device.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-900 border-white/10 text-slate-400 text-[10px]">
                        {device.os} • {device.version}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 w-24">
                        <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full", device.memoryUsage > 80 ? "bg-rose-500" : "bg-blue-500")} 
                            style={{ width: `${device.memoryUsage}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{device.memoryUsage}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px] font-mono text-slate-500">
                      {new Date(device.lastSeen).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-7 text-[10px]">
                        <Link to={`/device/${device.id}`}>
                          Inspect <ExternalLink className="ml-1.5 h-3 w-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">System Alerts</h2>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="p-8 border border-dashed border-white/5 rounded-lg text-center">
                <p className="text-xs text-slate-600">No active alerts</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-rose-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-rose-200">{alert.message}</p>
                      <p className="text-[10px] text-rose-500/60 font-mono mt-1">{alert.deviceId} • {new Date(alert.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}