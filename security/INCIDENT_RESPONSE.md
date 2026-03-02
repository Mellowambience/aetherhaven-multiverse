# Incident Response Playbook — Aetherhaven Multiverse

## Severity Levels
P0 Critical: Active breach / secret exposure / production down — 1 hour response
P1 High: Suspected compromise / CVE in prod dep — 4 hours
P2 Medium: Ghostline anomaly / suspicious PR — 24 hours
P3 Low: Config drift / informational — 72 hours

## P0 Steps
1. Isolate — revoke all tokens (Vercel, Railway, Supabase service role) immediately
2. Assess — determine blast radius from Ghostline audit report
3. Rotate — generate new secrets, update all envs
4. Audit — review commit history for exposed data
5. Patch — fix root cause before re-deploying
6. Document — add post-mortem to security/post-mortems/
7. Disclose — follow responsible disclosure per SECURITY.md

## Secret Exposure Checklist
- [ ] Identify which secret and which commit
- [ ] Revoke at the provider immediately
- [ ] Force-push or rewrite history if caught early
- [ ] Rotate all related secrets
- [ ] Review why VaultCheck didn't catch it
- [ ] Update VaultCheck patterns if needed

🜂 Aetherhaven Holdings — Prepared, not paranoid.
