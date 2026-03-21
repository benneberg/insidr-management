/**
 * Insidr Agent SDK v2.5 - Enterprise Edition
 * Features: DedicatedWorker Sandbox, PII Redaction, MsgPack Simulation
 */
interface AgentConfig {
  nodeId?: string;
  token?: string;
  redact?: string[];
}
class InsidrAgent {
  private sequence = 0;
  private nodeId: string;
  private token: string;
  private redactKeys: string[];
  private worker: Worker | null = null;
  constructor(config: AgentConfig = {}) {
    this.nodeId = config.nodeId || `node-${Math.random().toString(36).slice(2, 7)}`;
    this.token = config.token || "";
    this.redactKeys = config.redact || ["password", "token", "secret", "apikey"];
    this.init();
  }
  private init() {
    this.initSandbox();
    this.hijackConsole();
    this.startSyncLoop();
    console.info(`[Insidr] Enterprise Agent ${this.nodeId} Active`);
  }
  private initSandbox() {
    // Create a virtual sandbox worker for sensitive commands
    const blob = new Blob([`
      self.onmessage = (e) => {
        try {
          const result = eval(e.data.code);
          self.postMessage({ success: true, result });
        } catch (err) {
          self.postMessage({ success: false, error: err.message });
        }
      }
    `], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));
  }
  private mask(data: any): any {
    if (!data || typeof data !== 'object') return data;
    const masked = Array.isArray(data) ? [] : {};
    for (const key in data) {
      if (this.redactKeys.includes(key.toLowerCase())) {
        (masked as any)[key] = "[REDACTED]";
      } else if (typeof data[key] === 'object') {
        (masked as any)[key] = this.mask(data[key]);
      } else {
        (masked as any)[key] = data[key];
      }
    }
    return masked;
  }
  private hijackConsole() {
    const orig = console.error;
    console.error = (...args: any[]) => {
      this.transmit({ logs: [{ level: 'error', message: args.join(' ') }] });
      orig.apply(console, args);
    };
  }
  private async transmit(payload: any) {
    const masked = this.mask(payload);
    const headers: any = { 
      "Content-Type": "application/json",
      "X-Transport": "MsgPack_Sim"
    };
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    try {
      await fetch(`/api/devices/${this.nodeId}/ingest`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ...masked, sequence: ++this.sequence })
      });
    } catch (e) {
      this.sequence--;
    }
  }
  private startSyncLoop() {
    setInterval(() => {
      this.transmit({ metrics: [{ cpu: 10, memory: 20, fps: 60 }] });
    }, 15000);
  }
  public runSandbox(code: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker) return reject("Sandbox unavailable");
      this.worker.onmessage = (e) => {
        if (e.data.success) resolve(e.data.result);
        else reject(e.data.error);
      };
      this.worker.postMessage({ code });
    });
  }
}
export default InsidrAgent;