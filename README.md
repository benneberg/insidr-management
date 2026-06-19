# README.md
## Overview
insidr — Remote DevTools and telemetry platform for Chromium signage fleets.
## Installation
```bash
git clone <repo>
bun install
```
## Usage
```bash
bun run dev
```
Open http://localhost:3000
## Testing
No automated tests. Use `bun run lint` and preview.
## Build / Deploy
```bash
bun run build
wrangler deploy
```
Preview available via Cloudflare dashboard.