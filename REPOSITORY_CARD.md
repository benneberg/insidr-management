schema:
  version: 1
  compatible_with:
    - CCC
  generated_by: Repository Bootstrap Prompt
  generated_at: "2026-07-10T03:09:27.062Z"
  repository: insidr-telemetry-mcpq31xan1arg0nlsmawv
name:
  value: insidr
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - package.json name
    - Project branding in code
  notes: ""
short_description:
  value: Remote DevTools and telemetry platform for locked-down Chromium signage devices
  evidence_state: INFERRED
  confidence: HIGH
  evidence:
    - Multiple README references
    - Agent + Control Plane architecture
  notes: ""
category:
  value: Telemetry / Remote Debugging
  evidence_state: INFERRED
  confidence: MEDIUM
  evidence:
    - Agent SDK and dashboard features
  notes: ""
repository_type:
  value: WEB_APP
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - React + Worker architecture
  notes: ""
repository_status:
  value: ACTIVE
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - Recent deployment activity
  notes: ""
complexity:
  value: COMPLEX
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - Multi-phase development history
  notes: ""
primary_technologies:
  value:
    - React 18
    - Vite 6
    - Hono
    - Cloudflare Workers
    - Zustand
    - TypeScript
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - package.json dependencies
  notes: ""
problem_solved:
  value: Remote debugging and telemetry for locked-down digital signage devices
  evidence_state: INFERRED
  confidence: MEDIUM
  evidence:
    - Agent and dashboard functionality
  notes: ""
target_audience:
  value: UNSET
  evidence_state: UNSET
  confidence: NONE
  evidence: []
  notes: ""
primary_users:
  value: UNSET
  evidence_state: UNSET
  confidence: NONE
  evidence: []
  notes: ""
unique_characteristics:
  value:
    - Zero-dependency browser agent
    - CDP-Lite protocol implementation
    - Sandboxed command execution
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - agent-v1.ts and protocol types
  notes: ""
primary_entry_points:
  value:
    - src/main.tsx
    - worker/index.ts
    - /api/agent/bundle
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - Entry file analysis
  notes: ""
current_state:
  value: Production-ready simulation with active development
  evidence_state: INFERRED
  confidence: MEDIUM
  evidence:
    - Multiple deployment commits
  notes: ""
key_risks:
  value:
    - Vite optimizer instability
    - Many simulated features (WSS, MessagePack, JWT)
    - No automated tests
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - Audit documents and TODO.md
  notes: ""
overall_confidence:
  value: 72
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - Evidence gathered from multiple files
  notes: ""