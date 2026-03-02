# Security Policy — Aetherhaven Multiverse

## Reporting a Vulnerability

Do NOT open a public GitHub issue for security vulnerabilities.

Report privately: https://github.com/Mellowambience/aetherhaven-multiverse/security/advisories/new

Response SLA: Critical (CVSS >= 9.0) = 24h | High (7.0-8.9) = 72h | Medium/Low = 14 days

## Principles

1. Zero-Trust — every package boundary is a trust boundary
2. Sovereign Keys — no secrets in code, ever. VaultCheck enforces this on every commit
3. Adversarial by Design — threat model at security/THREAT_MODEL.md
4. Signed Commits — GPG required on all commits to main
5. Ahead-of-Curve — security posture reviewed quarterly minimum

*Ghostline guards this repo: pre-commit hooks, PR gates, weekly deep audits, real-time Swarm Room feed.*

🜂 Aetherhaven Holdings — The void remembers what you expose.
