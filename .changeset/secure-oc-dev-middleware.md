---
'oc-server': major
---

Upgrade the local development server to Fastify 5 and @fastify/express 4.0.9
to address middleware-bypass vulnerabilities CVE-2026-33807, CVE-2026-6556,
and CVE-2026-33808, as well as the subsequent absolute-form request-target
bypass CVE-2026-112362. Node.js 20 or newer is now required.
