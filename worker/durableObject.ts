import { DurableObject } from "cloudflare:workers";
import type { Device, LogEvent, Command, MetricData, NetworkDetail, SystemAlert } from '@shared/types';
interface IngestPayload {
  sequence: number;
  logs?: Omit<LogEvent, 'id' | 'deviceId'>[];
  metrics?: MetricData[];
  network?: Omit<NetworkDetail, 'id' | 'deviceId'>[];
  snapshot?: string;
  transport?: string;
}
interface FleetActivityEvent {
  id: string;
  deviceId: string;
  type: 'log' | 'metric' | 'network' | 'command';
  level?: string;
  message: string;
  timestamp: string;
  transport?: string;
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
    await this.ctx.storage.delete(["devices", "logs", "metrics", "network", "alerts", "commands", "sequences", "global_activity", "snapshots"]);
  }
  async getDevices(): Promise<Device[]> {
    const devices = await this.getStored<Device[]>("devices", []);
    const now = Date.now();
    // Active Offline Detection: Mark as offline if no check-in for 60 seconds
    return devices.map(d => {
      const lastSeenTime = new Date(d.lastSeen).getTime();
      if (d.status === 'online' && (now - lastSeenTime) > 60000) {
        return { ...d, status: 'offline' };
      }
      return d;
    });
  }
  async getGlobalActivity(): Promise<FleetActivityEvent[]> {
    return await this.getStored<FleetActivityEvent[]>("global_activity", []);
  }
  async getGlobalLogs(): Promise<LogEvent[]> {
    const allLogs = await this.getStored<Record<string, LogEvent[]>>("logs", {});
    const flattened: LogEvent[] = [];
    for (const deviceId in allLogs) {
      flattened.push(...allLogs[deviceId]);
    }
    // Strict temporal sort to handle fleet-wide clock drift
    return flattened
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 200);
  }
  async getDeviceSnapshots(deviceId: string): Promise<string[]> {
    const allSnapshots = await this.getStored<Record<string, string[]>>("snapshots", {});
    const deviceSnapshots = allSnapshots[deviceId] || [];
    // Ensure correct temporal order (newest first)
    return deviceSnapshots;
  }
  async getExportData(): Promise<FleetActivityEvent[]> {
    return await this.getGlobalActivity();
  }
  async ingestTelemetry(deviceId: string, payload: IngestPayload): Promise<{ success: boolean; acknowledgedSeq: number }> {
    const sequences = await this.getStored<Record<string, number>>("sequences", {});
    const lastSeq = sequences[deviceId] || 0;
    if (payload.sequence <= lastSeq && payload.sequence !== 0 && payload.sequence !== 1) {
      return { success: true, acknowledgedSeq: lastSeq };
    }
    const activity: FleetActivityEvent[] = await this.getGlobalActivity();
    const timestamp = new Date().toISOString();
    if (payload.snapshot) {
      const allSnapshots = await this.getStored<Record<string, string[]>>("snapshots", {});
      const deviceSnapshots = allSnapshots[deviceId] || [];
      if (payload.snapshot.length < 350000) {
        allSnapshots[deviceId] = [payload.snapshot, ...deviceSnapshots].slice(0, 3);
        await this.ctx.storage.put("snapshots", allSnapshots);
      }
    }
    if (payload.logs?.length) {
      const allLogs = await this.getStored<Record<string, LogEvent[]>>("logs", {});
      // Gracefully handle massive batches by capping to 100 per ingestion
      const processedLogs = payload.logs.slice(0, 100).map(l => ({
        ...l,
        id: this.generateUUID(),
        deviceId,
        timestamp: l.timestamp || timestamp
      }));
      allLogs[deviceId] = [...(allLogs[deviceId] || []), ...processedLogs].slice(-200);
      await this.ctx.storage.put("logs", allLogs);
      processedLogs.forEach(l => {
        activity.unshift({
          id: l.id,
          deviceId,
          type: 'log',
          level: l.level,
          message: l.message,
          timestamp: l.timestamp,
          transport: payload.transport
        });
      });
    }
    const devices = await this.getStored<Device[]>("devices", []);
    let idx = devices.findIndex(d => d.id === deviceId);
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
        version: '2.0.0'
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
    await this.ctx.storage.put("global_activity", activity.slice(0, 100));
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
  async getAlerts(all: boolean = false): Promise<SystemAlert[]> {
    const alerts = await this.getStored<SystemAlert[]>("alerts", []);
    return all ? alerts : alerts.filter(a => !a.resolved);
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
      payload
    };
    await this.ctx.storage.put("commands", [newCmd, ...commands].slice(0, 100));
    return newCmd;
  }
  async getCommandHistory(deviceId: string): Promise<Command[]> {
    const commands = await this.getStored<Command[]>("commands", []);
    return commands.filter(c => c.deviceId === deviceId);
  }
}