import { Hono } from "hono";
import { cors } from 'hono/cors';
import { Env } from './core-utils';
import type { ApiResponse, Device, SystemAlert } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const getStub = (env: Env) => env.GlobalDurableObject.get(env.GlobalDurableObject.idFromName("global"));
  app.use('/api*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'], allowHeaders: ['Content-Type', 'X-Transport'] }));
  app.get('/api/ws', async (c) => {
    const stub = getStub(c.env);
    return stub.fetch(c.req.raw);
  });
  app.get('/api/agent/bundle', async (c) => {
    const code = `/** Insidr Agent v2.6.0 */
(function(){const n="node-"+Math.random().toString(36).slice(2,7);const c=localStorage.getItem('insidr-consent')==='true';if(c)fetch("/api/devices/"+n+"/ingest",{method:"POST",headers:{"X-Transport":"JSON"},body:JSON.stringify({logs:[{level:"info",message:"Agent check-in"}],sequence:1})})})();`;
    return c.text(code, 200, { 'Content-Type': 'application/javascript' });
  });
  app.get('/api/fleet/public', async (c) => {
    const publicNodes: Device[] = [
      { id: "pub-nyc-01", name: "NYC Core Gateway", status: 'online', lastSeen: new Date().toISOString(), os: 'ChromeOS', ip: '172.22.1.44', memoryUsage: 45, uptime: '14d 2h', version: '2.6.0', protocol: 'MsgPack_Sim', enrolledAt: '2025-01-01T00:00:00Z', isPublic: true, location: 'New York, USA' }
    ];
    return c.json({ success: true, data: publicNodes });
  });
  app.get('/api/fleet/logs', async (c) => {
    const stub = getStub(c.env);
    return c.json({ success: true, data: await stub.getGlobalLogs() });
  });
  app.get('/api/fleet/alerts', async (c) => {
    const stub = getStub(c.env);
    return c.json({ success: true, data: await stub.getAlerts() });
  });
  app.get('/api/devices', async (c) => {
    const stub = getStub(c.env);
    return c.json({ success: true, data: await stub.getDevices() });
  });
  app.post('/api/devices/:id/ingest', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const stub = getStub(c.env);
    // Simulate CSP Validation
    const csp = c.req.header('Content-Security-Policy');
    if (csp && csp.includes('unsafe-inline')) {
       // Logic to trigger system alert for insecure CSP
    }
    const result = await stub.ingestTelemetry(id, body);
    return c.json(result);
  });
  app.get('/api/devices/:id/logs', async (c) => c.json({ success: true, data: await getStub(c.env).getDeviceLogs(c.req.param('id')) }));
  app.get('/api/devices/:id/metrics', async (c) => c.json({ success: true, data: await getStub(c.env).getDeviceMetrics(c.req.param('id')) }));
  app.get('/api/devices/:id/network', async (c) => c.json({ success: true, data: await getStub(c.env).getDeviceNetwork(c.req.param('id')) }));
  app.get('/api/devices/:id/commands', async (c) => c.json({ success: true, data: await getStub(c.env).getDeviceCommands(c.req.param('id')) }));
  app.post('/api/devices/:id/commands', async (c) => {
    const data = await getStub(c.env).queueCommand(c.req.param('id'), (await c.req.json()).action, (await c.req.json()).payload);
    return c.json({ success: true, data });
  });
  app.get('/api/compliance/requests', async (c) => c.json({ success: true, data: await getStub(c.env).getComplianceRequests() }));
  app.delete('/api/fleet', async (c) => { await getStub(c.env).resetFleet(); return c.json({ success: true }); });
}