/**
 * Insidr Agent SDK v1.0 - Reliable Telemetry Protocol (RTP)
 * Zero-dependency, Production-ready browser agent.
 */
interface AgentConfig {
  nodeId?: string;
  endpoint?: string;
  sampleRate?: number;
}
class InsidrAgent {
  private buffer: any[] = [];
  private sequence = 0;
  private nodeId: string;
  private endpoint: string;
  private isSyncing = false;
  private db: IDBDatabase | null = null;
  private backoff = 1000;
  constructor(config: AgentConfig = {}) {
    this.nodeId = config.nodeId || `node-${Math.random().toString(36).slice(2, 7)}`;
    this.endpoint = config.endpoint || `${window.location.origin}/api/devices/${this.nodeId}/ingest`;
    this.initDB().then(() => {
      this.hijackConsole();
      this.hijackFetch();
      this.startMetricsLoop();
      this.startSyncLoop();
      console.info(`[Insidr] Agent initialized as ${this.nodeId}`);
    });
  }
  private async initDB() {
    return new Promise((resolve) => {
      const request = indexedDB.open(`insidr_buffer_${this.nodeId}`, 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('events')) {
          db.createObjectStore('events', { autoIncrement: true });
        }
      };
      request.onsuccess = (e: any) => {
        this.db = e.target.result;
        resolve(true);
      };
    });
  }
  private async pushToBuffer(event: any) {
    if (!this.db) return;
    const tx = this.db.transaction('events', 'readwrite');
    tx.objectStore('events').add({ ...event, timestamp: new Date().toISOString() });
  }
  private hijackConsole() {
    const levels: ('log' | 'warn' | 'error' | 'info' | 'debug')[] = ['log', 'warn', 'error', 'info', 'debug'];
    levels.forEach(level => {
      const original = (console as any)[level];
      (console as any)[level] = (...args: any[]) => {
        const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        this.pushToBuffer({ type: 'log', level: level === 'log' ? 'info' : level, message });
        original.apply(console, args);
      };
    });
  }
  private hijackFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const start = performance.now();
      const url = typeof input === 'string' ? input : (input as Request).url;
      try {
        const response = await originalFetch(input, init);
        const duration = Math.round(performance.now() - start);
        if (!url.includes('/api/devices')) {
          this.pushToBuffer({
            type: 'network',
            method: init?.method || 'GET',
            url,
            status: response.status,
            duration
          });
        }
        return response;
      } catch (err: any) {
        this.pushToBuffer({
          type: 'network',
          method: init?.method || 'GET',
          url,
          status: 0,
          duration: Math.round(performance.now() - start),
          error: err.message
        });
        throw err;
      }
    };
  }
  private startMetricsLoop() {
    setInterval(() => {
      const mem = (performance as any).memory;
      this.pushToBuffer({
        type: 'metric',
        cpu: Math.floor(Math.random() * 30), // Mock CPU as JS can't read system CPU
        memory: mem ? Math.round((mem.usedJSHeapSize / mem.jsHeapLimit) * 100) : 0,
        fps: 60,
        timestamp: new Date().toISOString()
      });
    }, 5000);
  }
  private async startSyncLoop() {
    const run = async () => {
      if (this.isSyncing || !this.db) return;
      const tx = this.db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const request = store.getAll(null, 20); // Batch of 20
      request.onsuccess = async () => {
        const events = request.result;
        if (events.length === 0) {
          setTimeout(run, 3000);
          return;
        }
        this.isSyncing = true;
        const payload = {
          sequence: ++this.sequence,
          logs: events.filter(e => e.type === 'log'),
          metrics: events.filter(e => e.type === 'metric'),
          network: events.filter(e => e.type === 'network')
        };
        try {
          const res = await fetch(this.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (data.success && data.acknowledgedSeq === this.sequence) {
            const delTx = this.db!.transaction('events', 'readwrite');
            const delStore = delTx.objectStore('events');
            // Simplified: Clear processed count from start
            const keysReq = delStore.getAllKeys(null, events.length);
            keysReq.onsuccess = () => {
              keysReq.result.forEach(k => delStore.delete(k));
            };
            this.backoff = 1000;
          } else {
            this.sequence--; // Retry same sequence
            this.backoff = Math.min(this.backoff * 2, 30000);
          }
        } catch (e) {
          this.sequence--;
          this.backoff = Math.min(this.backoff * 2, 30000);
        } finally {
          this.isSyncing = false;
          setTimeout(run, this.backoff);
        }
      };
    };
    run();
  }
}
// Auto-initialize if running in browser
if (typeof window !== 'undefined') {
  const script = document.currentScript;
  const nodeId = script?.getAttribute('data-node-id');
  (window as any).insidr = new InsidrAgent({ nodeId: nodeId || undefined });
}
export default InsidrAgent;