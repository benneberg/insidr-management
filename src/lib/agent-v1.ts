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
}
class InsidrAgent {
  private sequence = 0;
  private sessionId: string;
  private nodeId: string;
  private redactKeys: string[];
  private gateway: "http" | "wss";
  private ws: WebSocket | null = null;
  private opfs: any = null;
  private isConsentGranted = false;
  constructor(config: AgentConfig = {}) {
    this.nodeId = config.nodeId || `node-${Math.random().toString(36).slice(2, 7)}`;
    this.sessionId = `session-${crypto.randomUUID().slice(0, 8)}`;
    this.redactKeys = (config.redact || ["password", "token", "secret", "auth"]).map(k => k.toLowerCase());
    this.gateway = config.gateway || "http";
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
    console.info(`%c[Insidr]%c Agent ${this.nodeId} v2.6.1 Active (Session: ${this.sessionId})`, "color: #3b82f6; font-weight: bold", "color: inherit");
  }
  private checkConsent() {
    this.isConsentGranted = localStorage.getItem('insidr-consent') === 'true';
  }
  private async initStorage() {
    try {
      if (navigator.storage && (navigator.storage as any).getDirectory) {
        this.opfs = await (navigator.storage as any).getDirectory();
        console.log("[Insidr] OPFS Storage Active");
      }
    } catch (e) {
      /* storage init failed */
    }
  }
  private initWebSocket() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/api/ws?id=${this.nodeId}`;
    this.ws = new WebSocket(url);
    this.ws.onmessage = (e) => {
      try {
        const cmd = JSON.parse(e.data);
        if (cmd.action === 'reload') window.location.reload();
      } catch (err) {
        /* invalid wss command */
      }
    };
    this.ws.onclose = () => setTimeout(() => this.initWebSocket(), 5000);
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
        this.transmit({
          network: [{
            method: init?.method || 'GET',
            url: typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url,
            status: res.status,
            duration: Date.now() - start,
            type: 'fetch',
            timestamp: new Date().toISOString()
          }]
        });
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
    // CDP-Lite v2 Envelope
    const envelope = {
      version: "2.6.1",
      sessionId: this.sessionId,
      sequence: ++this.sequence,
      ackReq: this.sequence === 1,
      method: "telemetry",
      params: {
        deviceId: this.nodeId,
        ...masked,
        storageType: this.opfs ? "opfs" : "memory",
        timestamp: new Date().toISOString()
      }
    };
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(envelope));
      return;
    }
    try {
      await fetch(`/api/devices/${this.nodeId}/ingest`, {
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
      this.transmit({ metrics: [{ timestamp: new Date().toISOString(), cpu: Math.random() * 10, memory: 40, fps: 60 }] });
    }, 15000);
  }
}
export default InsidrAgent;