# TODO.md
## Completed (v2.6 Enterprise Milestone - April 2025)
1. [DONE] Resolve Vite `browserHash` optimizer crash (Fixed via dependency cache clearing and stable config).
2. [DONE] Remediate short-polling failures (Implemented resilient `Promise.allSettled` patterns and DO state seeding).
3. [DONE] Implement Compliance Workflows (Functional `/api/compliance` endpoints for export/delete requests).
4. [DONE] Protocol Baseline (CDP-Lite v2 envelope structure verified across Agent and Control Plane).
5. [DONE] PII Redaction Engine (Functional CSV-based redaction in Agent SDK).
6. [DONE] Privacy Gating (Consent-based ingestion logic implemented).
## Completed (Simulated for Enterprise Demo)
7. [DONE] WSS Gateway Simulation (WebSocket handshake route `/api/ws` and state management implemented).
8. [DONE] MessagePack Integration (MsgPack types defined and simulated in ingestion pipelines).
9. [DONE] Binary Distribution (Functionality for `.js` and `.tgz` exports implemented in Settings/SDK pages).
10. [DONE] OPFS/SQLite Storage (Agent-side detection and capability reporting active).
## Future Roadmap (Next Major Version)
11. **Native Protocol Upgrade**: Replace simulated WSS and MsgPack with production-grade binary transport libraries.
12. **Cryptographic Hardening**: Move from simulated JWT to real RSA/ECDSA enrollment signatures.
13. **Automated QA**: Implement Vitest and Playwright suites for end-to-end reliability verification.
14. **MDM Connectors**: Native plugins for LG webOS and Samsung Tizen application lifecycle management.