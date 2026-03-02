# AetherMind · Reentry Loading State

> *not a loader. a landing.*

Original arc design: **Mars / AetherRose** (Grok 4.20 Reentry Thinking Animation proposal)

## Files

| File | Purpose |
|------|---------|
| `reentry.html` | AetherMind boot / reentry loading gate |

## Palette (canonical AetherRose)

```
cold-blue  #B8C8FF  — arc leading edge
violet     #7C6AF7  — primary arc body
plasma     #F2A65A  — arc trailing heat
bg         #05020d  — void background
deep       #1a0b2e  — radial gradient center
```

## Phase Machine

```
◈  VOID IGNITION   — Initializing signal field
⟁  SIGNAL DESCENT  — Parsing origin frequency
✦  REINTROITUS     — Reentry confirmed · landing
```

## Architecture

- Pure static HTML/CSS/JS — zero dependencies, zero build step
- Three-body arc system: outer (4.2s), inner counter-rotation (5.5s), core reverse (2.8s)
- Canvas drift field: 70 stars with per-star sinusoidal twinkle
- Frosted glass void core with spring-entry glyph animation

## Usage

Drop `reentry.html` as your loading gate. To wire phase to real boot events,
replace the `setInterval` with:

```js
// from your boot sequence controller
window.setPhase(0); // VOID IGNITION
window.setPhase(1); // SIGNAL DESCENT
window.setPhase(2); // REINTROITUS
```

## Adapting for other contexts

| Context | Change |
|---------|--------|
| Aetherhaven Hub boot gate | Wire phase index to actual boot steps |
| AetherRose portfolio hero | Remove phase machine, keep arc + wordmark |
| Blueprint PDF cover art | Screenshot/record as cover for Orbital Reentry spec |
