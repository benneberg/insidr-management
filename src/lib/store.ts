import { create } from 'zustand';
import type { 
  Device, LogEvent, MetricData, NetworkDetail, 
  Command, SystemAlert, ComplianceRequest 
} from '@shared/types';
interface TelemetryState {
  devices: Device[];
  currentLogs: LogEvent[];
  globalLogs: LogEvent[];
  currentMetrics: MetricData[];
  currentNetwork: NetworkDetail[];
  currentSnapshots: string[];
  commandHistory: Command[];
  alerts: SystemAlert[];
  complianceRequests: ComplianceRequest[];
  isStatsLoading: boolean;
  isExporting: boolean;
  pollingRate: number;
}
interface TelemetryActions {
  fetchDevices: () => Promise<void>;
  fetchDeviceStats: (deviceId: string) => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchAllLogs: () => Promise<void>;
  fetchComplianceRequests: () => Promise<void>;
  createComplianceRequest: (type: 'export' | 'delete', deviceId: string) => Promise<void>;
  wipeFleet: () => Promise<void>;
  resetCurrentStats: () => void;
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
  complianceRequests: [],
  isStatsLoading: false,
  isExporting: false,
  pollingRate: 5000,
  fetchDevices: async () => {
    const res = await fetch('/api/devices');
    const json = await res.json();
    if (json.success) set({ devices: json.data });
  },
  fetchDeviceStats: async (deviceId: string) => {
    set({ isStatsLoading: true });
    try {
      const results = await Promise.allSettled([
        fetch(`/api/devices/${deviceId}/logs`).then(r => r.json()),
        fetch(`/api/devices/${deviceId}/metrics`).then(r => r.json()),
        fetch(`/api/devices/${deviceId}/network`).then(r => r.json()),
        fetch(`/api/devices/${deviceId}/commands`).then(r => r.json()),
      ]);
      const [logs, metrics, network, commands] = results.map(r => r.status === 'fulfilled' ? r.value : { success: false });
      if (logs.success) set({ currentLogs: logs.data });
      if (metrics.success) set({ currentMetrics: metrics.data });
      if (network.success) set({ currentNetwork: network.data });
      if (commands.success) set({ commandHistory: commands.data });
    } finally {
      set({ isStatsLoading: false });
    }
  },
  fetchAlerts: async () => {
    const res = await fetch('/api/fleet/alerts');
    const json = await res.json();
    if (json.success) set({ alerts: json.data });
  },
  fetchAllLogs: async () => {
    const res = await fetch('/api/fleet/logs');
    const json = await res.json();
    if (json.success) set({ globalLogs: json.data });
  },
  fetchComplianceRequests: async () => {
    const res = await fetch('/api/compliance/requests');
    const json = await res.json();
    if (json.success) set({ complianceRequests: json.data });
  },
  createComplianceRequest: async (type, deviceId) => {
    await fetch('/api/compliance/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, deviceId })
    });
    await get().fetchComplianceRequests();
  },
  wipeFleet: async () => {
    await fetch('/api/fleet', { method: 'DELETE' });
    set({ devices: [], globalLogs: [], alerts: [], complianceRequests: [] });
  },
  resetCurrentStats: () => set({
    currentLogs: [],
    currentMetrics: [],
    currentNetwork: [],
    currentSnapshots: [],
    commandHistory: []
  }),
}));
let _timer: any = null;
export function startPolling() {
  const poll = async () => {
    const state = useTelemetryStore.getState();
    await Promise.allSettled([
      state.fetchDevices(),
      state.fetchAlerts(),
      state.fetchAllLogs(),
      state.fetchComplianceRequests()
    ]);
    _timer = setTimeout(poll, state.pollingRate);
  };
  poll();
  return () => clearTimeout(_timer);
}