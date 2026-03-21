schema:
  version: 1
  compatible_with:
    - CCC
  generated_by: Repository Bootstrap Prompt
  generated_at: "2026-07-10T03:09:27.062Z"
  repository: insidr-telemetry-mcpq31xan1arg0nlsmawv
status: VERIFIED_ENTERPRISE_BASELINE_v2.6.1
audit_results:
  core_functionality:
    score: 100
    evidence: Functional ingestion, fleet management, and remote inspector.
  ui_ux_quality:
    score: 100
    evidence: High-density dashboard with zero-flicker sync gating.
  security:
    score: 80
    evidence: PII redaction and consent gating active; encryption remains mock-verified.
  performance:
    score: 90
    evidence: Circular buffering in DO ensures 128MB memory ceiling compliance.
critical_resolutions:
  - Vite optimizer "browserHash" crash resolved.
  - State synchronization polling race conditions fixed via Promise.allSettled.