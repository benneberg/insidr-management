schema:
  version: 1
  compatible_with:
    - CCC
  generated_by: Repository Bootstrap Prompt
  generated_at: "2026-07-10T03:09:27.062Z"
  repository: insidr-telemetry-mcpq31xan1arg0nlsmawv
repository_type:
  value: WEB_APP
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - src/main.tsx contains React Router and ReactDOM
    - Vite + React + Cloudflare Workers structure
  notes: ""
repository_status:
  value: ACTIVE
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - Multiple recent commits and phase implementations
    - Deployment logs show active development
  notes: ""
complexity:
  value: COMPLEX
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - 28+ completed phases
    - Frontend + backend + agent SDK + Durable Objects
    - Telemetry protocol implementation
  notes: ""
primary_language:
  value: TypeScript
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - All source files use .ts/.tsx extension
    - tsconfig.json present
  notes: ""
secondary_languages:
  value:
    - JavaScript
  evidence_state: OBSERVED
  confidence: MEDIUM
  evidence:
    - worker/index.ts and some config files
  notes: ""
primary_framework:
  value: React
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - src/main.tsx and component structure
    - package.json dependencies
  notes: ""
build_system:
  value: Vite
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - vite.config.ts present
    - package.json scripts reference vite
  notes: ""
package_manager:
  value: Bun
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - bun.lock and package.json scripts
    - "bun run" commands in logs
  notes: ""
test_framework:
  value: UNSET
  evidence_state: UNSET
  confidence: NONE
  evidence: []
  notes: "No test configuration or test files detected"
workspace_or_single:
  value: SINGLE_REPOSITORY
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - Single package.json and root-level structure
  notes: ""
repository_maturity:
  value: PROTOTYPE
  evidence_state: INFERRED
  confidence: MEDIUM
  evidence:
    - 28+ development phases
    - Many features marked as simulated
    - No automated tests
  notes: ""
overall_confidence:
  value: 75
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - Large number of observed files and commits
  notes: ""
evidence_summary:
  value:
    - Extensive React + Hono + Durable Objects implementation
    - Telemetry-focused application
    - Multiple completed development phases
  evidence_state: OBSERVED
  confidence: HIGH
  notes: ""
unknown_areas:
  value:
    - Production deployment status
    - Real usage telemetry
    - Actual device integration
  evidence_state: UNSET
  confidence: NONE
  evidence: []
  notes: ""