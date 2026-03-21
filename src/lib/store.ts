import { create } from 'zustand';
import type { Device, LogEvent } from '@shared/types';
interface TelemetryState {
  devices: Device[];
  currentLogs: LogEvent[];
  isLoading: boolean;
  setDevices: (devices: Device[]) => void;
  setCurrentLogs: (logs: LogEvent[]) => void;
  fetchDevices: () => Promise<void>;
  fetchLogs: (deviceId: string) => Promise<void>;
}
export const useTelemetryStore = create<TelemetryState>((set) => ({
  devices: [],
  currentLogs: [],
  isLoading: false,
  setDevices: (devices) => set({ devices }),
  setCurrentLogs: (logs) => set({ currentLogs: logs }),
  fetchDevices: async () => {
    try {
      const res = await fetch('/api/devices');
      const json = await res.json();
      if (json.success) set({ devices: json.data });
    } catch (e) {
      console.error('Failed to fetch devices', e);
    }
  },
  fetchLogs: async (deviceId: string) => {
    try {
      const res = await fetch(`/api/devices/${deviceId}/logs`);
      const json = await res.json();
      if (json.success) set({ currentLogs: json.data });
    } catch (e) {
      console.error('Failed to fetch logs', e);
    }
  }
}));
export function startPolling() {
  const fetch = useTelemetryStore.getState().fetchDevices;
  fetch();
  const interval = setInterval(fetch, 3000);
  return () => clearInterval(interval);
}