import React, { useState, useMemo } from 'react';
import { useTelemetryStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Terminal, Search, Info, Link as LinkIcon, Copy, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
export function FleetLogsPage() {
  const globalLogs = useTelemetryStore(s => s.globalLogs);
  const wipeFleet = useTelemetryStore(s => s.wipeFleet);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string[]>(['info', 'warn', 'error']);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const filteredLogs = useMemo(() => {
    return (globalLogs ?? []).filter(log => {
      const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) ||
                           log.deviceId.toLowerCase().includes(search.toLowerCase());
      const matchesLevel = levelFilter.includes(log.level);
      return matchesSearch && matchesLevel;
    });
  }, [globalLogs, search, levelFilter]);
  const toggleLevel = (level: string) => {
    setLevelFilter(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };
  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Log message copied");
    setTimeout(() => setCopiedId(null), 2000);
  };
  const handleClearAll = async () => {
    if (confirm("Clear all logs from the server?")) {
      await wipeFleet();
      toast.success("Logs cleared");
    }
  };
  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    const time = date.toLocaleTimeString([], { hour12: false });
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${time}.${ms}`;
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
             <Button 
               variant="outline" 
               size="sm" 
               className="border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-[10px] font-bold"
               onClick={handleClearAll}
             >
               <Trash2 className="h-3 w-3 mr-2" /> CLEAR SERVER LOGS
             </Button>
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
          <div className="max-h-[70vh] overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            <Table>
              <TableHeader className="bg-white/[0.02] sticky top-0 z-10">
                <TableRow className="border-white/5">
                  <TableHead className="w-40 text-[10px] uppercase font-mono text-slate-500">Timestamp</TableHead>
                  <TableHead className="w-20 text-[10px] uppercase font-mono text-slate-500">Level</TableHead>
                  <TableHead className="w-32 text-[10px] uppercase font-mono text-slate-500">Device</TableHead>
                  <TableHead className="text-[10px] uppercase font-mono text-slate-500">Message</TableHead>
                  <TableHead className="w-12 text-[10px] uppercase font-mono text-slate-500 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-white/5 hover:bg-white/[0.02] group transition-colors">
                    <TableCell className="text-slate-500 whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "font-bold uppercase tracking-tighter",
                        log.level === 'error' ? "text-rose-500" : log.level === 'warn' ? "text-amber-500" : "text-blue-400"
                      )}>{log.level}</span>
                    </TableCell>
                    <TableCell>
                      <Link to={`/device/${log.deviceId}`} className="text-blue-400 hover:underline flex items-center gap-1">
                        {log.deviceId.slice(0, 8)} <LinkIcon className="h-2 w-2" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-300 break-all leading-relaxed min-w-[200px]">
                      {log.message}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-white/10"
                        onClick={() => copyMessage(log.message, log.id)}
                      >
                        {copiedId === log.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-slate-500" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-slate-600 italic uppercase tracking-widest text-[10px]">
                      <div className="flex flex-col items-center gap-2">
                        <Info className="h-6 w-6 opacity-20" />
                        No telemetry matching current filter
                      </div>
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