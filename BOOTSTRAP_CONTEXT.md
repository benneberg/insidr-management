schema:
  version: 1
  compatible_with:
    - CCC
  generated_by: Repository Bootstrap Prompt
  generated_at: "2026-07-10T03:09:27.062Z"
  repository: insidr-telemetry-mcpq31xan1arg0nlsmawv
milestones:
  initial_alpha:
    phase: 1-10
    goal: UI Mocking and Basic Ingestion
  protocol_v2:
    phase: 11-25
    goal: CDP-Lite Envelope and Resilient Polling
  enterprise_hardening:
    phase: 26-34
    goal: PII Redaction, Privacy Gating, and Compliance Workflows
  standardization:
    phase: 35
    goal: YAML Documentation & Handover Metadata
design_philosophy:
  - Telemetry-first remote debugging
  - Zero-dependency injection model
  - Resilient buffering for locked-down environments