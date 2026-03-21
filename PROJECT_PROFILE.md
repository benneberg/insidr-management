---
metadata:
  analysis_date: "2026-07-10"
  analysis_version: 1
  analyzed_by: "Repository Intelligence Engine"
analysis_scope:
  files_inspected: 50+
  directories_inspected: ["src", "worker", "shared"]
  limitations: "No runtime execution or production logs inspected"
repository_context:
  repository_name: insidr-telemetry-mcpq31xan1arg0nlsmawv
  repository_url: UNSET
  primary_language: TypeScript
  frameworks: ["React", "Hono"]
  package_manager: Bun
  build_system: Vite
  deployment_target: Cloudflare Workers + Durable Objects
  detected_tools: ["Zustand", "Shadcn", "Recharts", "Tailwind"]
project_identity:
  project_name: insidr
  suggested_names: []
  short_description: Remote DevTools and telemetry platform for locked-down Chromium signage devices
  one_sentence_pitch: A zero-dependency agent + control plane that gives remote debugging and observability to fleets of webOS, Tizen, and Android TV devices.
  category: Developer Tool / Infrastructure
  project_type: WEB_APP
  domain: Digital Signage Telemetry
  technology_tags: ["telemetry", "remote-debugging", "signage", "cloudflare"]
  audience_tags: ["enterprise", "signage-operators", "devops"]
project_classification:
project_intent:
  intent_score: 0.85
  class: PRODUCT
project_purpose:
project_state:
  current_focus: Production stabilization and documentation
  active_work: Enterprise handover documentation
  blocked_by: []
  next_milestone: Real WebSocket gateway + native MessagePack
lifecycle: SHIPABLE
status:
recommendations: ["OPEN_SOURCE_AGENT", "SAAS_CONTROL_PLANE"]
scores:
  effort_required: MEDIUM
  technical_complexity: HIGH
  potential_value: HIGH
  opportunity_score: 78
  priority_score: 85
health:
  health_score: 82
  health_status: HEALTHY
ai_suitability:
  workflow: ASSISTED
  automation_potential: 65
project_memory:
  important_decisions:
    - Chose CDP-Lite v2 protocol envelope for reliable telemetry
    - Enforced primitive Zustand selectors only (Zero-Tolerance Rule)
    - Used Durable Objects for global single-instance state
  architectural_constraints:
    - No eval() in main thread
    - Outbound-only connections (firewall safe)
    - Circular buffers for memory safety (50MB IndexedDB)
  known_limitations:
    - Many transport/auth features are simulated
    - No automated tests
    - Heavy reliance on polling
  future_ideas:
    - Native WebSocket gateway
    - Full MessagePack support
    - Real JWT + CSP enforcement
technical_assessment:
  complexity: COMPLEX
  maturity: DEVELOPING
  scalability_potential: MEDIUM
  security_sensitivity: HIGH
ai_context:
  preferred_workflow: Assisted development with strict selector rules
  coding_preferences: Primitive Zustand selectors + useShallow
  architectural_rules: No direct eval, outbound-only, circular buffers
  forbidden_actions: Direct eval, unsafe innerHTML, multiple React instances
risks:
  - severity: HIGH
    category: Technical
    description: Vite optimizer instability
  - severity: HIGH
    category: Technical
    description: Simulated WSS/MessagePack/JWT layers
  - severity: MEDIUM
    category: Maintenance
    description: No automated tests
portfolio_position: FLAGSHIP_PROJECT
tags: ["telemetry", "remote-debugging", "signage", "enterprise"]
confidence_summary:
  overall_confidence: 78
  evidence_coverage: 85
  uncertainty_areas: ["Production usage", "Real device compatibility"]
---
# Project Profile
## Quick Summary
| Field | Value |
|---|---|
| **Name** | insidr |
| **Stage** | SHIPABLE |
| **Status** | Healthy |
| **Priority** | High |
| **Opportunity** | 78 |
| **Health** | 82 |
| **AI Suitability** | Assisted (65) |
## Overview
insidr is a telemetry-first remote debugging platform designed for large fleets of locked-down digital signage devices. It provides observability and control without requiring physical access or native DevTools.
## Purpose
- **Problem solved**: No DevTools access, lost logs on reboot, no fleet-level visibility
- **Target users**: Enterprise signage operators, SignageOS/LG webOS developers
- **Main use case**: Inject agent → Stream telemetry → Remote commands → Compliance
- **Core value**: Zero-dependency agent with reliable protocol and sandboxed control
## Current State
- **Current lifecycle stage**: SHIPABLE
- **Current status**: Production-ready simulation with enterprise documentation
- **Missing requirements**: Real WebSocket gateway, native MessagePack, automated tests
## Recommended Direction
- **Recommended next action**: Implement real WSS gateway
- **Why**: Reduces latency and improves real-time experience
- **Expected value**: Higher reliability and lower resource usage
## Technical Assessment
- **Architecture observations**: React + Hono/Durable Objects, CDP-Lite v2 protocol
- **Complexity**: COMPLEX
- **Scalability**: Medium (single global Durable Object)
- **Technical risks**: Vite optimizer, simulated transport layers
## AI Development Strategy
- **How AI can assist**: Enforce primitive selectors, generate documentation, suggest protocol improvements
- **Recommended AI workflow**: Assisted development with strict architectural rules
## Risks
- **Technical risks**: Vite instability, simulated WSS/MessagePack
- **Maintenance risks**: Lack of automated tests
- **Adoption risks**: Simulated security features
- **Dependency risks**: Heavy reliance on Cloudflare platform
## Next Actions
1. Implement real WebSocket gateway
2. Add automated tests (Vitest + Playwright)
3. Native MessagePack support
## Project Memory
### Important Decisions
- Chose CDP-Lite v2 protocol envelope
- Enforced Zustand Zero-Tolerance Rule (primitive selectors only)
- Used single global Durable Object for state
### Architectural Constraints
- No eval() in main thread
- Outbound-only connections
- Circular buffers for logs and metrics
### Known Limitations
- Many transport and auth features are simulated
- No automated tests
- Polling-based architecture
### Future Ideas
- Native WSS + MessagePack
- Full JWT + CSP enforcement
- OPFS + SQLite Wasm storage