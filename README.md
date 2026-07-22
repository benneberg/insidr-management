# insidr
**Remote DevTools and Telemetry Platform for Locked-Down Chromium Signage Devices**
insidr enables real-time observability, debugging, and control of large fleets of webOS, Tizen, Android TV, and ChromeOS signage devices — without physical access or native DevTools.
## Features
- **Zero-Dependency Agent** — Inject a single `<script>` tag
- **Reliable Telemetry Protocol (CDP-Lite v2)** — Sequence numbers, ACKs, batching, retry with jitter
- **Full Telemetry Coverage** — Console logs, network requests, performance metrics, page lifecycle, viewport snapshots
- **Remote Command Execution** — Sandboxed commands (reload, clear cache, eval) via DedicatedWorker
- **Fleet Dashboard** — Real-time device status, logs, metrics, network waterfall, and alerts
- **Compliance Ready** — PII redaction, consent gating, data export/delete APIs
## Quick Start
### 1. Deploy the Control Plane
```bash
git clone <your-repo>
bun install
bun run deploy
```
### 2. Enroll Devices
Add the agent to your signage application:
```html
<script
  src="https://your-control-plane.workers.dev/api/agent/bundle"
  data-redact="password,token,secret"
  async
></script>
```
### 3. Monitor Fleet
Open the dashboard to view live telemetry, execute remote commands, and manage alerts.
## Architecture
```
[Browser Agent] → [WSS / HTTP] → [Cloudflare Workers + Durable Objects] → [React Dashboard]
```
- **Agent**: `src/lib/agent-v1.ts` (browser-only, ~zero dependencies)
- **Backend**: `worker/durableObject.ts` + `worker/userRoutes.ts`
- **Frontend**: React 18 + Vite + Shadcn + Zustand
## Documentation
- [User Manual](./src/pages/UserManualPage.tsx)
- [Architecture](./ARCHITECTURE.md)
- [Project Profile](./PROJECT_PROFILE.md)
## Deployment
- Cloudflare Workers + Durable Objects
- Deploy with `wrangler deploy`
## License
MIT (Agent SDK) / Proprietary (Control Plane)
## Status
**v2.6.1-enterprise** — Production ready for enterprise signage fleets.