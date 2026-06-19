# TODO.md
## Critical (Block Production)
1. Fix Vite `browserHash` optimizer crash (package.json / vite.config).
2. Implement real WSS gateway and replace short-polling.
3. Add native MessagePack (cbor-x or msgpack) support.
## High
4. Full JWT enrollment + CSP validation.
5. Enable OPFS + SQLite Wasm in Agent SDK when available.
6. Add automated tests and CI pipeline.
## Medium
7. Publish @insidr/agent to npm (tarball export is simulated).
8. Add real browserHash-safe Vite configuration for Cloudflare plugin.
9. Expand compliance features with actual data deletion.
## Low / Polish
10. Add more historical snapshot examples.
11. Improve mobile responsiveness of Log Explorer and Device Inspector.
12. Finalize ARCHITECTURE.md diagrams.