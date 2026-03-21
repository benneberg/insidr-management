schema:
  version: 1
  compatible_with:
    - CCC
  generated_by: Repository Bootstrap Prompt
  generated_at: "2026-07-10T03:09:27.062Z"
  repository: insidr-telemetry-mcpq31xan1arg0nlsmawv
identity:
  name: Insidr Telemetry Control Plane
  version: v2.6.1-enterprise
  owner: Cloudflare Team (Durable Objects Division)
  protocol: CDP-Lite v2.6
relationships:
  agent_sdk:
    path: src/lib/agent-v1.ts
    role: Collection & Redaction
  worker_backend:
    path: worker/index.ts
    role: Ingestion & Routing
  persistence:
    path: worker/durableObject.ts
    role: Global State & Circular Buffering
  frontend:
    path: src/main.tsx
    role: Fleet Visualization & Remote Debugging
compliance:
  gdpr:
    status: ACTIVE
    evidence: src/components/ConsentBanner.tsx
  ccpa:
    status: ACTIVE
    evidence: src/lib/store.ts (privacy gating)