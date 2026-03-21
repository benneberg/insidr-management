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
  setDevices: (devices: Device[]) => void;
  setAlerts: (alerts: SystemAlert[]) => void;
  setCurrentLogs: (logs: LogEvent[]) => void;
  clearCurrentLogs: () => void;
  setCurrentMetrics: (metrics: MetricData[]) => void;
  setCurrentNetwork: (network: NetworkDetail[]) => void;
  setCommandHistory: (history: Command[]) => void;
  fetchDevices: () => Promise<void>;
  fetchDeviceStats: (deviceId: string) => Promise<void>;
  fetchAlerts: () => Promise<void>;
}
export const useTelemetryStore = create<TelemetryState>((set) => ({
  devices: [],
  currentLogs: [],
  currentMetrics: [],
  currentNetwork: [],
  commandHistory: [],
  alerts: [],
  isLoading: false,
  isStatsLoading: false,
  setDevices: (devices) => set({ devices }),
  setAlerts: (alerts) => set({ alerts }),
  setCurrentLogs: (logs) => set({ currentLogs: logs }),
  clearCurrentLogs: () => set({ currentLogs: [] }),
  setCurrentMetrics: (metrics) => set({ currentMetrics: metrics }),
  setCurrentNetwork: (network) => set({ currentNetwork: network }),
  setCommandHistory: (history) => set({ commandHistory: history }),
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
export function startPolling() {
  const { fetchDevices, fetchAlerts } = useTelemetryStore.getState();
  fetchDevices();
  fetchAlerts();
  const interval = setInterval(() => {
    fetchDevices();
    fetchAlerts();
  }, 5000);
  return () => clearInterval(interval);
}