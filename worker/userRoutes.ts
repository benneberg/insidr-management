import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, Device } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const getStub = (env: Env) => env.GlobalDurableObject.get(env.GlobalDurableObject.idFromName("global"));
  app.get('/api/agent/bundle', async (c) => {
    // In a real app, this would return a minified JS file from KV or R2
    const code = `/** Insidr Enterprise Agent v2.5.0-production */
(function(){console.log("Insidr Agent Initialized");const n="node-"+Math.random().toString(36).slice(2,7);fetch("/api/devices/"+n+"/ingest",{method:"POST",body:JSON.stringify({logs:[{level:"info",message:"Agent distribution check-in"}],sequence:1})})})();`;
    return c.text(code, 200, { 'Content-Type': 'application/javascript' });
  });
  app.get('/api/fleet/public', async (c) => {
    const publicNodes: Device[] = [
      {
        id: "pub-nyc-01",
        name: "Times Square Billboard 4",
        status: 'online',
        lastSeen: new Date().toISOString(),
        os: 'webOS',
        ip: '172.22.1.44',
        memoryUsage: 45,
        uptime: '14d 2h',
        version: '2.5.0',
        protocol: 'MsgPack_Sim',
        enrolledAt: '2025-01-01T00:00:00Z',
        isPublic: true,
        location: 'New York, USA'
      },
      {
        id: "pub-ldn-02",
        name: "Piccadilly Circus North",
        status: 'online',
        lastSeen: new Date().toISOString(),
        os: 'Tizen',
        ip: '10.5.0.12',
        memoryUsage: 32,
        uptime: '8d 5h',
        version: '2.5.0',
        protocol: 'JSON',
        enrolledAt: '2025-02-15T10:00:00Z',
        isPublic: true,
        location: 'London, UK'
      }
    ];
    return c.json({ success: true, data: publicNodes } satisfies ApiResponse<Device[]>);
  });
  app.get('/api/fleet/logs', async (c) => {
    const stub = getStub(c.env);
    const data = await stub.getGlobalLogs();
    return c.json({ success: true, data });
  });
  app.get('/api/fleet/alerts', async (c) => {
    const stub = getStub(c.env);
    const data = await stub.getAlerts();
    return c.json({ success: true, data });
  });
  app.post('/api/alerts/:id/resolve', async (c) => {
    const id = c.req.param('id');
    const stub = getStub(c.env);
    await stub.resolveAlert(id);
    return c.json({ success: true });
  });
  app.get('/api/devices', async (c) => {
    const stub = getStub(c.env);
    const data = await stub.getDevices();
    return c.json({ success: true, data });
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
    const data = await stub.getDeviceCommands(id);
    return c.json({ success: true, data });
  });
  app.post('/api/devices/:id/commands', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const stub = getStub(c.env);
    const data = await stub.queueCommand(id, body.action, body.payload);
    return c.json({ success: true, data });
  });
  app.post('/api/devices/:id/ingest', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const stub = getStub(c.env);
    const result = await stub.ingestTelemetry(id, body);
    return c.json(result);
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
    await stub.performComplianceAction(req);
    return c.json({ success: true, data: req });
  });
  app.delete('/api/fleet', async (c) => {
    const stub = getStub(c.env);
    await stub.resetFleet();
    return c.json({ success: true });
  });
}