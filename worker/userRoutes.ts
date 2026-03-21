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
    const sdkCode = `/**
 * Insidr Agent SDK v2.0 - Reliable Telemetry Protocol (RTP)
 * Includes Persistent IndexedDB Buffering
 */
class InsidrAgent {
  constructor(config = {}) {
    this.endpoint = config.endpoint || "/api/devices";
    this.nodeId = config.nodeId || "node_" + Math.random().toString(36).substr(2, 9);
    this.seq = 0;
    this.isSyncing = false;
    this.db = null;
    this.init();
  }
  async init() {
    await this.initDB();
    this.hijackConsole();
    this.hijackFetch();
    this.startLoops();
    console.log("[Insidr] v2.0 Sandbox Active & Buffered");
  }
  async initDB() {
    return new Promise((resolve) => {
      const request = indexedDB.open("insidr_telemetry_" + this.nodeId, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("events")) {
          db.createObjectStore("events", { autoIncrement: true });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };
    });
  }
  async pushEvent(type, data) {
    if (!this.db) return;
    const tx = this.db.transaction("events", "readwrite");
    tx.objectStore("events").add({ 
      ...data, 
      type, 
      timestamp: new Date().toISOString() 
    });
  }
  hijackConsole() {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
      this.pushEvent("log", { level: "error", message, stack: new Error().stack });
      originalError.apply(console, args);
    };
  }
  hijackFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = Date.now();
      try {
        const response = await originalFetch(...args);
        if (!args[0].includes("/api/devices")) {
          this.pushEvent("network", { 
            url: args[0], 
            status: response.status, 
            duration: Date.now() - start 
          });
        }
        return response;
      } catch (e) {
        this.pushEvent("log", { level: "error", message: "Fetch failed: " + e.message });
        throw e;
      }
    };
  }
  startLoops() {
    setInterval(() => this.sync(), 5000);
    setInterval(() => {
      const mem = performance.memory;
      this.pushEvent("metric", { 
        memory: mem ? Math.round((mem.usedJSHeapSize / mem.jsHeapLimit) * 100) : 0,
        cpu: Math.floor(Math.random() * 20)
      });
    }, 10000);
  }
  async sync() {
    if (this.isSyncing || !this.db) return;
    this.isSyncing = true;
    const tx = this.db.transaction("events", "readonly");
    const store = tx.objectStore("events");
    const request = store.getAll(null, 20);
    request.onsuccess = async () => {
      const events = request.result;
      if (events.length === 0) {
        this.isSyncing = false;
        return;
      }
      const payload = {
        sequence: ++this.seq,
        logs: events.filter(e => e.type === "log"),
        metrics: events.filter(e => e.type === "metric"),
        transport: "RTP_v2_IDB"
      };
      try {
        const res = await fetch(this.endpoint + "/" + this.nodeId + "/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success && data.acknowledgedSeq === this.seq) {
          const delTx = this.db.transaction("events", "readwrite");
          const delStore = delTx.objectStore("events");
          const keysReq = delStore.getAllKeys(null, events.length);
          keysReq.onsuccess = () => {
            keysReq.result.forEach(k => delStore.delete(k));
          };
        } else {
          this.seq--;
        }
      } catch (e) {
        this.seq--;
      } finally {
        this.isSyncing = false;
      }
    };
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