# AUDIT.md
## Critical Issues
- Vite dependency optimizer crash: `Cannot read properties of undefined (reading 'browserHash')` — blocks local dev and rebuilds.
- Polling fetch failures previously present; now silenced but indicate fragile network layer.
## High Issues
- WSS, MessagePack, OPFS, full JWT/CSP enforcement are simulated only (not production ready).
- No automated tests or CI.
## Medium Issues
- Zustand v5 selector discipline required repeated enforcement across phases.
- Duplicate React root warning previously observed (fixed in main.tsx).
## Low Issues
- Minor lint warnings remain (no-empty comments, TS shallow typing).
## Dependencies
- All listed in package.json (stable versions). No obvious supply-chain red flags.
## Performance & Observability
- Good: singleton polling, shallow selectors, activity stream.
- Risk: High-frequency telemetry could overwhelm circular buffers under heavy load.
## Evidence Sources
- worker/userRoutes.ts, durableObject.ts, src/lib/store.ts, src/main.tsx, package.json, git history (28 phases).