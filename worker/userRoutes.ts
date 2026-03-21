import { Hono } from "hono";
import { cors } from 'hono/cors';
import { Env } from './core-utils';
import type { ApiResponse, Device } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const getStub = (env: Env) => env.GlobalDurableObject.get(env.GlobalDurableObject.idFromName("global"));
  
  app.use('/api*', cors({ 
    origin: '*', 
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'], 
    allowHeaders: ['Content-Type'], 
    credentials: false 
  }));
  app.get('/api/agent/bundle', async (c) => {
    try {
      // In a real app, this would return a minified JS file from KV or R2
      const code = `/** Insidr Enterprise Agent v2.5.0-production */
(function(){console.log("Insidr Agent Initialized");const n="node-"+Math.random().toString(36).slice(2,7);fetch("/api/devices/"+n+"/ingest",{method:"POST",body:JSON.stringify({logs:[{level:"info",message:"Agent distribution check-in"}],sequence:1})})})();`;
      return c.text(code, 200, { 'Content-Type': 'application/javascript' });
    } catch (error) {
      return c.json({ success: false, error: 'Failed to serve agent bundle' }, 500);
    }
  });
  app.get('/api/fleet/public', async (c) => {
    try {
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
    } catch (error) {
      return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  });
  app.get('/api/fleet/logs', async (c) => {
    try {
      const stub = getStub(c.env);
      const data = await stub.getGlobalLogs();
      return c.json({ success: true, data });
    } catch (error) {
      return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  });
  app.get('/api/fleet/alerts', async (c) => {
    try {
      const stub = getStub(c.env);
      const data = await stub.getAlerts();
      return c.json({ success: true, data });
    } catch (error) {
      return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  });
  app.post('/api/alerts/:id/resolve', async (c) => {
    try {
      const id = c.req.param('id');
      const stub = getStub(c.env);
      await stub.resolveAlert(id);
      return c.json({ success: true });
    } catch (error) {
      return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  });
  app.get('/api/devices', async (c) => {
    try {
      const stub = getStub(c.env);
      const data = await stub.getDevices();
      return c.json({ success: true, data });
    } catch (error) {
      return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  });
  app.get('/api/devices/:id/logs', async (c) => {
    try {
      const id = c.req.param('id');
      const stub = getStub(c.env);
      const data = await stub.getDeviceLogs(id);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  });
  app.get('/api/devices/:id/metrics', async (c) => {
    try {
      const id = c.req.param('id');
      const stub = getStub(c.env);
      const data = await stub.getDeviceMetrics(id);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  });
  app.get('/api/devices/:id/network', async (c) => {
    try {
      const id = c.req.param('id');
      const stub = getStub(c.env);
      const data = await stub.getDeviceNetwork(id);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  });
  app.get('/api/devices/:id/commands', async (c) => {
    try {
      const id = c.req.param('id');
      const stub = getStub(c.env);
      const data = await stub.getDeviceCommands(id);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  });
  app.post('/api/devices/:id/commands', async (c) => {
    try {
      const id = c.req.param('id');
      const body = await c.req.json();
      const stub = getStub(c.env);
      const data = await stub.queueCommand(id, body.action, body.payload);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  });
  app.post('/api/devices/:id/ingest', async (c) => {
    try {
      const id = c.req.param('id');
      const body = await c.req.json();
      const stub = getStub(c.env);
      const result = await stub.ingestTelemetry(id, body);
      return c.json(result);
    } catch (error) {
      return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  });
  app.get('/api/compliance/requests', async (c) => {
    try {
      const stub = getStub(c.env);
      const data = await stub.getComplianceRequests();
      return c.json({ success: true, data });
    } catch (error) {
      return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  });
  app.post('/api/compliance/requests', async (c) => {
    try {
      const body = await c.req.json() as { type: 'export' | 'delete'; deviceId: string };
      const stub = getStub(c.env);
      const req = await stub.queueComplianceRequest(body.type, 'device_id', body.deviceId);
      await stub.performComplianceAction(req);
      return c.json({ success: true, data: req });
    } catch (error) {
      return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  });
  app.delete('/api/fleet', async (c) => {
    try {
      const stub = getStub(c.env);
      await stub.resetFleet();
      return c.json({ success: true });
    } catch (error) {
      return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  });
}