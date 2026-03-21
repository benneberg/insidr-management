# PURPOSE.md
**Product Summary**
insidr is a remote DevTools and telemetry platform for large fleets of locked-down Chromium-based digital signage devices.
**Problem Statement**
Production signage devices (webOS, Tizen, Android TV) have no DevTools access, no persistent logs, and cannot be physically reached. Existing solutions are either too low-level or too passive.
**Target Audience** (High confidence)
- Enterprise signage operators and fleet managers
- SignageOS / LG webOS developers
- IT teams needing remote debugging at scale
**Value Proposition**
Zero-dependency JavaScript agent that streams logs, metrics, network, and screenshots over WSS while allowing safe remote commands.
**Features**
- Verified: Real-time dashboard, device inspector, alerts, logs, SDK distribution, compliance, RTP protocol, sandboxed commands
- Inferred: Fleet-wide search, CSV export, public demo mode
- Future: Native WSS, MessagePack, OPFS storage, full JWT auth