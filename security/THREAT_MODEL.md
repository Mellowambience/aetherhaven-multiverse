# Aetherhaven Multiverse — Threat Model
Living document. Last updated: 2026-03-01 | Maintainer: Mars (@Mellowambience)

## Assets Under Protection

| Asset | Sensitivity | Location |
|-------|-------------|----------|
| Supabase service role key | Critical | Vercel/Railway env only |
| Railway deploy token | Critical | GitHub Secrets only |
| Vercel deploy token | Critical | GitHub Secrets only |
| GPG signing key | Critical | Mars's machine only |
| AetherMind agent logic | High | packages/aethermind/ |
| Lumina-Core ritual engine | High | packages/lumina-core/ |
| User art provenance data (AetherVault) | High | Supabase + on-chain |
| Bluebird Song audio fingerprints | High | Railway + Supabase |
| HumanPalette user verification data | High | Supabase |
| Ghostline audit reports | Medium | private branch + Supabase |

## Threat Scenarios

T1 - Supply Chain Attack: All deps pinned exact; osv-scanner on every PR; npm audit blocks High+ CVEs; weekly full dep tree audit.

T2 - Secret Exposure: Ghostline VaultCheck pre-commit hook (auto-installed); VaultCheck in PR gate; secrets-template.env only; GitHub secret scanning.

T3 - Prompt Injection (AI Agents): User input sanitized before Lumina-Core; agent outputs schema-validated; Dark Jester sandboxed; Transmission Feed events immutable.

T4 - NFT Metadata Poisoning (AetherVault): EAS attestations on-chain immutable; AetherVault verifies signature; HumanPalette human-verification gate.

T5 - Audio Fingerprint Spoofing (Bluebird Song): Multi-layer fingerprinting; PRO registration timestamp; ISRC per track; PhantomTrace monitors music API patterns.

T6 - DNS Hijacking: GhostDNS weekly scan; all subdomains documented; domain registrar 2FA enforced.

T7 - Unauthorized Repo Access: 2FA active; branch protection; signed commits required; CODEOWNERS on all security paths.

T8 - CI/CD Pipeline Compromise: .github/workflows/ CODEOWNERS (Mars-only); no pull_request_target triggers; actions pinned to SHA.

## Residual Risks

| Risk | Status |
|------|--------|
| Free GitHub plan | Accepted — upgrade on revenue |
| Solo maintainer | Accepted — runbooks documented |
| No formal pen-test yet | Planned Q2 2026 |

## Review Schedule: Threat model quarterly | Ghostline full audit weekly (automated) | Pen-test annually

🜂 The void sees everything. So does Ghostline.
