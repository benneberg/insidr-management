import React, { useState, useEffect } from 'react';
import { useTelemetryStore, startPolling } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Terminal, Search, Clock, ShieldInfo, Filter, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
export function FleetLogsPage() {
  const globalLogs = useTelemetryStore(s => s.globalLogs);
  const fetchAllLogs = useTelemetryStore(s => s.fetchAllLogs);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string[]>(['info', 'warn', 'error']);
  useEffect(() => {
    const stop = startPolling();
    return stop;
  }, []);
  const filteredLogs = globalLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) || 
                         log.deviceId.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter.includes(log.level);
    return matchesSearch && matchesLevel;
  });
  const toggleLevel = (level: string) => {
    setLevelFilter(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Terminal className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Fleet Telemetry</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Global Log Explorer</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Stream Active</span>
             </div>
          </div>
        </header>
        <Card className="bg-slate-950 border-white/5 p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search by message or device ID..." 
              className="pl-9 bg-slate-900 border-white/10 text-white text-xs h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-white/10 shrink-0">
            {['info', 'warn', 'error'].map(level => (
              <button
                key={level}
                onClick={() => toggleLevel(level)}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold uppercase rounded transition-all",
                  levelFilter.includes(level) 
                    ? (level === 'error' ? "bg-rose-600 text-white" : level === 'warn' ? "bg-amber-600 text-white" : "bg-blue-600 text-white")
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </Card>
        <Card className="bg-slate-950 border-white/5 overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            <Table>
              <TableHeader className="bg-white/[0.02] sticky top-0 z-10">
                <TableRow className="border-white/5">
                  <TableHead className="w-48 text-[10px] uppercase font-mono text-slate-500">Timestamp</TableHead>
                  <TableHead className="w-24 text-[10px] uppercase font-mono text-slate-500">Level</TableHead>
                  <TableHead className="w-32 text-[10px] uppercase font-mono text-slate-500">Device</TableHead>
                  <TableHead className="text-[10px] uppercase font-mono text-slate-500">Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-white/5 hover:bg-white/[0.01]">
                    <TableCell className="text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "font-bold uppercase",
                        log.level === 'error' ? "text-rose-500" : log.level === 'warn' ? "text-amber-500" : "text-blue-400"
                      )}>{log.level}</span>
                    </TableCell>
                    <TableCell>
                      <Link to={`/device/${log.deviceId}`} className="text-blue-400 hover:underline flex items-center gap-1">
                        {log.deviceId.slice(0, 8)} <LinkIcon className="h-2 w-2" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-300 break-all leading-relaxed">
                      {log.message}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-slate-600 italic uppercase tracking-widest text-[10px]">
                      No telemetry matching current filter
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}