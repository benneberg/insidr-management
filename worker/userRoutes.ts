import { Hono } from "hono";
import { Env } from './core-utils';
import type { Device, LogEvent, Command, ApiResponse } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const getStub = (env: Env) => env.GlobalDurableObject.get(env.GlobalDurableObject.idFromName("global"));
  app.get('/api/devices', async (c) => {
    const stub = getStub(c.env);
    const data = await stub.getDevices();
    return c.json({ success: true, data } satisfies ApiResponse<Device[]>);
  });
  app.get('/api/devices/:id', async (c) => {
    const id = c.req.param('id');
    const stub = getStub(c.env);
    const devices = await stub.getDevices();
    const device = devices.find(d => d.id === id);
    return c.json({ success: true, data: device } satisfies ApiResponse<Device>);
  });
  app.get('/api/devices/:id/logs', async (c) => {
    const id = c.req.param('id');
    const stub = getStub(c.env);
    const data = await stub.getDeviceLogs(id);
    return c.json({ success: true, data } satisfies ApiResponse<LogEvent[]>);
  });
  app.post('/api/devices/:id/commands', async (c) => {
    const id = c.req.param('id');
    const { action } = await c.req.json() as { action: Command['action'] };
    const stub = getStub(c.env);
    const data = await stub.queueCommand(id, action);
    return c.json({ success: true, data } satisfies ApiResponse<Command>);
  });
}