import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const getStub = (env: Env) => env.GlobalDurableObject.get(env.GlobalDurableObject.idFromName("global"));
  app.get('/api/fleet/stream', async (c) => {
    const stub = getStub(c.env);
    const data = await stub.getGlobalActivity();
    return c.json({ success: true, data });
  });
  app.get('/api/agent/sdk', (c) => {
    const sdkCode = `
/** Insidr Agent SDK v1.0 (Reliable Telemetry Protocol) **/
(function() {
  const CONFIG = {
    endpoint: window.location.origin + '/api/devices/',
    nodeId: document.currentScript?.dataset.nodeId || 'unknown',
    batchSize: 50,
    flushInterval: 5000
  };
  let sequence = parseInt(localStorage.getItem('insidr_seq') || '0');
  let buffer = JSON.parse(localStorage.getItem('insidr_buffer') || '[]');
  const persist = () => {
    localStorage.setItem('insidr_seq', sequence.toString());
    localStorage.setItem('insidr_buffer', JSON.stringify(buffer));
  };
  const flush = async () => {
    if (buffer.length === 0 || !navigator.onLine) return;
    const currentBatch = buffer.slice(0, CONFIG.batchSize);
    const payload = {
      sequence: ++sequence,
      logs: currentBatch.filter(e => e.type === 'log'),
      metrics: currentBatch.filter(e => e.type === 'metric'),
      transport: 'RTP-over-HTTP'
    };
    try {
      const res = await fetch(CONFIG.endpoint + CONFIG.nodeId + '/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.acknowledgedSeq === sequence) {
        buffer = buffer.slice(currentBatch.length);
        persist();
      }
    } catch (e) {
      console.warn('[Insidr] Flush failed, retrying next cycle');
    }
  };
  window.insidr = {
    log: (level, message) => {
      buffer.push({ type: 'log', level, message, timestamp: new Date().toISOString() });
      persist();
    },
    metric: (data) => {
      buffer.push({ type: 'metric', ...data, timestamp: new Date().toISOString() });
      persist();
    }
  };
  setInterval(flush, CONFIG.flushInterval);
})();`;
    return c.text(sdkCode);
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
    return c.json({ success: true });
  });
  app.post('/api/devices/:id/commands', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json() as { action: any; payload?: any };
    const stub = getStub(c.env);
    const data = await stub.queueCommand(id, body.action, body.payload);
    return c.json({ success: true, data });
  });
}