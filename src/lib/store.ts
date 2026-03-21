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
  resetCurrentStats: () => void;
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
    if (json.success) {
      // Deduplicate by ID to prevent flicker
      const currentActivity = get().fleetActivity;
      const existingIds = new Set(currentActivity.map(a => a.id));
      const newItems = json.data.filter((a: FleetActivityEvent) => !existingIds.has(a.id));
      if (newItems.length > 0) {
        set({ fleetActivity: [...newItems, ...currentActivity].slice(0, 100) });
      }
    }
  },
  fetchAllLogs: async () => {
    const res = await fetch('/api/fleet/logs');
    const json = await res.json();
    if (json.success) set({ globalLogs: json.data });
  },
  fetchDeviceStats: async (deviceId: string) => {
    set({ isStatsLoading: true });
    try {
      const results = await Promise.allSettled([
        fetch(`/api/devices/${deviceId}/logs`).then(r => r.json()),
        fetch(`/api/devices/${deviceId}/metrics`).then(r => r.json()),
        fetch(`/api/devices/${deviceId}/network`).then(r => r.json()),
        fetch(`/api/devices/${deviceId}/commands`).then(r => r.json()),
        fetch(`/api/devices/${deviceId}/snapshots`).then(r => r.json()),
      ]);
      const [logs, metrics, network, commands, snapshots] = results.map(r => r.status === 'fulfilled' ? r.value : { success: false });
      if (logs.success) set({ currentLogs: logs.data });
      if (metrics.success) set({ currentMetrics: metrics.data });
      if (network.success) set({ currentNetwork: network.data });
      if (commands.success) set({ commandHistory: commands.data });
      if (snapshots.success) set({ currentSnapshots: snapshots.data });
    } catch (e) {
      console.error("Failed to fetch node stats", e);
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
  resetCurrentStats: () => set({ 
    currentLogs: [], 
    currentMetrics: [], 
    currentNetwork: [], 
    currentSnapshots: [], 
    commandHistory: [] 
  }),
  setPollingRate: (rate) => set({ pollingRate: rate }),
}));
// Singleton Polling Pattern to prevent runaway timers
let _timer: any = null;
let _activeCount = 0;
export function startPolling() {
  _activeCount++;
  if (_timer) return () => {
    _activeCount--;
    if (_activeCount === 0) {
      clearTimeout(_timer);
      _timer = null;
    }
  };
  const poll = async () => {
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
  return () => {
    _activeCount--;
    if (_activeCount <= 0) {
      clearTimeout(_timer);
      _timer = null;
    }
  };
}