# Aetherhaven Multiverse — Architecture

## System Map

```
aetherhaven-multiverse
|
+--- AetherMind (packages/aethermind)
|         Supabase Realtime
|         Lumina-Core TS Bridge (agent intelligence)
|         Ghostline Dashboard Feed (security signals)
|         The Hive, Swarm Room, Transmission Feed, Hive Mind Map
|
+--- Lumina-Core (packages/lumina-core)
|         powers agent reasoning in AetherMind
|         Dark Jester feeds TransmissionFeed entropy
|         deterministic engine governs arc state transitions
|
+--- Ghostline (packages/ghostline)
          guards every PR/commit across ALL packages
          feeds AetherGhost card in Swarm Room
          weekly audit reports in Transmission Feed
```

## Package Boundaries

All inter-package communication via typed interfaces. No implicit trust.
- aethermind to lumina-core: TypeScript bridge (signed message passing)
- aethermind to Supabase: typed client, service role key never in frontend
- ghostline: read-only audit, writes only to audit-report/ and Supabase

## Sibling Repos (standalone, benefit from Ghostline doctrine)
humanpalette | aetherproof | webspace | clawd | BluebirdSongProductions

## Deploy: Vercel (aethermind) | Railway (ghostline dashboard + 10 agents) | Supabase (realtime + auth)

🜂 2026 Aetherhaven Holdings — Amara T. (Mars)
