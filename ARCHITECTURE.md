schema:
  version: 1
  compatible_with:
    - CCC
  generated_by: Repository Bootstrap Prompt
  generated_at: "2026-07-10T03:09:27.062Z"
  repository: insidr-telemetry-mcpq31xan1arg0nlsmawv
system_layers:
  collection:
    component: Device Agent
    features:
      - Log hijacking (Console API)
      - Network interceptors (Fetch API)
      - Performance metrics (Performance API)
      - PII Redaction engine
  transport:
    protocol: CDP-Lite v2
    modes:
      - HTTP POST (standard)
      - WSS (high-frequency simulation)
  backend:
    platform: Cloudflare Workers
    router: Hono
    persistence: Durable Object (Global Instance)
  presentation:
    framework: React 18
    state: Zustand 5 (Shallow Primitive Selectors)
    styling: Tailwind v3 + Shadcn/UI
data_flow:
  telemetry: Agent -> Ingest API -> Durable Object -> Dashboard (Polling/WSS)
  commands: Control Plane -> Durable Object -> Agent (Check-in/WSS)