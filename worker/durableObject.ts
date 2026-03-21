import { DurableObject } from "cloudflare:workers";
import type { Device, LogEvent, Command, MetricData, NetworkDetail, SystemAlert } from '@shared/types';
export class GlobalDurableObject extends DurableObject {
  private generateUUID(): string {
    return crypto.randomUUID();
  }
  private async getStored<T>(key: string, defaultValue: T): Promise<T> {
    const value = await this.ctx.storage.get(key);
    return (value as T) ?? defaultValue;
  }
  async getDevices(): Promise<Device[]> {
    const devices = await this.getStored<Device[]>("devices", []);
    if (devices.length === 0) {
      const mockDevices: Device[] = [
        { id: 'dev-001', name: 'Lobby Signage A', status: 'online', lastSeen: new Date().toISOString(), os: 'webOS', ip: '192.168.1.45', memoryUsage: 42, uptime: '12d 4h', version: '2.1.0' },
        { id: 'dev-002', name: 'Elevator West', status: 'error', lastSeen: new Date().toISOString(), os: 'Android TV', ip: '192.168.1.48', memoryUsage: 88, uptime: '2d 1h', version: '2.0.4' },
        { id: 'dev-003', name: 'Cafeteria Main', status: 'offline', lastSeen: new Date(Date.now() - 3600000).toISOString(), os: 'Tizen', ip: '192.168.1.50', memoryUsage: 0, uptime: '0s', version: '1.9.8' }
      ];
      await this.ctx.storage.put("devices", mockDevices);
      return mockDevices;
    }
    return devices;
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
    return this.getStored<SystemAlert[]>("alerts", []);
  }
  async ingestTelemetry(deviceId: string, payload: { logs?: Omit<LogEvent, 'id' | 'deviceId'>[], metrics?: MetricData[], network?: Omit<NetworkDetail, 'id' | 'deviceId'>[] }): Promise<void> {
    // Process Logs
    if (payload.logs) {
      const allLogs = await this.getStored<Record<string, LogEvent[]>>("logs", {});
      const deviceLogs = allLogs[deviceId] || [];
      const newLogs = payload.logs.map(l => ({ ...l, id: this.generateUUID(), deviceId, timestamp: l.timestamp || new Date().toISOString() }));
      allLogs[deviceId] = [...newLogs, ...deviceLogs].slice(0, 500);
      await this.ctx.storage.put("logs", allLogs);
    }
    // Process Metrics
    if (payload.metrics) {
      const allMetrics = await this.getStored<Record<string, MetricData[]>>("metrics", {});
      const deviceMetrics = allMetrics[deviceId] || [];
      allMetrics[deviceId] = [...payload.metrics, ...deviceMetrics].slice(0, 100);
      await this.ctx.storage.put("metrics", allMetrics);
      // Update device last seen and health
      const devices = await this.getDevices();
      const idx = devices.findIndex(d => d.id === deviceId);
      if (idx !== -1) {
        devices[idx].lastSeen = new Date().toISOString();
        devices[idx].status = 'online';
        devices[idx].memoryUsage = payload.metrics[0].memory;
        await this.ctx.storage.put("devices", devices);
      }
    }
    // Process Network
    if (payload.network) {
      const allNet = await this.getStored<Record<string, NetworkDetail[]>>("network", {});
      const deviceNet = allNet[deviceId] || [];
      const newNet = payload.network.map(n => ({ ...n, id: this.generateUUID(), deviceId }));
      allNet[deviceId] = [...newNet, ...deviceNet].slice(0, 200);
      await this.ctx.storage.put("network", allNet);
    }
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
    const updated = [newCmd, ...commands].slice(0, 100);
    await this.ctx.storage.put("commands", updated);
    return newCmd;
  }
  async getCommandHistory(deviceId: string): Promise<Command[]> {
    const commands = await this.getStored<Command[]>("commands", []);
    return commands.filter(c => c.deviceId === deviceId);
  }
}