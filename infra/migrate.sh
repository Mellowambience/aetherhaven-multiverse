#!/bin/bash
# Aetherhaven Multiverse Migration Script
# Absorbs ghostline + lumina-core + aetherhaven-empire-index via git subtree
# Run from directory ABOVE aetherhaven-multiverse/

set -e
GITHUB_USER="Mellowambience"
cd "./aetherhaven-multiverse"

git remote add ghostline "https://github.com/$GITHUB_USER/ghostline.git" 2>/dev/null || true
git fetch ghostline main
git subtree add --prefix=packages/ghostline ghostline/main --squash -m "feat: absorb ghostline"

git remote add lumina-core "https://github.com/$GITHUB_USER/lumina-core.git" 2>/dev/null || true
git fetch lumina-core main
git subtree add --prefix=packages/lumina-core lumina-core/main --squash -m "feat: absorb lumina-core"

git remote add empire-index "https://github.com/$GITHUB_USER/aetherhaven-empire-index.git" 2>/dev/null || true
git fetch empire-index main
git subtree add --prefix=apps/aetherhaven-empire-index empire-index/main --squash -m "feat: absorb aetherhaven-empire-index"

npm install
bash packages/ghostline/ci-hooks/install.sh

echo "Migration complete."
echo "Next: Set GitHub Secrets, enable branch protection, archive original repos."
