import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, Command } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const getStub = (env: Env) => env.GlobalDurableObject.get(env.GlobalDurableObject.idFromName("global"));
  app.get('/api/fleet/stream', async (c) => {
    const stub = getStub(c.env);
    const data = await stub.getGlobalActivity();
    return c.json({ success: true, data });
  });
  app.get('/api/fleet/logs', async (c) => {
    const stub = getStub(c.env);
    const data = await stub.getGlobalLogs();
    return c.json({ success: true, data });
  });
  app.get('/api/fleet/alerts', async (c) => {
    const stub = getStub(c.env);
    const data = await stub.getAlerts(true);
    return c.json({ success: true, data });
  });
  app.get('/api/fleet/export', async (c) => {
    const stub = getStub(c.env);
    const data = await stub.getExportData();
    const csv = [
      ["Timestamp", "DeviceID", "Type", "Level", "Message"].join(","),
      ...data.map(row => [
        row.timestamp,
        row.deviceId,
        row.type,
        row.level || "N/A",
        `"${row.message.replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n");
    return c.text(csv, 200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=fleet_export.csv'
    });
  });
  app.get('/api/agent/sdk', (c) => {
    // Escaping backticks and interpolation to prevent worker build errors
    const sdkCode = `/**
 * Insidr Agent SDK v2.0 - Reliable Telemetry Protocol (RTP)
 */
class InsidrAgent {
  constructor(config = {}) {
    this.endpoint = config.endpoint || "/api/devices";
    this.nodeId = config.nodeId || "node_" + Math.random().toString(36).substr(2, 9);
    this.seq = 0;
    this.buffer = [];
    this.init();
  }
  async init() {
    this.setupSandbox();
    this.startLoops();
    console.log("[Insidr] v2.0 Sandbox Active");
  }
  setupSandbox() {
    // Command proxy to prevent direct eval
    window.addEventListener("message", (e) => {
      if (e.data?.type === "INSIDR_CMD") {
        this.executeSandboxed(e.data.action);
      }
    });
  }
  executeSandboxed(action) {
    const allowed = ["reload", "clear_cache", "heartbeat"];
    if (!allowed.includes(action)) return;
    if (action === "reload") window.location.reload();
    if (action === "clear_cache") {
      if ("caches" in window) caches.keys().then(ks => ks.forEach(k => caches.delete(k)));
    }
    this.pushEvent("Command.executed", { action, sandbox: "proxy_v2" });
  }
  pushEvent(method, params = {}) {
    const event = {
      seq: ++this.seq,
      method,
      params: { ...params, nodeId: this.nodeId, timestamp: Date.now() },
      timestamp: Date.now()
    };
    this.buffer.push(event);
  }
  startLoops() {
    setInterval(() => this.sync(), 5000);
  }
  async sync() {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0, 10);
    try {
      await fetch(this.endpoint + "/" + this.nodeId + "/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Transport": "MessagePack-Sim" },
        body: JSON.stringify({ sequence: this.seq, events: batch })
      });
    } catch (e) {
      this.buffer.unshift(...batch);
    }
  }
}
window.insidr = new InsidrAgent();`;
    return c.text(sdkCode, 200, {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600'
    });
  });
  app.get('/api/devices', async (c) => {
    const stub = getStub(c.env);
    const data = await stub.getDevices();
    return c.json({ success: true, data });
  });
  app.post('/api/devices/:id/ingest', async (c) => {
    const id = c.req.param('id');
    const transport = c.req.header('X-Transport') || 'HTTP';
    const body = await c.req.json();
    const stub = getStub(c.env);
    const result = await stub.ingestTelemetry(id, { ...body, transport });
    return c.json(result);
  });
  app.get('/api/devices/:id/logs', async (c) => {
    const id = c.req.param('id');
    const stub = getStub(c.env);
    const data = await stub.getDeviceLogs(id);
    return c.json({ success: true, data });
  });
  app.get('/api/devices/:id/metrics', async (c) => {
    const id = c.req.param('id');
    const stub = getStub(c.env);
    const data = await stub.getDeviceMetrics(id);
    return c.json({ success: true, data });
  });
  app.get('/api/devices/:id/network', async (c) => {
    const id = c.req.param('id');
    const stub = getStub(c.env);
    const data = await stub.getDeviceNetwork(id);
    return c.json({ success: true, data });
  });
  app.get('/api/devices/:id/commands', async (c) => {
    const id = c.req.param('id');
    const stub = getStub(c.env);
    const data = await stub.getCommandHistory(id);
    return c.json({ success: true, data });
  });
  app.get('/api/devices/:id/snapshots', async (c) => {
    const id = c.req.param('id');
    const stub = getStub(c.env);
    const data = await stub.getDeviceSnapshots(id);
    return c.json({ success: true, data });
  });
  app.get('/api/alerts', async (c) => {
    const stub = getStub(c.env);
    const data = await stub.getAlerts();
    return c.json({ success: true, data });
  });
  app.delete('/api/fleet', async (c) => {
    const stub = getStub(c.env);
    await stub.resetFleet();
    return c.json({ success: true });
  });
  app.post('/api/alerts/:id/resolve', async (c) => {
    const alertId = c.req.param('id');
    const stub = getStub(c.env);
    await stub.resolveAlert(alertId);
    const updated = await stub.getAlerts();
    return c.json({ success: true, data: updated });
  });
  app.post('/api/devices/:id/commands', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json() as { action: Command['action']; payload?: any };
    const stub = getStub(c.env);
    const data = await stub.queueCommand(id, body.action, body.payload);
    return c.json({ success: true, data });
  });
}