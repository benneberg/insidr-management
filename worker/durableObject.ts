import { DurableObject } from "cloudflare:workers";
import type {
  Device, LogEvent, Command, MetricData, NetworkDetail,
  SystemAlert, ComplianceRequest
} from '@shared/types';
interface IngestPayload {
  sequence: number;
  logs?: Omit<LogEvent, 'id' | 'deviceId'>[];
  metrics?: MetricData[];
  network?: Omit<NetworkDetail, 'id' | 'deviceId'>[];
  transport?: 'JSON' | 'MsgPack_Sim';
  authToken?: string;
}
export class GlobalDurableObject extends DurableObject {
  private generateUUID(): string {
    return crypto.randomUUID();
  }
  private async getStored<T>(key: string, defaultValue: T): Promise<T> {
    const value = await this.ctx.storage.get(key);
    return (value as T) ?? defaultValue;
  }
  async resetFleet(): Promise<void> {
    await this.ctx.storage.deleteAll();
  }
  async getDevices(): Promise<Device[]> {
    const devices = await this.getStored<Device[]>("devices", []);
    const now = Date.now();
    const processed = devices.map(d => {
      const lastSeenTime = new Date(d.lastSeen).getTime();
      if (d.status === 'online' && (now - lastSeenTime) > 60000) {
        return { ...d, status: 'offline' } as Device;
      }
      return d;
    });
    // Consistently sort by name for UI stability
    return processed.sort((a, b) => a.name.localeCompare(b.name));
  }
  async getGlobalLogs(): Promise<LogEvent[]> {
    const allLogs = await this.getStored<Record<string, LogEvent[]>>("logs", {});
    const flatLogs = Object.values(allLogs).flat();
    return flatLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 500);
  }
  async ingestTelemetry(deviceId: string, payload: IngestPayload): Promise<{ success: boolean; acknowledgedSeq: number }> {
    const sequences = await this.getStored<Record<string, number>>("sequences", {});
    const lastSeq = sequences[deviceId] || 0;
    // Simple sequence tracking alert simulation
    if (payload.sequence > lastSeq + 5) {
      const alerts = await this.getStored<SystemAlert[]>("alerts", []);
      alerts.push({
        id: this.generateUUID(),
        deviceId,
        severity: 'high',
        message: `Telemetry gap detected. Missed approx ${payload.sequence - lastSeq} packets.`,
        type: 'connection_lost',
        timestamp: new Date().toISOString(),
        resolved: false
      });
      await this.ctx.storage.put("alerts", alerts.slice(-100));
    }
    if (payload.sequence <= lastSeq && payload.sequence !== 1) {
      return { success: true, acknowledgedSeq: lastSeq };
    }
    const timestamp = new Date().toISOString();
    // Process Logs
    if (payload.logs?.length) {
      const allLogs = await this.getStored<Record<string, LogEvent[]>>("logs", {});
      const processed = payload.logs.map(l => ({
        ...l,
        id: this.generateUUID(),
        deviceId,
        timestamp: l.timestamp || timestamp
      }));
      allLogs[deviceId] = [...(allLogs[deviceId] || []), ...processed].slice(-200);
      await this.ctx.storage.put("logs", allLogs);
    }
    // Process Metrics
    if (payload.metrics?.length) {
      const allMetrics = await this.getStored<Record<string, MetricData[]>>("metrics", {});
      allMetrics[deviceId] = [...(allMetrics[deviceId] || []), ...payload.metrics].slice(-100);
      await this.ctx.storage.put("metrics", allMetrics);
    }
    // Update Device Registry
    const devices = await this.getStored<Device[]>("devices", []);
    const idx = devices.findIndex(d => d.id === deviceId);
    if (idx === -1) {
      devices.push({
        id: deviceId,
        name: `Node ${deviceId.slice(0, 4)}`,
        status: 'online',
        lastSeen: timestamp,
        os: 'ChromeOS',
        ip: '0.0.0.0',
        memoryUsage: payload.metrics?.[0]?.memory || 0,
        uptime: '0s',
        version: '2.5.0',
        protocol: payload.transport || 'JSON',
        enrolledAt: timestamp
      });
    } else {
      devices[idx].lastSeen = timestamp;
      devices[idx].status = 'online';
      if (payload.metrics?.length) {
        devices[idx].memoryUsage = payload.metrics[payload.metrics.length - 1].memory;
      }
    }
    sequences[deviceId] = payload.sequence;
    await this.ctx.storage.put("sequences", sequences);
    await this.ctx.storage.put("devices", devices);
    return { success: true, acknowledgedSeq: payload.sequence };
  }
  async getDeviceLogs(deviceId: string): Promise<LogEvent[]> {
    const allLogs = await this.getStored<Record<string, LogEvent[]>>("logs", {});
    return allLogs[deviceId] || [];
  }
  async getDeviceMetrics(deviceId: string): Promise<MetricData[]> {
    const allMetrics = await this.getStored<Record<string, MetricData[]>>("metrics", {});
    return allMetrics[deviceId] || [];
  }
  async getDeviceNetwork(deviceId: string): Promise<NetworkDetail[]> {
    const allNetwork = await this.getStored<Record<string, NetworkDetail[]>>("network", {});
    return allNetwork[deviceId] || [];
  }
  async getDeviceCommands(deviceId: string): Promise<Command[]> {
    const allCommands = await this.getStored<Command[]>("commands", []);
    return allCommands.filter(c => c.deviceId === deviceId).slice(0, 10);
  }
  async getAlerts(): Promise<SystemAlert[]> {
    return await this.getStored<SystemAlert[]>("alerts", []);
  }
  async resolveAlert(alertId: string): Promise<void> {
    const alerts = await this.getStored<SystemAlert[]>("alerts", []);
    const updated = alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a);
    await this.ctx.storage.put("alerts", updated);
  }
  async queueCommand(deviceId: string, action: Command['action'], payload?: any): Promise<Command> {
    const commands = await this.getStored<Command[]>("commands", []);
    const newCmd: Command = {
      id: this.generateUUID(),
      deviceId,
      action,
      status: 'pending',
      timestamp: new Date().toISOString(),
      payload,
      sandboxMode: action === 'eval_sandbox' ? 'DedicatedWorker' : 'MainThread'
    };
    await this.ctx.storage.put("commands", [newCmd, ...commands].slice(0, 100));
    return newCmd;
  }
  async getComplianceRequests(): Promise<ComplianceRequest[]> {
    return await this.getStored<ComplianceRequest[]>("compliance_requests", []);
  }
  async queueComplianceRequest(type: 'export' | 'delete', target: 'device_id', value: string): Promise<ComplianceRequest> {
    const requests = await this.getStored<ComplianceRequest[]>("compliance_requests", []);
    const req: ComplianceRequest = {
      id: this.generateUUID(),
      type,
      target,
      targetValue: value,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    await this.ctx.storage.put("compliance_requests", [req, ...requests]);
    return req;
  }
  async performComplianceAction(req: ComplianceRequest): Promise<void> {
    const requests = await this.getStored<ComplianceRequest[]>("compliance_requests", []);
    if (req.type === 'delete') {
      const allLogs = await this.getStored<Record<string, LogEvent[]>>("logs", {});
      if (req.target === 'device_id') {
        delete allLogs[req.targetValue];
        const devices = await this.getStored<Device[]>("devices", []);
        await this.ctx.storage.put("devices", devices.filter(d => d.id !== req.targetValue));
      }
      await this.ctx.storage.put("logs", allLogs);
    }
    const updated = requests.map(r => r.id === req.id ? ({ ...r, status: 'completed', completedAt: new Date().toISOString() } as ComplianceRequest) : r);
    await this.ctx.storage.put("compliance_requests", updated);
  }
}