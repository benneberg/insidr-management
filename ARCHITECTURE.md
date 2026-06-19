# ARCHITECTURE.md
## Components
- Frontend: React 18 + Vite + Shadcn + Zustand + Recharts
- Backend: Hono + Cloudflare Workers + Durable Objects
- Agent: Zero-dependency browser script (`agent-v1.ts`)
## Data Flow (source of truth = durableObject.ts + store.ts)
1. Agent collects telemetry → batches → POST /api/devices/:id/ingest (CDP-Lite v2 envelope)
2. DO ingests, stores in KV (devices, logs, metrics, network, alerts, commands)
3. Frontend polls /api/devices, /fleet/logs, /fleet/alerts every 5s via singleton
4. Commands queued via POST /api/devices/:id/commands → executed on next agent check-in
## Integrations
- signageOS / LG webOS 6+ via script injection
- Public demo nodes via /api/fleet/public
## Deployment Model
Cloudflare Workers + Durable Objects (single global instance). Assets served via Pages/Workers.
## Observability
- Global activity stream
- Per-device metrics charts
- Command audit trail
- Error boundary + client error reporter
## Risks
- Vite optimizer instability
- Simulated WSS / MessagePack / JWT
- No automated tests
## Improvements
- Real WebSocket + binary transport
- Persistent OPFS storage in agent
- CI + test suite
**Confidence per section**: High for current implemented flow; Medium for future/simulated features.