#!/bin/bash
# Ghostline Pre-Commit Hook Installer
# Auto-runs on npm install via prepare script

set -e
HOOK_DIR=".git/hooks"
HOOK_FILE="$HOOK_DIR/pre-commit"

echo "Installing Ghostline pre-commit hooks..."
if [ ! -d "$HOOK_DIR" ]; then echo "Not a git repo. Run from root."; exit 1; fi

cat > "$HOOK_FILE" << 'ENDHOOK'
#!/bin/bash
echo "Ghostline: Pre-commit security check..."
PATTERNS=("sk-[a-zA-Z0-9]{32,}" "ghp_[a-zA-Z0-9]{36}" "SUPABASE_SERVICE_ROLE" "-----BEGIN.*PRIVATE KEY-----" "RAILWAY_TOKEN" "VERCEL_TOKEN" "stripe_live_sk_")
STAGED=$(git diff --cached --name-only --diff-filter=ACM)
if [ -z "$STAGED" ]; then exit 0; fi
FOUND=0
for FILE in $STAGED; do
  if [ ! -f "$FILE" ]; then continue; fi
  for P in "${PATTERNS[@]}"; do
    if git diff --cached "$FILE" | grep -qE "$P"; then
      echo "VAULT CHECK FAIL: Possible secret in $FILE (pattern: $P)"
      FOUND=1
    fi
  done
done
if [ $FOUND -eq 1 ]; then echo "Ghostline blocked commit. Remove secrets, use env vars."; exit 1; fi
if echo "$STAGED" | grep -q "package-lock.json"; then
  npm audit --audit-level=critical --silent 2>/dev/null || { echo "SHADOW AUDIT FAIL: Critical CVE found."; exit 1; }
fi
echo "Ghostline: All clear."
ENDHOOK
chmod +x "$HOOK_FILE"
echo "Ghostline pre-commit hook installed."
