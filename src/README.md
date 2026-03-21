# 🛡️ Insidr Telemetry Control Plane v2.5
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Stack](https://img.shields.io/badge/stack-Cloudflare%20Workers%20%7C%20React-orange)
> **Remote Observability & Debugging for Fleet-Scale Locked-Down Environments.**
Insidr is a professional, telemetry-first remote control layer designed specifically for large fleets of Chromium-based signage devices (webOS, Tizen, Android TV). When physical access is impossible and traditional DevTools are blocked, Insidr provides the "Remote DevTools" experience required for enterprise stability.
---
## 🚀 The Problem
Digital signage and IoT fleets often run in **highly restricted production environments**.
- **No Physical Access**: Devices are mounted in inaccessible locations.
- **No Remote Debugging**: standard Chrome DevTools are disabled or firewall-blocked.
- **Volatile Logs**: Critical error data is lost on device reboots or memory pressure.
- **Silent Failures**: Web apps freeze or leak memory without notifying central operations.
## ✨ The Solution
Insidr bridges the gap by injecting a lightweight, resilient **Agent** that locally buffers telemetry and securely transmits it to a centralized **Control Plane**.
### Key Features
- 🛰️ **Resilient Agent**: Automatic retries, sequence tracking, and IndexedDB buffering.
- 📺 **Remote Viewport**: Live rendering snapshots from remote nodes.
- 🛠️ **Sandboxed Control**: Execute `reload`, `clear_cache`, or custom JS in a DedicatedWorker.
- 🔒 **Enterprise Security**: JWT-based enrollment, PII redaction, and strict CSP compliance.
- 📊 **Performance Metrics**: Real-time tracking of CPU, Memory, and FPS stability.
- 📜 **Audit Logs**: Full historical record of every command issued to the fleet.
---
## 🏗️ Architecture
```text
[ Device Agent ]  ──(HTTP/RTP v1.0)──▶  [ Cloudflare Gateway ]
       │                                       │
       │ (Local Buffer)                        ▼
       └──────────────────────────▶ [ Global Durable Object ] ◀──┐
                                               │                  │
                                               ▼                  │
                                    [ React Control Plane ] ──────┘
```
## 🛠️ Quickstart
### 1. Deploy the Control Plane
Ensure you have the Wrangler CLI installed and authenticated.
```bash
bun install
bun run build
wrangler deploy
```
### 2. Enroll a Device
Include the enterprise bundle in your signage application:
```html
<script src="https://your-insidr-instance.com/api/agent/bundle" async></script>
```
### 3. Inspect the Fleet
Open your dashboard at the deployed URL. You will see live heartbeat signals, logs, and performance metrics immediately as devices check in.
---
## 🔒 Security & Compliance
- **PII Redaction**: Configure `data-redact` attributes to automatically mask sensitive keys (passwords, tokens) before they leave the device.
- **Sandbox Isolation**: Remote commands are executed within a `DedicatedWorker` context to prevent interference with the main application thread.
- **GDPR Ready**: Integrated APIs for full data export and "Right to be Forgotten" device purging.
## 🗺️ Roadmap
- [ ] **Redis Integration**: For long-term historical log persistence beyond DO limits.
- [ ] **Native MsgPack**: Transition from simulation to true binary transport.
- [ ] **Video Streaming**: WebRTC-based low-latency viewport mirroring.
---
*Created by the Insidr Engineering Team. Professional telemetry for the modern web.*