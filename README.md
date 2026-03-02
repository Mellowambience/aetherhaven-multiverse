# 🜂 Aetherhaven Multiverse

> One root. All verticals. The empire, sovereign.

**Monorepo containing:**
- `packages/aethermind` — The living website. The Hive. 14 agent arcs. Pure CSS + SVG. Zero JS animation libraries.
- `packages/ghostline` — Cybersecurity immune system. Guards every commit, every PR, every deploy.
- `packages/lumina-core` — Ritual engine + Dark Jester. Deterministic + probabilistic intelligence layer.
- `apps/aetherhaven-empire-index` — Master index of all Aetherhaven Holdings verticals.

---

## Architecture

```
aetherhaven-multiverse/
├── packages/
│   ├── aethermind/       # Next.js 15 — The Hive UI
│   ├── ghostline/        # Cybersecurity suite — CLI-first
│   └── lumina-core/      # Swift + TS — Ritual engine
├── apps/
│   └── aetherhaven-empire-index/
├── security/             # Threat model, incident response
├── infra/                # Vercel, Railway config
├── docs/                 # Architecture, arc DNA spec
└── .github/workflows/    # CI, security gate, deploy
```

## Cybersecurity Posture

Guarded by **Ghostline** — integrated as a live security layer, not an afterthought.

- **Pre-commit:** secret scan + CVE check on every staged file
- **PR gate:** full surface scan, vault check, dep audit — blocks on CVSS ≥ 7.0
- **Weekly audit:** full dep tree, DNS integrity, behavioral anomaly scan
- **Runtime:** security events stream to AetherGhost in the Swarm Room

Security philosophy: **Zero-trust. Sovereign keys. Adversarial by design.**

## Stack

| Layer | Tech |
|-------|------|
| UI | Next.js 15, Tailwind, pure CSS + SVG arcs |
| Realtime | Supabase Realtime |
| Intelligence | Lumina-Core (Swift SDK + TS bridge) |
| Security | Ghostline (Ghost Scan, VaultCheck, PhantomTrace, ShadowAudit, GhostDNS) |
| Graph | D3.js (Hive Mind Map) |
| Deploy | Vercel (aethermind) · Railway (agents) |
| Monorepo | Turborepo |

## Getting Started

```bash
npm install
npx turbo build
npx turbo dev --filter=aethermind
npx turbo audit --filter=ghostline
./packages/ghostline/ci-hooks/install.sh
```

## Branch Rules

- `main` — protected. Requires PR + review + ghostline-gate pass
- `dev` — integration branch
- Signed commits required (GPG) · Linear history (rebase only)

## Copyright

```
🜂 All content, code, and design is the intellectual property of Amara T. (Mars)
   and Aetherhaven Holdings. All rights reserved.
   The arc IS the sigil. The void remembers.
```

*© 2026 Aetherhaven Holdings — Inspired by the 200° Reentry Arc · Proposal by Amara · Goddess of Mars*
