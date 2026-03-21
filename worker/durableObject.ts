import { DurableObject } from "cloudflare:workers";
import type { Device, LogEvent, Command, MetricData, NetworkDetail, SystemAlert } from '@shared/types';
interface IngestPayload {
  sequence: number;
  logs?: Omit<LogEvent, 'id' | 'deviceId'>[];
  metrics?: MetricData[];
  network?: Omit<NetworkDetail, 'id' | 'deviceId'>[];
  transport?: string;
}
interface FleetActivityEvent {
  id: string;
  deviceId: string;
  type: 'log' | 'metric' | 'network' | 'command';
  level?: string;
  message: string;
  timestamp: string;
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
    await this.ctx.storage.delete(["devices", "logs", "metrics", "network", "alerts", "commands", "sequences", "global_activity"]);
  }
  async getDevices(): Promise<Device[]> {
    return await this.getStored<Device[]>("devices", []);
  }
  async getGlobalActivity(): Promise<FleetActivityEvent[]> {
    return await this.getStored<FleetActivityEvent[]>("global_activity", []);
  }
  async ingestTelemetry(deviceId: string, payload: IngestPayload): Promise<{ success: boolean; acknowledgedSeq: number }> {
    const sequences = await this.getStored<Record<string, number>>("sequences", {});
    const lastSeq = sequences[deviceId] || 0;
    // Deduplication / Out-of-order protection
    if (payload.sequence <= lastSeq && payload.sequence !== 0) {
      return { success: true, acknowledgedSeq: lastSeq };
    }
    const activity: FleetActivityEvent[] = await this.getStored<FleetActivityEvent[]>("global_activity", []);
    const timestamp = new Date().toISOString();
    // Process Logs
    if (payload.logs?.length) {
      const allLogs = await this.getStored<Record<string, LogEvent[]>>("logs", {});
      const deviceLogs = allLogs[deviceId] || [];
      const newLogs = payload.logs.map(l => ({
        ...l,
        id: this.generateUUID(),
        deviceId,
        timestamp: l.timestamp || timestamp
      }));
      allLogs[deviceId] = [...deviceLogs, ...newLogs].slice(-500);
      await this.ctx.storage.put("logs", allLogs);
      // Add to global stream
      newLogs.forEach(l => {
        activity.unshift({
          id: l.id,
          deviceId,
          type: 'log',
          level: l.level,
          message: l.message,
          timestamp: l.timestamp
        });
      });
    }
    // Process Metrics
    if (payload.metrics?.length) {
      const allMetrics = await this.getStored<Record<string, MetricData[]>>("metrics", {});
      const deviceMetrics = allMetrics[deviceId] || [];
      allMetrics[deviceId] = [...deviceMetrics, ...payload.metrics].slice(-100);
      await this.ctx.storage.put("metrics", allMetrics);
      activity.unshift({
        id: this.generateUUID(),
        deviceId,
        type: 'metric',
        message: `Heartbeat: CPU ${payload.metrics[0].cpu}%`,
        timestamp
      });
    }
    // Update Device Registry
    const devices = await this.getDevices();
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
        version: '1.0.0'
      });
      idx = devices.length - 1;
    } else {
      devices[idx].lastSeen = timestamp;
      devices[idx].status = 'online';
      if (payload.metrics?.length) {
        devices[idx].memoryUsage = payload.metrics[payload.metrics.length - 1].memory;
      }
    }
    // Save state
    sequences[deviceId] = payload.sequence;
    await this.ctx.storage.put("sequences", sequences);
    await this.ctx.storage.put("devices", devices);
    await this.ctx.storage.put("global_activity", activity.slice(0, 50));
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
  async getAlerts(): Promise<SystemAlert[]> {
    const alerts = await this.getStored<SystemAlert[]>("alerts", []);
    return alerts.filter(a => !a.resolved);
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