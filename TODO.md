# Insidr Platform: Prioritized Roadmap
## P0: Critical / Immediate
- [ ] **Identity Federation:** Replace the `sim-` node IDs with cryptographically signed tokens (JWT).
- [ ] **OIDC Integration:** Implement professional auth for the Control Plane (Auth0/Google).
- [ ] **Data Persistence:** Extend DO storage to Cloudflare R2 for long-term telemetry archiving (>90 days).
## P1: Refinement & Performance
- [ ] **Binary Transport:** Implement MessagePack (MsgPack) compression for the WSS Gateway to reduce IoT data costs.
- [ ] **UI Virtualization:** Integrate `react-window` for the Global Log Explorer to handle >5,000 lines without DOM lag.
- [ ] **Global Search:** Implement a backend-indexed search across all device logs via Durable Object storage queries.
## P2: Future Roadmap
- [ ] **Multi-Region Replication:** Sync DO state across multiple regions for 0-latency global command dispatch.
- [ ] **Predictive Alerts:** Use basic heuristic analysis to detect "Memory Leaks" before devices crash.
- [ ] **Screenshot OCR:** Implement server-side OCR on viewport snapshots to detect "Service Unavailable" messages automatically.
---
*Last Updated: 2025-05-24*