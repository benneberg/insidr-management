import React, { useState, useMemo } from 'react';
import { useTelemetryStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Terminal, Search, Info, Link as LinkIcon, Copy, Check, Trash2, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { LogEvent } from '@shared/types';
export function FleetLogsPage() {
  const globalLogs = useTelemetryStore(useShallow(s => s.globalLogs));
  const wipeFleet = useTelemetryStore(s => s.wipeFleet);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string[]>(['info', 'warn', 'error']);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showFullBuffer, setShowFullBuffer] = useState(false);
  const filteredLogs = useMemo(() => {
    if (!globalLogs) return [];
    const term = search.toLowerCase();
    const list = globalLogs.filter((log: LogEvent) => {
      const matchesSearch = log.message.toLowerCase().includes(term) ||
                           log.deviceId.toLowerCase().includes(term);
      const matchesLevel = levelFilter.includes(log.level);
      return matchesSearch && matchesLevel;
    });
    return showFullBuffer ? list.slice(0, 500) : list.slice(0, 100);
  }, [globalLogs, search, levelFilter, showFullBuffer]);
  const toggleLevel = (level: string) => {
    setLevelFilter(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };
  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Log message copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };
  const formatTimestamp = (ts: string | undefined) => {
    if (!ts) return "NULL";
    try {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return "INVALID_TIME";
      const time = date.toLocaleTimeString([], { hour12: false });
      const ms = date.getMilliseconds().toString().padStart(3, '0');
      return `${time}.${ms}`;
    } catch {
      return "PARSE_ERROR";
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Terminal className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest text-foreground/80">Fleet Telemetry</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Global Log Explorer</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center space-x-2 bg-secondary px-3 py-1.5 rounded-lg border border-input">
               <Switch
                 id="buffer-limit"
                 checked={showFullBuffer}
                 onCheckedChange={setShowFullBuffer}
               />
               <Label htmlFor="buffer-limit" className="text-[10px] font-bold text-muted-foreground uppercase cursor-pointer">
                 {showFullBuffer ? 'Buffer: Full (500)' : 'Buffer: Rapid (100)'}
               </Label>
             </div>
             <Button
               variant="outline"
               size="sm"
               disabled={isClearing}
               className="border-destructive/20 text-destructive hover:bg-destructive/10 text-[10px] font-bold"
               onClick={async () => {
                 if (window.confirm("Purge ALL telemetry history?")) {
                   setIsClearing(true);
                   try { await wipeFleet(); toast.success("Purged"); }
                   finally { setIsClearing(false); }
                 }
               }}
             >
               {isClearing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Trash2 className="h-3 w-3 mr-2" />}
               PURGE_LOGS
             </Button>
          </div>
        </header>
        <Card className="bg-background border-input p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Query by message body, device ID, or error code..."
              className="pl-9 bg-secondary border-input text-foreground text-xs h-9 focus:ring-1 focus:ring-primary/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-secondary p-1 rounded-lg border border-input shrink-0">
            {['info', 'warn', 'error'].map(level => (
              <button
                key={level}
                onClick={() => toggleLevel(level)}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold uppercase rounded transition-all",
                  levelFilter.includes(level)
                    ? (level === 'error' ? "bg-destructive text-destructive-foreground" : level === 'warn' ? "bg-amber-600 text-white" : "bg-primary text-primary-foreground")
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </Card>
        <Card className="bg-background border-input overflow-hidden shadow-md">
          <div className="max-h-[70vh] overflow-x-auto overflow-y-auto scrollbar-thin">
            <Table>
              <TableHeader className="bg-secondary/50 sticky top-0 z-10 backdrop-blur-md">
                <TableRow className="border-input">
                  <TableHead className="w-40 text-[10px] uppercase font-mono text-muted-foreground text-right pr-6">Timestamp</TableHead>
                  <TableHead className="w-20 text-[10px] uppercase font-mono text-muted-foreground">Level</TableHead>
                  <TableHead className="w-32 text-[10px] uppercase font-mono text-muted-foreground">Device</TableHead>
                  <TableHead className="text-[10px] uppercase font-mono text-muted-foreground">Message</TableHead>
                  <TableHead className="w-12 text-[10px] uppercase font-mono text-muted-foreground text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-mono text-[11px]">
                {filteredLogs.map((log: LogEvent) => (
                  <TableRow key={log.id} className="border-input hover:bg-accent transition-colors group">
                    <TableCell className="text-muted-foreground whitespace-nowrap text-right pr-6 tabular-nums">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "font-bold uppercase tracking-tighter",
                        log.level === 'error' ? "text-destructive" : log.level === 'warn' ? "text-amber-500" : "text-blue-500"
                      )}>{log.level}</span>
                    </TableCell>
                    <TableCell>
                      <Link to={`/device/${log.deviceId}`} className="text-blue-500 hover:text-blue-600 flex items-center gap-1">
                        {String(log.deviceId).slice(0, 8)} <LinkIcon className="h-2 w-2" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-foreground break-all leading-relaxed min-w-[300px]">
                      {log.message}
                      {log.redacted && (
                        <Badge variant="outline" className="ml-2 h-3.5 text-[8px] bg-amber-500/10 text-amber-500 border-amber-500/20 px-1 py-0 uppercase">
                          <ShieldCheck className="h-2.5 w-2.5 mr-1" /> Redacted
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-accent"
                        onClick={() => copyMessage(log.message, log.id)}
                      >
                        {copiedId === log.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center text-muted-foreground italic uppercase tracking-widest text-[10px]">
                      <div className="flex flex-col items-center gap-3">
                        <Info className="h-8 w-8 opacity-10" />
                        NO_TELEMETRY_RECORDS_FOUND
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