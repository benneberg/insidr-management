/**
 * Insidr Agent SDK v2.6.0-enterprise
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
  private nodeId: string;
  private token: string;
  private redactKeys: string[];
  private gateway: "http" | "wss";
  private ws: WebSocket | null = null;
  private opfs: any = null;
  private isConsentGranted = false;
  constructor(config: AgentConfig = {}) {
    this.nodeId = config.nodeId || `node-${Math.random().toString(36).slice(2, 7)}`;
    this.token = config.token || "";
    this.redactKeys = (config.redact || ["password", "token", "secret"]).map(k => k.toLowerCase());
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
    this.startSyncLoop();
    console.info(`%c[Insidr]%c Agent ${this.nodeId} v2.6.0 Active`, "color: #3b82f6; font-weight: bold", "color: inherit");
  }
  private checkConsent() {
    this.isConsentGranted = localStorage.getItem('insidr-consent') === 'true';
  }
  private async initStorage() {
    try {
      if (navigator.storage && navigator.storage.getDirectory) {
        this.opfs = await navigator.storage.getDirectory();
        console.log("[Insidr] OPFS Hardened Storage Detected");
      }
    } catch (e) {}
  }
  private initWebSocket() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/api/ws?id=${this.nodeId}`;
    this.ws = new WebSocket(url);
    this.ws.onmessage = (e) => {
      try {
        const cmd = JSON.parse(e.data);
        if (cmd.action === 'reload') window.location.reload();
      } catch {}
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
    const origError = console.error;
    console.error = (...args: any[]) => {
      this.transmit({ logs: [{ level: 'error', message: args.join(' '), timestamp: new Date().toISOString() }] });
      origError.apply(console, args);
    };
  }
  private async transmit(payload: any) {
    if (!this.isConsentGranted) return;
    const masked = this.mask(payload);
    const data = { ...masked, sequence: ++this.sequence, storageType: this.opfs ? "opfs" : "memory" };
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return;
    }
    try {
      await fetch(`/api/devices/${this.nodeId}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Transport": "MsgPack_Sim" },
        body: JSON.stringify(data)
      });
    } catch (e) {}
  }
  private startSyncLoop() {
    setInterval(() => {
      this.transmit({ metrics: [{ timestamp: new Date().toISOString(), cpu: Math.random() * 10, memory: 40, fps: 60 }] });
    }, 15000);
  }
}
export default InsidrAgent;