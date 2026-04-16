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
  downloadAgentSDK: () => Promise<void>;
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
  fetchDevices: async () => {
    try {
      const res = await fetch('/api/devices');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) set({ devices: json.data || [], lastUpdated: new Date().toISOString() });
    } catch (e) {
      /* empty */
    }
  },
  fetchPublicDevices: async () => {
    try {
      const res = await fetch('/api/fleet/public');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) set({ publicDevices: json.data || [] });
    } catch (e) {
      /* empty */
    }
  },
  fetchDeviceStats: async (deviceId: string) => {
    set({ isStatsLoading: true });
    try {
      const results = await Promise.allSettled([
        fetch(`/api/devices/${deviceId}/logs`).then(async r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return await r.json();
        }),
        fetch(`/api/devices/${deviceId}/metrics`).then(async r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return await r.json();
        }),
        fetch(`/api/devices/${deviceId}/network`).then(async r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return await r.json();
        }),
        fetch(`/api/devices/${deviceId}/commands`).then(async r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return await r.json();
        }),
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
      if (json.success) {
        const sorted = (json.data || []).sort((a: SystemAlert, b: SystemAlert) => {
          if (a.severity === 'critical' && b.severity !== 'critical') return -1;
          if (a.severity !== 'critical' && b.severity === 'critical') return 1;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        set({ alerts: sorted });
      }
    } catch (e) {
      /* empty */
    }
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
    } catch (e) {
      /* empty */
    }
  },
  fetchComplianceRequests: async () => {
    try {
      const res = await fetch('/api/compliance/requests');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) set({ complianceRequests: json.data || [] });
    } catch (e) {
      /* empty */
    }
  },
  createComplianceRequest: async (type, deviceId) => {
    try {
      await fetch('/api/compliance/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, deviceId })
      });
      await get().fetchComplianceRequests();
    } catch (e) {
      console.error("createComplianceRequest failed", e);
    }
  },
  resolveAlert: async (alertId) => {
    try {
      await fetch(`/api/alerts/${alertId}/resolve`, { method: 'POST' });
      await get().fetchAlerts();
    } catch (e) {
      console.error("resolveAlert failed", e);
    }
  },
  exportToCSV: async () => {
    set({ isExporting: true });
    try {
      const devices = get().devices;
      const headers = "ID,Name,Status,OS,IP,Version,LastSeen\n";
      const rows = devices.map(d => `${d.id},${d.name},${d.status},${d.os},${d.ip},${d.version},${d.lastSeen}`).join("\n");
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `insidr_fleet_export_${new Date().toISOString()}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      set({ isExporting: false });
    }
  },
  downloadAgentSDK: async () => {
    try {
      const res = await fetch('/api/agent/bundle');
      const code = await res.text();
      const blob = new Blob([code], { type: 'application/javascript' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `insidr-agent-v2.5.0.js`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error("SDK download failed", e);
      throw e;
    }
  },
  wipeFleet: async () => {
    try {
      await fetch('/api/fleet', { method: 'DELETE' });
      set({
        devices: [],
        publicDevices: [],
        globalLogs: [],
        fleetActivity: [],
        alerts: [],
        complianceRequests: []
      });
    } catch (e) {
      console.error("wipeFleet failed", e);
    }
  },
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
  if (_pollingActive) {
    return () => {};
  }
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
    } catch (e) {
      console.error("[Telemetry] Polling cycle error", e);
    } finally {
      if (_pollingActive) {
        const currentRate = useTelemetryStore.getState().pollingRate;
        _timer = setTimeout(poll, currentRate);
      }
    }
  };
  poll();
  return () => {
    _pollingActive = false;
    if (_timer) {
      clearTimeout(_timer);
      _timer = null;
    }
  };
}