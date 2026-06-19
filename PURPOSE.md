# Purpose & Mission: Insidr Telemetry
## The Mission: "Visibility into the Invisible"
In the world of Digital Signage and IoT, production devices are effectively black boxes. When a web-based billboard in Times Square or a kiosk in London freezes, developers have no access to the `Console` or `Network` tab. 
**Insidr is the remote bridge that makes these black boxes transparent.**
## Problem Statement
Traditional observability tools (Sentry, LogRocket) are often:
1. Too heavy for resource-constrained signage browsers.
2. Not designed for real-time remote "Command & Control".
3. Lacking deep integration with platforms like LG webOS or Samsung Tizen.
## The Solution
Insidr provides a **CDP-Lite (Chrome DevTools Protocol)** experience over standard HTTP/WSS. It allows engineers to:
- **See** exactly what is on the screen via remote snapshots.
- **Inspect** real-time logs and network waterfalls.
- **Control** the device via remote JS execution and hardware-level commands (Reload/Clear Cache).
## Target Audience
- **Fleet Operators:** Monitoring the health of thousands of nodes.
- **DevOps/SRE:** Debugging production failures in real-time.
- **IoT Developers:** Building applications for locked-down signage browsers.
---
*Insidr: Remote DevTools for the Fleet.*