import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import type { MetricData } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface DeviceMetricsPanelProps {
  metrics: MetricData[];
}
export function DeviceMetricsPanel({ metrics }: DeviceMetricsPanelProps) {
  const chartData = [...metrics].reverse();
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-white/10 p-2 rounded shadow-xl text-[10px] font-mono">
          <p className="text-slate-400 mb-1">{new Date(label).toLocaleTimeString()}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {entry.name.toUpperCase()}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-mono text-slate-400 uppercase tracking-wider">CPU Utilization</CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis domain={[0, 100]} stroke="#475569" fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cpu" name="cpu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-mono text-slate-400 uppercase tracking-wider">Memory Pressure</CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis domain={[0, 100]} stroke="#475569" fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="memory" name="memory" stroke="#10b981" fillOpacity={1} fill="url(#colorMem)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-mono text-slate-400 uppercase tracking-wider">Frame Stability (FPS)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis domain={[0, 60]} stroke="#475569" fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="stepAfter" dataKey="fps" name="fps" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}