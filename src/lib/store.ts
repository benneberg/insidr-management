import { create } from 'zustand';
import type { Device, LogEvent, MetricData, NetworkDetail, Command, SystemAlert } from '@shared/types';
interface TelemetryState {
  devices: Device[];
  currentLogs: LogEvent[];
  currentMetrics: MetricData[];
  currentNetwork: NetworkDetail[];
  commandHistory: Command[];
  alerts: SystemAlert[];
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
}
export const useTelemetryStore = create<TelemetryState & TelemetryActions>((set, get) => ({
  // State
  devices: [],
  currentLogs: [],
  currentMetrics: [],
  currentNetwork: [],
  commandHistory: [],
  alerts: [],
  isLoading: false,
  isStatsLoading: false,
  // Actions
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
          currentMetrics: [],
          currentNetwork: [],
          commandHistory: [],
          alerts: []
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
      const res = await fetch('/api/alerts');
      const json = await res.json();
      if (json.success) set({ alerts: json.data });
    } catch (e) {
      console.error('Failed to fetch alerts', e);
    }
  }
}));
/**
 * Polling utility that uses stable references from the store.
 */
export function startPolling() {
  const store = useTelemetryStore.getState();
  const poll = () => {
    store.fetchDevices();
    store.fetchAlerts();
  };
  poll();
  const interval = setInterval(poll, 5000);
  return () => clearInterval(interval);
}