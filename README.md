# Insidr Telemetry Control Plane v2.6
> **Remote DevTools for Fleet-Scale Signage & IoT**
Insidr is a zero-dependency, telemetry-first remote debugging platform designed specifically for large fleets of locked-down signage devices (webOS, Tizen, Android TV). 
## 🚀 Key Features
- **Remote Console:** Real-time access to device logs (Info, Warn, Error).
- **Network Waterfall:** Inspect every fetch/XHR request across your fleet.
- **Performance Vitals:** Live CPU, Memory, and FPS monitoring.
- **Viewport Mirroring:** View live render previews and historical snapshots.
- **Command Palette:** Securely dispatch `Reload`, `Clear Cache`, or `Eval` commands.
- **Enterprise Security:** Built-in PII redaction and privacy consent management.
## 🛠️ Quickstart
### 1. Deploy Control Plane
The backend is a Cloudflare Worker using Durable Objects.
```bash
bun install
bun run deploy
```
### 2. Inject the Agent
Add the following to your signage application:
```html
<script src="https://your-insidr-instance.com/api/agent/bundle" async></script>
```
### 3. Grant Consent
To enable telemetry collection, ensure your app sets:
```javascript
localStorage.setItem('insidr-consent', 'true');
```
## 🏗️ Architecture
- **Backend:** Hono + Cloudflare Durable Objects.
- **Frontend:** React 18 + Zustand 5 + ShadCN UI.
- **Protocol:** CDP-Lite v2 (Reliable Telemetry Protocol).
## 📜 Documentation
Detailed technical guides are available in the repository root:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Deep dive into data flow.
- [AUDIT.md](./AUDIT.md) - Security and quality reports.
- [USER_MANUAL.md](./src/pages/UserManualPage.tsx) - Comprehensive operator guide.
---
*© 2025 Insidr Enterprise. All Rights Reserved.*