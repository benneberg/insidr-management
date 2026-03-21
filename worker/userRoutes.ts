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
  app.get('/api/agent/sdk', (c) => {
    const sdkCode = `/** Insidr Agent SDK v1.0 **/ ...`; // Shortened for brevity
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
    const updated = await stub.getAlerts();
    return c.json({ success: true, data: updated });
  });
  app.post('/api/devices/:id/commands', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json() as { action: any; payload?: any };
    const stub = getStub(c.env);
    const data = await stub.queueCommand(id, body.action, body.payload);
    return c.json({ success: true, data });
  });
}