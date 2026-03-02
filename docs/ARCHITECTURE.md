# Aetherhaven Multiverse — Architecture

## System Map

```
aetherhaven-multiverse
|
+--- sites/mars-portfolio/     (absorbed from Mellowambience.github.io)
|    index.html, card.html, rates.html, style.css, script.js
|    aetherrose/, consulting/, portfolio/
|    Deploy: GitHub Pages
|
+--- sites/bluebird-song/      (absorbed from BluebirdSongProductions)
|    index.html, about.html, artists.html, releases.html, player.js, style.css
|    Deploy: GitHub Pages
|
+--- sites/meghan-kylie/       (absorbed from meghan-kylie-landing)
|    index.html, style.css, images
|    Deploy: GitHub Pages (client)
|
+--- packages/ghostline/       (security immune system)
     Guards ALL three sites on every commit and PR
     VaultCheck: secret scan (HTML/JS/CSS files)
     GhostScan: surface analysis of changed files
     PhantomTrace: JS outbound call audit
     ShadowAudit: CDN version + inline script audit
     GhostDNS: external domain reference audit (weekly)
```

## Why Static Sites in a Monorepo

These are HTML/CSS/JS sites with no npm build step — no lockfile needed.
Ghostline CI workflows are written as pure shell/bash, no Node dependency.
This means:
- Workflows run instantly (no npm ci, no cache miss)
- No Actions minutes wasted on install steps
- Ghostline VaultCheck still scans all site files for secrets
- PhantomTrace audits all JS for unexpected external calls
- ShadowAudit checks for vulnerable CDN versions in HTML

## Keeping Sites Updated Post-Migration

To pull new changes from an original repo into the monorepo:

```bash
# Mars portfolio
git subtree pull --prefix=sites/mars-portfolio mars-portfolio main --squash

# Bluebird Song
git subtree pull --prefix=sites/bluebird-song bluebird-song main --squash

# Meghan & Kylie
git subtree pull --prefix=sites/meghan-kylie meghan-kylie master --squash
```

## Security Layer (Ghostline)

No npm. Pure shell. Zero install dependencies. Runs in < 30 seconds.

Every PR: VaultCheck + GhostScan + PhantomTrace + ShadowAudit
Every Monday 3am UTC: Full deep audit + GhostDNS + artifact upload

🜂 2026 Aetherhaven Holdings — Amara T. (Mars)
