import { DurableObject } from "cloudflare:workers";
import type { Device, LogEvent, Command } from '@shared/types';
export class GlobalDurableObject extends DurableObject {
  private generateUUID(): string {
    return crypto.randomUUID?.() ?? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  private async getStored<T>(key: string, defaultValue: T): Promise<T> {
    const value = await this.ctx.storage.get(key);
    return (value as T) ?? defaultValue;
  }
  async getDevices(): Promise<Device[]> {
    const devices = await this.getStored<Device[]>("devices", []);
    if (devices.length === 0) {
      const mockDevices: Device[] = [
        { id: 'dev-001', name: 'Lobby Signage A', status: 'online', lastSeen: new Date().toISOString(), os: 'webOS', ip: '192.168.1.45', memoryUsage: 42, uptime: '12d 4h' },
        { id: 'dev-002', name: 'Elevator West', status: 'error', lastSeen: new Date().toISOString(), os: 'Android TV', ip: '192.168.1.48', memoryUsage: 88, uptime: '2d 1h' },
        { id: 'dev-003', name: 'Cafeteria Main', status: 'offline', lastSeen: new Date(Date.now() - 3600000).toISOString(), os: 'Tizen', ip: '192.168.1.50', memoryUsage: 0, uptime: '0s' }
      ];
      await this.ctx.storage.put("devices", mockDevices);
      return mockDevices;
    }
    return devices;
  }
  async getDeviceLogs(deviceId: string): Promise<LogEvent[]> {
    const allLogs = await this.getStored<Record<string, LogEvent[]>>("logs", {});
    const deviceLogs = allLogs[deviceId] || [];
    if (deviceLogs.length === 0) {
      const mockLogs: LogEvent[] = [
        { id: 'l1', deviceId, level: 'info', message: 'Application started', timestamp: new Date().toISOString() },
        { id: 'l2', deviceId, level: 'warn', message: 'High memory threshold reached', timestamp: new Date().toISOString() },
        { id: 'l3', deviceId, level: 'error', message: 'Failed to fetch manifest.json', timestamp: new Date().toISOString() }
      ];
      allLogs[deviceId] = mockLogs;
      await this.ctx.storage.put('logs', allLogs);
      return mockLogs;
    }
    return deviceLogs;
  }
  async ingestTelemetry(deviceId: string, log: Omit<LogEvent, 'id' | 'deviceId'>): Promise<void> {
    const allLogs = await this.getStored<Record<string, LogEvent[]>>("logs", {});
    const deviceLogs = allLogs[deviceId] || [];
    const newLog: LogEvent = { ...log, id: this.generateUUID(), deviceId, timestamp: new Date().toISOString() };
    const updated = [newLog, ...deviceLogs].slice(0, 500); // Circular buffer
    allLogs[deviceId] = updated;
    await this.ctx.storage.put("logs", allLogs);
  }
  async getDevice(deviceId: string): Promise<Device | null> {
    const devices = await this.getDevices();
    return devices.find(d => d.id === deviceId) ?? null;
  }

  async queueCommand(deviceId: string, action: Command['action']): Promise<Command> {
    const commands = await this.getStored<Command[]>("commands", []);
    const newCmd: Command = {
      id: this.generateUUID(),
      deviceId,
      action,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    await this.ctx.storage.put("commands", [...commands, newCmd]);
    return newCmd;
  }
}