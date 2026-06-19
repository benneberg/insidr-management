import { Hono } from "hono";
import { cors } from 'hono/cors';
import { Env } from './core-utils';
import type { ApiResponse, Device, CDPLiteV2Payload } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const getStub = (env: Env) => env.GlobalDurableObject.get(env.GlobalDurableObject.idFromName("global"));
  app.use('/api*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'], allowHeaders: ['Content-Type', 'X-Transport'] }));
  app.get('/api/ws', async (c) => {
    const stub = getStub(c.env);
    return stub.fetch(c.req.raw);
  });
  app.get('/api/agent/bundle', async (c) => {
    const code = `/** Insidr Agent v2.6.1-enterprise */
(function(){
  const n="node-"+Math.random().toString(36).slice(2,7);
  const c=localStorage.getItem('insidr-consent')==='true';
  if(c) {
    console.info("[Insidr] Auto-inject successful. NodeID: " + n);
    fetch("/api/devices/"+n+"/ingest",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        version: "2.6.1",
        sessionId: "init-"+Math.random().toString(36).slice(2,8),
        sequence: 1,
        ackReq: true,
        method: "telemetry",
        params:{
          deviceId:n,
          logs:[{level:"info",message:"Agent v2.6.1 check-in",timestamp:new Date().toISOString()}],
          timestamp:new Date().toISOString()
        }
      })
    });
  }
})();`;
    return c.text(code, 200, { 'Content-Type': 'application/javascript' });
  });
  app.get('/api/fleet/public', async (c) => {
    const publicNodes: Device[] = [
      { id: "pub-nyc-01", name: "NYC Core Gateway", status: 'online', lastSeen: new Date().toISOString(), os: 'ChromeOS', ip: '172.22.1.44', memoryUsage: 45, uptime: '14d 2h', version: '2.6.1', protocol: 'JSON', enrolledAt: '2025-01-01T00:00:00Z', isPublic: true, location: 'New York, USA' }
    ];
    return c.json({ success: true, data: publicNodes } satisfies ApiResponse<Device[]>);
  });
  app.get('/api/fleet/logs', async (c) => {
    const stub = getStub(c.env);
    const data = await stub.getGlobalLogs();
    return c.json({ success: true, data: data || [] } satisfies ApiResponse);
  });
  app.get('/api/fleet/alerts', async (c) => {
    const stub = getStub(c.env);
    const data = await stub.getAlerts();
    return c.json({ success: true, data: data || [] } satisfies ApiResponse);
  });
  app.get('/api/devices', async (c) => {
    const stub = getStub(c.env);
    const data = await stub.getDevices();
    return c.json({ success: true, data: data || [] } satisfies ApiResponse<Device[]>);
  });
  app.post('/api/devices/:id/ingest', async (c) => {
    const body = await c.req.json() as CDPLiteV2Payload;
    const stub = getStub(c.env);
    const result = await stub.ingestTelemetry(body);
    return c.json({ success: true, data: result } satisfies ApiResponse);
  });
  app.get('/api/devices/:id/logs', async (c) => c.json({ success: true, data: await getStub(c.env).getDeviceLogs(c.req.param('id')) } satisfies ApiResponse));
  app.get('/api/devices/:id/metrics', async (c) => c.json({ success: true, data: await getStub(c.env).getDeviceMetrics(c.req.param('id')) } satisfies ApiResponse));
  app.get('/api/devices/:id/network', async (c) => c.json({ success: true, data: await getStub(c.env).getDeviceNetwork(c.req.param('id')) } satisfies ApiResponse));
  app.get('/api/devices/:id/commands', async (c) => c.json({ success: true, data: await getStub(c.env).getDeviceCommands(c.req.param('id')) } satisfies ApiResponse));
  app.post('/api/devices/:id/commands', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const stub = getStub(c.env);
    const data = await stub.queueCommand(id, body.action, body.payload);
    return c.json({ success: true, data } satisfies ApiResponse);
  });
  app.post('/api/alerts/:id/resolve', async (c) => {
    const id = c.req.param('id');
    const stub = getStub(c.env);
    await stub.resolveAlert(id);
    return c.json({ success: true } satisfies ApiResponse);
  });
  app.get('/api/compliance/requests', async (c) => {
    const stub = getStub(c.env);
    const data = await stub.getComplianceRequests();
    return c.json({ success: true, data: data || [] } satisfies ApiResponse);
  });
  app.post('/api/compliance/requests', async (c) => {
    const body = await c.req.json();
    const stub = getStub(c.env);
    const data = await stub.addComplianceRequest(body.type, body.deviceId);
    return c.json({ success: true, data } satisfies ApiResponse);
  });
  app.delete('/api/fleet', async (c) => {
    await getStub(c.env).resetFleet();
    return c.json({ success: true } satisfies ApiResponse);
  });
}