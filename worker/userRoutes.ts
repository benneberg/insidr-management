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
    const sdkCode = `/**
 * Insidr Agent SDK v1.0 - Reliable Telemetry Protocol (RTP)
 * Zero-dependency, Production-ready browser agent.
 */

interface AgentConfig {
  endpoint?: string;
  nodeId?: string;
  batchSize?: number;
  syncInterval?: number;
  maxRetries?: number;
}

interface TelemetryEvent {
  seq: number;
  method: string;
  params: Record<string, any>;
  timestamp: number;
}

declare global {
  interface Window {
    insidr: InsidrAgent;
  }
}

class InsidrAgent {
  private endpoint: string;
  private nodeId: string;
  private batchSize: number;
  private syncInterval: number;
  private maxRetries: number;
  private seq: number = 0;
  private ackSeq: number = 0;
  private buffer: TelemetryEvent[] = [];
  private syncTimer: number | null = null;
  private metricsTimer: number | null = null;
  private db: IDBDatabase | null = null;
  private isSyncing: boolean = false;

  constructor(config: AgentConfig = {}) {
    this.endpoint = config.endpoint || '/api/devices';
    this.nodeId = config.nodeId || this.generateNodeId();
    this.batchSize = config.batchSize || 20;
    this.syncInterval = config.syncInterval || 5000;
    this.maxRetries = config.maxRetries || 5;

    // Auto-init if script has data-node-id
    if (document.currentScript?.hasAttribute('data-node-id')) {
      this.init();
    }
  }

  private generateNodeId(): string {
    if (typeof localStorage !== 'undefined') {
      const existing = localStorage.getItem('insidr:nodeId');
      if (existing) return existing;
    }
    
    const nodeId = 'node_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('insidr:nodeId', nodeId);
    }
    return nodeId;
  }

  public async init(): Promise<void> {
    await this.initDB();
    this.hijackConsole();
    this.hijackFetch();
    this.startMetricsLoop();
    this.startSyncLoop();
    
    // Initial heartbeat
    this.pushEvent('Agent.connected', { nodeId: this.nodeId });
    
    // Expose globally
    (window as any).insidr = this;
  }

  private async initDB(): Promise<void> {
    if (!('indexedDB' in window)) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('insidr_v1', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const eventStore = db.createObjectStore('events', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        eventStore.createIndex('seq', 'seq', { unique: true });
        eventStore.createIndex('timestamp', 'timestamp');
        
        const ackStore = db.createObjectStore('acks', { 
          keyPath: 'seq', 
          autoIncrement: false 
        });
      };
    });
  }

  public pushEvent(method: string, params: Record<string, any> = {}): void {
    const event: TelemetryEvent = {
      seq: ++this.seq,
      method,
      params: {
        ...params,
        nodeId: this.nodeId,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    };

    this.buffer.push(event);
    this.storeEvent(event);
  }

  private async storeEvent(event: TelemetryEvent): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const tx = this.db!.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      const req = store.add(event);
      req.onsuccess = resolve;
    });
  }

  private hijackConsole(): void {
    const methods = ['log', 'info', 'warn', 'error'];
    
    methods.forEach(method => {
      const original = console[method as keyof Console];
      (console as any)[method] = (...args: any[]) => {
        this.pushEvent(`Console.${method}`, { 
          message: args.map(arg => String(arg)).join(' ') 
        });
        original.apply(console, args);
      };
    });
  }

  private hijackFetch(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const method = init?.method || 'GET';
      
      this.pushEvent('Network.request', { url, method });
      
      try {
        const response = await originalFetch(input, init);
        this.pushEvent('Network.response', { 
          url, 
          status: response.status,
          statusText: response.statusText 
        });
        return response;
      } catch (error) {
        this.pushEvent('Network.failure', { 
          url, 
          method,
          error: String(error) 
        });
        throw error;
      }
    };
  }

  private startMetricsLoop(): void {
    this.metricsTimer = setInterval(() => {
      this.pushEvent('Metrics.snapshot', {
        memory: performance.memory,
        connection: navigator.connection,
        timestamp: Date.now()
      });
    }, 30000); // 30s
  }

  private startSyncLoop(): void {
    this.syncTimer = setInterval(() => {
      if (!this.isSyncing) {
        this.sync();
      }
    }, this.syncInterval);
  }

  private async sync(attempt = 1): Promise<void> {
    if (this.isSyncing || this.buffer.length === 0) return;
    
    this.isSyncing = true;
    
    try {
      const batch = this.buffer.splice(0, this.batchSize);
      const response = await fetch(`${this.endpoint}/${this.nodeId}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seq: this.seq,
          ackSeq: this.ackSeq,
          events: batch
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.ackSeq = Math.max(this.ackSeq, result.ackedSeq || 0);
        await this.clearAckedEvents();
      }
    } catch (error) {
      // Restore failed batch to front (batch already spliced from buffer)
      this.buffer.unshift(...batch);
      if (attempt < this.maxRetries) {
        setTimeout(() => this.sync(attempt + 1), 1000 * attempt);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private async clearAckedEvents(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const tx = this.db!.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      const seqIndex = store.index('seq');
      const range = IDBKeyRange.upperBound(this.ackSeq);
      const req = seqIndex.openCursor(range);

      req.onsuccess = (event) => {
        const cursor = event.target!.result as IDBCursorWithValue | null;
        if (cursor) {
          cursor.delete().onsuccess = () => cursor.continue();
        } else {
          resolve();
        }
      };

      req.onerror = () => resolve();
    });
  }

  // Public API
  public reload(): void {
    this.pushEvent('Device.reload');
    window.location.reload();
  }

  public heartbeat(): void {
    this.pushEvent('Device.heartbeat');
  }

  public getInfo(): Record<string, any> {
    return {
      nodeId: this.nodeId,
      seq: this.seq,
      ackSeq: this.ackSeq,
      bufferSize: this.buffer.length,
      timestamp: Date.now()
    };
  }

  public destroy(): void {
    if (this.syncTimer) clearInterval(this.syncTimer);
    if (this.metricsTimer) clearInterval(this.metricsTimer);
    this.buffer = [];
  }
}

export default InsidrAgent;`;
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
    const body = await c.req.json();
    const stub = getStub(c.env);
    
    // Heartbeat update even if payload is empty
    if (!body.logs && !body.metrics && !body.network) {
       // Logic inside DO will handle lastSeen update
    }

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