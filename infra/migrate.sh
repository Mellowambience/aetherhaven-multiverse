#!/bin/bash
# Aetherhaven Multiverse — Migration Script
# Absorbs three static site repos via git subtree
# Run from directory ABOVE aetherhaven-multiverse/ after cloning it

set -e
GITHUB_USER="Mellowambience"
echo "🜂 Aetherhaven Multiverse — Migration Starting"
echo "=============================================="

cd "./aetherhaven-multiverse"

# ── Mars Portfolio (Mellowambience.github.io) ───────────────────
echo ""
echo "Absorbing Mellowambience.github.io → sites/mars-portfolio/ ..."
git remote add mars-portfolio "https://github.com/$GITHUB_USER/Mellowambience.github.io.git" 2>/dev/null || true
git fetch mars-portfolio main
if [ ! -d "sites/mars-portfolio" ]; then
  git subtree add --prefix=sites/mars-portfolio mars-portfolio/main --squash \
    -m "feat: absorb Mellowambience.github.io into sites/mars-portfolio"
  echo "  ✅ Mars portfolio absorbed"
else
  echo "  ⚠️  sites/mars-portfolio already exists — run: git subtree pull --prefix=sites/mars-portfolio mars-portfolio main --squash"
fi

# ── Bluebird Song Productions ───────────────────────────────────
echo ""
echo "Absorbing BluebirdSongProductions → sites/bluebird-song/ ..."
git remote add bluebird-song "https://github.com/$GITHUB_USER/BluebirdSongProductions.git" 2>/dev/null || true
git fetch bluebird-song main
if [ ! -d "sites/bluebird-song" ]; then
  git subtree add --prefix=sites/bluebird-song bluebird-song/main --squash \
    -m "feat: absorb BluebirdSongProductions into sites/bluebird-song"
  echo "  ✅ Bluebird Song absorbed"
else
  echo "  ⚠️  sites/bluebird-song already exists — run: git subtree pull --prefix=sites/bluebird-song bluebird-song main --squash"
fi

# ── Meghan & Kylie Landing ──────────────────────────────────────
echo ""
echo "Absorbing meghan-kylie-landing → sites/meghan-kylie/ ..."
git remote add meghan-kylie "https://github.com/$GITHUB_USER/meghan-kylie-landing.git" 2>/dev/null || true
git fetch meghan-kylie master
if [ ! -d "sites/meghan-kylie" ]; then
  git subtree add --prefix=sites/meghan-kylie meghan-kylie/master --squash \
    -m "feat: absorb meghan-kylie-landing into sites/meghan-kylie"
  echo "  ✅ Meghan & Kylie absorbed"
else
  echo "  ⚠️  sites/meghan-kylie already exists — run: git subtree pull --prefix=sites/meghan-kylie meghan-kylie master --squash"
fi

# ── Ghostline pre-commit hooks ──────────────────────────────────
echo ""
echo "Installing Ghostline pre-commit hooks..."
bash packages/ghostline/ci-hooks/install.sh

echo ""
echo "════════════════════════════════════════════════"
echo "🜂 Migration complete."
echo ""
echo "Next steps:"
echo "  1. Set GitHub Secrets (if using Supabase Swarm Room):"
echo "     SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY"
echo "  2. Enable branch protection on main:"
echo "     - Require PR + review"
echo "     - Require status checks: ghostline-gate, validate-html"
echo "     - Require signed commits (GPG)"
echo "     - No force push"
echo "  3. Archive original repos with redirect notices:"
echo "     - Mellowambience.github.io → 'Absorbed into aetherhaven-multiverse/sites/mars-portfolio'"
echo "     - BluebirdSongProductions → 'Absorbed into aetherhaven-multiverse/sites/bluebird-song'"
echo "     - meghan-kylie-landing → 'Absorbed into aetherhaven-multiverse/sites/meghan-kylie'"
echo "  4. Update GitHub Pages settings for each site to deploy from the new monorepo"
echo "════════════════════════════════════════════════"
