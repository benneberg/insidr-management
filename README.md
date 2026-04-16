# 🛡️ Insidr Control Plane v2.5.0-PROD
> **Enterprise-grade telemetry for fleet-scale locked-down signage and IoT devices.**
![Build Status](https://img.shields.io/badge/Build-Passing-emerald?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-JWT_RS256-blue?style=for-the-badge)
![Protocol](https://img.shields.io/badge/Protocol-v2.5_RTP-amber?style=for-the-badge)
## 📋 Overview
Insidr provides a zero-dependency remote debugging and control layer for locked-down Chromium-based environments (webOS, Tizen, Android TV). When traditional DevTools are blocked, Insidr bridges the gap with high-fidelity telemetry, memory profiling, and remote sandboxed execution.
## 🏗️ Architecture
1.  **Agent SDK**: Injected into the client application. It buffers logs, metrics, and snapshots locally.
2.  **RTP Protocol**: A resilient sequence-aware transport layer that handles intermittent connectivity and packet loss.
3.  **Cloudflare Worker Gateway**: Scalable entry point for telemetry ingestion and API distribution.
4.  **Durable Object Registry**: Single-source-of-truth for fleet state, log circular buffers, and command queues.
5.  **Control Plane UI**: A developer-first dashboard for real-time inspection and fleet management.
## 🔒 Security & Compliance
- **PII Redaction**: Automatic masking of sensitive keys (passwords, tokens) before transmission.
- **JWT Enrollment**: Cryptographic node identification using RS256 signing.
- **Isolated Sandbox**: Remote code execution via `DedicatedWorker` to prevent main-thread pollution.
- **Data Sovereignty**: Configurable retention policies and GDPR/CCPA export tools.
## 🚀 Quick Start
### 1. Integration
Add the agent to your web application:
```html
<script src="https://insidr.io/api/agent/bundle" async></script>
```
### 2. Monitoring
Access the dashboard at `https://insidr.io` to view real-time fleet health and logs.
### 3. Debugging
Select any node to enter the **Device Inspector**. View live console logs, monitor CPU/Memory pressure, and issue remote `reload` or `clear_cache` commands.
---
*Built for the edge. Distributed via Cloudflare.*