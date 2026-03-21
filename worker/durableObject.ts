import { DurableObject } from "cloudflare:workers";
import type { 
  Device, LogEvent, Command, MetricData, NetworkDetail, 
  SystemAlert, ComplianceRequest, PIIRedactionConfig 
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
  async verifyEnrollment(token: string): Promise<boolean> {
    // In production, verify JWT signature here
    return token.startsWith("insidr_live_");
  }
  async getDevices(): Promise<Device[]> {
    const devices = await this.getStored<Device[]>("devices", []);
    const now = Date.now();
    return devices.map(d => {
      const lastSeenTime = new Date(d.lastSeen).getTime();
      if (d.status === 'online' && (now - lastSeenTime) > 60000) {
        return { ...d, status: 'offline' };
      }
      return d;
    });
  }
  async ingestTelemetry(deviceId: string, payload: IngestPayload): Promise<{ success: boolean; acknowledgedSeq: number }> {
    const sequences = await this.getStored<Record<string, number>>("sequences", {});
    const lastSeq = sequences[deviceId] || 0;
    if (payload.sequence <= lastSeq && payload.sequence !== 1) {
      return { success: true, acknowledgedSeq: lastSeq };
    }
    // Binary Simulation Decoding
    if (payload.transport === 'MsgPack_Sim') {
      console.log(`[Protocol] Decoded simulated MsgPack payload for ${deviceId}`);
    }
    const timestamp = new Date().toISOString();
    // Process Logs with Storage Persistence
    if (payload.logs?.length) {
      const allLogs = await this.getStored<Record<string, LogEvent[]>>("logs", {});
      const processed = payload.logs.map(l => ({
        ...l,
        id: this.generateUUID(),
        deviceId,
        timestamp: l.timestamp || timestamp
      }));
      allLogs[deviceId] = [...(allLogs[deviceId] || []), ...processed].slice(-500);
      await this.ctx.storage.put("logs", allLogs);
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
    const updated = [
      { ...req, status: 'completed', completedAt: new Date().toISOString() } as ComplianceRequest,
      ...requests.filter(r => r.id !== req.id)
    ];
    await this.ctx.storage.put("compliance_requests", updated);
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
  async getDeviceLogs(deviceId: string): Promise<LogEvent[]> {
    const allLogs = await this.getStored<Record<string, LogEvent[]>>("logs", {});
    return allLogs[deviceId] || [];
  }
  async getAlerts(): Promise<SystemAlert[]> {
    return await this.getStored<SystemAlert[]>("alerts", []);
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
}