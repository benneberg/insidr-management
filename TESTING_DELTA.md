# TESTING_DELTA.md
**STATIC ANALYSIS ONLY**
- No test files (`.test.ts`, `.spec.ts`) found anywhere in repository.
- No Jest, Vitest, or Playwright configuration.
- Only lint (`eslint`) and typecheck (`tsc`) run via `bun run lint`.
- Manual verification performed via `get_runtime_errors`, `run_analysis`, and live preview.
**Missing Coverage**:
- Agent SDK behavior under packet loss / offline.
- Command sandbox execution isolation.
- Real WebSocket and MessagePack paths.
- Compliance export/delete end-to-end.
**Recommended Additions**:
- Unit tests for `ingestTelemetry` and sequence ACK logic.
- Integration tests for store polling.
- E2E test for device inspector command flow.