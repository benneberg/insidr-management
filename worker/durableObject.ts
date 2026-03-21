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
  async resetFleet(): Promise<void> {
    await this.ctx.storage.delete(["devices", "logs", "metrics", "network", "alerts", "commands"]);
  }
  async getDevices(): Promise<Device[]> {
    const devices = await this.getStored<Device[]>("devices", []);
    if (devices.length === 0) {
      const defaultDevice: Device = { 
        id: 'system-gateway-01', 
        name: 'System Gateway', 
        status: 'online', 
        lastSeen: new Date().toISOString(), 
        os: 'ChromeOS', 
        ip: '127.0.0.1', 
        memoryUsage: 12, 
        uptime: '0s', 
        version: '1.0.0' 
      };
      await this.ctx.storage.put("devices", [defaultDevice]);
      return [defaultDevice];
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
    const alerts = await this.getStored<SystemAlert[]>("alerts", []);
    return alerts.filter(a => !a.resolved);
  }
  async resolveAlert(alertId: string): Promise<void> {
    const alerts = await this.getStored<SystemAlert[]>("alerts", []);
    const updated = alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a);
    await this.ctx.storage.put("alerts", updated);
  }
  async ingestTelemetry(deviceId: string, payload: { logs?: Omit<LogEvent, 'id' | 'deviceId'>[], metrics?: MetricData[], network?: Omit<NetworkDetail, 'id' | 'deviceId'>[] }): Promise<void> {
    const hasActivity = !!(payload.logs?.length || payload.metrics?.length || payload.network?.length);
    // Process Logs
    if (payload.logs?.length) {
      const allLogs = await this.getStored<Record<string, LogEvent[]>>("logs", {});
      const deviceLogs = allLogs[deviceId] || [];
      const newLogs = payload.logs.map(l => ({
        ...l,
        id: this.generateUUID(),
        deviceId,
        timestamp: l.timestamp || new Date().toISOString()
      }));
      allLogs[deviceId] = [...deviceLogs, ...newLogs].slice(-500);
      await this.ctx.storage.put("logs", allLogs);
    }
    // Process Metrics
    if (payload.metrics?.length) {
      const allMetrics = await this.getStored<Record<string, MetricData[]>>("metrics", {});
      const deviceMetrics = allMetrics[deviceId] || [];
      allMetrics[deviceId] = [...deviceMetrics, ...payload.metrics].slice(-100);
      await this.ctx.storage.put("metrics", allMetrics);
    }
    // Process Network
    if (payload.network?.length) {
      const allNet = await this.getStored<Record<string, NetworkDetail[]>>("network", {});
      const deviceNet = allNet[deviceId] || [];
      const newNet = payload.network.map(n => ({ ...n, id: this.generateUUID(), deviceId }));
      allNet[deviceId] = [...deviceNet, ...newNet].slice(-200);
      await this.ctx.storage.put("network", allNet);
    }
    // Update Heartbeat and Auto-Register unknown devices
    const devices = await this.getDevices();
    let idx = devices.findIndex(d => d.id === deviceId);
    if (idx === -1 && hasActivity) {
      const newDevice: Device = {
        id: deviceId,
        name: `New Node (${deviceId.slice(0, 4)})`,
        status: 'online',
        lastSeen: new Date().toISOString(),
        os: 'ChromeOS',
        ip: '0.0.0.0',
        memoryUsage: payload.metrics?.[payload.metrics.length - 1]?.memory || 0,
        uptime: '0s',
        version: '1.0.0'
      };
      devices.push(newDevice);
      idx = devices.length - 1;
    }
    if (idx !== -1 && hasActivity) {
      devices[idx].lastSeen = new Date().toISOString();
      devices[idx].status = 'online';
      if (payload.metrics?.length) {
        devices[idx].memoryUsage = payload.metrics[payload.metrics.length - 1].memory;
      }
      await this.ctx.storage.put("devices", devices);
    }
    // Command Lifecycle Simulation
    const allCommands = await this.getStored<Command[]>("commands", []);
    const pendingIdx = allCommands.findIndex(c => c.deviceId === deviceId && c.status === 'pending');
    if (pendingIdx !== -1 && hasActivity) {
      allCommands[pendingIdx].status = 'executed';
      allCommands[pendingIdx].result = { success: true, acknowledgedAt: new Date().toISOString() };
      await this.ctx.storage.put("commands", allCommands);
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