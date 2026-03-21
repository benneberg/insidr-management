import { create } from 'zustand';
import type { Device, LogEvent, MetricData, NetworkDetail, Command, SystemAlert } from '@shared/types';
interface FleetActivityEvent {
  id: string;
  deviceId: string;
  type: 'log' | 'metric' | 'network' | 'command';
  level?: string;
  message: string;
  timestamp: string;
}
interface TelemetryState {
  devices: Device[];
  currentLogs: LogEvent[];
  globalLogs: LogEvent[];
  currentMetrics: MetricData[];
  currentNetwork: NetworkDetail[];
  commandHistory: Command[];
  alerts: SystemAlert[];
  fleetActivity: FleetActivityEvent[];
  isLoading: boolean;
  isStatsLoading: boolean;
}
interface TelemetryActions {
  setDevices: (devices: Device[]) => void;
  setAlerts: (alerts: SystemAlert[]) => void;
  setCurrentLogs: (logs: LogEvent[]) => void;
  clearCurrentLogs: () => void;
  setCurrentMetrics: (metrics: MetricData[]) => void;
  setCurrentNetwork: (network: NetworkDetail[]) => void;
  setCommandHistory: (history: Command[]) => void;
  wipeFleet: () => Promise<void>;
  fetchDevices: () => Promise<void>;
  fetchDeviceStats: (deviceId: string) => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchFleetActivity: () => Promise<void>;
  fetchAllLogs: () => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
}
export const useTelemetryStore = create<TelemetryState & TelemetryActions>((set, get) => ({
  devices: [],
  currentLogs: [],
  globalLogs: [],
  currentMetrics: [],
  currentNetwork: [],
  commandHistory: [],
  alerts: [],
  fleetActivity: [],
  isLoading: false,
  isStatsLoading: false,
  setDevices: (devices) => set({ devices }),
  setAlerts: (alerts) => set({ alerts }),
  setCurrentLogs: (logs) => set({ currentLogs: logs }),
  clearCurrentLogs: () => set({ currentLogs: [] }),
  setCurrentMetrics: (metrics) => set({ currentMetrics: metrics }),
  setCurrentNetwork: (network) => set({ currentNetwork: network }),
  setCommandHistory: (history) => set({ commandHistory: history }),
  wipeFleet: async () => {
    try {
      const res = await fetch('/api/fleet', { method: 'DELETE' });
      if (res.ok) {
        set({
          devices: [],
          currentLogs: [],
          globalLogs: [],
          currentMetrics: [],
          currentNetwork: [],
          commandHistory: [],
          alerts: [],
          fleetActivity: []
        });
      }
    } catch (e) {
      console.error('Failed to wipe fleet', e);
    }
  },
  fetchDevices: async () => {
    try {
      const res = await fetch('/api/devices');
      const json = await res.json();
      if (json.success) set({ devices: json.data });
    } catch (e) {
      console.error('Failed to fetch devices', e);
    }
  },
  fetchFleetActivity: async () => {
    try {
      const res = await fetch('/api/fleet/stream');
      const json = await res.json();
      if (json.success) set({ fleetActivity: json.data });
    } catch (e) {
      console.error('Failed to fetch fleet activity', e);
    }
  },
  fetchAllLogs: async () => {
    try {
      const res = await fetch('/api/fleet/logs');
      const json = await res.json();
      if (json.success) set({ globalLogs: json.data });
    } catch (e) {
      console.error('Failed to fetch all logs', e);
    }
  },
  fetchDeviceStats: async (deviceId: string) => {
    set({ isStatsLoading: true });
    try {
      const [logs, metrics, network, commands] = await Promise.all([
        fetch(`/api/devices/${deviceId}/logs`).then(r => r.json()),
        fetch(`/api/devices/${deviceId}/metrics`).then(r => r.json()),
        fetch(`/api/devices/${deviceId}/network`).then(r => r.json()),
        fetch(`/api/devices/${deviceId}/commands`).then(r => r.json()),
      ]);
      if (logs.success) set({ currentLogs: logs.data });
      if (metrics.success) set({ currentMetrics: metrics.data });
      if (network.success) set({ currentNetwork: network.data });
      if (commands.success) set({ commandHistory: commands.data });
    } catch (e) {
      console.error('Failed to fetch device stats', e);
    } finally {
      set({ isStatsLoading: false });
    }
  },
  fetchAlerts: async () => {
    try {
      const res = await fetch('/api/fleet/alerts');
      const json = await res.json();
      if (json.success) set({ alerts: json.data });
    } catch (e) {
      console.error('Failed to fetch alerts', e);
    }
  },
  resolveAlert: async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/resolve`, { method: 'POST' });
      const json = await res.json();
      if (json.success) set({ alerts: json.data });
    } catch (e) {
      console.error('Failed to resolve alert', e);
    }
  }
}));
export function startPolling() {
  const store = useTelemetryStore.getState();
  const poll = () => {
    store.fetchDevices();
    store.fetchAlerts();
    store.fetchFleetActivity();
    store.fetchAllLogs();
  };
  poll();
  const interval = setInterval(poll, 5000);
  return () => clearInterval(interval);
}