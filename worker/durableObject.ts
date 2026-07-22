import { DurableObject } from "cloudflare:workers";
import type {
  Device, LogEvent, Command, MetricData, NetworkDetail,
  SystemAlert, ComplianceRequest, CDPLiteV2Payload
} from '@shared/types';
export class GlobalDurableObject extends DurableObject {
  private activeSessions = new Map<string, WebSocket>();
  private generateUUID(): string {
    return crypto.randomUUID();
  }
  private async getStored<T>(key: string, defaultValue: T): Promise<T> {
    const value = await this.ctx.storage.get(key);
    return (value as T) ?? defaultValue;
  }
  async resetFleet(): Promise<void> {
    await this.ctx.storage.deleteAll();
    this.activeSessions.forEach(ws => ws.close());
    this.activeSessions.clear();
  }
  async getDevices(): Promise<Device[]> {
    let devices = await this.getStored<Device[]>("devices", []);
    const now = Date.now();
    return devices.map(d => {
      const isSocketActive = this.activeSessions.has(d.id);
      const lastSeenTime = new Date(d.lastSeen).getTime();
      let status = d.status;
      if (isSocketActive) status = 'online';
      else if (d.status === 'online' && (now - lastSeenTime) > 60000) status = 'offline';
      return { ...d, status, gatewayMode: isSocketActive ? 'wss' : 'http' } as Device;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }
  async getGlobalLogs(): Promise<LogEvent[]> {
    let allLogs = await this.getStored<Record<string, LogEvent[]>>("logs", {});
    let flatLogs = Object.values(allLogs).flat();
    return flatLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 500);
  }
  async ingestTelemetry(payload: CDPLiteV2Payload): Promise<{ success: boolean; acknowledgedSeq: number }> {
    const { sessionId, sequence, params } = payload;
    const { deviceId, logs, metrics, network, storageType, timestamp } = params;
    const sequences = await this.getStored<Record<string, number>>("sequences", {});
    const sessionTimestamps = await this.getStored<Record<string, string>>("sessions", {});
    if (logs?.length) {
      const allLogs = await this.getStored<Record<string, LogEvent[]>>("logs", {});
      const processed = logs.map(l => ({ ...l, id: this.generateUUID(), deviceId, timestamp: l.timestamp || timestamp }));
      allLogs[deviceId] = [...(allLogs[deviceId] || []), ...processed].slice(-200);
      await this.ctx.storage.put("logs", allLogs);
    }
    if (metrics?.length) {
      const allMetrics = await this.getStored<Record<string, MetricData[]>>("metrics", {});
      const enriched = metrics.map(m => ({ ...m, storageType: storageType || "memory" }));
      allMetrics[deviceId] = [...(allMetrics[deviceId] || []), ...enriched].slice(-100);
      await this.ctx.storage.put("metrics", allMetrics);
    }
    if (network?.length) {
      const allNetwork = await this.getStored<Record<string, NetworkDetail[]>>("network", {});
      const processed = network.map(n => ({ ...n, id: this.generateUUID(), deviceId, timestamp: n.timestamp || timestamp }));
      allNetwork[deviceId] = [...(allNetwork[deviceId] || []), ...processed].slice(-100);
      await this.ctx.storage.put("network", allNetwork);
    }
    const devices = await this.getStored<Device[]>("devices", []);
    const idx = devices.findIndex(d => d.id === deviceId);
    if (idx !== -1) {
      devices[idx].lastSeen = timestamp;
      devices[idx].status = 'online';
      if (metrics?.length) devices[idx].memoryUsage = metrics[metrics.length - 1].memory;
    } else {
      // Auto-enroll new device
      const newDevice: Device = {
        id: deviceId,
        name: deviceId,
        status: 'online',
        lastSeen: timestamp,
        os: 'webOS',
        ip: '0.0.0.0',
        memoryUsage: metrics?.[0]?.memory || 0,
        uptime: '0m',
        version: '2.6.1',
        protocol: 'JSON',
        enrolledAt: timestamp
      };
      devices.push(newDevice);
    }
    sequences[deviceId] = sequence;
    sessionTimestamps[sessionId] = timestamp;
    await this.ctx.storage.put("sequences", sequences);
    await this.ctx.storage.put("sessions", sessionTimestamps);
    await this.ctx.storage.put("devices", devices);
    return { success: true, acknowledgedSeq: sequence };
  }
  async getDeviceLogs(deviceId: string): Promise<LogEvent[]> { return (await this.getStored<Record<string, LogEvent[]>>("logs", {}))[deviceId] || []; }
  async getDeviceMetrics(deviceId: string): Promise<MetricData[]> { return (await this.getStored<Record<string, MetricData[]>>("metrics", {}))[deviceId] || []; }
  async getDeviceNetwork(deviceId: string): Promise<NetworkDetail[]> { return (await this.getStored<Record<string, NetworkDetail[]>>("network", {}))[deviceId] || []; }
  async getDeviceCommands(deviceId: string): Promise<Command[]> {
    return (await this.getStored<Command[]>("commands", [])).filter(c => c.deviceId === deviceId).slice(0, 10);
  }
  async getAlerts(): Promise<SystemAlert[]> { return await this.getStored<SystemAlert[]>("alerts", []); }
  async resolveAlert(alertId: string): Promise<void> {
    const alerts = await this.getAlerts();
    await this.ctx.storage.put("alerts", alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a));
  }
  async queueCommand(deviceId: string, action: Command['action'], payload?: any): Promise<Command> {
    const commands = await this.getStored<Command[]>("commands", []);
    const newCmd: Command = { id: this.generateUUID(), deviceId, action, status: 'pending', timestamp: new Date().toISOString(), payload: payload || {} };
    const socket = this.activeSessions.get(deviceId);
    if (socket) {
       socket.send(JSON.stringify(newCmd));
       newCmd.status = 'sent';
    }
    await this.ctx.storage.put("commands", [newCmd, ...commands].slice(0, 100));
    return newCmd;
  }
  async getComplianceRequests(): Promise<ComplianceRequest[]> { return await this.getStored<ComplianceRequest[]>("compliance_requests", []); }
  async addComplianceRequest(type: 'export' | 'delete', deviceId: string): Promise<ComplianceRequest[]> {
    const requests = await this.getComplianceRequests();
    const newReq: ComplianceRequest = {
      id: this.generateUUID(),
      type,
      target: 'device_id',
      targetValue: deviceId,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    const updated = [newReq, ...requests];
    await this.ctx.storage.put("compliance_requests", updated);
    return updated;
  }
  async fetch(request: Request) {
    if (request.headers.get("Upgrade") === "websocket") {
      const url = new URL(request.url);
      const deviceId = url.searchParams.get("id") || "unknown";
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);
      this.activeSessions.set(deviceId, server);
      return new Response(null, { status: 101, webSocket: client });
    }
    return new Response("Not Found", { status: 404 });
  }
  async webSocketMessage(ws: WebSocket, message: string) {
    try {
      const deviceId = Array.from(this.activeSessions.entries()).find(([_, v]) => v === ws)?.[0];
      if (!deviceId) return;
      const data = JSON.parse(message) as CDPLiteV2Payload;
      await this.ingestTelemetry(data);
    } catch (e) {
      console.error("[DO] WS Message Error:", e);
    }
  }
  async webSocketClose(ws: WebSocket) {
    const deviceId = Array.from(this.activeSessions.entries()).find(([_, v]) => v === ws)?.[0];
    if (deviceId) {
      this.activeSessions.delete(deviceId);
      const devices = await this.getStored<Device[]>("devices", []);
      const idx = devices.findIndex(d => d.id === deviceId);
      if (idx !== -1) {
        devices[idx].status = 'offline';
        await this.ctx.storage.put("devices", devices);
      }
    }
  }
}