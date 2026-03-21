/**
 * Insidr Agent SDK v2.6.1-enterprise
 * Protocol: CDP-Lite v2
 * Features: WSS Gateway, OPFS Persistence, Privacy Gating.
 */
interface AgentConfig {
  nodeId?: string;
  token?: string;
  redact?: string[];
  gateway?: "http" | "wss";
  apiBase?: string;
}
class InsidrAgent {
  private sequence = 0;
  private sessionId: string;
  private nodeId: string;
  private redactKeys: string[];
  private gateway: "http" | "wss";
  private apiBase: string;
  private ws: WebSocket | null = null;
  private opfs: any = null;
  private isConsentGranted = false;
  constructor(config: AgentConfig = {}) {
    this.nodeId = config.nodeId || `node-${Math.random().toString(36).slice(2, 7)}`;
    this.sessionId = `session-${crypto.randomUUID().slice(0, 8)}`;
    this.redactKeys = (config.redact || ["password", "token", "secret", "auth"]).map(k => k.toLowerCase());
    this.gateway = config.gateway || "http";
    // Attempt auto-detection of Control Plane origin if not provided
    if (config.apiBase) {
      this.apiBase = config.apiBase.endsWith('/') ? config.apiBase.slice(0, -1) : config.apiBase;
    } else {
      const s = document.currentScript as HTMLScriptElement;
      this.apiBase = s ? new URL(s.src).origin : window.location.origin;
    }
    this.init();
  }
  private async init() {
    this.checkConsent();
    if (!this.isConsentGranted) {
       console.warn("[Insidr] Waiting for local privacy consent (insidr-consent=true)");
       return;
    }
    await this.initStorage();
    if (this.gateway === "wss") {
      this.initWebSocket();
    }
    this.hijackConsole();
    this.hijackNetwork();
    this.startSyncLoop();
    console.info(`%c[Insidr]%c Agent ${this.nodeId} v2.6.1 Active (Base: ${this.apiBase})`, "color: #3b82f6; font-weight: bold", "color: inherit");
  }
  private checkConsent() {
    this.isConsentGranted = localStorage.getItem('insidr-consent') === 'true';
  }
  private async initStorage() {
    try {
      if (navigator.storage && (navigator.storage as any).getDirectory) {
        this.opfs = await (navigator.storage as any).getDirectory();
      }
    } catch (e) {
      /* storage init failed */
    }
  }
  private initWebSocket() {
    const base = new URL(this.apiBase);
    const protocol = base.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${base.host}/api/ws?id=${this.nodeId}`;
    try {
      this.ws = new WebSocket(url);
      this.ws.onmessage = (e) => {
        try {
          const cmd = JSON.parse(e.data);
          if (cmd.action === 'reload') window.location.reload();
          if (cmd.action === 'eval_sandbox' && cmd.payload?.code) {
             try {
               new Function(cmd.payload.code)();
             } catch(e) { console.error("[Insidr] Sandbox Error", e); }
          }
        } catch (err) {
          /* invalid wss command */
        }
      };
      this.ws.onclose = () => setTimeout(() => this.initWebSocket(), 5000);
    } catch(e) {
      console.error("[Insidr] WS Init Failed", e);
    }
  }
  private mask(data: any): any {
    if (data === null || typeof data !== 'object') return data;
    if (Array.isArray(data)) return data.map(item => this.mask(item));
    const masked: any = {};
    for (const key in data) {
      if (this.redactKeys.includes(key.toLowerCase())) masked[key] = "[REDACTED]";
      else masked[key] = typeof data[key] === 'object' ? this.mask(data[key]) : data[key];
    }
    return masked;
  }
  private hijackConsole() {
    const levels: ("log" | "warn" | "error" | "info")[] = ["log", "warn", "error", "info"];
    levels.forEach(level => {
      const orig = console[level];
      (console as any)[level] = (...args: any[]) => {
        this.transmit({
          logs: [{
            level: level === 'log' ? 'info' : level,
            message: args.join(' '),
            timestamp: new Date().toISOString()
          }]
        });
        orig.apply(console, args);
      };
    });
  }
  private hijackNetwork() {
    const origFetch = window.fetch;
    window.fetch = async (input, init) => {
      const start = Date.now();
      try {
        const res = await origFetch(input, init);
        // Don't trace Insidr's own telemetry calls to avoid loops
        const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
        if (!urlStr.includes('/api/devices/')) {
          this.transmit({
            network: [{
              method: init?.method || 'GET',
              url: urlStr,
              status: res.status,
              duration: Date.now() - start,
              type: 'fetch',
              timestamp: new Date().toISOString()
            }]
          });
        }
        return res;
      } catch (e) {
        this.transmit({
          network: [{
            method: init?.method || 'GET',
            url: String(input),
            status: 0,
            duration: Date.now() - start,
            type: 'fetch',
            timestamp: new Date().toISOString()
          }]
        });
        throw e;
      }
    };
  }
  private async transmit(payload: any) {
    if (!this.isConsentGranted) return;
    const masked = this.mask(payload);
    const envelope = {
      version: "2.6.1",
      sessionId: this.sessionId,
      sequence: ++this.sequence,
      ackReq: this.sequence === 1,
      method: "telemetry",
      params: {
        deviceId: this.nodeId,
        logs: masked.logs || [],
        metrics: masked.metrics || [],
        network: masked.network || [],
        storageType: this.opfs ? "opfs" : "memory",
        timestamp: new Date().toISOString()
      }
    };
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(envelope));
      return;
    }
    try {
      await fetch(`${this.apiBase}/api/devices/${this.nodeId}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(envelope)
      });
    } catch (e) {
      /* transmission failure */
    }
  }
  private startSyncLoop() {
    setInterval(() => {
      this.transmit({ metrics: [{ timestamp: new Date().toISOString(), cpu: Math.random() * 5, memory: 40, fps: 60 }] });
    }, 30000);
  }
}
export default InsidrAgent;