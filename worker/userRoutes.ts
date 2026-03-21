import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, Command, ComplianceRequest } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const getStub = (env: Env) => env.GlobalDurableObject.get(env.GlobalDurableObject.idFromName("global"));
  app.post('/api/auth/enroll', async (c) => {
    const body = await c.req.json();
    if (!body.orgId) return c.json({ success: false, error: "Missing Org ID" }, 400);
    // Simulate JWT issuance
    const token = `insidr_live_${crypto.randomUUID().replace(/-/g, '')}`;
    return c.json({ 
      success: true, 
      data: { token, expiresAt: new Date(Date.now() + 86400000 * 365).toISOString() } 
    });
  });
  app.get('/api/compliance/requests', async (c) => {
    const stub = getStub(c.env);
    const data = await stub.getComplianceRequests();
    return c.json({ success: true, data });
  });
  app.post('/api/compliance/requests', async (c) => {
    const body = await c.req.json() as { type: 'export' | 'delete'; deviceId: string };
    const stub = getStub(c.env);
    const req = await stub.queueComplianceRequest(body.type, 'device_id', body.deviceId);
    // In a real worker, we'd use ctx.waitUntil for the heavy lifting
    await stub.performComplianceAction(req);
    return c.json({ success: true, data: req });
  });
  app.get('/api/agent/sdk', (c) => {
    const redactConfig = { enabled: true, keys: ['password', 'secret', 'token', 'auth'] };
    const sdkCode = `/**
 * Insidr Enterprise SDK v2.5 - Production Protocol
 * Features: PII Redaction, Binary Simulation, JWT Auth
 */
class InsidrEnterpriseAgent {
  constructor(config = {}) {
    this.endpoint = config.endpoint || "/api/devices";
    this.token = config.token || localStorage.getItem("INSIDR_TOKEN");
    this.redact = ${JSON.stringify(redactConfig)};
    this.seq = 0;
    this.init();
  }
  init() {
    this.hijackConsole();
    this.startHeartbeat();
    console.log("[Insidr] Enterprise Sandbox Ready");
  }
  mask(obj) {
    if (!this.redact.enabled || !obj || typeof obj !== 'object') return obj;
    const masked = Array.isArray(obj) ? [] : {};
    for (let key in obj) {
      if (this.redact.keys.includes(key.toLowerCase())) {
        masked[key] = "[REDACTED]";
      } else if (typeof obj[key] === 'object') {
        masked[key] = this.mask(obj[key]);
      } else {
        masked[key] = obj[key];
      }
    }
    return masked;
  }
  async send(payload) {
    const masked = this.mask(payload);
    const headers = { "Content-Type": "application/json" };
    if (this.token) headers["Authorization"] = "Bearer " + this.token;
    // Simulate Protocol Efficiency (MsgPack Sim)
    headers["X-Transport"] = "MsgPack_Sim";
    return fetch(this.endpoint + "/ingest", {
      method: "POST",
      headers,
      body: JSON.stringify({ ...masked, sequence: ++this.seq })
    });
  }
  hijackConsole() {
    const orig = console.error;
    console.error = (...args) => {
      this.send({ logs: [{ level: 'error', message: args.join(' ') }] });
      orig.apply(console, args);
    };
  }
  startHeartbeat() {
    setInterval(() => this.send({ metrics: [{ memory: 45, cpu: 12 }] }), 10000);
  }
}
window.insidr = new InsidrEnterpriseAgent();`;
    return c.text(sdkCode, 200, { 'Content-Type': 'application/javascript' });
  });
  app.get('/api/devices', async (c) => {
    const stub = getStub(c.env);
    const data = await stub.getDevices();
    return c.json({ success: true, data });
  });
  app.post('/api/devices/:id/ingest', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const stub = getStub(c.env);
    const result = await stub.ingestTelemetry(id, body);
    return c.json(result);
  });
  app.get('/api/devices/:id/logs', async (c) => {
    const id = c.req.param('id');
    const stub = getStub(c.env);
    const data = await stub.getDeviceLogs(id);
    return c.json({ success: true, data });
  });
  app.post('/api/devices/:id/commands', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const stub = getStub(c.env);
    const data = await stub.queueCommand(id, body.action, body.payload);
    return c.json({ success: true, data });
  });
}