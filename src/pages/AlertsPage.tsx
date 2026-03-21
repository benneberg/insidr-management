import React, { useEffect, useState } from 'react';
import { useTelemetryStore, startPolling } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bell, CheckCircle2, ShieldAlert, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
export function AlertsPage() {
  const alerts = useTelemetryStore(s => s.alerts);
  const resolveAlert = useTelemetryStore(s => s.resolveAlert);
  const [isResolving, setIsResolving] = useState<string | null>(null);
  useEffect(() => {
    const stop = startPolling();
    return stop;
  }, []);
  const activeAlerts = (alerts || []).filter(a => !a.resolved);
  const resolvedAlerts = (alerts || []).filter(a => a.resolved).slice(0, 20);
  const stats = {
    critical: activeAlerts.filter(a => a.severity === 'critical').length,
    high: activeAlerts.filter(a => a.severity === 'high').length,
    medium: activeAlerts.filter(a => a.severity === 'medium' || a.severity === 'low').length
  };
  const handleResolve = async (id: string) => {
    setIsResolving(id);
    try {
      await resolveAlert(id);
    } finally {
      setIsResolving(null);
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Bell className="h-8 w-8 text-rose-500" />
            Alert Center
          </h1>
          <p className="text-slate-500 text-sm mt-2">Manage fleet-wide incidents and performance anomalies.</p>
        </div>
        <div className="flex gap-4">
          <Card className="bg-slate-900 border-white/5 px-4 py-2 flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-rose-500 uppercase">Critical</span>
              <span className="text-xl font-bold text-white">{stats.critical}</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-amber-500 uppercase">High</span>
              <span className="text-xl font-bold text-white">{stats.high}</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-blue-500 uppercase">Warning</span>
              <span className="text-xl font-bold text-white">{stats.medium}</span>
            </div>
          </Card>
        </div>
      </header>
      <section className="space-y-6">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" /> Active Incidents
        </h2>
        {activeAlerts.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-white/5 rounded-2xl bg-slate-950">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4 opacity-20" />
            <p className="text-slate-500 font-mono text-sm uppercase">All nodes are healthy. No active alerts.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {activeAlerts.map(alert => (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className={cn(
                    "bg-slate-900 border-l-4 h-full flex flex-col transition-all",
                    alert.severity === 'critical' ? "border-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.1)]" :
                    alert.severity === 'high' ? "border-amber-600 shadow-[0_0_20px_rgba(217,119,6,0.1)]" : "border-blue-600"
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className={cn(
                          "text-[9px] uppercase font-bold",
                          alert.severity === 'critical' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        )}>{alert.severity}</Badge>
                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <CardTitle className="text-sm font-bold text-slate-200 mt-2">{alert.message}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 pb-4">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mb-4">
                        <span className="uppercase text-slate-600">Source:</span>
                        <Link to={`/device/${alert.deviceId}`} className="text-blue-400 hover:underline">
                          NODE_{alert.deviceId.slice(0, 8)}
                        </Link>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 border-t border-white/5 mt-auto">
                      <Button
                        onClick={() => handleResolve(alert.id)}
                        disabled={isResolving === alert.id}
                        variant="ghost"
                        className="w-full h-10 text-[10px] font-bold uppercase hover:bg-emerald-500/10 hover:text-emerald-500 group"
                      >
                        {isResolving === alert.id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-2" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 mr-2 group-hover:scale-110 transition-transform" />
                        )}
                        Acknowledge & Resolve
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
      <section className="space-y-6 pt-10 border-t border-white/5">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Clock className="h-4 w-4" /> Incident History
        </h2>
        <Card className="bg-slate-950 border-white/5 overflow-hidden">
          <div className="max-h-[300px] overflow-y-auto font-mono text-[10px]">
            {resolvedAlerts.length === 0 ? (
              <div className="p-8 text-center text-slate-600 italic uppercase">No resolved alerts in current session</div>
            ) : (
              <div className="divide-y divide-white/5">
                {resolvedAlerts.map(alert => (
                  <div key={alert.id} className="p-4 flex items-center justify-between hover:bg-white/[0.01]">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center justify-center h-8 w-8 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-300 font-bold">{alert.message}</span>
                        <span className="text-slate-600 uppercase text-[9px]">{alert.type} • Node {alert.deviceId.slice(0, 8)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block mb-1 uppercase">Resolved at</span>
                      <span className="text-slate-400">{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}