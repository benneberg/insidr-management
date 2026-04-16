import { create } from 'zustand';
import type {
  Device, LogEvent, MetricData, NetworkDetail,
  Command, SystemAlert, ComplianceRequest
} from '@shared/types';
interface TelemetryState {
  devices: Device[];
  publicDevices: Device[];
  currentLogs: LogEvent[];
  globalLogs: LogEvent[];
  fleetActivity: LogEvent[];
  currentMetrics: MetricData[];
  currentNetwork: NetworkDetail[];
  currentSnapshots: string[];
  commandHistory: Command[];
  alerts: SystemAlert[];
  complianceRequests: ComplianceRequest[];
  isStatsLoading: boolean;
  isExporting: boolean;
  pollingRate: number;
  lastUpdated: string | null;
  protocolMode: 'polling' | 'wss';
}
interface TelemetryActions {
  fetchDevices: () => Promise<void>;
  fetchPublicDevices: () => Promise<void>;
  fetchDeviceStats: (deviceId: string) => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchAllLogs: () => Promise<void>;
  fetchComplianceRequests: () => Promise<void>;
  createComplianceRequest: (type: 'export' | 'delete', deviceId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  wipeFleet: () => Promise<void>;
  exportToCSV: () => Promise<void>;
  exportAgentTarball: () => Promise<void>;
  downloadAgentSDK: () => Promise<void>;
  setProtocolMode: (mode: 'polling' | 'wss') => void;
  resetCurrentStats: () => void;
  clearLocalLogs: () => void;
}
export const useTelemetryStore = create<TelemetryState & TelemetryActions>((set, get) => ({
  devices: [],
  publicDevices: [],
  currentLogs: [],
  globalLogs: [],
  fleetActivity: [],
  currentMetrics: [],
  currentNetwork: [],
  currentSnapshots: [],
  commandHistory: [],
  alerts: [],
  complianceRequests: [],
  isStatsLoading: false,
  isExporting: false,
  pollingRate: 5000,
  lastUpdated: null,
  protocolMode: 'polling',
  fetchDevices: async () => {
    try {
      const res = await fetch('/api/devices');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) set({ devices: json.data || [], lastUpdated: new Date().toISOString() });
    } catch (e) { /* silent */ }
  },
  fetchPublicDevices: async () => {
    try {
      const res = await fetch('/api/fleet/public');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        const enriched = (json.data || []).map((d: Device) => ({
          ...d,
          uptime: `${Math.floor(Math.random() * 20)}d ${Math.floor(Math.random() * 24)}h`,
          memoryUsage: Math.floor(Math.random() * 40) + 20
        }));
        set({ publicDevices: enriched });
      }
    } catch (e) { /* silent */ }
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
      const [logs, metrics, network, commands] = results.map(r => r.status === 'fulfilled' ? r.value : { success: false, data: [] });
      if (logs.success) set({ currentLogs: logs.data || [] });
      if (metrics.success) set({ currentMetrics: metrics.data || [] });
      if (network.success) set({ currentNetwork: network.data || [] });
      if (commands.success) set({ commandHistory: commands.data || [] });
    } finally {
      set({ isStatsLoading: false });
    }
  },
  fetchAlerts: async () => {
    try {
      const res = await fetch('/api/fleet/alerts');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) set({ alerts: json.data || [] });
    } catch (e) { /* silent */ }
  },
  fetchAllLogs: async () => {
    try {
      const res = await fetch('/api/fleet/logs');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        const logs: LogEvent[] = json.data || [];
        set({
          globalLogs: logs,
          fleetActivity: logs.slice(0, 50)
        });
      }
    } catch (e) { /* silent */ }
  },
  fetchComplianceRequests: async () => {
    try {
      const res = await fetch('/api/compliance/requests');
      const json = await res.json();
      if (json.success) set({ complianceRequests: json.data || [] });
    } catch (e) { /* silent */ }
  },
  createComplianceRequest: async (type, deviceId) => {
    try {
      await fetch('/api/compliance/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, deviceId })
      });
      await get().fetchComplianceRequests();
    } catch (e) { /* silent */ }
  },
  resolveAlert: async (alertId) => {
    try {
      await fetch(`/api/alerts/${alertId}/resolve`, { method: 'POST' });
      await get().fetchAlerts();
    } catch (e) { /* silent */ }
  },
  wipeFleet: async () => {
    try {
      const res = await fetch('/api/fleet', { method: 'DELETE' });
      if (res.ok) {
        set({
          devices: [],
          alerts: [],
          globalLogs: [],
          fleetActivity: [],
          currentLogs: [],
          currentMetrics: [],
          currentNetwork: [],
          commandHistory: []
        });
      }
    } catch (e) {
      console.error("Wipe fleet failed", e);
    }
  },
  exportToCSV: async () => {
    set({ isExporting: true });
    try {
      await new Promise(r => setTimeout(r, 1500));
      const devices = get().devices;
      const headers = "ID,Name,Status,OS,IP,Version,LastSeen\n";
      const rows = devices.map(d => `${d.id},${d.name},${d.status},${d.os},${d.ip},${d.version},${d.lastSeen}`).join("\n");
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `insidr_fleet_${Date.now()}.csv`;
      a.click();
    } finally {
      set({ isExporting: false });
    }
  },
  exportAgentTarball: async () => {
    try {
      await new Promise(r => setTimeout(r, 2000));
      const blob = new Blob(["Simulated NPM Tarball Content"], { type: 'application/gzip' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `insidr-agent-v2.5.0-production.tgz`;
      a.click();
    } catch (e) {
      console.error("Tarball export failed", e);
    }
  },
  downloadAgentSDK: async () => {
    try {
      const res = await fetch('/api/agent/bundle');
      const code = await res.text();
      const blob = new Blob([code], { type: 'application/javascript' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `insidr-agent-v2.5.0.js`;
      a.click();
    } catch (e) {
      console.error("SDK download failed", e);
    }
  },
  setProtocolMode: (mode) => set({ protocolMode: mode }),
  resetCurrentStats: () => set({
    currentLogs: [],
    currentMetrics: [],
    currentNetwork: [],
    currentSnapshots: [],
    commandHistory: []
  }),
  clearLocalLogs: () => set({ currentLogs: [] }),
}));
let _timer: any = null;
let _pollingActive = false;
export function startPolling() {
  if (_pollingActive) return () => {};
  _pollingActive = true;
  const poll = async () => {
    if (!_pollingActive) return;
    try {
      const state = useTelemetryStore.getState();
      await Promise.allSettled([
        state.fetchDevices(),
        state.fetchAlerts(),
        state.fetchAllLogs(),
        state.fetchComplianceRequests()
      ]);
    } finally {
      if (_pollingActive) {
        const rate = useTelemetryStore.getState().pollingRate;
        _timer = setTimeout(poll, rate);
      }
    }
  };
  poll();
  return () => {
    _pollingActive = false;
    if (_timer) clearTimeout(_timer);
  };
}