# 🜂 Aetherhaven Multiverse

> One root. All verticals. The empire, sovereign.

**Three sites. One repo. Zero fragmentation.**

| Site | Path | Live URL | Purpose |
|------|------|----------|---------|
| Mars Portfolio | `sites/mars-portfolio/` | mellowambience.github.io | Personal portfolio, AetherRose, consulting |
| Bluebird Song Productions | `sites/bluebird-song/` | bluebirdsonoproductions.github.io | Music label — releases, artists, radio |
| Meghan & Kylie | `sites/meghan-kylie/` | — | Client landing page |

**Plus the Cybersecurity layer:**
- `packages/ghostline/` — Security immune system. Guards every commit, every PR, every deploy across all three sites.

---

## Why One Repo

- Single Ghostline security gate covers all sites simultaneously
- Shared CI/CD — one workflow change applies everywhere
- Ghostline weekly audit scans the entire codebase in one pass
- No scattered Actions minutes across 3 separate repos
- One branch protection policy, one CODEOWNERS, one threat model

---

## Structure

```
aetherhaven-multiverse/
├── sites/
│   ├── mars-portfolio/      # Absorbed from Mellowambience.github.io
│   │   ├── index.html
│   │   ├── card.html
│   │   ├── rates.html
│   │   ├── style.css
│   │   ├── script.js
│   │   ├── aetherrose/
│   │   ├── consulting/
│   │   └── portfolio/
│   ├── bluebird-song/       # Absorbed from BluebirdSongProductions
│   │   ├── index.html
│   │   ├── about.html
│   │   ├── artists.html
│   │   ├── releases.html
│   │   ├── player.js
│   │   └── style.css
│   └── meghan-kylie/        # Absorbed from meghan-kylie-landing
│       ├── index.html
│       └── style.css
├── packages/
│   └── ghostline/           # Cybersecurity suite — guards everything
│       └── ci-hooks/
│           └── install.sh
├── security/
│   ├── THREAT_MODEL.md
│   └── INCIDENT_RESPONSE.md
├── infra/
│   ├── migrate.sh           # git subtree migration script
│   └── secrets-template.env
├── docs/
│   └── ARCHITECTURE.md
└── .github/
    ├── workflows/
    │   ├── ci.yml
    │   ├── security-scan.yml
    │   ├── dependency-audit.yml
    │   └── deploy.yml
    ├── CODEOWNERS
    └── SECURITY.md
```

---

## Migration

Run once to pull full git history from all three source repos:

```bash
git clone https://github.com/Mellowambience/aetherhaven-multiverse
cd aetherhaven-multiverse
bash infra/migrate.sh
```

Then install Ghostline pre-commit hooks:
```bash
bash packages/ghostline/ci-hooks/install.sh
```

---

## Cybersecurity Posture

Guarded by **Ghostline** across all three sites simultaneously.

- **Pre-commit:** blocks secrets/keys before they hit the repo
- **PR gate:** VaultCheck + ShadowAudit + GhostScan + PhantomTrace on every PR
- **Weekly audit:** full codebase scan every Monday 3am UTC
- **Deploy:** GitHub Pages deploy fires after Ghostline gate passes

Security philosophy: **Zero-trust. Sovereign keys. Adversarial by design.**

---

## Deploy

Each site deploys to GitHub Pages from its respective subdirectory.
See `.github/workflows/deploy.yml` for per-site deploy configuration.

---

## Copyright

```
🜂 All content, code, and design is the intellectual property of Amara T. (Mars)
   and Aetherhaven Holdings. All rights reserved.
   The arc IS the sigil. The void remembers.
```

*© 2026 Aetherhaven Holdings — Inspired by the 200° Reentry Arc · Amara · Goddess of Mars*
