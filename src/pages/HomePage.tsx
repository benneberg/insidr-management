import React, { useEffect } from 'react';
import { useTelemetryStore, startPolling } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Server, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
export function HomePage() {
  const devices = useTelemetryStore(s => s.devices);
  const fetchDevices = useTelemetryStore(s => s.fetchDevices);
  useEffect(() => {
    fetchDevices();
    const stop = startPolling();
    return stop;
  }, [fetchDevices]);
  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    errors: devices.filter(d => d.status === 'error').length
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Fleet Overview</h1>
          <p className="text-muted-foreground">Monitor and manage your remote device infrastructure.</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchDevices}
            className="ml-auto h-8 px-3 text-xs"
          >
            Refresh
          </Button>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-slate-900 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Devices</CardTitle>
              <Server className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.online}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">System Errors</CardTitle>
              <AlertCircle className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.errors}</div>
            </CardContent>
          </Card>
        </div>
        <Card className="bg-slate-950 border-white/5 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow>
                <TableHead className="text-slate-400">Device ID</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">OS</TableHead>
                <TableHead className="text-slate-400">IP Address</TableHead>
                <TableHead className="text-slate-400">Last Seen</TableHead>
                <TableHead className="text-right text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-mono text-sm text-white">{device.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                        device.status === 'online' ? "bg-emerald-500 shadow-emerald-500/50" :
                        device.status === 'error' ? "bg-rose-500 shadow-rose-500/50" : "bg-slate-500"
                      )} />
                      <span className="capitalize text-slate-300 text-xs">{device.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                      {device.os}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm">{device.ip}</TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                      <Link to={`/device/${device.id}`} className="flex items-center gap-2">
                        Inspect <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}