import { create } from 'zustand';
import type { Device, LogEvent, MetricData, NetworkDetail, Command, SystemAlert } from '@shared/types';
interface FleetActivityEvent {
  id: string;
  deviceId: string;
  type: 'log' | 'metric' | 'network' | 'command';
  level?: string;
  message: string;
  timestamp: string;
  transport?: string;
}
interface TelemetryState {
  devices: Device[];
  currentLogs: LogEvent[];
  globalLogs: LogEvent[];
  currentMetrics: MetricData[];
  currentNetwork: NetworkDetail[];
  currentSnapshots: string[];
  commandHistory: Command[];
  alerts: SystemAlert[];
  fleetActivity: FleetActivityEvent[];
  isStatsLoading: boolean;
  isExporting: boolean;
  pollingRate: number;
}
interface TelemetryActions {
  fetchDevices: () => Promise<void>;
  fetchDeviceStats: (deviceId: string) => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchFleetActivity: () => Promise<void>;
  fetchAllLogs: () => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  wipeFleet: () => Promise<void>;
  exportToCSV: () => Promise<void>;
  clearCurrentLogs: () => void;
  setPollingRate: (rate: number) => void;
}
export const useTelemetryStore = create<TelemetryState & TelemetryActions>((set, get) => ({
  devices: [],
  currentLogs: [],
  globalLogs: [],
  currentMetrics: [],
  currentNetwork: [],
  currentSnapshots: [],
  commandHistory: [],
  alerts: [],
  fleetActivity: [],
  isStatsLoading: false,
  isExporting: false,
  pollingRate: 5000,
  fetchDevices: async () => {
    const res = await fetch('/api/devices');
    const json = await res.json();
    if (json.success) set({ devices: json.data });
  },
  fetchFleetActivity: async () => {
    const res = await fetch('/api/fleet/stream');
    const json = await res.json();
    if (json.success) set({ fleetActivity: json.data });
  },
  fetchAllLogs: async () => {
    const res = await fetch('/api/fleet/logs');
    const json = await res.json();
    if (json.success) set({ globalLogs: json.data });
  },
  fetchDeviceStats: async (deviceId: string) => {
    set({ isStatsLoading: true });
    try {
      const [logs, metrics, network, commands, snapshots] = await Promise.all([
        fetch(`/api/devices/${deviceId}/logs`).then(r => r.json()),
        fetch(`/api/devices/${deviceId}/metrics`).then(r => r.json()),
        fetch(`/api/devices/${deviceId}/network`).then(r => r.json()),
        fetch(`/api/devices/${deviceId}/commands`).then(r => r.json()),
        fetch(`/api/devices/${deviceId}/snapshots`).then(r => r.json()),
      ]);
      if (logs.success) set({ currentLogs: logs.data });
      if (metrics.success) set({ currentMetrics: metrics.data });
      if (network.success) set({ currentNetwork: network.data });
      if (commands.success) set({ commandHistory: commands.data });
      if (snapshots.success) set({ currentSnapshots: snapshots.data });
    } finally {
      set({ isStatsLoading: false });
    }
  },
  fetchAlerts: async () => {
    const res = await fetch('/api/fleet/alerts');
    const json = await res.json();
    if (json.success) set({ alerts: json.data });
  },
  resolveAlert: async (alertId: string) => {
    await fetch(`/api/alerts/${alertId}/resolve`, { method: 'POST' });
    const state = get();
    await state.fetchAlerts();
  },
  wipeFleet: async () => {
    await fetch('/api/fleet', { method: 'DELETE' });
    set({ devices: [], fleetActivity: [], globalLogs: [], alerts: [] });
  },
  exportToCSV: async () => {
    set({ isExporting: true });
    try {
      const response = await fetch('/api/fleet/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `insidr_export_${Date.now()}.csv`;
      a.click();
    } finally {
      set({ isExporting: false });
    }
  },
  clearCurrentLogs: () => set({ currentLogs: [] }),
  setPollingRate: (rate) => set({ pollingRate: rate }),
}));
export function startPolling() {
  if (_running) return () => {};
  _running = true;
  const poll = async () => {
    if (!_running) return;
    const state = useTelemetryStore.getState();
    await Promise.allSettled([
      state.fetchDevices(),
      state.fetchAlerts(),
      state.fetchFleetActivity(),
      state.fetchAllLogs()
    ]);
    _timer = setTimeout(poll, state.pollingRate);
  };
  poll();
  return () => { _running = false; if (_timer) clearTimeout(_timer); };
}
let _running = false;
let _timer: any = null;